import { brandIcon } from "@/lib/brand-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** The icon iPhones use when the site is added to the home screen. */
export default function AppleIcon() {
  return brandIcon(180);
}
