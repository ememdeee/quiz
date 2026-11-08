// `npm run test:mail`: a real sign-up must make Supabase send its verify email over SMTP to the
// Mailtrap sandbox. Uses 1 email of the free quota (50 per month): run sparingly.
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { assertDevProject, loadEnv, requireEnv } from "../db/env.ts";
import { deleteAll, readHtml, readText, waitForMessage } from "./mailbox.ts";

loadEnv();
assertDevProject(); // refuses to run unless the URL is the dev project

const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const anon = createClient(url, requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), opts);
const admin = createClient(url, requireEnv("SUPABASE_SERVICE_ROLE_KEY"), opts);

const email = `qc-${randomBytes(6).toString("hex")}@example.test`;
const password = randomBytes(12).toString("hex") + "Aa1!";
let userId: string | undefined;
let failure: string | undefined;

try {
  await deleteAll(); // start from an empty inbox so the check is clear
  const { data, error } = await anon.auth.signUp({ email, password });
  if (error) throw new Error(`signUp failed: ${error.message}`);
  userId = data.user?.id;

  const message = await waitForMessage(email);
  if (!message.subject?.trim()) throw new Error("The email has no subject.");
  const body = (await readHtml(message.id)) + (await readText(message.id));
  if (!/supabase\.co\/auth\/v1\/verify/.test(body)) throw new Error("The email has no verify link (supabase.co/auth/v1/verify).");
  console.log(`OK: verify email arrived in the sandbox (subject: "${message.subject}") and contains the verify link.`);
} catch (e) {
  failure = e instanceof Error ? e.message : String(e);
} finally {
  try {
    if (userId) await admin.auth.admin.deleteUser(userId);
    await deleteAll();
  } catch (e) {
    console.error("Cleanup problem:", e instanceof Error ? e.message : e);
    failure ??= "cleanup failed";
  }
}
if (failure) {
  console.error(`FAIL: ${failure}`);
  process.exit(1);
}
