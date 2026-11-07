import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type BrowserContext, type Locator, type Page } from "@playwright/test";

/**
 * Link audit (handover 2.12). For each kind of person (a visitor, a normal person, the admin) it starts at the test-links
 * page (/dev), follows every link on every page it reaches, and checks:
 *  - every page answers (no 404 or 500 except the ones meant to),
 *  - no link is empty, "#", or "javascript:", links that open a new tab have rel="noopener",
 *  - a link to a place on a page (#how) finds that place,
 *  - no script error or failed request,
 *  - every button on a page does something when pressed (the page changes, a request is made, a file is saved).
 * All problems are listed together at the end, so one run shows everything.
 */

type Who = "out" | "user" | "admin";

const MAX_PAGES = 160;
/** Following these would change who is logged in in the middle of the crawl. */
const NEVER_FOLLOW = [/^\/dev\/session/];
/** Pages that are meant to answer with an error status. */
const EXPECTED_STATUS: Record<string, number> = { "/this-page-does-not-exist": 404 };
/** Errors in the console that are part of such a page. */
const EXPECTED_CONSOLE: { path: RegExp; text: RegExp }[] = [
  { path: /^\/this-page-does-not-exist/, text: /404/ },
  // The site icons come with the brand icons in Phase 13 (handover 8.1); until then every first visit asks for /favicon.ico
  { path: /./, text: /favicon\.ico/ },
];
/** Buttons that leave the website or end the session, so pressing them says nothing about the page. */
const SKIP_BUTTON = /^(log out)$/i;

const BUTTONS = "button:visible:enabled:not([type=submit])";

type Problem = string;

async function settle(page: Page) {
  await page.waitForLoadState("load");
  await page.waitForTimeout(500);
}

/** Opens the page and watches it for errors. Returns the status and what went wrong while it loaded. */
function watch(page: Page, path: string, problems: Problem[], who: Who) {
  const say = (text: string) => problems.push(`[${who}] ${path}: ${text}`);
  page.on("pageerror", (error) => say(`script error: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = `${message.text()} ${message.location().url}`;
    if (EXPECTED_CONSOLE.some((rule) => rule.path.test(path) && rule.text.test(text))) return;
    say(`console error: ${text.slice(0, 260)}`);
  });
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (response.status() < 400 || url.origin !== new URL(page.url() === "about:blank" ? response.url() : page.url()).origin) return;
    if (EXPECTED_STATUS[path] === response.status() && url.pathname + url.search === path) return;
    say(`request answered ${response.status()}: ${url.pathname}`);
  });
}

type FoundLink = { href: string | null; target: string; rel: string; text: string };

async function linksOf(page: Page): Promise<FoundLink[]> {
  return page.$$eval("a", (anchors) =>
    anchors.map((a) => ({ href: a.getAttribute("href"), target: a.getAttribute("target") ?? "", rel: a.getAttribute("rel") ?? "", text: (a.textContent ?? "").trim().slice(0, 40) })),
  );
}

/** Presses one button and says whether anything happened: the page changed, the address changed, a request went out or a file was saved. */
async function pressAndWatch(page: Page, button: Locator): Promise<boolean> {
  await page.evaluate(() => {
    const w = window as unknown as { __changes: number };
    w.__changes = 0;
    new MutationObserver(() => (w.__changes += 1)).observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
  });
  const before = page.url();
  let requests = 0;
  let downloads = 0;
  const onRequest = () => (requests += 1);
  const onDownload = () => (downloads += 1);
  page.on("request", onRequest);
  page.on("download", onDownload);
  try {
    await button.click({ timeout: 4000 });
    await page.waitForTimeout(500);
    if (page.url() !== before || requests > 0 || downloads > 0) return true;
    // If the page was replaced, the counter is gone; that counts as a change
    return await page.evaluate(() => (window as unknown as { __changes?: number }).__changes !== 0).catch(() => true);
  } finally {
    page.off("request", onRequest);
    page.off("download", onDownload);
  }
}

async function auditAs(who: Who, context: BrowserContext, baseURL: string): Promise<Problem[]> {
  const problems: Problem[] = [];

  // Choose who is logged in
  const login = await context.newPage();
  await login.goto(`/dev/session?as=${who}&next=${encodeURIComponent("/dev")}`);
  await login.close();

  const seen = new Set<string>();
  const queue = ["/dev"];
  const anchors = new Map<string, Set<string>>();
  const external = new Set<string>();
  let pressed = 0;

  while (queue.length > 0 && seen.size < MAX_PAGES) {
    const path = queue.shift()!;
    if (seen.has(path)) continue;
    seen.add(path);

    const page = await context.newPage();
    watch(page, path, problems, who);
    const response = await page.goto(path).catch((error: Error) => {
      problems.push(`[${who}] ${path}: could not open (${error.message.split("\n")[0]})`);
      return null;
    });
    if (!response) {
      await page.close();
      continue;
    }
    const wanted = EXPECTED_STATUS[path] ?? 200;
    if (response.status() !== wanted) problems.push(`[${who}] ${path}: answered ${response.status()}, expected ${wanted}`);
    await settle(page);

    for (const link of await linksOf(page)) {
      const label = `link "${link.text || link.href}"`;
      const href = link.href;
      if (href === null || href.trim() === "") {
        problems.push(`[${who}] ${path}: ${label} has no address`);
        continue;
      }
      if (href === "#" || href.startsWith("javascript:")) {
        problems.push(`[${who}] ${path}: ${label} goes nowhere (${href})`);
        continue;
      }
      if (/^(mailto:|tel:)/.test(href)) continue;
      const isWhole = /^https?:\/\//i.test(href);
      if (isWhole && new URL(href).origin !== baseURL) {
        external.add(href);
        if (!href.startsWith("https://")) problems.push(`[${who}] ${path}: ${label} is not https (${href})`);
        if (link.target === "_blank" && !/noopener/.test(link.rel)) problems.push(`[${who}] ${path}: ${label} opens a new tab without rel="noopener"`);
        continue;
      }
      if (link.target === "_blank" && !/noopener/.test(link.rel)) problems.push(`[${who}] ${path}: ${label} opens a new tab without rel="noopener"`);

      const target = new URL(href, `${baseURL}${path}`);
      const [targetPath, hash] = [target.pathname + target.search, target.hash.slice(1)];
      if (NEVER_FOLLOW.some((rule) => rule.test(targetPath))) continue;
      if (hash) anchors.set(target.pathname + target.search, (anchors.get(target.pathname + target.search) ?? new Set()).add(hash));
      if (!seen.has(targetPath)) queue.push(targetPath);
    }

    // Every button does something. Start each press from a fresh copy of the page and clean dummy data.
    // The test-links pages are not the product, and a page that opens with a dialog hides its own buttons behind it.
    const behindDialog = (await page.locator("[role=dialog]").count()) > 0;
    const count = path.startsWith("/dev") || behindDialog ? 0 : await page.locator(BUTTONS).count();
    for (let index = 0; index < count; index += 1) {
      if (index > 0) {
        await page.evaluate(() => window.localStorage.clear());
        await page.goto(path);
        await settle(page);
      }
      const button = page.locator(BUTTONS).nth(index);
      if ((await button.count()) === 0) continue;
      const name = ((await button.innerText().catch(() => "")) || (await button.getAttribute("aria-label")) || `button ${index + 1}`).trim().replace(/\s+/g, " ").slice(0, 40);
      if (SKIP_BUTTON.test(name)) continue;
      pressed += 1;
      const worked = await pressAndWatch(page, button).catch(() => false);
      if (!worked) problems.push(`[${who}] ${path}: button "${name}" does nothing`);
    }
    await page.close();
  }

  // A link to a place on a page (/#how) must find that place
  for (const [path, hashes] of anchors) {
    const page = await context.newPage();
    await page.goto(path);
    await settle(page);
    for (const hash of hashes) {
      const found = await page.evaluate((id) => document.getElementById(id) !== null || document.getElementsByName(id).length > 0, hash);
      if (!found) problems.push(`[${who}] ${path}: no place called #${hash} for a link to find`);
    }
    await page.close();
  }

  mkdirSync("test-results", { recursive: true });
  writeFileSync(`test-results/link-audit-${who}.txt`, [`visited ${seen.size} pages, pressed ${pressed} buttons`, ...[...seen], "", ...problems].join("\n"));
  console.log(`[${who}] visited ${seen.size} pages, pressed ${pressed} buttons, ${external.size} outside links`);
  if (seen.size >= MAX_PAGES) problems.push(`[${who}] stopped at ${MAX_PAGES} pages: raise MAX_PAGES or find the loop`);
  return problems;
}

for (const who of ["out", "user", "admin"] as const) {
  test(`links and buttons, ${who === "out" ? "a visitor" : who === "user" ? "a normal person" : "the admin"}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL: baseURL!, viewport: { width: 1280, height: 800 } });
    const problems = await auditAs(who, context, new URL(baseURL!).origin);
    await context.close();
    expect(problems, problems.join("\n")).toEqual([]);
  });
}
