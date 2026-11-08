import { describe, expect, it } from "vitest";
import { formatLongDate, formatMonth, monthGrid, parseIsoDate, shiftMonth, toIsoDate } from "./calendar";

describe("dates as text", () => {
  it("reads a real date and refuses an impossible one", () => {
    expect(parseIsoDate("2027-03-01")).toEqual({ year: 2027, month: 2, day: 1 });
    expect(parseIsoDate("2027-02-30")).toBeNull();
    expect(parseIsoDate("March 1")).toBeNull();
  });

  it("writes dates the way the design shows them", () => {
    expect(formatLongDate("2027-03-01")).toBe("March 1, 2027");
    expect(formatLongDate("nonsense")).toBe("");
    expect(formatMonth(2027, 2)).toBe("March 2027");
    expect(toIsoDate(2027, 2, 1)).toBe("2027-03-01");
  });
});

describe("the month grid", () => {
  it("starts weeks on Monday: March 2027 begins on a Monday and has 31 days", () => {
    const weeks = monthGrid(2027, 2);
    expect(weeks[0][0]).toBe(1);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weeks.flat().filter((d) => d !== null)).toHaveLength(31);
  });

  it("leaves empty squares before the first day: February 2026 begins on a Sunday", () => {
    const weeks = monthGrid(2026, 1);
    expect(weeks[0]).toEqual([null, null, null, null, null, null, 1]);
    expect(weeks.flat().filter((d) => d !== null)).toHaveLength(28);
  });

  it("moves between months across a year change", () => {
    expect(shiftMonth(2027, 0, -1)).toEqual({ year: 2026, month: 11 });
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth(2027, 5, 0)).toEqual({ year: 2027, month: 5 });
  });
});
