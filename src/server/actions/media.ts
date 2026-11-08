"use server";

import { randomUUID } from "node:crypto";
import { fail, ok, type ActionResult } from "@/lib/errors";
import { MEDIA_BUCKET, MEDIA_MAX_BYTES, MEDIA_TYPES, mediaUrl, parseDataUrl } from "@/lib/media-url";
import { requireUser } from "@/server/auth/guards";
import type { MediaItem } from "@/server/repos/ports";

/** The owner's picture library ("My pictures"). Files live in the `quiz-media` bucket, in a folder named after the owner. */

export async function listMediaAction(): Promise<ActionResult<MediaItem[]>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { data, error } = await auth.data.supabase.from("media").select("id, path, file_name").order("created_at", { ascending: false });
  if (error) return fail("load_failed");
  return ok(data.map((row) => ({ id: row.id, src: mediaUrl(row.path), name: row.file_name })));
}

/**
 * Saves a picture the browser already shrank (a base64 address). The type and the 5 MB size are checked again here, the file
 * goes into the person's own folder, and only then is a row added to the library.
 */
export async function addMediaAction(input: { src: string; name: string }): Promise<ActionResult<MediaItem>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const parsed = parseDataUrl(input.src);
  if (!parsed) return fail("picture_rejected");
  if (parsed.bytes.length === 0 || parsed.bytes.length > MEDIA_MAX_BYTES) return fail(parsed.bytes.length === 0 ? "picture_rejected" : "too_large");

  const id = randomUUID();
  const path = `${auth.data.userId}/${id}.${MEDIA_TYPES[parsed.type]}`;
  const { error: uploadError } = await auth.data.supabase.storage.from(MEDIA_BUCKET).upload(path, parsed.bytes, { contentType: parsed.type, upsert: false });
  if (uploadError) return fail("picture_rejected");

  const fileName = input.name.trim().slice(0, 120) || "Picture";
  const { error } = await auth.data.supabase.from("media").insert({ id, owner_id: auth.data.userId, path, file_name: fileName, mime: parsed.type, size_bytes: parsed.bytes.length });
  if (error) {
    await auth.data.supabase.storage.from(MEDIA_BUCKET).remove([path]);
    return fail("picture_rejected");
  }
  return ok({ id, src: mediaUrl(path), name: fileName });
}
