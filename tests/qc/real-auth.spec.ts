import { expect, test, type Page } from "@playwright/test";
import { admin, cleanup, freshEmail, makePerson, PASSWORD, removeByEmail } from "./helpers/supabase";

/**
 * QC-02 register and verify, QC-03 login, lock and reset (handover 14.4), on the real Supabase dev project.
 * People are made and removed through the service key. The one test that registers through the website sends one email
 * (the free Mailtrap inbox allows 50 a month).
 */
test.afterAll(cleanup);

const login = async (page: Page, email: string, password: string, next?: string) => {
  await page.goto(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
};

test.describe("logging in", () => {
  test("a verified person logs in, sees the dashboard, and can log out", async ({ page }) => {
    const { email } = await makePerson({ name: "Sarah QC" });
    await login(page, email, PASSWORD);
    await page.waitForURL("**/dashboard");
    await page.getByRole("button", { name: "Account menu" }).click();
    await expect(page.getByText("Sarah QC")).toBeVisible();
    await page.getByRole("menuitem", { name: "Log out" }).click();
    await page.waitForURL((url) => url.pathname === "/");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
  });

  test("a wrong password says so, and the page does not say which half was wrong", async ({ page }) => {
    const { email } = await makePerson();
    await login(page, email, "not-the-password");
    await expect(page.getByText("That email and password don’t match.")).toBeVisible();
    await login(page, `nobody-${email}`, PASSWORD);
    await expect(page.getByText("That email and password don’t match.")).toBeVisible();
  });

  test("five wrong passwords lock the login, even for the right password, until the wait is over", async ({ page }) => {
    const { email } = await makePerson();
    for (let i = 0; i < 5; i += 1) await login(page, email, `wrong-${i}`);
    await expect(page.getByText("Too many tries.")).toBeVisible();
    await login(page, email, PASSWORD);
    await expect(page.getByText("Too many tries.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
    // After the wait (here: the lock is cleared) the right password works
    await admin.from("login_attempts").delete().eq("email", email);
    await login(page, email, PASSWORD);
    await page.waitForURL("**/dashboard");
  });

  test("someone who has not verified their email is told to, and cannot log in", async ({ page }) => {
    const { email } = await makePerson({ verified: false });
    await login(page, email, PASSWORD);
    await expect(page.getByText("Please verify your email first.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("a suspended person cannot log in and sees why", async ({ page }) => {
    const { id, email } = await makePerson();
    await admin.from("profiles").update({ status: "suspended", suspended_at: new Date().toISOString() }).eq("id", id);
    await login(page, email, PASSWORD);
    await expect(page.getByText("This account is suspended.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("a private page sends a stranger to Log in and brings them back afterwards", async ({ page }) => {
    const { email } = await makePerson();
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login\?next=%2Faccount/);
    await page.locator("#login-email").fill(email);
    await page.locator("#login-password").fill(PASSWORD);
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    await page.waitForURL("**/account");
  });

  test("the way back after login can only be a page of this site", async ({ page }) => {
    const { email } = await makePerson();
    await login(page, email, PASSWORD, "https://evil.example/steal");
    await page.waitForURL("**/dashboard");
    expect(new URL(page.url()).hostname).toBe("localhost");
  });
});

test.describe("verifying an email and resetting a password", () => {
  test("the link in the verify email signs the person in and shows Email verified", async ({ page }) => {
    const email = freshEmail();
    const { data, error } = await admin.auth.admin.generateLink({ type: "signup", email, password: PASSWORD, options: { data: { name: "Verify QC" } } });
    expect(error).toBeNull();
    await page.goto(`/auth/confirm?token_hash=${data.properties!.hashed_token}&type=email`);
    await expect(page).toHaveURL(/\/verify-email\/done/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    await removeByEmail(email);
  });

  test("an old or made-up link shows the right link-expired screen", async ({ page }) => {
    await page.goto("/auth/confirm?token_hash=made-up&type=email");
    await expect(page).toHaveURL(/\/verify-email\/expired/);
    await page.goto("/auth/confirm?token_hash=made-up&type=recovery");
    await expect(page).toHaveURL(/\/reset-password\/expired/);
    await page.goto("/auth/confirm");
    await expect(page).toHaveURL(/\/verify-email\/expired/);
  });

  test("a reset link lets the person choose a new password; the old one stops working", async ({ page }) => {
    const { email } = await makePerson();
    const { data } = await admin.auth.admin.generateLink({ type: "recovery", email });
    await page.goto(`/auth/confirm?token_hash=${data.properties!.hashed_token}&type=recovery`);
    await expect(page).toHaveURL(/\/reset-password$/);
    await page.locator("#reset-password").fill("A-brand-new-pass-2");
    await page.locator("#reset-confirm").fill("A-brand-new-pass-2");
    await page.getByRole("button", { name: "Save password" }).click();
    await expect(page).toHaveURL(/\/reset-password\/done/);
    await page.context().clearCookies();
    await login(page, email, PASSWORD);
    await expect(page.getByText("That email and password don’t match.")).toBeVisible();
    await login(page, email, "A-brand-new-pass-2");
    await page.waitForURL("**/dashboard");
  });

  test("setting a new password without a reset link is refused", async ({ page }) => {
    await page.goto("/reset-password");
    await page.locator("#reset-password").fill("Another-pass-3");
    await page.locator("#reset-confirm").fill("Another-pass-3");
    await page.getByRole("button", { name: "Save password" }).click();
    await expect(page).toHaveURL(/\/reset-password\/expired/);
  });

  test("registering through the website makes an unverified account and says to check the email", async ({ page }) => {
    const email = freshEmail();
    await page.goto("/register");
    await page.locator("input[name=name]").fill("Register QC");
    await page.locator("input[name=email]").fill(email);
    await page.locator("input[name=password]").fill(PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();
    // Supabase sends the email before it answers, and the first visit to a page compiles it: allow time
    await expect(page).toHaveURL(/\/verify-email/, { timeout: 45_000 });
    await expect(page.getByText(email)).toBeVisible();
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const made = data.users.find((u) => u.email === email);
    expect(made, "the account exists").toBeTruthy();
    expect(made!.email_confirmed_at, "not verified yet").toBeFalsy();
    const { data: profile } = await admin.from("profiles").select("name").eq("id", made!.id).single();
    expect(profile?.name).toBe("Register QC");
    await removeByEmail(email);
  });
});

test.describe("who may open the admin area", () => {
  test("a normal person and a stranger see no access; an admin gets in", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("You don’t have access to this page")).toBeVisible();

    const person = await makePerson();
    await login(page, person.email, PASSWORD);
    await page.waitForURL("**/dashboard");
    await page.goto("/admin");
    await expect(page.getByText("You don’t have access to this page")).toBeVisible();

    await page.context().clearCookies();
    const boss = await makePerson({ role: "admin" });
    await login(page, boss.email, PASSWORD);
    await page.waitForURL("**/dashboard");
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  });
});
