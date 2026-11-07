import path from "node:path";
import { defineConfig } from "vitest/config";

// Unit tests for pure logic that lives next to the code (src/**/*.test.ts). Database tests have their own config.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: { include: ["src/**/*.test.ts"] },
});
