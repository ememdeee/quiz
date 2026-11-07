import type { MetadataRoute } from "next";

// Portfolio site — no crawler may index anything (served as /robots.txt).
export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: "*", disallow: "/" },
    };
}
