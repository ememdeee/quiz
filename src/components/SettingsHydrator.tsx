"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";

/**
 * Hydrates the settings store on mount and renders the favicon `<link>` tags.
 *
 * Why JSX instead of document.head.appendChild?
 * React 19 / Next 15 auto-hoist `<link>`, `<title>`, and other resource elements
 * rendered from any component into `<head>`. Manual DOM mutation conflicts with
 * React's reconciliation and caused "removeChild on null parent" errors during
 * navigation. JSX is the idiomatic, race-free path.
 */
export default function SettingsHydrator() {
    const loadSettings = useSettingsStore((s) => s.loadSettings);
    const logoUrl = useSettingsStore((s) => s.logoUrl);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    if (!logoUrl) return null;
    return (
        <>
            <link rel="icon" href={logoUrl} />
            <link rel="apple-touch-icon" href={logoUrl} />
        </>
    );
}
