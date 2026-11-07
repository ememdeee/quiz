import { Banner } from "@/components/ui/banner";
import { RichText } from "@/components/ui/rich-text";
import { auth } from "@/content/auth";
import { authProblems, type AuthProblem } from "@/lib/routes";

/** The `?problem=` of a sign-in screen, when it is one the server uses (anything else is ignored). */
export const readAuthProblem = (value: string | undefined): AuthProblem | null => authProblems.find((problem) => problem === value) ?? null;

/** The red banner above a form the server turned back (no board, gaps G11 and G25). */
export function AuthProblemBanner({ problem }: { problem: AuthProblem | null }) {
  if (!problem) return null;
  return (
    <Banner tone="error">
      <RichText text={auth.problems[problem]} />
    </Banner>
  );
}
