import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * QC-18 accessibility (WCAG 2.1 AA): every main screen is scanned with axe, as a visitor, a person and the admin, on the
 * dummy-data app. Serious and critical findings fail the test. The scan covers contrast, names of buttons and fields, headings,
 * landmarks and focus order hints; the keyboard and screen reader checks that need a person are listed in plan/project_handover.md.
 */
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const screens: { who: "out" | "user" | "admin"; paths: string[] }[] = [
  { who: "out", paths: ["/", "/pricing", "/contact", "/terms", "/privacy", "/login", "/register", "/forgot-password", "/verify-email", "/reset-password", "/quiz/body-reset", "/quiz/debug-quiz", "/this-page-does-not-exist"] },
  { who: "user", paths: ["/dashboard", "/dashboard/quiz-body-reset", "/dashboard/quiz-body-reset/responses", "/dashboard/quiz-body-reset/settings", "/dashboard/quiz-body-reset/preview", "/account"] },
  { who: "admin", paths: ["/admin", "/admin/users", "/admin/users/u-maria"] },
];

async function scan(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("load");
  await page.waitForTimeout(1200);
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).exclude("[data-axe-skip]").analyze();
  return violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${path}: ${v.id} (${v.impact}) ${v.help} — ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
}

for (const { who, paths } of screens) {
  test(`no serious accessibility problems, ${who === "out" ? "a visitor" : who === "user" ? "a person" : "the admin"}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL: baseURL!, viewport: { width: 1280, height: 800 } });
    const login = await context.newPage();
    await login.goto(`/dev/session?as=${who}&next=${encodeURIComponent("/dev")}`);
    await login.close();
    const page = await context.newPage();
    const problems: string[] = [];
    for (const path of paths) problems.push(...(await scan(page, path)));
    await context.close();
    expect(problems, problems.join("\n")).toEqual([]);
  });
}

test("the quiz on a phone: every state has no serious problems", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL: baseURL!, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const problems: string[] = [];
  await page.goto("/quiz/body-reset");
  await page.waitForTimeout(1200);
  problems.push(...(await scan(page, "/quiz/body-reset")));
  await page.getByRole("button", { name: "Start the quiz" }).click();
  await page.waitForTimeout(500);
  problems.push(...(await new AxeBuilder({ page }).withTags(TAGS).analyze()).violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `choice page: ${v.id} ${v.help}`));
  await page.getByRole("radio", { name: "Lose weight" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(500);
  problems.push(...(await new AxeBuilder({ page }).withTags(TAGS).analyze()).violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `number page with an error: ${v.id} ${v.help}`));
  await context.close();
  expect(problems, problems.join("\n")).toEqual([]);
});
