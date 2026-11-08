import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { routes } from "@/lib/routes";
import { getSessionUser } from "@/server/session";

/** Try it: the owner's working copy of a quiz, outside the dashboard frame. Logged-out people go to Log in. */
export default async function PreviewLayout({ children }: { children: ReactNode }) {
  if (!(await getSessionUser())) redirect(routes.login);
  return children;
}
