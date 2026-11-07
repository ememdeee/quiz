import { expect, test } from "@playwright/test";
import { admin, cleanup, makePerson, PASSWORD } from "./helpers/supabase";

/**
 * QC-19 security basics and QC-21 production smoke, against the production build (`next build`) with the real data.
 * The content security policy only exists in production, so this is the one place it is exercised: any page that breaks it
 * shows up here as a console error.
 */
test.afterAll(cleanup);

const publicPages = ["/", "/pricing", "/contact", "/terms", "/privacy", "/login", "/register", "/forgot-password"];

test.describe("security headers and search engines", () => {
  test("every page carries the security headers and a content security policy", async ({ request }) => {
    for (const path of ["/", "/login", "/quiz/anything", "/dashboard"]) {
      const response = await request.get(path, { maxRedirects: 0 });
      const headers = response.headers();
      expect(headers["x-content-type-options"], path).toBe("nosniff");
      expect(headers["x-frame-options"], path).toBe("DENY");
      expect(headers["referrer-policy"], path).toBe("strict-origin-when-cross-origin");
      const csp = headers["content-security-policy"] ?? "";
      expect(csp, path).toContain("frame-ancestors 'none'");
      expect(csp, path).toContain("object-src 'none'");
      expect(csp, path).toContain("default-src 'self'");
    }
  });

  test("the website can be indexed, and private pages and quiz links are kept out", async ({ request, page }) => {
    const home = await request.get("/");
    expect(home.headers()["x-robots-tag"] ?? "").not.toContain("noindex");
    const robots = await (await request.get("/robots.txt")).text();
    for (const hidden of ["/dashboard", "/admin", "/quiz/", "/api/", "/account"]) expect(robots).toContain(`Disallow: ${hidden}`);
    expect(robots).toContain("Sitemap:");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/pricing");
    expect(sitemap).not.toContain("/dashboard");

    await page.goto("/quiz/some-quiz");
    expect(await page.locator("meta[name=robots]").getAttribute("content")).toContain("noindex");
    await page.goto("/login");
    expect(await page.locator("meta[name=robots]").getAttribute("content")).toContain("noindex");
  });

  test("the test links and the person switcher do not exist in production", async ({ request }) => {
    for (const path of ["/dev", "/dev/session?as=admin", "/dev/ui", "/dev/emails"]) expect((await request.get(path)).status(), path).toBe(404);
  });

  test("icons, manifest and the health check answer", async ({ request }) => {
    for (const path of ["/icon", "/apple-icon", "/icons/192", "/icons/512", "/icons/maskable", "/opengraph-image"]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(response.headers()["content-type"], path).toContain("image/png");
    }
    expect((await request.get("/icons/999")).status()).toBe(404);
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
    expect(await (await request.get("/api/health")).json()).toEqual({ ok: true });
  });

  test("a private page without a login goes to Log in, and the admin area shows no access", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
    await page.goto("/admin");
    await expect(page.getByText("You don’t have access to this page")).toBeVisible();
  });

  test("the public quiz endpoints do not give away a draft, and refuse bad input", async ({ request }) => {
    expect((await request.get("/api/q/no-such-quiz-here")).status()).toBe(200);
    expect(await (await request.get("/api/q/no-such-quiz-here")).json()).toEqual({ status: "not_found" });
    expect((await request.post("/api/r/00000000-0000-0000-0000-000000000000/answer", { data: { token: "x", progress: {} } })).status()).toBe(404);
    expect((await request.post("/api/r/not-a-uuid/answer", { data: "not json" })).status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe("production smoke", () => {
  test("the website pages open with no errors in the console (so the content security policy lets everything through)", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => message.type() === "error" && errors.push(`${message.text()} ${message.location().url}`));
    page.on("pageerror", (error) => errors.push(error.message));
    for (const path of publicPages) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await page.waitForLoadState("load");
    }
    expect(errors.filter((text) => !/favicon/.test(text)), errors.join("\n")).toEqual([]);
  });

  test("log in, see the dashboard, open a quiz as a stranger would, and log out, all under the policy", async ({ page, browser }) => {
    const errors: string[] = [];
    page.on("console", (message) => message.type() === "error" && errors.push(`${message.text()} ${message.location().url}`));
    const person = await makePerson({ name: "Smoke QC" });
    const doc = {
      format: "quiz-v1",
      name: "Smoke",
      pages: [
        { id: "w", type: "welcome", title: "Smoke quiz", text: "Hello", picture: null },
        { id: "q", type: "text", question: "Your name?", input: "any", hint: "", required: true },
        { id: "e", type: "end", style: "thanks", title: "Done", text: "", picture: null },
      ],
    };
    const { data: quiz } = await admin
      .from("quizzes")
      .insert({ owner_id: person.id, name: "Smoke", slug: `smoke-${Date.now().toString(36)}`, draft: doc, published: doc, published_version: 1, published_at: new Date().toISOString() })
      .select("id, slug")
      .single();

    await page.goto("/login");
    await page.locator("#login-email").fill(person.email);
    await page.locator("#login-password").fill(PASSWORD);
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    await page.waitForURL("**/dashboard", { timeout: 45_000 });
    await expect(page.getByText("Smoke", { exact: true }).first()).toBeVisible({ timeout: 30_000 });
    await page.goto(`/dashboard/${quiz!.id}`);
    await expect(page.locator("input[value='Smoke quiz']")).toBeVisible({ timeout: 30_000 });

    const visitor = await browser.newContext();
    const tab = await visitor.newPage();
    const visitorErrors: string[] = [];
    tab.on("console", (message) => message.type() === "error" && visitorErrors.push(`${message.text()} ${message.location().url}`));
    await tab.goto(`/quiz/${quiz!.slug}`);
    await tab.getByRole("button", { name: "Start the quiz" }).click();
    await tab.getByRole("textbox").fill("Sarah");
    await tab.getByRole("button", { name: "Continue" }).click();
    await expect(tab.getByText("Done")).toBeVisible({ timeout: 30_000 });
    await visitor.close();
    expect(visitorErrors, visitorErrors.join("\n")).toEqual([]);

    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Log out" }).click();
    await page.waitForURL((url) => url.pathname === "/");
    expect(errors.filter((text) => !/favicon/.test(text)), errors.join("\n")).toEqual([]);
  });

  test("the share picture of a quiz link is made from the published Start page", async ({ request }) => {
    const person = await makePerson();
    const doc = { format: "quiz-v1", name: "Preview", pages: [{ id: "w", type: "welcome", title: "Preview title", text: "x", picture: null }, { id: "e", type: "end", style: "thanks", title: "Done", text: "", picture: null }] };
    const { data } = await admin
      .from("quizzes")
      .insert({ owner_id: person.id, name: "Preview", slug: `og-${Date.now().toString(36)}`, draft: doc, published: doc, published_version: 1, published_at: new Date().toISOString() })
      .select("slug")
      .single();
    const image = await request.get(`/quiz/${data!.slug}/opengraph-image`);
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toContain("image/png");
    const page = await (await request.get(`/quiz/${data!.slug}`)).text();
    expect(page).toContain("Preview title");
    expect(page).toContain("og:image");
  });
});

test.describe("QC-20 performance", () => {
  /** All the script files a page asks for, with their sizes and text. */
  async function scripts(page: import("@playwright/test").Page, path: string) {
    const files: { url: string; bytes: number; text: string }[] = [];
    page.on("response", async (response) => {
      if (response.request().resourceType() !== "script" || !response.url().includes("/_next/")) return;
      const body = await response.body().catch(() => Buffer.alloc(0));
      files.push({ url: response.url(), bytes: body.length, text: body.toString("utf8") });
    });
    await page.goto(path, { waitUntil: "networkidle" });
    return files;
  }

  test("the quiz page ships no editor, drag-and-drop, chart or admin code, and stays light", async ({ page }) => {
    const files = await scripts(page, "/quiz/no-such-quiz");
    const total = files.reduce((sum, file) => sum + file.bytes, 0);
    const all = files.map((file) => file.text).join("\n");
    for (const forbidden of ["@dnd-kit", "DndContext", "useSortable", "recharts", "exceljs"]) expect(all, forbidden).not.toContain(forbidden);
    expect(total, `quiz page scripts: ${Math.round(total / 1024)} KB`).toBeLessThan(900 * 1024);
  });

  test("the home page stays light", async ({ page }) => {
    const files = await scripts(page, "/");
    const total = files.reduce((sum, file) => sum + file.bytes, 0);
    expect(total, `home page scripts: ${Math.round(total / 1024)} KB`).toBeLessThan(900 * 1024);
  });

  test("pages answer fast: the quiz API and the home page", async ({ request }) => {
    for (const path of ["/", "/api/health", "/api/q/no-such-quiz"]) {
      const start = Date.now();
      expect((await request.get(path)).status()).toBe(200);
      expect(Date.now() - start, path).toBeLessThan(3000);
    }
  });
});
