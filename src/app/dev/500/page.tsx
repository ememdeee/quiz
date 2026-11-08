"use client";

import { ErrorScreen } from "@/components/marketing/status/error-screen";

/** Dev only: shows the "something went wrong" screen without having to break something. */
export default function ServerErrorPreviewPage() {
  return <ErrorScreen onRetry={() => window.location.reload()} />;
}
