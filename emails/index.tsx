import { render } from "@react-email/components";
import type { ReactElement } from "react";
import { absoluteUrl, CONTACT_EMAIL, routes } from "@/lib/routes";
import { Contact } from "./contact";
import { NewAddress } from "./new-address";
import { PasswordChanged } from "./password-changed";
import { Reset } from "./reset";
import { Verify } from "./verify";

/**
 * The five emails of the product, in one list (handover 8.12). The dev preview page, the tests and (later) the code that
 * sends them all start from here. `sample` is what the preview shows; the real values come from the sender.
 */
export const EMAIL_FROM = "Quiz <hello@quiz.basrh.com>";

export type EmailId = "verify" | "new-address" | "reset" | "password-changed" | "contact";

type EmailEntry = {
  id: EmailId;
  /** The design board this email follows */
  board: string;
  /** When it is sent, in plain words */
  when: string;
  subject: string;
  /** "From: ..." or "To: ..." line shown above the preview, as on the boards */
  header: { label: "From" | "To"; address: string };
  element: () => ReactElement;
};

const sampleLink = (path: string, token: string) => absoluteUrl(`${path}?token=${token}`);

export const emails: EmailEntry[] = [
  {
    id: "verify",
    board: "EmailVerify",
    when: "Someone registers or asks for the link again",
    subject: "Verify your email to start using Quiz",
    header: { label: "From", address: EMAIL_FROM },
    element: () => <Verify name="Sarah" verifyUrl={sampleLink(routes.verifyEmailDone, "a1b2c3d4e5f6")} />,
  },
  {
    id: "new-address",
    board: "EmailNewAddress",
    when: "Someone asks to change their email (goes to the new address)",
    subject: "Confirm your new email address",
    header: { label: "To", address: "new@example.com" },
    element: () => <NewAddress name="Sarah" newEmail="new@example.com" confirmUrl={sampleLink(routes.account, "f6e5d4c3b2a1")} />,
  },
  {
    id: "reset",
    board: "EmailReset",
    when: "Someone forgot their password",
    subject: "Reset your Quiz password",
    header: { label: "From", address: EMAIL_FROM },
    element: () => <Reset resetUrl={sampleLink(routes.resetPassword, "9f8e7d6c5b4a")} />,
  },
  {
    id: "password-changed",
    board: "EmailPasswordChanged",
    when: "A password was changed or a reset was completed",
    subject: "Your Quiz password was changed",
    header: { label: "From", address: EMAIL_FROM },
    element: () => <PasswordChanged changedOn="November 6, 2026" resetUrl={absoluteUrl(routes.forgotPassword)} />,
  },
  {
    id: "contact",
    board: "EmailContact",
    when: "Someone sends the contact form (goes to the owner)",
    subject: "New message from the Quiz contact form",
    header: { label: "To", address: CONTACT_EMAIL },
    element: () => (
      <Contact
        name="Sarah Lee"
        email="sarah@example.com"
        needs={["Your own domain", "Your colors and logo"]}
        message="Hi! We run a small studio and want a quiz that looks like our brand, on our own domain. Can you send a price?"
      />
    ),
  },
];

/** The email as the whole HTML page an inbox receives. */
export const renderEmail = (id: EmailId): Promise<string> => render(emails.find((email) => email.id === id)!.element());

export { Contact, NewAddress, PasswordChanged, Reset, Verify };
