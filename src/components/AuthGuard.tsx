"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Wait for Zustand to hydrate from localStorage
    useEffect(() => {
        // Check if already hydrated from persist
        const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
            setIsHydrated(true);
        });

        // If already hydrated (fast refresh), set immediately
        if (useAuthStore.persist.hasHydrated()) {
            setIsHydrated(true);
        }

        return () => {
            unsubscribe();
        };
    }, []);

    // Redirect after hydration if not authenticated
    useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isHydrated, isAuthenticated, router]);

    // Show loading only while hydrating
    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-dashboard-background-dark flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 rounded-full border-4 border-dashboard-primary/30 border-t-dashboard-primary animate-spin"></div>
                </div>
            </div>
        );
    }

    // After hydration, if not authenticated, show loading while redirecting
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-dashboard-background-dark flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 rounded-full border-4 border-dashboard-primary/30 border-t-dashboard-primary animate-spin"></div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
