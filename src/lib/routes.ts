/** Every URL in the app lives here. No hard-coded href strings anywhere else (rule R2). */
export const routes = {
  home: "/",
  howItWorks: "/#how",
  features: "/#features",
  pricing: "/pricing",
  contact: "/contact",
  terms: "/terms",
  privacy: "/privacy",
  maintenance: "/maintenance",

  register: "/register",
  login: "/login",
  forgotPassword: "/forgot-password",
  forgotPasswordSent: "/forgot-password/sent",
  resetPassword: "/reset-password",
  resetPasswordDone: "/reset-password/done",
  resetPasswordExpired: "/reset-password/expired",
  verifyEmail: "/verify-email",
  verifyEmailDone: "/verify-email/done",
  verifyEmailExpired: "/verify-email/expired",
  goodbye: "/goodbye",

  dashboard: "/dashboard",
  account: "/account",
  admin: "/admin",

  dev: "/dev",
  devSession: "/dev/session",
  dev500: "/dev/500",
  devUi: "/dev/ui",
  devTemplates: "/dev/templates",
  devEmails: "/dev/emails",
} as const;

/** Pages of one quiz in the dashboard. They use the quiz id, never the web address. */
export const quizHref = {
  edit: (id: string) => `/dashboard/${id}`,
  responses: (id: string) => `/dashboard/${id}/responses`,
  settings: (id: string) => `/dashboard/${id}/settings`,
  preview: (id: string) => `/dashboard/${id}/preview`,
  /** What the people who answer open. */
  public: (slug: string) => `/quiz/${slug}`,
} as const;

/** Pages of the admin area (owner only). They use a person's id, never their email. */
export const adminHref = {
  overview: "/admin",
  users: "/admin/users",
  user: (id: string) => `/admin/users/${id}`,
} as const;

/** The public address of the website (decision D9). Emails need whole addresses, so they are built from this. */
export const SITE_URL = "https://quiz.basrh.com";
export const absoluteUrl = (path: string) => `${SITE_URL}${path}`;

export const CONTACT_EMAIL = "basurah@basrh.com";
export const mailto = (address: string = CONTACT_EMAIL) => `mailto:${address}`;

/** Where "Create your quiz" goes: people without an account register first. */
export const createQuizHref = (loggedIn: boolean) => (loggedIn ? routes.dashboard : routes.register);

/** Login screens that can be opened directly (redirects, the dev link list). */
export const loginStates = [
  "error",
  "unverified",
  "too-many",
  "suspended",
  "google-exists",
  "google-cancelled",
] as const;
export type LoginState = (typeof loginStates)[number];
export const loginHref = (state?: LoginState) => (state ? `${routes.login}?state=${state}` : routes.login);

/** Result screens of the contact form and the verify-email screen, opened directly. */
export const contactHref = (state: "error" | "sent") => `${routes.contact}?state=${state}`;
export const verifyEmailHref = (state: "resent") => `${routes.verifyEmail}?state=${state}`;
