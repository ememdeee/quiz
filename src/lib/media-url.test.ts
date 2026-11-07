import { describe, expect, it } from "vitest";
import { MEDIA_MAX_BYTES, parseDataUrl } from "./media-url";

describe("reading a picture sent from the browser", () => {
  it("accepts jpeg, png and webp and gives back the bytes", () => {
    const parsed = parseDataUrl(`data:image/png;base64,${Buffer.from("hello").toString("base64")}`);
    expect(parsed?.type).toBe("image/png");
    expect(parsed?.bytes.toString()).toBe("hello");
    expect(parseDataUrl("data:image/webp;base64,AAAA")?.type).toBe("image/webp");
    expect(parseDataUrl("data:image/jpeg;base64,AAAA")?.type).toBe("image/jpeg");
  });

  it("refuses other types and anything that is not a base64 picture address", () => {
    for (const bad of ["data:image/svg+xml;base64,AAAA", "data:image/gif;base64,AAAA", "data:text/html;base64,AAAA", "https://x/y.png", "data:image/png;base64,<script>", ""]) {
      expect(parseDataUrl(bad), bad).toBeNull();
    }
  });

  it("knows the 5 MB limit", () => {
    expect(MEDIA_MAX_BYTES).toBe(5242880);
  });
});
