"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { QuizCard } from "./components/QuizCard";
import { CreateQuizModal } from "@/components/CreateQuizModal";
import { useQuizBuilderStore } from "@/store/quizBuilderStore";
import { DashboardLoading } from "@/components/DashboardLoading";

type FilterType = 'all' | 'published' | 'draft';
type SortType = 'lastModified' | 'title' | 'created';

export default function DashboardPage() {
    const { quizList, isLoading, loadQuizList } = useQuizBuilderStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [sortType, setSortType] = useState<SortType>('lastModified');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadQuizList();
    }, [loadQuizList]);

    // Filter and sort quizzes
    const filteredQuizzes = useMemo(() => {
        let result = [...quizList];

        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((q) => q.title.toLowerCase().includes(query));
        }

        // Filter by status
        if (filterType !== 'all') {
            result = result.filter((q) => q.status === filterType);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortType) {
                case 'lastModified':
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'created':
                    return new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime();
                default:
                    return 0;
            }
        });

        return result;
    }, [quizList, searchQuery, filterType, sortType]);

    // Calculate relative time for display
    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const sortLabels: Record<SortType, string> = {
        lastModified: 'Last Modified',
        title: 'Title',
        created: 'Date Created',
    };

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {/* Filters / Tabs */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm cursor-pointer transition-colors ${filterType === 'all'
                                    ? 'bg-dashboard-surface-dark border-transparent text-white shadow-sm'
                                    : 'bg-transparent border-transparent hover:bg-dashboard-surface-dark text-slate-400'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    grid_view
                                </span>
                                All Quizzes
                            </button>
                            <button
                                onClick={() => setFilterType('published')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm cursor-pointer transition-colors ${filterType === 'published'
                                    ? 'bg-dashboard-surface-dark text-white'
                                    : 'bg-transparent hover:bg-dashboard-surface-dark text-slate-400'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    check_circle
                                </span>
                                Published
                            </button>
                            <button
                                onClick={() => setFilterType('draft')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm cursor-pointer transition-colors ${filterType === 'draft'
                                    ? 'bg-dashboard-surface-dark text-white'
                                    : 'bg-transparent hover:bg-dashboard-surface-dark text-slate-400'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    edit_note
                                </span>
                                Drafts
                            </button>
                        </div>
                        <div className="relative flex items-center gap-2 text-sm text-slate-400">
                            <span>Sort by:</span>
                            <button
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                                className="flex items-center gap-1 font-medium text-white hover:text-dashboard-primary transition-colors cursor-pointer"
                            >
                                {sortLabels[sortType]}{" "}
                                <span className="material-symbols-outlined text-[16px]">
                                    keyboard_arrow_down
                                </span>
                            </button>

                            {showSortDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowSortDropdown(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-40 bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg shadow-xl z-20 overflow-hidden">
                                        {(Object.keys(sortLabels) as SortType[]).map((key) => (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    setSortType(key);
                                                    setShowSortDropdown(false);
                                                }}
                                                className={`w-full px-3 py-2 text-left text-sm transition-colors cursor-pointer ${sortType === key
                                                    ? 'bg-dashboard-primary/20 text-dashboard-primary'
                                                    : 'text-slate-300 hover:bg-dashboard-background-dark'
                                                    }`}
                                            >
                                                {sortLabels[key]}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                        {/* Create New Quiz Card */}
                        <QuizCard type="create" onClick={() => setShowCreateModal(true)} />

                        {/* Loading State */}
                        {isLoading && (
                            <div className="col-span-full py-12">
                                <DashboardLoading message="Loading quizzes..." />
                            </div>
                        )}

                        {/* Quiz Cards from Data */}
                        {!isLoading && filteredQuizzes.map((quiz) => (
                            <Link
                                key={quiz.quizId}
                                href={`/dashboard/${quiz.quizId}`}
                                className="contents"
                            >
                                <QuizCard
                                    type={quiz.status}
                                    title={quiz.title}
                                    id={quiz.quizId}
                                    steps={quiz.stepsCount}
                                    time={getRelativeTime(quiz.updatedAt)}
                                    imageUrl={quiz.thumbnailUrl}
                                />
                            </Link>
                        ))}

                        {/* Empty State */}
                        {!isLoading && filteredQuizzes.length === 0 && quizList.length > 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                <span className="material-symbols-outlined text-5xl text-slate-600 mb-4">
                                    search_off
                                </span>
                                <h3 className="text-lg font-semibold text-slate-300 mb-2">
                                    No quizzes found
                                </h3>
                                <p className="text-slate-500 text-sm mb-4">
                                    Try adjusting your search or filters
                                </p>
                            </div>
                        )}

                        {!isLoading && quizList.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">
                                    quiz
                                </span>
                                <h3 className="text-lg font-semibold text-slate-300 mb-2">
                                    No quizzes yet
                                </h3>
                                <p className="text-slate-500 text-sm mb-4">
                                    Create your first quiz to get started
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Create Quiz Modal */}
            <CreateQuizModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </div>
    );
}
