"use client";

import { ErrorScreen } from "@/components/marketing/status/error-screen";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorScreen onRetry={reset} />;
}
