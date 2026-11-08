import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/icons";
import { auth } from "@/content/auth";
import { googleLoginAction } from "@/server/actions/auth";

/**
 * "Continue with Google". Must sit inside a form: it sends that form somewhere else without
 * checking the other fields. Phase 4 starts the real Google sign-in; for now it logs in the demo person.
 */
export function GoogleButton() {
  return (
    <Button type="submit" formAction={googleLoginAction} formNoValidate variant="secondary" size="lg" block className="gap-2.5 text-[17px]">
      <GoogleIcon />
      {auth.google}
    </Button>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3.5 text-sm text-mute before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
      {auth.or}
    </div>
  );
}
