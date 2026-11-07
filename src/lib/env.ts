/**
 * The only place that reads process.env (rule R2). It grows into the Zod-checked
 * environment in Phase 1; the UI phase only needs the flags below.
 */
export const isProduction = process.env.NODE_ENV === "production";
