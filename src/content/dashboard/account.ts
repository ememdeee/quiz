/** Words of the Account page and its dialogs (boards Account, AccountEmail, AccountPassword, AccountDelete, AccountGoogleOnly). */
export const accountPage = {
  back: "All quizzes",
  title: "Account",
  subtitle: "Your personal details and how you sign in.",
  details: "Your details",
  name: "Name",
  email: "Email",
  verified: "Verified",
  waiting: "Waiting for verification",
  emailHint: "If you change your email, we’ll ask you to verify the new one.",
  /** The design does not show how a new address is entered or what a wrong one says (gap G22). */
  emailInvalid: "Please enter a valid email.",
  sentTo: (email: string) => `We sent a link to ${email}. Your email changes after you open it.`,
  sendAgain: "Send it again",
  sentAgain: "Sent again",
  cancelChange: "Cancel the change",
  /** The toast after the new-address link was opened. No board (gap G5). */
  emailChanged: "Your email address was changed",
  login: "How you log in",
  password: "Password",
  passwordNote: "Change it any time.",
  changePassword: "Change password",
  googleOnlyNote: "You log in with Google only. Add a password to also log in with your email.",
  setPassword: "Set a password",
  google: "Google",
  googleNote: "Log in with your Google account.",
  googleConnectedNote: "Connected. You can disconnect it after you set a password.",
  connect: "Connect",
  connected: "Connected",
  /** Disconnect Google has no board (gap G6). */
  disconnect: "Disconnect",
  deleteTitle: "Delete account",
  deleteText: "This permanently deletes your account, all your quizzes and all their responses. You can’t undo it.",
  deleteButton: "Delete my account",
  saved: "All changes saved",
  saving: "Saving…",
} as const;

export const passwordDialog = {
  title: "Change your password",
  /** Setting a first password (Google-only account) has no board; it is the same dialog without the current password (gap G22). */
  titleSet: "Set a password",
  current: "Current password",
  wrongCurrent: "That isn’t your current password.",
  next: "New password",
  nextHint: "At least 8 characters.",
  confirm: "Confirm new password",
  mismatch: "The two passwords are not the same.",
  note: "After you save, you’ll be signed out on your other devices, and we’ll email you to confirm.",
  cancel: "Cancel",
  update: "Update password",
  toast: "Password updated",
} as const;

/** No board (gap G6). */
export const disconnectGoogleDialog = {
  title: "Disconnect Google?",
  text: "From now on you log in with your email and password. You can connect Google again any time.",
  keep: "Keep it connected",
  confirm: "Disconnect Google",
  toast: "Google disconnected",
  failed: "We couldn’t disconnect Google. Please try again.",
} as const;

export const deleteAccountDialog = {
  title: "Delete your account?",
  before: "This permanently deletes your account,",
  quizzes: "all your quizzes",
  and: "and",
  responses: "all their responses",
  after: ". You can’t undo this.",
  download: "Download your responses first",
  confirmLabel: "Type DELETE to confirm",
  word: "DELETE",
  keep: "Keep my account",
  confirm: "Delete my account",
} as const;
