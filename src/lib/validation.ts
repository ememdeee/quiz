/** Small checks shared by the browser and the server (rule R2: one function, both sides). */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL.test(value.trim());
}

export const PASSWORD_MIN_LENGTH = 8;

/**
 * What is wrong with a field of a sign-in form. The words live in `content/auth.ts`; the design shows field errors only on
 * Contact, so these are built by Code (gap G9).
 */
export type FieldProblem = "name_missing" | "email_missing" | "email_invalid" | "password_missing" | "password_short" | "passwords_differ";
export type FieldProblems<Field extends string> = Partial<Record<Field, FieldProblem>>;

const emailProblem = (email: string): FieldProblem | null => (email.trim() === "" ? "email_missing" : isValidEmail(email) ? null : "email_invalid");
const newPasswordProblem = (password: string): FieldProblem | null => (password === "" ? "password_missing" : password.length < PASSWORD_MIN_LENGTH ? "password_short" : null);

/** Keeps only the fields that have a problem. */
function onlyProblems<Field extends string>(found: Record<Field, FieldProblem | null>): FieldProblems<Field> {
  return Object.fromEntries(Object.entries(found).filter(([, problem]) => problem !== null)) as FieldProblems<Field>;
}

export const registerProblems = (input: { name: string; email: string; password: string }) =>
  onlyProblems<"name" | "email" | "password">({
    name: input.name.trim() === "" ? "name_missing" : null,
    email: emailProblem(input.email),
    password: newPasswordProblem(input.password),
  });

export const forgotProblems = (input: { email: string }) => onlyProblems<"email">({ email: emailProblem(input.email) });

export const resetProblems = (input: { password: string; confirm: string }) =>
  onlyProblems<"password" | "confirm">({
    password: newPasswordProblem(input.password),
    confirm: input.confirm !== input.password ? "passwords_differ" : null,
  });
