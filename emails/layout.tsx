import { Body, Container, Head, Html, Link, Preview, Section, Text } from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";
import { absoluteUrl, routes } from "@/lib/routes";

/**
 * The frame every email shares (boards EmailVerify to EmailContact): grey page, white card, the Quiz wordmark, and a
 * small footer. Email programs ignore style sheets, so colors and sizes are written out here, once.
 */
export const colors = {
  page: "#EEF1F5",
  card: "#FFFFFF",
  ink: "#1E293B",
  body: "#3F4B5C",
  mute: "#5B6778",
  slate: "#334155",
  line: "#D5DBE3",
  soft: "#EAEEF3",
} as const;

const font = "'Inter', Arial, sans-serif";

export const text = {
  title: { margin: "28px 0 0", fontSize: 28, lineHeight: "34px", fontWeight: 800, letterSpacing: "-0.02em", color: colors.ink } satisfies CSSProperties,
  paragraph: { margin: "14px 0 0", fontSize: 16, lineHeight: "26px", color: colors.body } satisfies CSSProperties,
  small: { margin: 0, fontSize: 14, lineHeight: "22px", color: colors.mute } satisfies CSSProperties,
  address: { color: colors.slate, wordBreak: "break-all" } satisfies CSSProperties,
  rule: { margin: "24px 0 0", paddingTop: 20, borderTop: `1px solid ${colors.line}`, fontSize: 14, lineHeight: "22px", color: colors.mute } satisfies CSSProperties,
} as const;

/** The wordmark as text. Many inboxes hide inline SVG and pictures, so the logo is plain bold letters. */
function Wordmark() {
  return <Text style={{ margin: 0, fontSize: 30, lineHeight: "34px", fontWeight: 800, letterSpacing: "-0.04em", color: colors.slate }}>quiz</Text>;
}

/** The big pill button. `href` must be a whole address. */
export function EmailButton({ href, children, size = "large" }: { href: string; children: ReactNode; size?: "large" | "medium" }) {
  const large = size === "large";
  return (
    <Link
      href={href}
      style={{
        display: "inline-block",
        padding: large ? "16px 32px" : "14px 28px",
        borderRadius: 999,
        backgroundColor: colors.slate,
        color: "#FFFFFF",
        fontSize: large ? 17 : 16,
        fontWeight: 600,
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}

/** "If the button doesn't work, copy this address": the link written out, with how long it works. */
export function LinkFallback({ validFor, href }: { validFor: string; href: string }) {
  return (
    <Text style={text.small}>
      This link works for {validFor}. If the button doesn’t work, copy this address into your browser:
      <br />
      <span style={text.address}>{href}</span>
    </Text>
  );
}

type Footer = "legal" | { note: string };

export function EmailLayout({ preview, footer = "legal", children }: { preview: string; footer?: Footer; children: ReactNode }) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, padding: "32px 20px", backgroundColor: colors.page, fontFamily: font, color: colors.ink }}>
        <Container style={{ maxWidth: 600, width: "100%" }}>
          <Section style={{ backgroundColor: colors.card, borderRadius: 20, padding: "40px 40px 32px" }}>
            <Wordmark />
            {children}
          </Section>
          <Text style={{ margin: "18px 8px 0", fontSize: 13, lineHeight: "20px", color: colors.mute, textAlign: "center" }}>
            {footer === "legal" ? (
              <>
                © 2026 Quiz ·{" "}
                <Link href={absoluteUrl(routes.terms)} style={{ color: colors.mute }}>
                  Terms
                </Link>{" "}
                ·{" "}
                <Link href={absoluteUrl(routes.privacy)} style={{ color: colors.mute }}>
                  Privacy
                </Link>
              </>
            ) : (
              footer.note
            )}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
