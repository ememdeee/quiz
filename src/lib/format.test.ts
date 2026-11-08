import { describe, expect, it } from "vitest";
import { editedAgo, formatNumber, timeAgo } from "./format";

const now = new Date("2026-11-07T12:00:00Z");
const ago = (ms: number) => new Date(now.getTime() - ms);
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("timeAgo", () => {
  it("says just now under a minute", () => {
    expect(timeAgo(ago(30_000), now)).toBe("just now");
    expect(timeAgo(now, now)).toBe("just now");
  });

  it("counts minutes, hours and days with the right plural", () => {
    expect(timeAgo(ago(MIN), now)).toBe("1 minute ago");
    expect(timeAgo(ago(5 * MIN), now)).toBe("5 minutes ago");
    expect(timeAgo(ago(3 * HOUR), now)).toBe("3 hours ago");
    expect(timeAgo(ago(DAY), now)).toBe("1 day ago");
    expect(timeAgo(ago(2 * DAY), now)).toBe("2 days ago");
  });

  it("counts weeks, months and years", () => {
    expect(timeAgo(ago(7 * DAY), now)).toBe("1 week ago");
    expect(timeAgo(ago(21 * DAY), now)).toBe("3 weeks ago");
    expect(timeAgo(ago(60 * DAY), now)).toBe("2 months ago");
    expect(timeAgo(ago(800 * DAY), now)).toBe("2 years ago");
  });

  it("never shows a future time as negative", () => {
    expect(timeAgo(new Date(now.getTime() + DAY), now)).toBe("just now");
  });

  it("accepts ISO strings", () => {
    expect(timeAgo("2026-11-05T12:00:00Z", now)).toBe("2 days ago");
  });
});

describe("editedAgo and formatNumber", () => {
  it("prefixes Edited", () => {
    expect(editedAgo(ago(2 * DAY), now)).toBe("Edited 2 days ago");
    expect(editedAgo(ago(0), now)).toBe("Edited just now");
  });

  it("groups thousands", () => {
    expect(formatNumber(1280)).toBe("1,280");
  });
});
