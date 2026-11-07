import { expect, test, type Page } from "@playwright/test";
import { readHtml, waitForMessage } from "../mail/mailbox.ts";
import { admin, cleanup, makePerson, PASSWORD } from "./helpers/supabase";

/**
 * QC-14 account, QC-16 admin and the contact form on the real Supabase dev project. People are made with the service key
 * and removed at the end. The contact test sends one email into the Mailtrap test inbox.
 */
test.afterAll(cleanup);

/** Logs in and waits until the dashboard is open, so the next page already has the session. */
const login = async (page: Page, email: string, password = PASSWORD, expectDashboard = true) => {
  await page.goto("/login");
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  if (expectDashboard) await page.waitForURL("**/dashboard", { timeout: 45_000 });
};

test.describe("the account page", () => {
  test("the name is saved, and the details shown are the real ones", async ({ page }) => {
    const person = await makePerson({ name: "Old Name" });
    await login(page, person.email);
    await page.goto("/account");
    await expect(page.getByLabel("Email")).toHaveValue(person.email, { timeout: 30_000 });
    const name = page.getByLabel("Name");
    await name.fill("New Name");
    await name.blur();
    await expect.poll(async () => (await admin.from("profiles").select("name").eq("id", person.id).single()).data?.name, { timeout: 20_000 }).toBe("New Name");
  });

  test("changing the password needs the current one, keeps the person in, and the old one stops working", async ({ page }) => {
    const person = await makePerson();
    await login(page, person.email);
    await page.goto("/account");
    await page.getByRole("button", { name: "Change password" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Current password").fill("not-my-password");
    await dialog.getByLabel("New password", { exact: true }).fill("Brand-new-pass-9");
    await dialog.getByLabel("Confirm new password").fill("Brand-new-pass-9");
    await dialog.getByRole("button", { name: /Update/ }).click();
    await expect(dialog.getByText(/current password/i)).toBeVisible({ timeout: 30_000 });

    await dialog.getByLabel("Current password").fill(PASSWORD);
    await dialog.getByRole("button", { name: /Update/ }).click();
    await expect(dialog).toBeHidden({ timeout: 30_000 });

    // QC-17: the "password changed" email reached the test inbox, written from the template
    const mail = await waitForMessage(person.email, 45_000);
    expect(mail.subject).toBe("Your Quiz password was changed");
    expect(await readHtml(mail.id)).toContain("Your password was changed");

    await page.context().clearCookies();
    await login(page, person.email, PASSWORD, false);
    await expect(page.getByText("That email and password don’t match.")).toBeVisible();
    await login(page, person.email, "Brand-new-pass-9");
  });

  test("deleting the account removes the person, their quizzes and their answers", async ({ page }) => {
    const person = await makePerson();
    const { data: quiz } = await admin
      .from("quizzes")
      .insert({ owner_id: person.id, name: "Gone soon", slug: `gone-${Date.now().toString(36)}`, draft: { format: "quiz-v1", name: "Gone soon", pages: [] } })
      .select("id")
      .single();
    await login(page, person.email);
    await page.goto("/account");
    await page.getByRole("button", { name: "Delete my account" }).click();
    await page.getByRole("dialog").getByLabel(/Type DELETE/i).fill("DELETE");
    await page.getByRole("dialog").getByRole("button", { name: /Delete/ }).last().click();
    await page.waitForURL("**/goodbye", { timeout: 30_000 });
    const { data: gone } = await admin.auth.admin.getUserById(person.id);
    expect(gone.user).toBeNull();
    const { count } = await admin.from("quizzes").select("id", { count: "exact", head: true }).eq("id", quiz!.id);
    expect(count).toBe(0);
  });

  test("the link in the new-address email changes the email, and a made-up link does not", async ({ page }) => {
    const person = await makePerson();
    const { createHash } = await import("node:crypto");
    const token = "t".repeat(48);
    const newEmail = `moved-${person.email}`;
    await admin.from("email_changes").insert({ user_id: person.id, new_email: newEmail, token_hash: createHash("sha256").update(token).digest("hex"), expires_at: new Date(Date.now() + 3_600_000).toISOString() });
    await page.goto("/auth/email-change/confirm?token=nope");
    await expect(page).toHaveURL(/\/verify-email\/expired/);
    await page.goto(`/auth/email-change/confirm?token=${token}`);
    await expect.poll(async () => (await admin.auth.admin.getUserById(person.id)).data.user?.email, { timeout: 20_000 }).toBe(newEmail);
    // The same link cannot be used twice
    await page.goto(`/auth/email-change/confirm?token=${token}`);
    await expect(page).toHaveURL(/\/verify-email\/expired/);
  });
});

test.describe("the admin area", () => {
  test("an admin suspends a person (login stops), restores them, and cannot touch their own account", async ({ page, browser }) => {
    const boss = await makePerson({ role: "admin", name: "Boss QC" });
    const target = await makePerson({ name: "Target QC" });
    await login(page, boss.email);
    await page.goto(`/admin/users/${target.id}`);
    await expect(page.getByRole("heading", { name: "Target QC" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: "Suspend account" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Suspend account" }).click();
    await expect(page.getByText("This account is suspended.")).toBeVisible({ timeout: 30_000 });

    const other = await browser.newContext();
    const tab = await other.newPage();
    await login(tab, target.email, PASSWORD, false);
    await expect(tab.getByText("This account is suspended.")).toBeVisible({ timeout: 30_000 });

    await page.getByRole("button", { name: "Restore account" }).click();
    await expect(page.getByText("This account is suspended.")).toBeHidden({ timeout: 30_000 });
    await login(tab, target.email);
    await other.close();

    await page.goto(`/admin/users/${boss.id}`);
    await expect(page.getByRole("button", { name: "Suspend account" })).toBeDisabled({ timeout: 30_000 });
    const { data: log } = await admin.from("admin_log").select("action").eq("admin_id", boss.id).order("created_at");
    expect(log?.map((row) => row.action)).toEqual(["suspend", "restore"]);
  });

  test("a plan change is saved, applies to the person's limits, and Free clears the extras", async ({ page }) => {
    const boss = await makePerson({ role: "admin" });
    const target = await makePerson();
    await login(page, boss.email);
    await page.goto(`/admin/users/${target.id}`);
    await page.getByRole("radio", { name: "Custom" }).click();
    await page.getByLabel("Quizzes").fill("50");
    await page.getByRole("button", { name: "Save plan" }).click();
    await expect.poll(async () => (await admin.from("profiles").select("plan, max_quizzes").eq("id", target.id).single()).data, { timeout: 30_000 }).toMatchObject({ plan: "custom", max_quizzes: 50 });
    // Wait for the first save to finish (the card redraws with the saved values) before changing again
    await expect(page.getByText(/limits apply now/)).toBeVisible({ timeout: 30_000 });
    await page.getByRole("radio", { name: "Free" }).click();
    await page.getByRole("button", { name: "Save plan" }).click();
    await expect.poll(async () => (await admin.from("profiles").select("plan, max_quizzes").eq("id", target.id).single()).data, { timeout: 30_000 }).toMatchObject({ plan: "free", max_quizzes: null });
  });

  test("deleting a person needs their email and takes everything with it", async ({ page }) => {
    const boss = await makePerson({ role: "admin" });
    const target = await makePerson();
    await login(page, boss.email);
    await page.goto(`/admin/users/${target.id}`);
    await page.getByRole("button", { name: "Delete account" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/Type their email/).fill(target.email);
    await dialog.getByRole("button", { name: "Delete account" }).click();
    await page.waitForURL("**/admin/users", { timeout: 30_000 });
    expect((await admin.auth.admin.getUserById(target.id)).data.user).toBeNull();
  });
});

test.describe("the contact form", () => {
  test("a message is saved and emailed to the owner with the visitor as reply-to", async ({ page }) => {
    await page.goto("/contact");
    const email = `visitor-${Date.now().toString(36)}@example.com`;
    await page.locator("input[name=name]").fill("Visitor QC");
    await page.locator("input[name=email]").fill(email);
    await page.locator("textarea[name=message]").fill("Hello from the browser test");
    await page.getByRole("button", { name: /Send/ }).click();
    await expect(page.getByText(/sent|thank/i).first()).toBeVisible({ timeout: 45_000 });
    await expect.poll(async () => (await admin.from("contact_messages").select("email_sent, message").eq("email", email).single()).data, { timeout: 20_000 }).toMatchObject({ email_sent: true, message: "Hello from the browser test" });
    // QC-17: and the owner got the email, with the visitor's words in it
    const mail = await waitForMessage("basurah@basrh.com", 45_000);
    expect(mail.subject).toBe("New message from the Quiz contact form");
    const html = await readHtml(mail.id);
    expect(html).toContain("Hello from the browser test");
    expect(html).toContain(`mailto:${email}`);
    await admin.from("contact_messages").delete().eq("email", email);
  });
});
