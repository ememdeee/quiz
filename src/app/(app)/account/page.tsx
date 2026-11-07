import type { Metadata } from "next";
import { AccountPage } from "@/components/account/account-page";

export const metadata: Metadata = { title: "Account · Quiz", robots: { index: false } };

export default function AccountRoute() {
  return <AccountPage />;
}
