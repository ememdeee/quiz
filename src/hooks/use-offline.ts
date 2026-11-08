"use client";

import { useSyncExternalStore } from "react";
import { readFlags, subscribeFlags } from "@/server/repos/mock/flags";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  const stopFlags = subscribeFlags(onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
    stopFlags();
  };
}

/** True while the browser has no connection (or the /dev "pretend offline" switch is on). */
export function useOffline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !navigator.onLine || readFlags().offline,
    () => false,
  );
}
