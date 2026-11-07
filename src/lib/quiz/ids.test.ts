import { describe, expect, it } from "vitest";
import { ID_LENGTH, newId } from "./ids";

describe("newId", () => {
  it("makes 10 characters from the allowed alphabet", () => {
    for (let i = 0; i < 50; i++) expect(newId()).toMatch(/^[A-Za-z0-9_-]{10}$/);
    expect(newId()).toHaveLength(ID_LENGTH);
  });

  it("does not repeat in a normal run", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => newId()));
    expect(ids.size).toBe(1000);
  });

  it("maps bytes to the alphabet evenly (byte 64 wraps to the first symbol)", () => {
    expect(newId((bytes) => bytes.fill(0))).toBe("0000000000");
    expect(newId((bytes) => bytes.fill(64))).toBe("0000000000");
    expect(newId((bytes) => bytes.fill(63))).toBe("----------");
  });
});
