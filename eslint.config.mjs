import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const hex = { selector: "Literal[value=/#[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]/]", message: "Use a color token (bg-slate, text-mute, bg-quiz-primary ...), not a raw hex color." };
const hexInTemplate = { selector: "TemplateElement[value.raw=/#[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]/]", message: "Use a color token, not a raw hex color." };
const processEnv = { selector: "MemberExpression[object.name='process'][property.name='env']", message: "Read environment variables only in src/lib/env.ts." };

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      "react/no-unescaped-entities": "off", // 👈 disable this annoying rule
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    // The architecture rules (handover 1, R2): one place for env, no raw colors, components only call actions and repos
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/env.ts"],
    rules: { "no-restricted-syntax": ["error", processEnv] },
  },
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": ["error", processEnv, hex, hexInTemplate],
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["@/server/supabase/*", "@/server/auth/*", "@/server/public/*", "@/server/email/*", "@/server/rate-limit"], message: "Components may only call server actions and the repos." }] },
      ],
    },
  },
];

export default eslintConfig;
