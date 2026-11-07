import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CourseProgressState {
  // Map of courseId → array of completed videoIds
  completedVideos: Record<string, string[]>;
  // Map of courseId → last watched videoId (for resume)
  lastWatchedVideo: Record<string, string>;
  // Currently active video id in the player
  activeVideoId: string | null;

  // Actions
  markVideoComplete: (courseId: string, videoId: string) => void;
  setActiveVideo: (courseId: string, videoId: string) => void;
  isVideoComplete: (courseId: string, videoId: string) => boolean;
  getProgress: (courseId: string, totalVideos: number) => number;
  getLastWatchedVideo: (courseId: string) => string | null;
  /**
   * Reconcile stored completedVideos against the current video list.
   * Purges stale IDs that no longer exist in the JSON (PRD §7.2).
   */
  reconcileProgress: (courseId: string, validVideoIds: string[]) => void;
}

export const useCourseStore = create<CourseProgressState>()(
  persist(
    (set, get) => ({
      completedVideos: {},
      lastWatchedVideo: {},
      activeVideoId: null,

      markVideoComplete: (courseId, videoId) => {
        const current = get().completedVideos[courseId] ?? [];
        if (current.includes(videoId)) return;
        set((state) => ({
          completedVideos: {
            ...state.completedVideos,
            [courseId]: [...current, videoId],
          },
        }));
      },

      setActiveVideo: (courseId, videoId) => {
        set((state) => ({
          activeVideoId: videoId,
          lastWatchedVideo: {
            ...state.lastWatchedVideo,
            [courseId]: videoId,
          },
        }));
      },

      isVideoComplete: (courseId, videoId) => {
        return (get().completedVideos[courseId] ?? []).includes(videoId);
      },

      getProgress: (courseId, totalVideos) => {
        if (totalVideos === 0) return 0;
        const completed = (get().completedVideos[courseId] ?? []).length;
        return Math.round((completed / totalVideos) * 100);
      },

      getLastWatchedVideo: (courseId) => {
        return get().lastWatchedVideo[courseId] ?? null;
      },

      reconcileProgress: (courseId, validVideoIds) => {
        const stored = get().completedVideos[courseId] ?? [];
        const validSet = new Set(validVideoIds);
        const reconciled = stored.filter((id) => validSet.has(id));
        if (reconciled.length !== stored.length) {
          set((state) => ({
            completedVideos: {
              ...state.completedVideos,
              [courseId]: reconciled,
            },
          }));
        }
      },
    }),
    {
      name: "course-progress",
      // Partition storage by course key for clean isolation
      partialize: (state) => ({
        completedVideos: state.completedVideos,
        lastWatchedVideo: state.lastWatchedVideo,
      }),
    }
  )
);
