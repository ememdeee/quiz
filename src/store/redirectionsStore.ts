import { create } from 'zustand';

export interface RedirectionRule {
    id: string;
    from: string;
    to: string;
    forwardParams: boolean;
}

interface RedirectionsConfig {
    forwardQueryParamsDefault: boolean;
    rules: RedirectionRule[];
}

interface RedirectionsState extends RedirectionsConfig {
    isLoaded: boolean;
    isSaving: boolean;
    loadRedirections: () => Promise<void>;
    setForwardDefault: (value: boolean) => void;
    addRule: () => void;
    updateRule: (id: string, updates: Partial<RedirectionRule>) => void;
    removeRule: (id: string) => void;
    saveRedirections: () => Promise<{ ok: boolean; error?: string }>;
}

const defaultConfig: RedirectionsConfig = {
    forwardQueryParamsDefault: true,
    rules: [],
};

function newId() {
    return `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

let loadPromise: Promise<void> | null = null;

export const useRedirectionsStore = create<RedirectionsState>()((set, get) => ({
    ...defaultConfig,
    isLoaded: false,
    isSaving: false,

    loadRedirections: () => {
        if (loadPromise) return loadPromise;
        loadPromise = fetch('/api/redirections', { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : defaultConfig))
            .then((data: RedirectionsConfig) => {
                set({
                    forwardQueryParamsDefault:
                        typeof data.forwardQueryParamsDefault === 'boolean'
                            ? data.forwardQueryParamsDefault
                            : true,
                    rules: Array.isArray(data.rules) ? data.rules : [],
                    isLoaded: true,
                });
            })
            .catch(() => set({ isLoaded: true }));
        return loadPromise;
    },

    setForwardDefault: (value) => set({ forwardQueryParamsDefault: value }),

    addRule: () => {
        const { rules, forwardQueryParamsDefault } = get();
        set({
            rules: [
                ...rules,
                { id: newId(), from: '', to: '', forwardParams: forwardQueryParamsDefault },
            ],
        });
    },

    updateRule: (id, updates) => {
        set((state) => ({
            rules: state.rules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));
    },

    removeRule: (id) => {
        set((state) => ({ rules: state.rules.filter((r) => r.id !== id) }));
    },

    saveRedirections: async () => {
        set({ isSaving: true });
        try {
            const { forwardQueryParamsDefault, rules } = get();
            const res = await fetch('/api/redirections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ forwardQueryParamsDefault, rules }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                set({ isSaving: false });
                return { ok: false, error: err.error || 'Failed to save' };
            }
            const data = await res.json();
            set({
                forwardQueryParamsDefault: data.config.forwardQueryParamsDefault,
                rules: data.config.rules,
                isSaving: false,
            });
            return { ok: true };
        } catch (e) {
            set({ isSaving: false });
            return { ok: false, error: e instanceof Error ? e.message : 'Failed to save' };
        }
    },
}));
