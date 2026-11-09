const MAX_BYTES = 1_500_000;

/**
 * A picture from our own storage as a data address the picture maker can draw, or null when it cannot be used
 * (not reachable in 3.5 seconds, not a PNG or JPEG, or too big). A share picture must never fail because of a picture.
 */
export async function pictureDataUri(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3500) });
    const type = response.headers.get("content-type")?.split(";")[0] ?? "";
    if (!response.ok || (type !== "image/png" && type !== "image/jpeg")) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    return bytes.length > 0 && bytes.length <= MAX_BYTES ? `data:${type};base64,${bytes.toString("base64")}` : null;
  } catch {
    return null;
  }
}
