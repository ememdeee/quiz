import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isProduction } from "@/lib/env";

/** Everything under /dev is for building and testing. It does not exist in a production build. */
export default function DevLayout({ children }: { children: ReactNode }) {
  if (isProduction) notFound();
  return children;
}
