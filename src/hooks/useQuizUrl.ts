import { useSettingsStore } from '@/store/settingsStore';

/**
 * Returns the resolved quiz URL based on Dashboard setting.
 * If a quiz is configured in dashboard settings → /quiz/{quizId}
 * Otherwise → /quiz (fallback)
 */
export function useQuizUrl(): string {
    const homePageQuiz = useSettingsStore((state) => state.homePageQuiz);
    return homePageQuiz ? `/quiz/${homePageQuiz}` : '/quiz';
}
