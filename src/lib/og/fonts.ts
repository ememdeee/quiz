import { readFile } from "node:fs/promises";
import path from "node:path";

type OgFont = { name: string; data: Buffer; weight: 500 | 700 | 800; style: "normal" };

/**
 * Inter for the share pictures (the picture maker only has one thin default font). The files sit in `fonts/` next to this one
 * (SIL Open Font License, see fonts/LICENSE.txt), are listed in `outputFileTracingIncludes` in next.config.ts so Vercel ships
 * them, and are read once. If they cannot be read the pictures still work with the default font.
 */
const FILES = [
  { weight: 500, file: "inter-500.woff" },
  { weight: 700, file: "inter-700.woff" },
  { weight: 800, file: "inter-800.woff" },
] as const;

let loaded: Promise<OgFont[]> | null = null;

export function ogFonts(): Promise<OgFont[]> {
  loaded ??= Promise.all(FILES.map(async ({ weight, file }) => ({ name: "Inter", data: await readFile(path.join(process.cwd(), "src/lib/og/fonts", file)), weight, style: "normal" as const }))).catch(() => []);
  return loaded;
}
