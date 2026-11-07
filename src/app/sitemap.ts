import type { MetadataRoute } from "next";
import { absoluteUrl, routes } from "@/lib/routes";

/** The pages of the website that should be found. Quiz pages, the dashboard and the sign-in screens are not listed. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [routes.home, routes.pricing, routes.contact, routes.terms, routes.privacy].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === routes.home ? "weekly" : "monthly",
    priority: path === routes.home ? 1 : 0.6,
  }));
}
