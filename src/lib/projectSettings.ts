/**
 * Server-side reader for the project settings JSON.
 * Used by `generateMetadata` and other server-rendered code paths.
 *
 * Client code should use `useSettingsStore` instead — it shares one fetch
 * across the app via the SettingsHydrator and stays reactive on save.
 */

import "server-only";
import fs from "fs/promises";
import path from "path";

export interface ProjectSettings {
    projectName: string;
    projectDescription: string;
    logoUrl: string;
    homePageQuiz: string;
}

const DEFAULTS: ProjectSettings = {
    projectName: "LogicFlow",
    projectDescription: "",
    logoUrl: "",
    homePageQuiz: "",
};

const SETTINGS_PATH = path.join(process.cwd(), "public", "data", "settings.json");

export async function getProjectSettings(): Promise<ProjectSettings> {
    try {
        const raw = await fs.readFile(SETTINGS_PATH, "utf-8");
        const parsed = JSON.parse(raw) as Partial<ProjectSettings>;
        return { ...DEFAULTS, ...parsed };
    } catch {
        return DEFAULTS;
    }
}

/**
 * Public quiz URL for "take the quiz" CTAs — the quiz chosen as Home Page Quiz
 * in /dashboard/settings, else `/quiz`. Server-side counterpart of `useQuizUrl`:
 * resolved before render, so the link is correct in the SSR HTML.
 */
export async function getQuizUrl(): Promise<string> {
    const { homePageQuiz } = await getProjectSettings();
    return homePageQuiz ? `/quiz/${homePageQuiz}` : "/quiz";
}
