/** Small date helpers for the date page. Dates travel as "YYYY-MM-DD" text and are always read as UTC, so no time zone can shift a day. */

const pad = (n: number) => String(n).padStart(2, "0");

export const toIsoDate = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

/** `month` is 0 to 11. Returns null for text that is not a real date. */
export function parseIsoDate(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
  const check = new Date(Date.UTC(year, month, day));
  return check.getUTCFullYear() === year && check.getUTCMonth() === month && check.getUTCDate() === day ? { year, month, day } : null;
}

const longDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const monthTitle = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

/** "March 1, 2027" */
export function formatLongDate(value: string): string {
  const parts = parseIsoDate(value);
  return parts ? longDate.format(new Date(Date.UTC(parts.year, parts.month, parts.day))) : "";
}

/** "March 2027" */
export const formatMonth = (year: number, month: number) => monthTitle.format(new Date(Date.UTC(year, month, 1)));

/** The days of one month laid out in weeks that start on Monday. A null is an empty square. */
export function monthGrid(year: number, month: number): (number | null)[][] {
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const cells: (number | null)[] = [...Array<null>(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, week) => cells.slice(week * 7, week * 7 + 7));
}

/** Moves a month by `by` months (negative goes back) and keeps the year right. */
export function shiftMonth(year: number, month: number, by: number): { year: number; month: number } {
  const index = year * 12 + month + by;
  return { year: Math.floor(index / 12), month: ((index % 12) + 12) % 12 };
}

/** Today as "YYYY-MM-DD" in UTC. */
export const todayIso = (now: Date = new Date()) => toIsoDate(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
