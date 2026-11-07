/**
 * Centralized metadata builder. Every page that exports `generateMetadata`
 * should go through `buildMetadata` so titles and descriptions consistently
 * fall back to the project name / description configured in /dashboard/settings.
 *
 * Title pattern: page-specific title gets " · ProjectName" appended.
 * Description: page-specific description, or the project description as fallback.
 */

import type { Metadata } from "next";
import { getProjectSettings } from "./projectSettings";

export interface BuildMetadataInput {
    /** Page-specific title. If omitted, the project name alone is used. */
    title?: string;
    /** Page-specific description. If omitted, the project description is used. */
    description?: string;
    /** Extra metadata fields to merge in (e.g. openGraph image). Wins over defaults. */
    overrides?: Metadata;
}

export async function buildMetadata({
    title,
    description,
    overrides,
}: BuildMetadataInput = {}): Promise<Metadata> {
    const settings = await getProjectSettings();

    const finalTitle = title ? `${title} · ${settings.projectName}` : settings.projectName;
    const finalDescription = description || settings.projectDescription || "";
    const iconUrl = settings.logoUrl || undefined;

    const base: Metadata = {
        title: finalTitle,
        description: finalDescription,
        // Portfolio site — keep every page out of search engines. Pairs with
        // app/robots.ts (Disallow: /) and the X-Robots-Tag header in next.config.ts.
        robots: {
            index: false,
            follow: false,
            nocache: true,
            googleBot: { index: false, follow: false, noimageindex: true },
        },
        openGraph: {
            title: finalTitle,
            description: finalDescription,
            ...(iconUrl ? { images: [{ url: iconUrl }] } : {}),
        },
        ...(iconUrl
            ? {
                icons: {
                    icon: iconUrl,
                    apple: iconUrl,
                },
            }
            : {}),
    };

    return { ...base, ...overrides };
}
