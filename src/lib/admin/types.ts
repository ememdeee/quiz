import type { LimitOverrides, Plan } from "@/lib/plan/limits";

/** One quiz of a person, as the admin sees it: facts only, never what people answered. */
export type AdminQuiz = {
  id: string;
  name: string;
  status: "open" | "closed" | "not_published";
  pages: number;
  /** Finished responses only (decision D19) */
  responses: number;
  updatedAt: string;
};

export type AdminPerson = {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  brandColors: boolean;
  hidePoweredBy: boolean;
  customDomain: string | null;
  /** Blank (null) means the plan's own number */
  overrides: LimitOverrides;
  emailVerified: boolean;
  signedUpAt: string;
  signsInWithGoogle: boolean;
  /** null while the account is active */
  suspendedAt: string | null;
  notes: string;
  quizzes: AdminQuiz[];
};

/** `near-limit` has no board (gap G7): the Overview counter "Close to a Free plan limit" opens the Users list on it. */
export type PeopleFilter = "everyone" | "free" | "custom" | "unverified" | "near-limit";
export type PeopleQuery = { search: string; filter: PeopleFilter; page: number };

export type PersonRow = { person: AdminPerson; quizzes: number; responses: number };

export type AdminOverviewData = {
  signedUp: number;
  newThisWeek: number;
  newThisMonth: number;
  custom: number;
  quizzes: number;
  responses: number;
  unverified: number;
  nearLimit: number;
  /** Sign-ups per day, oldest first, 30 entries ending today */
  daily: number[];
  newest: AdminPerson[];
};

/** What the admin can change on the Plan card. */
export type PlanPatch = Pick<AdminPerson, "plan" | "brandColors" | "hidePoweredBy" | "customDomain" | "overrides">;
