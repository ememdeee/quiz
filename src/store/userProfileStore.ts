import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// =============================================================================
// USER PROFILE TYPES
// =============================================================================

export interface UserProfile {
    // Core biometrics
    gender: 'male' | 'female' | null;
    age: number | null;
    heightCm: number | null;        // Always stored in cm
    weightKg: number | null;        // Always stored in kg
    targetWeightKg: number | null;  // Always stored in kg
    weightUnit: 'kg' | 'lbs' | null; // User's preferred display unit
    targetDate: string | null;      // ISO date string

    // Lifestyle answers (for metabolic age / TDEE calculations)
    activity: string | null;        // from physical-activity question
    sleep: string | null;           // from sleep question
    water: string | null;           // from water question
    typicalDay: string | null;      // from typical-day question
    walkFrequency: string | null;   // from walk-frequency question

    // Quiz behavioral answers
    mainGoal: string | null;        // from main-goal question
    physicalBuild: string | null;   // from q-physical-build (thin, mid, curvy, plus)
    dreamBody: string | null;       // from q-dream-body (slim, fit, hourglass, average)
}

// =============================================================================
// STORE ACTIONS
// =============================================================================

interface UserProfileActions {
    setField: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void;
    setProfile: (partial: Partial<UserProfile>) => void;
    reset: () => void;
    getProfile: () => UserProfile;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialProfile: UserProfile = {
    gender: null,
    age: null,
    heightCm: null,
    weightKg: null,
    targetWeightKg: null,
    weightUnit: null,
    targetDate: null,
    activity: null,
    sleep: null,
    water: null,
    typicalDay: null,
    walkFrequency: null,
    mainGoal: null,
    physicalBuild: null,
    dreamBody: null,
};

// =============================================================================
// STORE — persisted to localStorage under static key "user-profile"
// =============================================================================

export const useUserProfileStore = create<UserProfile & UserProfileActions>()(
    persist(
        immer((set, get) => ({
            ...initialProfile,

            setField: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
                set((state) => {
                    (state as UserProfile)[key] = value;
                });
            },

            setProfile: (partial: Partial<UserProfile>) => {
                set((state) => {
                    Object.assign(state, partial);
                });
            },

            reset: () => {
                set(initialProfile);
            },

            getProfile: (): UserProfile => {
                const s = get();
                return {
                    gender: s.gender,
                    age: s.age,
                    heightCm: s.heightCm,
                    weightKg: s.weightKg,
                    targetWeightKg: s.targetWeightKg,
                    weightUnit: s.weightUnit,
                    targetDate: s.targetDate,
                    activity: s.activity,
                    sleep: s.sleep,
                    water: s.water,
                    typicalDay: s.typicalDay,
                    walkFrequency: s.walkFrequency,
                    mainGoal: s.mainGoal,
                    physicalBuild: s.physicalBuild,
                    dreamBody: s.dreamBody,
                };
            },
        })),
        {
            name: 'user-profile', // Static localStorage key
        }
    )
);
