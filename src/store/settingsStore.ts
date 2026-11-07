import { create } from 'zustand';

interface ProjectSettings {
    projectName: string;
    projectDescription: string;
    logoUrl: string;
    homePageQuiz: string;
}

interface SettingsState extends ProjectSettings {
    isLoaded: boolean;
    loadSettings: () => Promise<void>;
    updateSettings: (updates: Partial<ProjectSettings>) => void;
    getExportData: () => ProjectSettings;
    importSettings: (data: ProjectSettings) => void;
}

const defaultSettings: ProjectSettings = {
    projectName: 'LogicFlow',
    projectDescription: '',
    logoUrl: '',
    homePageQuiz: '',
};

async function persistToFile(settings: ProjectSettings) {
    try {
        await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
    } catch (err) {
        console.warn('Failed to persist settings to file:', err);
    }
}

let loadPromise: Promise<void> | null = null;

export const useSettingsStore = create<SettingsState>()((set, get) => ({
    ...defaultSettings,
    isLoaded: false,

    loadSettings: () => {
        if (loadPromise) return loadPromise;
        loadPromise = fetch('/data/settings.json', { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : defaultSettings))
            .then((data) => {
                set({
                    projectName: data.projectName ?? defaultSettings.projectName,
                    projectDescription: data.projectDescription ?? '',
                    logoUrl: data.logoUrl ?? '',
                    homePageQuiz: data.homePageQuiz ?? '',
                    isLoaded: true,
                });
            })
            .catch(() => set({ isLoaded: true }));
        return loadPromise;
    },

    updateSettings: (updates) => {
        set((state) => {
            const next = { ...state, ...updates };
            persistToFile({
                projectName: next.projectName,
                projectDescription: next.projectDescription,
                logoUrl: next.logoUrl,
                homePageQuiz: next.homePageQuiz,
            });
            return next;
        });
    },

    getExportData: () => {
        const { projectName, projectDescription, logoUrl, homePageQuiz } = get();
        return { projectName, projectDescription, logoUrl, homePageQuiz };
    },

    importSettings: (data) => {
        const next: ProjectSettings = {
            projectName: data.projectName || defaultSettings.projectName,
            projectDescription: data.projectDescription || '',
            logoUrl: data.logoUrl || '',
            homePageQuiz: data.homePageQuiz || '',
        };
        set(next);
        persistToFile(next);
    },
}));
