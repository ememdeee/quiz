import { defineConfig } from "@playwright/test";

/**
 * Browser checks (QC scripts, handover 14.4). They run against a dev server on port 3100 (the /dev test links and the person switcher
 * do not exist in a production build), so they do not disturb the one on port 3000. `QC_BROWSER` picks an installed browser ("msedge" is on every Windows PC, "chrome" also
 * works); in CI leave it empty and install Playwright's own with `npx playwright install chromium`.
 */
const channel = process.env.QC_BROWSER ?? (process.env.CI ? undefined : "msedge");

const links = 3100;
const real = 3200;

export default defineConfig({
  testDir: "tests/qc",
  timeout: 20 * 60_000,
  fullyParallel: true,
  workers: 3,
  reporter: [["list"]],
  use: { ...(channel ? { channel } : {}), viewport: { width: 1280, height: 800 } },
  projects: [
    // The whole mock app: every link and button
    { name: "links", testMatch: /link-audit/, use: { baseURL: `http://localhost:${links}` } },
    // The app on the real Supabase dev project: sign-in and everything after it
    { name: "real", testMatch: /real-.*.spec.ts/, fullyParallel: false, workers: 1, use: { baseURL: `http://localhost:${real}` } },
  ],
  webServer: [
    { command: `npx next dev -p ${links}`, url: `http://localhost:${links}`, reuseExistingServer: true, timeout: 5 * 60_000, env: { NEXT_DIST_DIR: ".next-qc-links" } },
    {
      command: `npx next dev -p ${real}`,
      url: `http://localhost:${real}`,
      reuseExistingServer: true,
      timeout: 5 * 60_000,
      env: { NEXT_DIST_DIR: ".next-qc-real", NEXT_PUBLIC_DATA_MODE: "supabase", NEXT_PUBLIC_SITE_URL: `http://localhost:${real}` },
    },
  ],
});
