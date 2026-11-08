import { ImageResponse } from "next/og";
import { dataMode } from "@/lib/env";
import { previewOf } from "@/server/public/summary";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A quiz";

/** The picture shown when a quiz link is shared (board SocialQuiz): the Start page's title, its text and "Start the quiz". */
export default async function QuizPreviewImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const preview = dataMode === "supabase" ? await previewOf(slug) : null;
  const title = preview?.title ?? "A quiz";
  const text = preview?.text || "Answer a few questions.";
  const time = preview?.time || "A quiz";

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 90px", background: "#F4F6F8", color: "#1E293B", position: "relative" }}>
        <div style={{ display: "flex", alignSelf: "flex-start", padding: "8px 18px", borderRadius: 999, background: "#FFFFFF", border: "1px solid #D5DBE3", fontSize: 22, fontWeight: 600, color: "#334155" }}>{`A quiz${time ? ` · ${time.replace("Takes about", "about")}` : ""}`}</div>
        <div style={{ display: "flex", marginTop: 28, fontSize: title.length > 24 ? 72 : 104, lineHeight: 1.05, fontWeight: 800, letterSpacing: -4, maxWidth: 1000 }}>{title}</div>
        <div style={{ display: "flex", marginTop: 22, fontSize: 32, lineHeight: 1.35, color: "#5B6778", maxWidth: 900 }}>{text}</div>
        <div style={{ display: "flex", alignSelf: "flex-start", alignItems: "center", marginTop: 44, height: 76, padding: "0 44px", borderRadius: 999, background: "#334155", color: "#FFFFFF", fontSize: 28, fontWeight: 600 }}>Start the quiz</div>
        <div style={{ position: "absolute", right: 80, bottom: 56, display: "flex", alignItems: "center", gap: 14, color: "#5B6778", fontSize: 20, fontWeight: 500 }}>
          <span>Made with</span>
          <span style={{ fontSize: 34, fontWeight: 800, color: "#334155", letterSpacing: -2 }}>quiz</span>
        </div>
      </div>
    ),
    size,
  );
}
