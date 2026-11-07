// Runs a command with the variables of .env.local loaded exactly as written (no shell expansion).
// Usage: node scripts/with-env.mjs <command> [args...]   (never prints variable values)
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const env = { ...process.env };
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^(['"])(.*)\1$/, "$2");
}

const win = process.platform === "win32";
// On Windows the command runs through a shell: quote arguments that contain spaces or specials.
const quote = (a) => (win && /[\s"&|<>^%()]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);

const [cmd, ...args] = process.argv.slice(2);
const r = spawnSync(cmd, args.map(quote), { stdio: "inherit", env, shell: win });
process.exit(r.status ?? 1);
