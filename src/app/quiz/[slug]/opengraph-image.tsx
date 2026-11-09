import { ImageResponse } from "next/og";
import { dataMode } from "@/lib/env";
import { ogFonts } from "@/lib/og/fonts";
import { pictureDataUri } from "@/lib/og/picture";
import { clip, titleSize } from "@/lib/og/text";
import { OgWordmark } from "@/lib/og/wordmark";
import { previewOf } from "@/server/public/summary";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A quiz you can answer in your browser";

const INK = "#1E293B";
const SLATE = "#334155";
const MUTE = "#5B6778";

/**
 * The picture shown when a quiz link is shared (board SocialQuiz, extended by Code, no board for the extras): the Start page's
 * title and words, how long it takes, a "Start the quiz" button, and the Start page's own picture when it has one. A quiz with no
 * picture gets a dark panel with the number of questions instead, so the picture never looks empty.
 */
export default async function QuizPreviewImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const preview = dataMode === "supabase" ? await previewOf(slug) : null;
  const [fonts, picture] = await Promise.all([ogFonts(), preview?.picture ? pictureDataUri(preview.picture) : Promise.resolve(null)]);

  const title = clip(preview?.title ?? "A quiz", 90);
  const text = clip(preview?.text ?? "", 130);
  const time = preview?.time ? preview.time.replace("Takes about", "about") : "";
  const questions = preview?.questions ?? 0;
  const showBrand = preview?.showBrand ?? true;
  const narrow = Boolean(picture) || questions > 0;

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", padding: 40, background: "linear-gradient(135deg, #F4F6F8 0%, #DCE4EE 100%)", fontFamily: "Inter" }}>
        <div style={{ display: "flex", width: 1120, height: 550, background: "#FFFFFF", borderRadius: 40, border: "2px solid #D5DBE3", overflow: "hidden" }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "46px 56px 44px" }}>
            <div style={{ display: "flex" }}>
              <div style={{ display: "flex", alignItems: "center", height: 44, padding: "0 20px", borderRadius: 999, background: "#F4F6F8", border: "2px solid #D5DBE3", fontSize: 22, fontWeight: 700, color: SLATE }}>
                {time ? `Quiz · ${time}` : "Quiz"}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: titleSize(title, narrow), lineHeight: 1.08, fontWeight: 800, letterSpacing: -2.5, color: INK }}>{title}</div>
              {text ? <div style={{ display: "flex", marginTop: 20, fontSize: 28, lineHeight: 1.4, fontWeight: 500, color: MUTE }}>{text}</div> : null}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", height: 68, padding: "0 36px", borderRadius: 999, background: SLATE, color: "#FFFFFF", fontSize: 28, fontWeight: 700 }}>
                Start the quiz
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 14 }}>
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {showBrand && !picture && questions === 0 ? <OgWordmark height={36} /> : null}
            </div>
          </div>

          {picture ? (
            <div style={{ display: "flex", position: "relative", width: 440, height: 546 }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- drawn by the picture maker, not by the browser */}
              <img src={picture} width={440} height={546} alt="" style={{ objectFit: "cover" }} />
              {showBrand ? (
                <div style={{ display: "flex", position: "absolute", right: 24, bottom: 24, padding: "10px 18px", borderRadius: 999, background: "#FFFFFF" }}>
                  <OgWordmark height={28} />
                </div>
              ) : null}
            </div>
          ) : questions > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", width: 330, height: 546, padding: "46px 44px 44px", background: SLATE, color: "#FFFFFF" }}>
              <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: "#9FB3D1" }}>This quiz has</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 150, lineHeight: 0.95, fontWeight: 800, letterSpacing: -6 }}>{questions}</div>
                <div style={{ display: "flex", marginTop: 10, fontSize: 36, fontWeight: 700 }}>{questions === 1 ? "question" : "questions"}</div>
              </div>
              {showBrand ? <OgWordmark height={34} color="#FFFFFF" /> : <div style={{ display: "flex" }} />}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
