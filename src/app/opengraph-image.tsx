import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Quiz: make a quiz people actually finish";

/** The picture shown when the website is shared. */
export default function SiteShareImage() {
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 90px", background: "#F4F6F8", color: "#1E293B" }}>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 800, color: "#334155", letterSpacing: -2 }}>quiz</div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 92, lineHeight: 1.05, fontWeight: 800, letterSpacing: -4, maxWidth: 1000 }}>Make a quiz people actually finish.</div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 32, color: "#5B6778" }}>Free to start. Simple to share. See every answer.</div>
      </div>
    ),
    size,
  );
}
