import { expect, test, type Browser, type Page } from "@playwright/test";
import { admin, cleanup, makePerson, PASSWORD } from "./helpers/supabase";

/**
 * The screens built without a board (checklist H) that need the real database to prove: the "changed somewhere else" dialog
 * (G1, two windows of the same person), the "Full" quiz card (G8) and the admin filter "Near a limit" (G7).
 */
test.afterAll(cleanup);

const welcome = { id: "w", type: "welcome", title: "Gaps QC", text: "", picture: null };
const end = { id: "e", type: "end", style: "thanks", title: "Thanks", text: "", picture: null };

let counter = 0;
async function makeQuiz(ownerId: string, published = false) {
  counter += 1;
  const doc = { format: "quiz-v1", name: `Gaps ${counter}`, pages: [welcome, end] };
  const { data, error } = await admin
    .from("quizzes")
    .insert({
      owner_id: ownerId,
      name: doc.name,
      slug: `qg-${Date.now().toString(36)}-${counter}`,
      draft: doc,
      published: published ? doc : null,
      published_version: published ? 1 : null,
      published_at: published ? new Date().toISOString() : null,
    })
    .select("id")
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

/** The same person with the same quiz open in two windows, both loaded before anyone saves. */
async function twoWindows(browser: Browser) {
  const owner = await makePerson();
  const quiz = await makeQuiz(owner.id);
  const contexts = [await browser.newContext(), await browser.newContext()];
  const [a, b] = await Promise.all(contexts.map((context) => context.newPage()));
  await Promise.all([login(a, owner.email), login(b, owner.email)]);
  await Promise.all([a.goto(`/dashboard/${quiz.id}`), b.goto(`/dashboard/${quiz.id}`)]);
  for (const page of [a, b]) await expect(page.locator("input[value='Gaps QC']").first()).toBeVisible({ timeout: 30_000 });
  const draftTitle = async () => ((await admin.from("quizzes").select("draft").eq("id", quiz.id).single()).data?.draft as { pages: { title?: string }[] }).pages[0].title;
  const close = () => Promise.all(contexts.map((context) => context.close()));
  return { a, b, draftTitle, close };
}

test("a save from a second window asks what to do and overwrites nothing; Keep my version saves this window", async ({ browser }) => {
  const { a, b, draftTitle, close } = await twoWindows(browser);
  await b.locator("input[value='Gaps QC']").first().fill("From window B");
  await expect.poll(draftTitle, { timeout: 30_000 }).toBe("From window B");

  await a.locator("input[value='Gaps QC']").first().fill("From window A");
  const dialog = a.getByRole("dialog", { name: "This quiz was changed somewhere else" });
  await expect(dialog).toBeVisible({ timeout: 30_000 });
  expect(await draftTitle()).toBe("From window B");

  await dialog.getByRole("button", { name: "Keep my version" }).click();
  await expect(dialog).toBeHidden({ timeout: 30_000 });
  await expect.poll(draftTitle, { timeout: 30_000 }).toBe("From window A");
  await close();
});

test("Load the newest drops this window's change and shows the other window's save", async ({ browser }) => {
  const { a, b, draftTitle, close } = await twoWindows(browser);
  await b.locator("input[value='Gaps QC']").first().fill("From window B");
  await expect.poll(draftTitle, { timeout: 30_000 }).toBe("From window B");

  await a.locator("input[value='Gaps QC']").first().fill("From window A");
  await a.getByRole("dialog", { name: "This quiz was changed somewhere else" }).getByRole("button", { name: "Load the newest" }).click();
  await expect(a.locator("input[value='From window B']").first()).toBeVisible({ timeout: 30_000 });
  expect(await draftTitle()).toBe("From window B");
  await close();
});

test("a published quiz that reached its response limit shows as Full, without Copy link", async ({ page }) => {
  const owner = await makePerson();
  const quiz = await makeQuiz(owner.id, true);
  await admin.from("quizzes").update({ finished_count: 500 }).eq("id", quiz.id);
  await login(page, owner.email);
  await expect(page.getByText("Full", { exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("It reached 500 responses. People see that it is closed.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy link" })).toHaveCount(0);
});

test("the admin filter Near a limit lists a person at 4 of 5 quizzes and not one with none", async ({ page }) => {
  const boss = await makePerson({ role: "admin", name: "Boss gaps" });
  const near = await makePerson({ name: "Near gaps" });
  const far = await makePerson({ name: "Far gaps" });
  for (let i = 0; i < 4; i += 1) await makeQuiz(near.id);
  await login(page, boss.email);
  await page.goto("/admin/users?filter=near-limit");
  await expect(page.getByText(near.email)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(far.email)).toHaveCount(0);
});
