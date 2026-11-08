"use server";

import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import { endSession } from "@/server/session";

export async function logoutAction() {
  await endSession();
  redirect(routes.home);
}
