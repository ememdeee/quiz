import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og/fonts";
import { OgWordmark } from "@/lib/og/wordmark";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Quiz: make a quiz people actually finish";

const SLATE = "#334155";
const MUTE = "#5B6778";

const options = ["Lose weight", "Tone my body", "Have more energy"];

/** The picture shown when the website is shared: the promise on the left, a small quiz page on the right. */
export default async function SiteShareImage() {
  const fonts = await ogFonts();
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", background: "linear-gradient(135deg, #F4F6F8 0%, #DCE4EE 100%)", fontFamily: "Inter" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700, padding: "64px 0 60px 80px" }}>
          <OgWordmark height={46} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 78, lineHeight: 1.04, fontWeight: 800, letterSpacing: -3.5, color: "#1E293B" }}>Make a quiz people actually finish.</div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 26, fontSize: 30, lineHeight: 1.35, fontWeight: 500, color: MUTE }}>
              <div style={{ display: "flex" }}>Free to start. Simple to share.</div>
              <div style={{ display: "flex" }}>See every answer.</div>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: SLATE }}>quiz.basrh.com</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", width: 360, padding: "30px 30px 34px", borderRadius: 36, background: "#FFFFFF", border: "2px solid #D5DBE3", boxShadow: "0 24px 60px rgba(51,65,85,0.22)", transform: "rotate(3deg)" }}>
            <div style={{ display: "flex", height: 10, borderRadius: 999, background: "#E2E8F0" }}>
              <div style={{ display: "flex", width: "42%", height: 10, borderRadius: 999, background: SLATE }} />
            </div>
            <div style={{ display: "flex", marginTop: 28, fontSize: 30, lineHeight: 1.15, fontWeight: 800, letterSpacing: -1, color: "#1E293B" }}>What is your main goal?</div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 22 }}>
              {options.map((option, index) => (
                <div
                  key={option}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: 56,
                    marginTop: index === 0 ? 0 : 12,
                    padding: "0 18px",
                    borderRadius: 14,
                    border: index === 1 ? `3px solid ${SLATE}` : "2px solid #D5DBE3",
                    background: index === 1 ? "#EEF2F7" : "#FFFFFF",
                    fontSize: 21,
                    fontWeight: 700,
                    color: "#1E293B",
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 58, marginTop: 24, borderRadius: 999, background: SLATE, color: "#FFFFFF", fontSize: 22, fontWeight: 700 }}>Continue</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
