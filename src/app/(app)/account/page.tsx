import type { Metadata } from "next";
import { AccountPage } from "@/components/account/account-page";

export const metadata: Metadata = { title: "Account · Quiz", robots: { index: false } };

/** `?email=changed` is where the "confirm your new email" link lands (no board, gap G5). */
export default async function AccountRoute({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return <AccountPage emailChanged={email === "changed"} />;
}
