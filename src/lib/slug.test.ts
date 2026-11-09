import { describe, expect, it } from "vitest";
import { checkSlug, makeSlug, slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and joins words with single hyphens", () => {
    expect(slugify("Body Reset")).toBe("body-reset");
    expect(slugify("  Hello,   World!!  ")).toBe("hello-world");
  });

  it("removes accents and drops characters it cannot keep", () => {
    expect(slugify("Café Été")).toBe("cafe-ete");
    expect(slugify("日本語")).toBe("");
  });

  it("cuts to 60 characters without leaving a hyphen at the end", () => {
    const slug = slugify(`${"a".repeat(59)} b`);
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("checkSlug", () => {
  it("accepts good addresses", () => {
    expect(checkSlug("body-reset")).toBeNull();
    expect(checkSlug("abc")).toBeNull();
    expect(checkSlug("a1-b2-c3")).toBeNull();
  });

  it("rejects bad shapes and lengths", () => {
    for (const bad of ["ab", "-abc", "abc-", "a--b", "Abc", "a b c", "a_b_c", "a".repeat(61)]) {
      expect(checkSlug(bad)).toBe("invalid");
    }
  });

  it("rejects reserved words", () => {
    expect(checkSlug("admin")).toBe("reserved");
    expect(checkSlug("login")).toBe("reserved");
  });
});

describe("makeSlug", () => {
  it("is the name as a slug and an eight digit number", () => {
    expect(makeSlug("Body Reset", () => false, () => 0)).toBe("body-reset-10000000");
    expect(makeSlug("Contact Form", () => false)).toMatch(/^contact-form-[1-9]\d{7}$/);
  });

  it("tries another number when one is taken", () => {
    const numbers = [0, 0.5];
    const slug = makeSlug("Body Reset", (s) => s === "body-reset-10000000", () => numbers.shift() ?? 0.9);
    expect(slug).toBe("body-reset-55000000");
  });

  it("falls back to my-quiz when the name gives nothing usable", () => {
    expect(makeSlug("日本語", () => false, () => 0)).toBe("my-quiz-10000000");
  });

  it("keeps a very long name within the allowed length", () => {
    const slug = makeSlug("a".repeat(100), () => false) as string;
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(checkSlug(slug)).toBeNull();
  });

  it("gives up after 5 taken tries", () => {
    expect(makeSlug("Body Reset", () => true)).toBeNull();
  });
});
