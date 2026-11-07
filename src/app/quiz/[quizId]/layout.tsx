import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { loadQuizConfig } from "@/lib/quizData.server";
import type { QuizTheme } from "@/types/quiz";
import { DEFAULT_QUIZ_THEME } from "@/types/quiz";

interface Params {
    quizId: string;
}

async function loadQuizMeta(quizId: string) {
    return (await loadQuizConfig(quizId))?.meta ?? null;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    const { quizId } = await params;
    const meta = await loadQuizMeta(quizId);
    return buildMetadata({
        title: meta?.title,
        description: meta?.description,
    });
}

export default async function QuizLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<Params>;
}) {
    const { quizId } = await params;
    const meta = await loadQuizMeta(quizId);
    const theme: QuizTheme = (meta?.theme && typeof meta.theme === "object")
        ? meta.theme
        : DEFAULT_QUIZ_THEME;

    // Server-rendered theme vars so pre-hydration UI (e.g. the loading screen)
    // already has the quiz's palette instead of the global fallbacks
    const themeVars = {
        "--quiz-primary": theme.primary,
        "--quiz-primary-fg": theme.primaryForeground,
        "--quiz-bg": theme.background,
        "--quiz-fg": theme.foreground,
        "--quiz-muted-fg": theme.mutedForeground,
        "--quiz-border": theme.border,
    } as React.CSSProperties;

    return (
        <div style={themeVars} className="contents">
            {children}
        </div>
    );
}
