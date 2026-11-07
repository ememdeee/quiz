import { publicEnv } from "./env";

/** The public address of a picture in the owner's Supabase Storage bucket (decision: public read, owner-only write). */
export const MEDIA_BUCKET = "quiz-media";
export const mediaUrl = (path: string) => `${publicEnv.supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;

/** The picture types and the size the bucket accepts (handover 6.5). */
export const MEDIA_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;
export const MEDIA_MAX_BYTES = 5 * 1024 * 1024;

export type MediaType = keyof typeof MEDIA_TYPES;

/** Reads a `data:image/...;base64,...` address. null if it is not one of the allowed picture types. */
export function parseDataUrl(src: string): { type: MediaType; bytes: Buffer } | null {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(src);
  if (!match) return null;
  return { type: match[1] as MediaType, bytes: Buffer.from(match[2], "base64") };
}
