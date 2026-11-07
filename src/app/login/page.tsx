"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated } = useAuthStore();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already logged in
    React.useEffect(() => {
        if (isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const success = login(username, password);

        if (success) {
            router.push('/dashboard');
        } else {
            setError("Invalid username or password");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dashboard-background-dark flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div
                className="fixed inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: "radial-gradient(#282839 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                }}
            />

            <div className="w-full max-w-md relative z-10">
                {/* Logo/Brand */}
                <div className="flex flex-col items-center mb-8">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-dashboard-primary to-purple-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-dashboard-primary/30">
                        <span className="material-symbols-outlined text-3xl">bolt</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">LogicFlow</h1>
                    <p className="text-slate-500 text-sm mt-1">Quiz Builder Dashboard</p>
                </div>

                {/* Login Card */}
                <div className="bg-dashboard-surface-dark border border-dashboard-border-dark rounded-2xl p-8 shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-6 text-center">
                        Sign in to continue
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300 text-sm">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined text-[18px]">
                                    person
                                </span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-dashboard-background-dark border border-dashboard-border-dark rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-dashboard-primary focus:border-dashboard-primary focus:outline-none transition-all"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined text-[18px]">
                                    lock
                                </span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-dashboard-background-dark border border-dashboard-border-dark rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-dashboard-primary focus:border-dashboard-primary focus:outline-none transition-all"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-dashboard-primary hover:bg-dashboard-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg shadow-dashboard-primary/30 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-600 text-xs mt-6">
                        Use <span className="text-slate-400 font-mono">admin</span> / <span className="text-slate-400 font-mono">admin</span> to login
                    </p>
                </div>
            </div>
        </div>
    );
}
