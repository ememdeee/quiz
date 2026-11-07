import type { CSSProperties } from "react";

const defaultA: CSSProperties = { width: 420, height: 420, left: -120, top: -100, background: "radial-gradient(circle, #C9D6EA, transparent 70%)" };
const defaultB: CSSProperties = {
  width: 460,
  height: 460,
  right: -140,
  top: 40,
  background: "radial-gradient(circle, #B7C7DF, transparent 70%)",
  animationDelay: "-7s",
};

/** Dotted grid and two slowly drifting glows behind a hero. Parent must be position: relative. */
export function HeroBackdrop({
  dotsAt = "50% 30%",
  blobA,
  blobB,
}: {
  dotsAt?: string;
  blobA?: CSSProperties;
  blobB?: CSSProperties;
}) {
  return (
    <>
      <div className="bg-dots" aria-hidden="true" style={{ "--dots-at": dotsAt } as CSSProperties} />
      <div className="blob" aria-hidden="true" style={{ ...defaultA, ...blobA }} />
      <div className="blob" aria-hidden="true" style={{ ...defaultB, ...blobB }} />
    </>
  );
}
