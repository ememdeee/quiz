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

/** Eight digits, never starting with 0 ("89101273"). */
function randomNumber(random: () => number): string {
  return String(10_000_000 + Math.floor(random() * 90_000_000));
}

/**
 * The first address of a new quiz: the name as a slug and a long random number ("contact-form-89101273"), so it is hard
 * to guess and never taken by chance. The owner can change it in Quiz settings. Tried up to 5 times; null if all were taken.
 */
export function makeSlug(name: string, isTaken: (slug: string) => boolean, random: () => number = Math.random): string | null {
  const slugified = slugify(name);
  const base = slugified || "my-quiz";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${base.slice(0, SLUG_MAX - 9).replace(/-+$/g, "")}-${randomNumber(random)}`;
    if (checkSlug(candidate) === null && !isTaken(candidate)) return candidate;
  }
  return null;
}
