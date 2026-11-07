import { defineConfig } from "@playwright/test";

/**
 * Browser checks (QC scripts, handover 14.4). They run against a dev server on port 3100 (the /dev test links and the person switcher
 * do not exist in a production build), so they do not disturb the one on port 3000. `QC_BROWSER` picks an installed browser ("msedge" is on every Windows PC, "chrome" also
 * works); in CI leave it empty and install Playwright's own with `npx playwright install chromium`.
 */
const port = 3100;
const channel = process.env.QC_BROWSER ?? (process.env.CI ? undefined : "msedge");

export default defineConfig({
  testDir: "tests/qc",
  timeout: 20 * 60_000,
  fullyParallel: true,
  workers: 3,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    ...(channel ? { channel } : {}),
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: `npx next dev -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: true,
    timeout: 5 * 60_000,
  },
});
