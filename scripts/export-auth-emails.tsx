// Writes the two emails that Supabase Auth sends (verify and reset) as HTML files in supabase/templates/.
// The designed React Email templates are the source; the {{ ... }} words are filled in by Supabase when it sends.
// Usage: npm run emails:export   (then: node scripts/with-env.mjs npx supabase config push --yes)
import { render } from "@react-email/components";
import { mkdirSync, writeFileSync } from "node:fs";
import { createElement } from "react";
import { Reset } from "../emails/reset";
import { Verify } from "../emails/verify";

const link = (type: string) => `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=${type}`;

async function main() {
  mkdirSync("supabase/templates", { recursive: true });
  writeFileSync("supabase/templates/confirmation.html", await render(createElement(Verify, { name: "{{ .Data.name }}", verifyUrl: link("email") })));
  writeFileSync("supabase/templates/recovery.html", await render(createElement(Reset, { resetUrl: link("recovery") })));
  console.log("Wrote supabase/templates/confirmation.html and recovery.html");
}

void main();
