import Link from "next/link";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { textLink } from "@/components/ui/link-styles";
import { auth } from "@/content/auth";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function BackToLogin() {
  return (
    <Link
      href={routes.login}
      className={cn("inline-flex min-h-11 items-center gap-2 rounded text-base font-semibold text-slate focus-visible:outline-[3px] focus-visible:outline-slate", textLink)}
    >
      <ArrowLeftIcon />
      {auth.backToLogin}
    </Link>
  );
}
