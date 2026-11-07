import { brandIcon } from "@/lib/brand-icon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** The favicon shown in the browser tab. */
export default function Icon() {
  return brandIcon(32);
}
