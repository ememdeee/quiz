import { defineConfig } from "@playwright/test";

/**
 * Browser checks (QC scripts, handover 14.4). They run against a dev server on port 3100 (the /dev test links and the person switcher
 * do not exist in a production build), so they do not disturb the one on port 3000. `QC_BROWSER` picks an installed browser ("msedge" is on every Windows PC, "chrome" also
 * works); in CI leave it empty and install Playwright's own with `npx playwright install chromium`.
 */
const channel = process.env.QC_BROWSER ?? (process.env.CI ? undefined : "msedge");

const links = 3100;
const real = 3200;
const prod = 3300;

/**
 * Start only the servers the chosen projects need (`--project=links`, `--project real`, ...). Every server used to start for every run:
 * a links-only run also built the production app and booted the Supabase one, which needs real keys, so it hung in CI and took many
 * minutes on a PC. A run without `--project` starts all of them, as before.
 */
const chosen = [...process.argv.join(" ").matchAll(/--project[= ](\w+)/g)].map((match) => match[1]);
const needs = (...projects: string[]) => chosen.length === 0 || projects.some((name) => chosen.includes(name));

export default defineConfig({
  testDir: "tests/qc",
  // The two long crawls (a person, the admin) take about 17 minutes on a fast PC and longer on a GitHub runner
  timeout: (process.env.CI ? 60 : 20) * 60_000,
  fullyParallel: true,
  workers: 3,
  reporter: [["list"]],
  use: { ...(channel ? { channel } : {}), viewport: { width: 1280, height: 800 } },
  projects: [
    // The whole mock app: every link and button
    { name: "links", testMatch: /link-audit/, use: { baseURL: `http://localhost:${links}` } },
    // Accessibility scan of every main screen on the dummy-data app
    { name: "a11y", testMatch: /a11y/, timeout: 300_000, use: { baseURL: `http://localhost:${links}` } },
    // The app on the real Supabase dev project: sign-in and everything after it
    { name: "real", testMatch: /real-.*.spec.ts/, fullyParallel: false, workers: 1, timeout: 120_000, use: { baseURL: `http://localhost:${real}` } },
    // The production build with the real data: headers, the content security policy, robots, icons, and that dev tools are gone
    { name: "prod", testMatch: /prod-.*.spec.ts/, fullyParallel: false, workers: 1, timeout: 120_000, use: { baseURL: `http://localhost:${prod}` } },
  ],
  webServer: [
    ...(needs("links", "a11y")
      ? [{ command: `npx next dev -p ${links}`, url: `http://localhost:${links}`, reuseExistingServer: true, timeout: 5 * 60_000, env: { NEXT_DIST_DIR: ".next-qc-links" } }]
      : []),
    ...(needs("real")
      ? [
          {
            command: `npx next dev -p ${real}`,
            url: `http://localhost:${real}`,
            reuseExistingServer: true,
            timeout: 5 * 60_000,
            env: { NEXT_DIST_DIR: ".next-qc-real", NEXT_PUBLIC_DATA_MODE: "supabase", NEXT_PUBLIC_SITE_URL: `http://localhost:${real}` },
          },
        ]
      : []),
    ...(needs("prod")
      ? [
          {
            command: `npx next build && npx next start -p ${prod}`,
            url: `http://localhost:${prod}`,
            reuseExistingServer: true,
            timeout: 10 * 60_000,
            env: { NEXT_DIST_DIR: ".next-qc-prod", NEXT_PUBLIC_DATA_MODE: "supabase", NEXT_PUBLIC_SITE_URL: `http://localhost:${prod}` },
          },
        ]
      : []),
  ],
});
