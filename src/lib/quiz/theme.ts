/** The six colors every quiz page uses (board FEShell). The Custom plan can change them; everyone else gets the default slate set. */
export type QuizTheme = { primary: string; onPrimary: string; background: string; text: string; muted: string; border: string };

const HEX = /^#[0-9a-fA-F]{6}$/;

/** The values for the `--quiz-*` variables on the quiz root, or nothing for the default set. Anything that is not a plain #RRGGBB color is ignored. */
export function themeVars(theme: QuizTheme | null): Record<string, string> {
  if (!theme) return {};
  const pairs: [string, string][] = [
    ["--quiz-primary", theme.primary],
    ["--quiz-on-primary", theme.onPrimary],
    ["--quiz-bg", theme.background],
    ["--quiz-fg", theme.text],
    ["--quiz-muted", theme.muted],
    ["--quiz-line", theme.border],
  ];
  return Object.fromEntries(pairs.filter(([, value]) => HEX.test(value)));
}
