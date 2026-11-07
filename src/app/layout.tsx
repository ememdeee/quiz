import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { ToastProvider } from "@/contexts/ToastContext";
import SettingsHydrator from "@/components/SettingsHydrator";
import { buildMetadata } from "@/lib/metadata";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Title and description fall back to the project settings configured in
// /dashboard/settings. Individual pages can override via their own generateMetadata.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // No explicit <head> element — Next renders metadata (title, description,
  // icons) directly into <head>. <link> and <Script> placed under <body> are
  // hoisted into <head> automatically by React 19.
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <ToastProvider>
          <SettingsHydrator />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
