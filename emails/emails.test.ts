import { describe, expect, it } from "vitest";
import { Contact, emails, renderEmail, type EmailId } from "./index";
import { createElement } from "react";
import { render } from "@react-email/components";

const html = (id: EmailId) => renderEmail(id);
const flat = (value: string) => value.replace(/<!--.*?-->/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

describe("the five emails", () => {
  it("all render to a whole HTML page with no empty values", async () => {
    for (const email of emails) {
      const page = await html(email.id);
      expect(page, email.id).toContain("<html");
      expect(page, email.id).not.toMatch(/undefined|NaN|\[object/);
      expect(page, email.id).toContain("quiz");
    }
  });

  it("verify: greets by name, links to the address, says 1 hour (what Supabase really allows), and says who to ignore it for", async () => {
    const text = flat(await html("verify"));
    expect(text).toContain("Hi Sarah, thanks for signing up");
    expect(text).toContain("This link works for 1 hour");
    expect(text).toContain("If you didn’t create a Quiz account, you can ignore this email.");
    expect(await html("verify")).toContain('href="https://quiz.basrh.com/verify-email/done?token=a1b2c3d4e5f6"');
  });

  it("reset: the link works for 1 hour", async () => {
    const text = flat(await html("reset"));
    expect(text).toContain("This link works for 1 hour");
    expect(text).toContain("Your password stays the same.");
  });

  it("new address: names the new address and says the old one keeps working", async () => {
    const text = flat(await html("new-address"));
    expect(text).toContain("change your Quiz email to new@example.com");
    expect(text).toContain("you keep logging in with your old email");
    expect(text).toContain("This link works for 24 hours");
  });

  it("password changed: says when, signs out, and offers a reset and the contact address", async () => {
    const page = await html("password-changed");
    const text = flat(page);
    expect(text).toContain("changed on November 6, 2026");
    expect(text).toContain("You were signed out on all devices.");
    expect(page).toContain('href="https://quiz.basrh.com/forgot-password"');
    expect(page).toContain('href="mailto:basurah@basrh.com"');
  });

  it("contact: shows what the visitor wrote and replies to them, and only lists Needs when something was picked", async () => {
    const page = await html("contact");
    expect(flat(page)).toContain("Needs Your own domain, Your colors and logo");
    expect(page).toContain('href="mailto:sarah@example.com"');
    expect(flat(page)).toContain("Reply to Sarah");
    const none = flat(await render(createElement(Contact, { name: "Tom", email: "tom@example.com", needs: [], message: "Hello" })));
    expect(none).not.toContain("Needs");
  });

  it("contact: text from a visitor is never turned into markup", async () => {
    const page = await render(createElement(Contact, { name: "<b>Eve</b>", email: "eve@example.com", needs: [], message: "<script>alert(1)</script>" }));
    expect(page).not.toContain("<script>alert(1)</script>");
    expect(page).toContain("&lt;script&gt;");
  });

  it("every email has a subject and a sender or receiver line", () => {
    for (const email of emails) {
      expect(email.subject.length).toBeGreaterThan(5);
      expect(email.header.address).toContain("@");
    }
  });
});
