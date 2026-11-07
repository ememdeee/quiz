import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Members Area",
  description: "Your course library and learning dashboard.",
};

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
