import { describe, expect, it } from "vitest";
import { clip, previewDescription, titleSize } from "./text";

describe("clip", () => {
  it("keeps a short text and cuts a long one at a word", () => {
    expect(clip("  Hello   world ", 40)).toBe("Hello world");
    const cut = clip("This is a rather long sentence about a quiz that goes on", 30);
    expect(cut.length).toBeLessThanOrEqual(30);
    expect(cut.endsWith("…")).toBe(true);
    expect(cut).not.toMatch(/ …$/);
  });
});

describe("titleSize", () => {
  it("gets smaller as the title gets longer, and smaller again beside a picture", () => {
    expect(titleSize("Short")).toBeGreaterThan(titleSize("A much longer title for a quiz about many things"));
    expect(titleSize("Short", true)).toBeLessThan(titleSize("Short"));
  });
});

describe("previewDescription", () => {
  it("uses the Start page words when there are some", () => {
    expect(previewDescription("Tell us how to reach you.", 3, "Takes about 1 minute")).toBe("Tell us how to reach you.");
  });

  it("says what the quiz is when the Start page has no words", () => {
    expect(previewDescription("", 10, "Takes about 2 minutes")).toBe("10 questions · about 2 minutes. Tap to start.");
    expect(previewDescription("  ", 1, "")).toBe("1 question. Tap to start.");
    expect(previewDescription("", 0, "")).toBe("Tap to open this quiz.");
  });
});
