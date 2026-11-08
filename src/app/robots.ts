import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/routes";

/** Search engines may read the website. Everything private, every quiz link, and the server routes stay out (decision D5). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/account", "/admin", "/quiz/", "/api/", "/auth/", "/dev", "/login", "/register", "/verify-email", "/reset-password", "/forgot-password"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
