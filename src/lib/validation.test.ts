import { describe, expect, it } from "vitest";
import { forgotProblems, isValidEmail, registerProblems, resetProblems } from "./validation";

describe("isValidEmail", () => {
  it("accepts an ordinary address, ignoring spaces around it", () => {
    expect(isValidEmail(" sarah@example.com ")).toBe(true);
  });

  it("refuses a missing @, a missing dot and spaces inside", () => {
    expect(isValidEmail("sarah.example.com")).toBe(false);
    expect(isValidEmail("sarah@example")).toBe(false);
    expect(isValidEmail("sa rah@example.com")).toBe(false);
  });
});

describe("registerProblems", () => {
  it("has nothing to say about a good form", () => {
    expect(registerProblems({ name: "Sarah", email: "sarah@example.com", password: "12345678" })).toEqual({});
  });

  it("names each field that is wrong, and only those", () => {
    expect(registerProblems({ name: "  ", email: "nope", password: "short" })).toEqual({ name: "name_missing", email: "email_invalid", password: "password_short" });
    expect(registerProblems({ name: "Sarah", email: "", password: "" })).toEqual({ email: "email_missing", password: "password_missing" });
  });
});

describe("forgotProblems", () => {
  it("asks for an email, then for a valid one", () => {
    expect(forgotProblems({ email: "" })).toEqual({ email: "email_missing" });
    expect(forgotProblems({ email: "sarah@" })).toEqual({ email: "email_invalid" });
    expect(forgotProblems({ email: "sarah@example.com" })).toEqual({});
  });
});

describe("resetProblems", () => {
  it("checks the length of the new password and that the two are the same", () => {
    expect(resetProblems({ password: "12345678", confirm: "12345678" })).toEqual({});
    expect(resetProblems({ password: "1234", confirm: "1234" })).toEqual({ password: "password_short" });
    expect(resetProblems({ password: "12345678", confirm: "12345679" })).toEqual({ confirm: "passwords_differ" });
    expect(resetProblems({ password: "", confirm: "" })).toEqual({ password: "password_missing" });
  });
});
