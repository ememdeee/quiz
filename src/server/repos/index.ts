import { mockAccount } from "./mock/account";
import { mockMedia } from "./mock/media";
import { mockProfiles, mockQuizzes } from "./mock/quizzes";
import { mockResponses } from "./mock/responses";
import type { Repos } from "./ports";

/**
 * The one place that decides which data layer is wired in. Today it is the browser mock; Phase 5
 * swaps it for server actions and the screens do not change. Screens reach it only through hooks.
 */
export const repos: Repos = { quizzes: mockQuizzes, profiles: mockProfiles, media: mockMedia, responses: mockResponses, account: mockAccount };
