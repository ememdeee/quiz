/**
 * Shared hover look for text links: the underline fades in instead of appearing at once.
 * Colors and weights stay with the caller.
 */
export const textLink =
  "underline decoration-transparent underline-offset-4 transition-[text-decoration-color,color] duration-200 hover:decoration-current";

/** Soft grey pill behind a link or menu row on hover (website menu, footer, table of contents). */
export const softHover = "transition-colors duration-200 hover:bg-soft";
