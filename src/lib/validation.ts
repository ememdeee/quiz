/** Small checks shared by the browser and the server (rule R2: one function, both sides). */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL.test(value.trim());
}

export const PASSWORD_MIN_LENGTH = 8;
