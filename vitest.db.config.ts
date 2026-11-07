import { defineConfig } from "vitest/config";

// Database tests run against the dev Supabase project (see tests/db/helpers.ts for the safety guard).
// Files run one after another because they share the same few test people.
export default defineConfig({
  test: {
    include: ["tests/db/**/*.test.ts"],
    globalSetup: ["tests/db/global-setup.ts"],
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 120_000,
  },
});
