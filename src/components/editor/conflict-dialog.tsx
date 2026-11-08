"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { conflictDialog } from "@/content/dashboard/editor";

/**
 * "This quiz was changed somewhere else" (no board, gap G1). It must be answered, so it cannot be dismissed. Nothing was
 * overwritten yet: "Keep my version" saves this screen on top of the other save, "Load the newest" drops what is here.
 */
export function ConflictDialog({ onChoose }: { onChoose: (choice: "keep" | "reload") => Promise<void> }) {
  const words = conflictDialog;
  const [pending, setPending] = useState<"keep" | "reload" | null>(null);
  const choose = async (choice: "keep" | "reload") => {
    setPending(choice);
    await onChoose(choice);
    setPending(null);
  };
  return (
    <Dialog
      open
      dismissible={false}
      title={words.title}
      description={words.text}
      actions={
        <>
          <Button shape="box" size="sm" variant="secondary" loading={pending === "reload"} disabled={pending !== null} onClick={() => void choose("reload")}>
            {words.reload}
          </Button>
          <Button shape="box" size="sm" loading={pending === "keep"} disabled={pending !== null} onClick={() => void choose("keep")}>
            {words.keep}
          </Button>
        </>
      }
    />
  );
}
