/** The Quiz wordmark for the share pictures: the "q" mark drawn as a shape and "uiz" in Inter (board Logo). */
export function OgWordmark({ height, color = "#334155", dot = "#9FB3D1" }: { height: number; color?: string; dot?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <svg width={height * 0.86} height={height * 0.86} viewBox="4 6 52 56" fill="none">
        <circle cx="26" cy="28" r="15" stroke={color} strokeWidth="8" />
        <circle cx="26" cy="28" r="5.5" fill={dot} />
        <path d="M41 28V60" stroke={color} strokeWidth="8" strokeLinecap="round" />
      </svg>
      <div style={{ display: "flex", marginLeft: -height * 0.06, marginTop: height * 0.1, fontSize: height * 1.02, fontWeight: 800, letterSpacing: -height * 0.05, color, lineHeight: 1 }}>uiz</div>
    </div>
  );
}
