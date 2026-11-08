"use client";

import { Inter } from "next/font/google";
import { ErrorScreen } from "@/components/marketing/status/error-screen";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

/** Last resort when even the root layout fails. It brings its own html and body. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ErrorScreen onRetry={reset} />
      </body>
    </html>
  );
}
