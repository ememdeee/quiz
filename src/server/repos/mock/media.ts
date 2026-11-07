import { fail, ok } from "@/lib/errors";
import type { MediaItem, MediaRepo } from "../ports";
import { readFlags } from "./flags";

/** The owner's picture library in localStorage. It starts with a few plain pictures from `public/mock/`. */
const KEY = "quiz.mock.media.v1";

const seed = (): MediaItem[] => Array.from({ length: 8 }, (_, i) => ({ id: `mock-${i + 1}`, src: `/mock/picture-${i + 1}.svg`, name: `Picture ${i + 1}` }));

let memory: MediaItem[] | null = null;

function load(): MediaItem[] {
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return (memory = JSON.parse(raw) as MediaItem[]);
  } catch {
    // Unreadable storage: start from the seed
  }
  return (memory = seed());
}

function save(items: MediaItem[]) {
  memory = items;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Storage full: the picture stays until the page is closed
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockMedia: MediaRepo = {
  async list() {
    await wait(readFlags().slow ? 3000 : 150);
    return ok([...load()]);
  },
  async add({ src, name }) {
    await wait(readFlags().slow ? 3000 : 400);
    if (!src) return fail("picture_rejected");
    const item = { id: crypto.randomUUID(), src, name };
    save([item, ...load()]);
    return ok(item);
  },
};

export function resetMedia() {
  save(seed());
}
