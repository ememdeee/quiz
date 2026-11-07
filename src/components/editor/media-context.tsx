"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { repos } from "@/server/repos";
import type { MediaItem } from "@/server/repos/ports";

/** The owner's pictures, loaded once for the editor, so a page can show the picture its id points to. */
type Media = { items: MediaItem[]; srcOf: (id: string | null) => string | null; add: (item: MediaItem) => void };

const MediaContext = createContext<Media | null>(null);

export function MediaProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    void repos.media.list().then((result) => {
      if (!cancelled && result.ok) setItems(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const add = useCallback((item: MediaItem) => setItems((all) => [item, ...all.filter((i) => i.id !== item.id)]), []);
  const value = useMemo<Media>(() => ({ items, add, srcOf: (id) => (id ? (items.find((i) => i.id === id)?.src ?? null) : null) }), [items, add]);
  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}

export function useMedia(): Media {
  const media = useContext(MediaContext);
  if (!media) throw new Error("MediaProvider is missing");
  return media;
}
