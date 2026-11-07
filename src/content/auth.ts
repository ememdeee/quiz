/**
 * Words on the sign-in screens (boards Register, Login*, Forgot*, Reset*, Verify*, AccountDeleted).
 * Inline format: **bold** and [link text](page:name), see components/ui/rich-text.tsx.
 * {email} is replaced with the person's address.
 */
export const auth = {
  placeholderEmail: "you@example.com",
  google: "Continue with Google",
  or: "or",
  fields: {
    name: "Your name",
    email: "Email",
    password: "Password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
  },
  passwordHint: "At least 8 characters.",
  passwordMismatch: "The two passwords are not the same.",
  forgotLink: "Forgot your password?",
  backToLogin: "Back to log in",

  login: {
    title: "Welcome back",
    sub: "Log in to manage your quizzes.",
    submit: "Log in",
    newHere: "New here? [Create an account](page:register)",
    banners: {
      error: "That email and password don’t match. Try again, or [reset your password](page:forgot-password).",
      unverified: "**Please verify your email first.** We sent a link to {email}. [Send it again](page:verify-email)",
      "too-many": "**Too many tries.** For your security, wait 15 minutes and try again. Or [reset your password](page:forgot-password) now.",
      suspended: "**This account is suspended.** You can’t log in right now. If you think this is a mistake, [contact us](page:contact).",
      "google-exists":
        "**This email already has an account with a password.** Log in with your password below. You can connect Google later in your account settings.",
      "google-cancelled": "Logging in with Google was cancelled. You can try again, or log in with your email.",
    },
    panel: {
      title: "Where people leave",
      caption: "See where people leave.",
      rows: [
        { label: "Welcome", percent: 100 },
        { label: "Main goal", percent: 88 },
        { label: "Age", percent: 76 },
        { label: "Thank you", percent: 52 },
      ],
    },
  },

  register: {
    title: "Create your account",
    sub: "Free. No credit card.",
    submit: "Create account",
    agree: "By creating an account you agree to the [Terms](page:terms) and the [Privacy Policy](page:privacy).",
    haveAccount: "Already have an account? [Log in](page:login)",
    panel: { title: ["Build it. Share it.", "See the answers."], chips: ["Add your pages", "Share one link", "Read every response"] },
  },

  forgot: {
    title: "Forgot your password?",
    sub: "Enter your email and we’ll send you a link to reset it.",
    submit: "Send reset link",
    caption: "We’ll get you back in.",
  },
  forgotSent: {
    title: "Check your email",
    sub: "If there is an account for **{email}**, we sent a link to reset your password. The link works for 1 hour.",
    back: "Back to log in",
    again: "Didn’t get it? Check your spam folder, or [send the link again](page:forgot-password).",
    caption: "Check your inbox.",
  },
  reset: {
    title: "Set a new password",
    sub: "Choose a password you haven’t used before.",
    submit: "Save password",
    caption: "Make it a good one.",
  },
  resetDone: {
    title: "Password updated",
    sub: "You can now log in with your new password.",
    button: "Log in",
    caption: "All set.",
  },
  resetExpired: {
    title: "This link has expired",
    sub: "Password reset links work for 1 hour. We can send you a new one.",
    button: "Send a new link",
    caption: "Links don’t last forever.",
  },

  verify: {
    title: "Check your email to finish signing up",
    sub: "We sent a verification link to **{email}**. Click it to activate your account.",
    done: "I’ve verified my email",
    resend: "Send the email again",
    resendWait: "Send the email again ({seconds}s)",
    wrongAddress: "Wrong address? [Use a different email](page:register). The link works for 24 hours.",
    resentBanner: "**We sent it again.** You can ask for another one in 60 seconds.",
    resentHelp: "Still nothing? Check your spam folder. Wrong address? [Use a different email](page:register).",
    caption: "One more step.",
  },
  verifyDone: {
    title: "Email verified",
    sub: "Your account is ready. Let’s make your first quiz.",
    button: "Go to my quizzes",
    caption: "You’re in.",
  },
  verifyExpired: {
    title: "This link has expired",
    sub: "Verification links work for 24 hours. We can send you a new one.",
    button: "Send a new link",
    caption: "Links don’t last forever.",
  },

  goodbye: {
    title: "Your account was deleted",
    sub: "All your quizzes and responses have been removed. We’re sorry to see you go.",
    button: "Back to home",
    caption: "Take care.",
  },
} as const;

export const RESEND_WAIT_SECONDS = 60;
