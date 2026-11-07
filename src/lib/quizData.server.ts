// Server-side quiz data loading for /quiz/[quizId]. Reads the same JSON files
// the taker used to fetch over HTTP (/data/quizzes/*), straight from disk.
// Wrapped in React cache() so layout (generateMetadata + theme vars) and page
// share one read per request. Server components only — fs will not bundle
// for the client.
import { cache } from "react";
import fs from "fs/promises";
import path from "path";
import type { QuizConfig, QuizListItem } from "@/types/quiz";

export const loadQuizConfig = cache(async (quizId: string): Promise<QuizConfig | null> => {
    try {
        const file = path.join(process.cwd(), "public", "data", "quizzes", `${quizId}.json`);
        const raw = await fs.readFile(file, "utf-8");
        return JSON.parse(raw) as QuizConfig;
    } catch {
        return null;
    }
});

// Mirrors the client fetch path's fallbacks exactly: 'published' when the
// index is missing/unreadable or the quiz has no entry; an entry without a
// status counts as 'draft'.
export const loadQuizIndexStatus = cache(async (quizId: string): Promise<string> => {
    try {
        const file = path.join(process.cwd(), "public", "data", "quizzes", "index.json");
        const raw = await fs.readFile(file, "utf-8");
        const list = JSON.parse(raw) as QuizListItem[];
        const entry = list.find((q) => q.quizId === quizId);
        return entry ? (entry.status || "draft") : "published";
    } catch {
        return "published";
    }
});
