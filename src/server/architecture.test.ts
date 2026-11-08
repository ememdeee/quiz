import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The shape of the server code (handover 1 and 4): what may run only on the server says so, and what the browser calls is a
 * server action. A new file that forgets its marker fails here instead of leaking secrets into the browser one day.
 */
const root = join(process.cwd(), "src", "server");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

const firstCode = (path: string) =>
  readFileSync(path, "utf8")
    .split(/\r?\n/)
    .find((line) => line.trim() !== "" && !line.trim().startsWith("//") && !line.trim().startsWith("/*") && !line.trim().startsWith("*"))
    ?.trim();

const rel = (path: string) => relative(root, path).replace(/\\/g, "/");

describe("server code is marked as server code", () => {
  const all = files(root).map((path) => ({ path, name: rel(path) }));

  it("every server action file starts with \"use server\" and exports only async functions", () => {
    for (const { path, name } of all.filter((f) => f.name.startsWith("actions/"))) {
      expect(firstCode(path), name).toBe('"use server";');
      const source = readFileSync(path, "utf8");
      // A "use server" file may export functions and types, nothing else (constants and classes would break the build)
      const bad = source.match(/^export (?!async function|type |interface |\{ type )(const|let|var|class|function|default)\b/gm);
      expect(bad, `${name} exports something that is not an async function`).toBeNull();
    }
  });

  it("the code that uses secrets starts with import \"server-only\"", () => {
    const secret = all.filter((f) => /^(auth|email|public|supabase)\//.test(f.name) && f.name !== "supabase/middleware.ts" && f.name !== "auth/mock.ts" && f.name !== "auth/real.ts");
    for (const { path, name } of secret) expect(firstCode(path), name).toBe('import "server-only";');
    // The two sign-in modules and the rate limiter use server-only code and say so as well
    for (const name of ["auth/mock.ts", "auth/real.ts", "rate-limit.ts", "session.ts", "public/http.ts"]) {
      expect(firstCode(join(root, name)), name).toBe('import "server-only";');
    }
  });

  it("the service-role client is imported only by server code, never by a component or a hook", () => {
    const src = join(process.cwd(), "src");
    const everything = (function walk(dir: string): string[] {
      return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        return statSync(path).isDirectory() ? walk(path) : /\.(ts|tsx)$/.test(name) ? [path] : [];
      });
    })(src);
    const offenders = everything.filter((path) => /^(components|hooks|store|content|data)\//.test(relative(src, path).replace(/\\/g, "/")) && /supabase\/admin|createAdminClient/.test(readFileSync(path, "utf8")));
    expect(offenders.map((path) => relative(src, path))).toEqual([]);
  });
});
