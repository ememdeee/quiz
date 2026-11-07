/** Dates and numbers shown to people. One place, so every screen says "2 days ago" the same way. */
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"} ago`;

/** "just now", "5 minutes ago", "2 days ago", "3 weeks ago", "4 months ago", "2 years ago". */
export function timeAgo(date: Date | string | number, now: Date | number = Date.now()): string {
  const diff = Math.max(0, new Date(now).getTime() - new Date(date).getTime());
  if (diff < MINUTE) return "just now";
  if (diff < HOUR) return plural(Math.floor(diff / MINUTE), "minute");
  if (diff < DAY) return plural(Math.floor(diff / HOUR), "hour");
  if (diff < 7 * DAY) return plural(Math.floor(diff / DAY), "day");
  if (diff < 30 * DAY) return plural(Math.floor(diff / (7 * DAY)), "week");
  if (diff < 365 * DAY) return plural(Math.floor(diff / (30 * DAY)), "month");
  return plural(Math.floor(diff / (365 * DAY)), "year");
}

export const editedAgo = (date: Date | string | number, now?: Date | number) => `Edited ${timeAgo(date, now)}`;

const numberFormat = new Intl.NumberFormat("en-US");
export const formatNumber = (n: number) => numberFormat.format(n);
