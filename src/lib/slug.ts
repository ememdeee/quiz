/**
 * Quiz web addresses (`/quiz/<slug>`). The same rules run in the form and on the server.
 * Lowercase letters, numbers and single hyphens; no hyphen at either end; 3 to 60 characters.
 */
export const SLUG_MIN = 3;
export const SLUG_MAX = 60;

export const RESERVED_SLUGS: readonly string[] = ["new", "edit", "preview", "admin", "api", "www", "app", "quiz", "login", "register"];

export type SlugProblem = "invalid" | "reserved";

const SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Turns any name into the closest valid-looking address ("Body Reset!" becomes "body-reset"). */
export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");
}

/** null when the address is fine, otherwise why it is not. */
export function checkSlug(slug: string): SlugProblem | null {
  if (slug.length < SLUG_MIN || slug.length > SLUG_MAX || !SHAPE.test(slug)) return "invalid";
  if (RESERVED_SLUGS.includes(slug)) return "reserved";
  return null;
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomSuffix(random: () => number): string {
  let out = "";
  for (let i = 0; i < 4; i++) out += ALPHABET[Math.floor(random() * ALPHABET.length)];
  return out;
}

/**
 * A free address for a new quiz: the name as a slug, and when it is taken (or not allowed) a dash
 * and 4 random letters or numbers, tried up to 5 times. null if all of them were taken.
 */
export function makeSlug(name: string, isTaken: (slug: string) => boolean, random: () => number = Math.random): string | null {
  const slugified = slugify(name);
  const base = checkSlug(slugified) ? "my-quiz" : slugified;
  if (checkSlug(base) === null && !isTaken(base)) return base;
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${base.slice(0, SLUG_MAX - 5)}-${randomSuffix(random)}`;
    if (checkSlug(candidate) === null && !isTaken(candidate)) return candidate;
  }
  return null;
}
