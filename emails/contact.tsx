import { Heading, Section } from "@react-email/components";
import { mailto, SITE_URL } from "@/lib/routes";
import { colors, EmailButton, EmailLayout, text } from "./layout";

export type ContactProps = { name: string; email: string; needs: string[]; message: string };

const label = { padding: "10px 0", width: 110, color: colors.mute, verticalAlign: "top" } as const;
const value = { padding: "10px 0", fontWeight: 600 } as const;

/** "New message" (board EmailContact): goes to the owner, with the visitor's address as reply-to. */
export function Contact({ name, email, needs, message }: ContactProps) {
  const rows: [string, string, boolean][] = [
    ["Name", name, true],
    ["Email", email, true],
    ...(needs.length > 0 ? ([["Needs", needs.join(", "), true]] as [string, string, boolean][]) : []),
    ["Message", message, false],
  ];
  const first = name.split(" ")[0] || name;

  return (
    <EmailLayout preview={`${name} sent a message from the contact form.`} footer={{ note: `Sent from the contact form on ${SITE_URL.replace("https://", "")}` }}>
      <Heading as="h1" style={{ ...text.title, fontSize: 26, lineHeight: "32px" }}>
        New message
      </Heading>
      <table role="presentation" style={{ marginTop: 20, width: "100%", borderCollapse: "collapse", fontSize: 15, lineHeight: "22px", color: colors.ink }}>
        <tbody>
          {rows.map(([title, content, strong], index) => (
            <tr key={title} style={index > 0 ? { borderTop: `1px solid ${colors.soft}` } : undefined}>
              <td style={label}>{title}</td>
              <td style={{ ...value, fontWeight: strong ? 600 : 400, whiteSpace: "pre-wrap" }}>{content}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Section style={{ margin: "26px 0 4px" }}>
        <EmailButton href={mailto(email)} size="medium">
          Reply to {first}
        </EmailButton>
      </Section>
    </EmailLayout>
  );
}
