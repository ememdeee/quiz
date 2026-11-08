import { expect, test, type Page } from "@playwright/test";
import { admin, cleanup, makePerson, PASSWORD } from "./helpers/supabase";

/**
 * QC-04 to QC-13 on the real Supabase dev project: owner side (create, limits, preview, isolation), the public side (answer a
 * quiz with no account, resume, closed, tampering) and what the owner reads afterwards. People and quizzes are made with
 * the service key and removed at the end.
 */
test.afterAll(cleanup);

const welcome = { id: "w", type: "welcome", title: "QC quiz", text: "Hello", picture: null };
const goal = {
  id: "goal",
  type: "choice",
  question: "What is your goal?",
  answers: [
    { id: "a", text: "Lose weight", picture: null },
    { id: "b", text: "Tone my body", picture: null },
  ],
  multiple: false,
  required: true,
  picture: null,
};
const age = { id: "age", type: "number", question: "How old are you?", kind: "age", unit: "years", min: 18, max: 99, required: true };
const end = { id: "e", type: "end", style: "thanks", title: "Thank you!", text: "Bye", picture: null };
const docOf = (name: string, pages: object[] = [welcome, goal, age, end]) => ({ format: "quiz-v1", name, pages });

let counter = 0;
async function makeQuiz(ownerId: string, options: { published?: boolean; accepting?: boolean; pages?: object[] } = {}) {
  counter += 1;
  const slug = `qc-${Date.now().toString(36)}-${counter}`;
  const doc = docOf(`QC ${counter}`, options.pages);
  const published = options.published ?? true;
  const { data, error } = await admin
    .from("quizzes")
    .insert({
      owner_id: ownerId,
      name: doc.name,
      slug,
      draft: doc,
      published: published ? doc : null,
      published_version: published ? 1 : null,
      published_at: published ? new Date().toISOString() : null,
      accepting_responses: options.accepting ?? true,
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
  await page.waitForURL("**/dashboard");
};

test.describe("the owner's side", () => {
  test("a new person sees an empty list and can create a quiz that is saved for them", async ({ page }) => {
    const person = await makePerson();
    await login(page, person.email);
    await expect(page.getByText("No quizzes yet")).toBeVisible();
    await page.getByRole("button", { name: "New quiz" }).first().click();
    await page.getByLabel("Quiz name").fill("QC Survey");
    await page.getByRole("button", { name: "Create quiz" }).click();
    await page.waitForURL(/\/dashboard\/[0-9a-f-]{36}/, { timeout: 30_000 });
    const { data } = await admin.from("quizzes").select("name, slug, owner_id, published").eq("owner_id", person.id);
    expect(data).toHaveLength(1);
    expect(data![0]).toMatchObject({ name: "QC Survey", slug: "qc-survey", published: null });
  });

  test("the Free plan stops the sixth quiz with a clear message, and the database agrees", async ({ page }) => {
    const person = await makePerson();
    for (let i = 0; i < 5; i += 1) await makeQuiz(person.id, { published: false });
    await login(page, person.email);
    await page.getByRole("button", { name: "New quiz" }).first().click();
    // At the limit the dialog that explains it opens at once, before any name is asked for
    await expect(page.getByText(/reached 5 quizzes/i)).toBeVisible({ timeout: 30_000 });
    const { count } = await admin.from("quizzes").select("id", { count: "exact", head: true }).eq("owner_id", person.id);
    expect(count).toBe(5);
  });

  test("nobody else can open or read another person's quiz, and the public link never shows the draft", async ({ page, request }) => {
    const owner = await makePerson();
    const stranger = await makePerson();
    const quiz = await makeQuiz(owner.id);
    // The owner edits after publishing: people must keep seeing what was published
    await admin.from("quizzes").update({ draft: docOf("SECRET DRAFT TITLE", [{ ...welcome, title: "SECRET DRAFT TITLE" }, goal, end]) }).eq("id", quiz.id);
    const publicCopy = await request.get(`/api/q/${quiz.slug}`);
    const body = await publicCopy.text();
    expect(body).toContain("QC quiz");
    expect(body).not.toContain("SECRET DRAFT TITLE");

    await login(page, stranger.email);
    await page.goto(`/dashboard/${quiz.id}`);
    await expect(page.getByText("We can’t find this quiz")).toBeVisible();
    await page.goto(`/dashboard/${quiz.id}/responses`);
    await expect(page.getByText("We can’t find this quiz")).toBeVisible();
    await page.goto(`/dashboard/${quiz.id}/preview`);
    await expect(page.getByText("We can’t find this quiz")).toBeVisible();
  });

  test("Try it shows the unpublished draft and never saves an answer", async ({ page }) => {
    const owner = await makePerson();
    const quiz = await makeQuiz(owner.id, { published: false });
    await login(page, owner.email);
    await page.goto(`/dashboard/${quiz.id}/preview`);
    await expect(page.getByText("Preview · your answers aren’t saved")).toBeVisible();
    await page.getByRole("button", { name: "Start the quiz" }).click();
    await page.getByRole("radio", { name: "Lose weight" }).click();
    await expect(page.getByText("How old are you?")).toBeVisible();
    const { count } = await admin.from("responses").select("id", { count: "exact", head: true }).eq("quiz_id", quiz.id);
    expect(count).toBe(0);
  });

  test("publishing is blocked until the quiz has a question (the board says 'Add a question first'), and works after", async ({ page }) => {
    const owner = await makePerson();
    const quiz = await makeQuiz(owner.id, { published: false, pages: [welcome, end] });
    await login(page, owner.email);
    await page.goto(`/dashboard/${quiz.id}`);
    await page.getByRole("button", { name: /^Publish/ }).first().click();
    await expect(page.getByText("Add a question first")).toBeVisible({ timeout: 30_000 });
    const { data: blocked } = await admin.from("quizzes").select("published").eq("id", quiz.id).single();
    expect(blocked!.published).toBeNull();

    await admin.from("quizzes").update({ draft: docOf("QC ok") }).eq("id", quiz.id);
    await page.goto(`/dashboard/${quiz.id}`);
    await page.getByRole("button", { name: /^Publish/ }).first().click();
    await page.getByRole("dialog").getByRole("button", { name: "Publish", exact: true }).click();
    await expect.poll(async () => (await admin.from("quizzes").select("published_at").eq("id", quiz.id).single()).data?.published_at, { timeout: 30_000 }).not.toBeNull();
  });
});

test.describe("the public side", () => {
  test("a stranger answers a quiz to the end; the answers are saved with the published words and the owner sees them", async ({ page, browser }) => {
    const owner = await makePerson();
    const quiz = await makeQuiz(owner.id);
    const visitor = await browser.newContext();
    const tab = await visitor.newPage();
    await tab.goto(`/quiz/${quiz.slug}`);
    await tab.getByRole("button", { name: "Start the quiz" }).click();
    await tab.getByRole("radio", { name: "Tone my body" }).click();
    await tab.locator("input").first().fill("34");
    await tab.getByRole("button", { name: "Continue" }).click();
    await expect(tab.getByText("Thank you!")).toBeVisible({ timeout: 30_000 });
    await visitor.close();

    await expect
      .poll(async () => (await admin.from("responses").select("status, answers, last_page_id").eq("quiz_id", quiz.id)).data?.[0]?.status, { timeout: 15_000 })
      .toBe("finished");
    const { data } = await admin.from("responses").select("answers, pages_seen, last_page_id").eq("quiz_id", quiz.id).single();
    expect(data!.answers).toMatchObject({ goal: { type: "choice", q: "What is your goal?", v: ["b"], vt: ["Tone my body"] }, age: { type: "number", v: 34 } });
    expect(data!.pages_seen).toEqual(["w", "goal", "age", "e"]);
    expect(data!.last_page_id).toBe("e");
    const { data: counted } = await admin.from("quizzes").select("finished_count").eq("id", quiz.id).single();
    expect(counted!.finished_count).toBe(1);

    await login(page, owner.email);
    await page.goto(`/dashboard/${quiz.id}/responses`);
    await expect(page.getByText("Tone my body").first()).toBeVisible({ timeout: 30_000 });
  });

  test("someone who stops half way sees Welcome back, and Continue brings their answers back", async ({ browser }) => {
    const owner = await makePerson();
    const quiz = await makeQuiz(owner.id);
    const visitor = await browser.newContext();
    const tab = await visitor.newPage();
    await tab.goto(`/quiz/${quiz.slug}`);
    await tab.getByRole("button", { name: "Start the quiz" }).click();
    await tab.getByRole("radio", { name: "Lose weight" }).click();
    await expect(tab.getByText("How old are you?")).toBeVisible();
    await tab.goto(`/quiz/${quiz.slug}`);
    await expect(tab.getByText("Welcome back")).toBeVisible({ timeout: 30_000 });
    await tab.getByRole("button", { name: "Continue" }).click();
    await expect(tab.getByText("How old are you?")).toBeVisible();
    await tab.getByRole("button", { name: "Go back" }).click();
    await expect(tab.getByRole("radio", { name: "Lose weight" })).toBeChecked();
    const { data } = await admin.from("responses").select("status").eq("quiz_id", quiz.id);
    expect(data).toEqual([{ status: "in_progress" }]);
    await visitor.close();
  });

  test("closed, not published and unknown quizzes show the right screen", async ({ page }) => {
    const owner = await makePerson();
    const closed = await makeQuiz(owner.id, { accepting: false });
    const draft = await makeQuiz(owner.id, { published: false });
    await page.goto(`/quiz/${closed.slug}`);
    await expect(page.getByText("This quiz is closed")).toBeVisible({ timeout: 30_000 });
    await page.goto(`/quiz/${draft.slug}`);
    await expect(page.getByText("This quiz isn’t open yet")).toBeVisible({ timeout: 30_000 });
    await page.goto("/quiz/no-such-quiz-anywhere");
    await expect(page.getByText("We can’t find this quiz")).toBeVisible({ timeout: 30_000 });
    // Turning a quiz off while someone is answering closes it on their next step
    await admin.from("profiles").update({ status: "suspended" }).eq("id", owner.id);
    const open = await makeQuiz(owner.id);
    await page.goto(`/quiz/${open.slug}`);
    await expect(page.getByText("This quiz is closed")).toBeVisible({ timeout: 30_000 });
  });

  test("the public endpoints refuse a wrong token, made-up answers and the wrong quiz's pages", async ({ request }) => {
    const owner = await makePerson();
    const one = await makeQuiz(owner.id);
    const other = await makeQuiz(owner.id, { pages: [welcome, { ...goal, id: "other" }, end] });
    const started = await (await request.post(`/api/q/${one.slug}/start`)).json();
    expect(started.status).toBe("open");
    const url = `/api/r/${started.responseId}/answer`;
    const good = { answers: { goal: ["a"] }, pagesSeen: ["w", "goal"], lastPageId: "goal" };

    expect((await request.post(url, { data: { token: "wrong", progress: good } })).status()).toBe(403);
    expect((await request.post(url, { data: { token: started.token, progress: { ...good, answers: { goal: ["zzz"] } } } })).status()).toBe(422);
    expect((await request.post(url, { data: { token: started.token, progress: { ...good, answers: { other: ["a"] } } } })).status()).toBe(422);
    expect((await request.post(url, { data: { token: started.token, progress: { ...good, answers: { age: 5 } } } })).status()).toBe(422);
    expect((await request.post(url, { data: { token: started.token, progress: good } })).status()).toBe(200);
    // Finishing needs every answer
    expect((await request.post(`/api/r/${started.responseId}/finish`, { data: { token: started.token, progress: good } })).status()).toBe(422);
    // Another quiz's response cannot be read with this token
    const second = await (await request.post(`/api/q/${other.slug}/start`)).json();
    expect((await request.post(`/api/r/${second.responseId}/resume`, { data: { token: started.token } })).status()).toBe(404);
    const resumed = await request.post(`/api/r/${started.responseId}/resume`, { data: { token: started.token } });
    expect((await resumed.json()).saved.answers.goal.vt).toEqual(["Lose weight"]);
  });

  test("a quiz that has reached its response limit says closed, and answers stop", async ({ request }) => {
    const owner = await makePerson();
    await admin.from("profiles").update({ max_responses: 1 }).eq("id", owner.id);
    const quiz = await makeQuiz(owner.id);
    const first = await (await request.post(`/api/q/${quiz.slug}/start`)).json();
    const second = await (await request.post(`/api/q/${quiz.slug}/start`)).json();
    const full = { answers: { goal: ["a"], age: 30 }, pagesSeen: ["w", "goal", "age", "e"], lastPageId: "e" };
    expect((await request.post(`/api/r/${first.responseId}/finish`, { data: { token: first.token, progress: full } })).status()).toBe(200);
    expect((await request.post(`/api/r/${second.responseId}/finish`, { data: { token: second.token, progress: full } })).status()).toBe(409);
    expect(((await (await request.get(`/api/q/${quiz.slug}`)).json()) as { status: string }).status).toBe("closed");
    const { data } = await admin.from("quizzes").select("finished_count").eq("id", quiz.id).single();
    expect(data!.finished_count).toBe(1);
  });
});
