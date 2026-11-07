import type { QuizDocument } from "@/lib/quiz/schema";
import { slugify } from "@/lib/slug";
import type { QuizResponse } from "../types";
import { toCsv } from "./csv";
import { toJson } from "./json";
import { buildTable } from "./table";

export type ExportFormat = "csv" | "xlsx" | "json";

/** `<quiz-name>-responses-2026-11-07.csv`. Downloads are never limited by the plan. */
export function exportFileName(quizName: string, format: ExportFormat, now: Date = new Date()): string {
  const name = slugify(quizName) || "quiz";
  return `${name}-responses-${now.toISOString().slice(0, 10)}.${format}`;
}

async function toXlsx(doc: QuizDocument, responses: readonly QuizResponse[]): Promise<Blob> {
  const { default: ExcelJS } = await import("exceljs");
  const table = buildTable(doc, responses);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Responses");
  sheet.addRow(table.headers).font = { bold: true };
  table.rows.forEach((row) => sheet.addRow(row));
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

/** Builds the file for one format. */
export async function buildExport(format: ExportFormat, doc: QuizDocument, responses: readonly QuizResponse[]): Promise<Blob> {
  if (format === "xlsx") return toXlsx(doc, responses);
  if (format === "json") return new Blob([toJson(doc, responses)], { type: "application/json" });
  return new Blob([toCsv(buildTable(doc, responses))], { type: "text/csv;charset=utf-8" });
}

/** Saves a file through the browser. */
export function saveFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
