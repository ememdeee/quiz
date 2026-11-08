import { describe, expect, it } from "vitest";
import { FREE_LIMITS } from "../../src/lib/plan/limits.ts";
import { RESERVED_SLUGS, SLUG_MAX, SLUG_MIN, checkSlug, slugify } from "../../src/lib/slug.ts";
import { MEDIA_MAX_BYTES } from "../../src/lib/media-url.ts";
import { people, runSql } from "./helpers.ts";

/**
 * The same numbers and rules exist twice: in the database (the last line of defence) and in the code (the friendly messages).
 * These tests fail the moment one side changes without the other (handover 13.3).
 */
describe("the code and the database agree", () => {
  const { A } = people();

  it("the Free plan limits are the same", async () => {
    const [row] = await runSql<{ max_quizzes: number; max_pages: number; max_responses: number }>(`select * from private.plan_limits('${A.id}'::uuid)`);
    expect(row).toEqual({ max_quizzes: FREE_LIMITS.quizzes, max_pages: FREE_LIMITS.pagesPerQuiz, max_responses: FREE_LIMITS.responsesPerQuiz });
  });

  it("the reserved web addresses and the address shape are the same", async () => {
    for (const word of RESERVED_SLUGS) {
      const result = (await A.db.rpc("slug_available", { p_slug: word, p_quiz_id: null })).data as { available: boolean; reason?: string };
      expect(result.available, word).toBe(false);
      // Words shorter than 3 letters are "invalid" on both sides, the rest "reserved"
      expect(result.reason, word).toBe(checkSlug(word) ?? "invalid");
    }
    for (const slug of ["ab", "Has-Capitals", "double--hyphen", "-leading", "trailing-", "x".repeat(SLUG_MAX + 1), "good-slug-1", "a".repeat(SLUG_MIN)]) {
      const result = (await A.db.rpc("slug_available", { p_slug: slug, p_quiz_id: null })).data as { available: boolean; reason?: string };
      const codeSays = checkSlug(slug);
      expect(result.available || result.reason === "invalid" || result.reason === "reserved", slug).toBe(true);
      expect(codeSays === null, `${slug} (code ${codeSays}, database ${JSON.stringify(result)})`).toBe(result.available || result.reason === "taken");
    }
    expect(checkSlug(slugify("Body Reset!"))).toBeNull();
  });

  it("the picture size limit and types are the same as the storage bucket", async () => {
    const [bucket] = await runSql<{ file_size_limit: number; allowed_mime_types: string[] }>("select file_size_limit, allowed_mime_types from storage.buckets where id = 'quiz-media'");
    expect(bucket.file_size_limit).toBe(MEDIA_MAX_BYTES);
    expect([...bucket.allowed_mime_types].sort()).toEqual(["image/jpeg", "image/png", "image/webp"]);
  });
});
