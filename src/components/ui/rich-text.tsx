import Link from "next/link";
import { Fragment } from "react";
import { routes } from "@/lib/routes";

/**
 * Tiny inline format for copy kept in src/content:
 *   **bold**   [link text](page:terms)   [link text](mailto:name@example.com)
 * Keeps links out of the content files as raw URLs (rule R2).
 */
const pageRoutes: Record<string, string> = {
  terms: routes.terms,
  privacy: routes.privacy,
  contact: routes.contact,
  pricing: routes.pricing,
  login: routes.login,
  register: routes.register,
  "forgot-password": routes.forgotPassword,
  "verify-email": routes.verifyEmail,
};

const token = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

export function RichText({ text, linkClassName }: { text: string; linkClassName?: string }) {
  return (
    <>
      {text.split(token).map((part, i) => {
        if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (!link) return <Fragment key={i}>{part}</Fragment>;
        const [, label, target] = link;
        if (target.startsWith("mailto:")) {
          return (
            <a key={i} href={target} className={linkClassName}>
              {label}
            </a>
          );
        }
        const href = pageRoutes[target.replace(/^page:/, "").toLowerCase()];
        if (!href) return <Fragment key={i}>{label}</Fragment>;
        return (
          <Link key={i} href={href} className={linkClassName}>
            {label}
          </Link>
        );
      })}
    </>
  );
}
