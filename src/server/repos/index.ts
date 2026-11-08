import { dataMode } from "@/lib/env";
import { mockAccount } from "./mock/account";
import { mockAdmin } from "./mock/admin";
import { mockMedia } from "./mock/media";
import { mockProfiles, mockQuizzes } from "./mock/quizzes";
import { mockResponses } from "./mock/responses";
import { mockRunner } from "./mock/runner";
import type { Repos } from "./ports";
import { remoteRepos } from "./remote";

const mockRepos: Repos = {
  quizzes: mockQuizzes,
  profiles: mockProfiles,
  media: mockMedia,
  responses: mockResponses,
  account: mockAccount,
  runner: mockRunner,
  admin: mockAdmin,
};

/**
 * The one place that decides which data layer is wired in: the browser dummy data (NEXT_PUBLIC_DATA_MODE unset or "mock") or
 * the real one on Supabase ("supabase"). Screens reach it only through hooks and do not change (handover 4.3).
 */
export const repos: Repos = dataMode === "supabase" ? remoteRepos : mockRepos;
