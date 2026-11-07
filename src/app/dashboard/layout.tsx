import type { Metadata } from "next";
import { AuthGuard } from "@/components/AuthGuard";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
    return buildMetadata({ title: "Dashboard" });
}

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthGuard>
            <div className="bg-dashboard-background-dark min-h-screen">
                {children}
            </div>
        </AuthGuard>
    );
}
