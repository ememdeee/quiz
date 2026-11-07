import { expect, test, type Page } from "@playwright/test";
import { admin, cleanup, makePerson, PASSWORD } from "./helpers/supabase";

/**
 * QC-05 editing and autosave, QC-06 display conditions, QC-07 pictures, QC-08 sharing, QC-09 web addresses between two people,
 * on the real Supabase dev project.
 */
test.afterAll(cleanup);

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");

const welcome = { id: "w", type: "welcome", title: "Editor QC", text: "", picture: null };
const goal = {
  id: "goal",
  type: "choice",
  question: "Your goal?",
  answers: [
    { id: "lose", text: "Lose weight", picture: null },
    { id: "tone", text: "Tone", picture: null },
  ],
  multiple: false,
  required: true,
  picture: null,
};
const height = {
  id: "height",
  type: "number",
  question: "Your height",
  kind: "height",
  unit: "cm",
  min: 120,
  max: 230,
  required: true,
  show: { match: "all", rules: [{ page: "goal", op: "is", value: "lose" }] },
};
const end = { id: "e", type: "end", style: "thanks", title: "Thanks", text: "", picture: null };

let counter = 0;
async function makeQuiz(ownerId: string, options: { published?: boolean; slug?: string } = {}) {
  counter += 1;
  const doc = { format: "quiz-v1", name: `Editor ${counter}`, pages: [welcome, goal, height, end] };
  const published = options.published ?? false;
  const { data, error } = await admin
    .from("quizzes")
    .insert({
      owner_id: ownerId,
      name: doc.name,
      slug: options.slug ?? `qe-${Date.now().toString(36)}-${counter}`,
      draft: doc,
      published: published ? doc : null,
      published_version: published ? 1 : null,
      published_at: published ? new Date().toISOString() : null,
    })
    .select("id, slug")
    .single();
  if (error) throw new Error(error.message);
  return data!;
}

const login = async (page: Page, email: string) => {
  await page.goto("/login");
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await page.waitForURL("**/dashboard", { timeout: 45_000 });
};

test("an edit is saved by itself, survives a reload, and the database keeps counting versions", async ({ page }) => {
  const owner = await makePerson();
  const quiz = await makeQuiz(owner.id);
  await login(page, owner.email);
  await page.goto(`/dashboard/${quiz.id}`);
  const title = page.locator("input").filter({ hasText: "" }).and(page.locator("input[value='Editor QC']")).first();
  await expect(title).toBeVisible({ timeout: 30_000 });
  await title.fill("Edited by the browser test");
  await expect.poll(async () => ((await admin.from("quizzes").select("draft").eq("id", quiz.id).single()).data?.draft as { pages: { title?: string }[] }).pages[0].title, { timeout: 30_000 }).toBe("Edited by the browser test");
  const { data } = await admin.from("quizzes").select("draft_version, published").eq("id", quiz.id).single();
  expect(data!.draft_version).toBeGreaterThan(1);
  expect(data!.published).toBeNull();
  await page.reload();
  await expect(page.locator("input[value='Edited by the browser test']")).toBeVisible({ timeout: 30_000 });
});

test("a picture is uploaded to the person's own folder, listed in My pictures, and can be opened by anyone with the link", async ({ page, request }) => {
  const owner = await makePerson();
  const quiz = await makeQuiz(owner.id);
  await login(page, owner.email);
  await page.goto(`/dashboard/${quiz.id}`);
  await page.getByRole("button", { name: "Add a picture" }).first().click({ timeout: 30_000 });
  await page.locator("input[type=file]").setInputFiles({ name: "dot.png", mimeType: "image/png", buffer: PNG });
  await expect.poll(async () => (await admin.from("media").select("path, mime, owner_id").eq("owner_id", owner.id)).data?.length, { timeout: 45_000 }).toBe(1);
  const { data } = await admin.from("media").select("path, mime").eq("owner_id", owner.id).single();
  expect(data!.path.startsWith(`${owner.id}/`)).toBe(true);
  // The browser shrinks every picture before sending it, so it arrives as a JPEG
  expect(["image/png", "image/jpeg"]).toContain(data!.mime);
  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}`;
  if (publicUrl) {
    const file = await request.get(`${publicUrl}/storage/v1/object/public/quiz-media/${data!.path}`);
    expect(file.status()).toBe(200);
  }
});

test("two people cannot hold the same web address, and the second one is told", async ({ page }) => {
  const first = await makePerson();
  const second = await makePerson();
  const slug = `shared-${Date.now().toString(36)}`;
  await makeQuiz(first.id, { slug });
  const mine = await makeQuiz(second.id);
  await login(page, second.email);
  await page.goto(`/dashboard/${mine.id}/settings`);
  const address = page.getByLabel("Web address");
  await expect(address).toBeVisible({ timeout: 30_000 });
  await address.fill(slug);
  await expect(page.getByText("That address is already taken. Try another one.")).toBeVisible({ timeout: 30_000 });
  const { data } = await admin.from("quizzes").select("slug").eq("id", mine.id).single();
  expect(data!.slug).not.toBe(slug);
  // A free address is accepted
  await address.fill(`free-${slug}`);
  await expect(page.getByText("That address is free.")).toBeVisible({ timeout: 30_000 });
  await expect.poll(async () => (await admin.from("quizzes").select("slug").eq("id", mine.id).single()).data?.slug, { timeout: 20_000 }).toBe(`free-${slug}`);
});

test("a published quiz has a Share dialog with its real link", async ({ page }) => {
  const owner = await makePerson();
  const quiz = await makeQuiz(owner.id, { published: true });
  await login(page, owner.email);
  await page.goto(`/dashboard/${quiz.id}`);
  await page.getByRole("button", { name: "Share" }).first().click({ timeout: 30_000 });
  await expect(page.getByRole("dialog").locator("input").first()).toHaveValue(new RegExp(`/quiz/${quiz.slug}$`), { timeout: 30_000 });
});

test("a page that only some people see is shown to them and skipped for the others", async ({ browser }) => {
  const owner = await makePerson();
  const quiz = await makeQuiz(owner.id, { published: true });
  for (const [answer, shows] of [
    ["Lose weight", true],
    ["Tone", false],
  ] as const) {
    const context = await browser.newContext();
    const tab = await context.newPage();
    await tab.goto(`/quiz/${quiz.slug}`);
    await tab.getByRole("button", { name: "Start the quiz" }).click();
    await tab.getByRole("radio", { name: answer }).click();
    if (shows) await expect(tab.getByText("Your height")).toBeVisible({ timeout: 30_000 });
    else await expect(tab.getByText("Thanks")).toBeVisible({ timeout: 30_000 });
    await context.close();
  }
});
