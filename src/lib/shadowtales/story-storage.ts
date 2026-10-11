import { createDemoStory, createInteractiveStory } from "./demo-story";
import type { Story } from "./types";

const STORAGE_KEY = "shadowtales.stories.v1";
const SEEDED_KEY = "shadowtales.seeded.v1";
const EMPTY: Story[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();

/** Notify subscribed components that the stored stories changed. */
function emit(): void {
  listeners.forEach((listener) => listener());
}

/** Subscribe to library changes (for useSyncExternalStore). */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readAll(): Story[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Story[]) : [];
  } catch {
    return [];
  }
}

function writeAll(stories: Story[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  emit();
}

/**
 * On first run, seed the library with the demo and the interactive example so
 * there is always something to play.
 */
export function ensureSeeded(): void {
  if (!canUseStorage()) return;
  if (window.localStorage.getItem(SEEDED_KEY)) return;
  const existing = readAll();
  if (existing.length === 0) {
    writeAll([createDemoStory(), createInteractiveStory()]);
  }
  window.localStorage.setItem(SEEDED_KEY, "1");
}

export function listStories(): Story[] {
  return readAll().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

/**
 * A stable snapshot for useSyncExternalStore. Returns the cached reference when
 * the serialised content is unchanged, so React does not re-render endlessly.
 */
export function getSnapshot(): Story[] {
  if (!canUseStorage()) return EMPTY;
  const raw = window.localStorage.getItem(STORAGE_KEY) ?? "";
  if (raw === lastRaw) return lastSnapshot;
  lastRaw = raw;
  lastSnapshot = readAll().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return lastSnapshot;
}

let lastRaw: string | null = null;
let lastSnapshot: Story[] = EMPTY;

/** Server snapshot: the library is client-only, so render an empty list. */
export function getServerSnapshot(): Story[] {
  return EMPTY;
}

export function getStory(id: string): Story | undefined {
  return readAll().find((s) => s.id === id);
}

export function saveStory(story: Story): Story {
  const all = readAll();
  const next = { ...story, updatedAt: new Date().toISOString() };
  const index = all.findIndex((s) => s.id === story.id);
  if (index >= 0) all[index] = next;
  else all.unshift(next);
  writeAll(all);
  return next;
}

export function deleteStory(id: string): void {
  writeAll(readAll().filter((s) => s.id !== id));
}

export function exportStoryJson(story: Story): string {
  return JSON.stringify(story, null, 2);
}

export function importStoryJson(json: string): Story {
  const parsed = JSON.parse(json);
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.scenes)) {
    throw new Error("Ungültige Story-Datei.");
  }
  const story = parsed as Story;
  return {
    ...story,
    id: story.id || `imported-${Date.now().toString(36)}`,
    characters: story.characters ?? [],
    scenes: story.scenes ?? [],
  };
}

/** Trigger a browser download of the story as a .json file. */
export function downloadStoryJson(story: Story): void {
  const blob = new Blob([exportStoryJson(story)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${story.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "shadowtales"}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
