import type { ResponseTable } from "./table";

/** A cell that starts with = + - @ could run as a formula in a spreadsheet, so it gets a leading apostrophe. */
export const protectCell = (value: string) => (/^[=+\-@]/.test(value) ? `'${value}` : value);

const quote = (value: string) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/** UTF-8 with a byte order mark (so Excel reads accents), one line per response. */
export function toCsv(table: ResponseTable): string {
  const lines = [table.headers, ...table.rows].map((row) => row.map((cell) => quote(protectCell(cell))).join(","));
  return `﻿${lines.join("\r\n")}\r\n`;
}
