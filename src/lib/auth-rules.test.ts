import { describe, expect, it } from "vitest";
import { isLockedOut, MAX_LOGIN_FAILURES, safeNext } from "./auth-rules";

describe("the sign-in lock", () => {
  it("locks from the fifth wrong password", () => {
    expect(isLockedOut(MAX_LOGIN_FAILURES - 1)).toBe(false);
    expect(isLockedOut(MAX_LOGIN_FAILURES)).toBe(true);
  });
});

describe("where to go after logging in", () => {
  it("keeps a page of this site", () => {
    expect(safeNext("/dashboard/abc?x=1", "/dashboard")).toBe("/dashboard/abc?x=1");
  });

  it("refuses other websites and tricks, and falls back", () => {
    for (const bad of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "evil", "", null, undefined]) {
      expect(safeNext(bad, "/dashboard")).toBe("/dashboard");
    }
  });
});
