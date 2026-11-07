import { ImageResponse } from "next/og";

/**
 * The favicon and app icons (board BrandIcons): the mark alone, white on a slate square, with the dot in light slate.
 * One drawing for every size, so the icons can never drift apart.
 */
export const BRAND_SLATE = "#334155";

export function brandIcon(size: number, shape: "square" | "round" | "maskable" = "square") {
  // The mark sits in a 64 x 64 box; a maskable icon keeps it small so the phone's own cut-out never touches it
  const mark = size * (shape === "maskable" ? 0.5 : shape === "round" ? 0.55 : 0.68);
  return new ImageResponse(
    (
      <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background: BRAND_SLATE, borderRadius: shape === "round" ? size / 2 : shape === "maskable" ? 0 : size * 0.22 }}>
        <svg width={mark} height={mark} viewBox="0 0 64 64" fill="none">
          <circle cx="26" cy="28" r="15" stroke="#FFFFFF" strokeWidth="8" />
          <circle cx="26" cy="28" r="5.5" fill="#9FB3D1" />
          <path d="M41 28V60" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
