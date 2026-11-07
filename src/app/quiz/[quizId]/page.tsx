import { preload } from "react-dom";
import { loadQuizConfig, loadQuizIndexStatus } from "@/lib/quizData.server";
import { QuizPageClient } from "./QuizPageClient";

// The quiz JSON is editable at runtime (dashboard saves write to disk), so
// render per-request — edits must show up on refresh, exactly like the old
// client-side fetch of /data/quizzes/*.json did.
export const dynamic = "force-dynamic";

interface Params {
    quizId: string;
}

export default async function QuizPage({ params }: { params: Promise<Params> }) {
    const { quizId } = await params;
    const [quiz, indexStatus] = await Promise.all([
        loadQuizConfig(quizId),
        loadQuizIndexStatus(quizId),
    ]);

    // Start the hero download with the HTML — a background-image in an inline
    // style is invisible to the browser's preload scanner, so without this it
    // only starts after hydration renders step 1.
    const firstStep = quiz?.steps?.[0];
    if (firstStep?.type === "quiz-landing") {
        const bg = (firstStep.content as { backgroundImage?: string })?.backgroundImage;
        if (bg) preload(bg, { as: "image", fetchPriority: "high" });
    }

    return <QuizPageClient serverData={{ quiz, indexStatus }} />;
}
