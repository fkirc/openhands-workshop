"use client";

import { useCallback, useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "./icons";

const THEME_EVENT = "nomomarket:themechange";

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

// The server can't know the stored/system theme; the pre-paint script in the
// layout sets the real class before hydration reconciles to it.
function getServerSnapshot() {
  return false;
}

/**
 * Toggles the `.dark` class on <html> and remembers the choice in
 * localStorage. The initial class is applied before paint by a script in the
 * layout, so this button only mirrors that state.
 */
export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Ignore storage failures (e.g. disabled cookies); the class still applies.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className="fixed right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/60 text-zinc-800 shadow-lg ring-1 ring-black/5 backdrop-blur-md transition hover:bg-white/80 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-white/15 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/20 dark:hover:text-white dark:focus-visible:outline-white sm:right-6 sm:top-6"
    >
      {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}
