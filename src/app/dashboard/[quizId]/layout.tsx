import React from "react";

export default function QuizEditorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-dashboard-background-dark">
            {children}
        </div>
    );
}
