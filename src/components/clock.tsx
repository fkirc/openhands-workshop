"use client";

import { useSyncExternalStore } from "react";

/** Ticks once per second; the snapshot is the current second. */
function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

function getSnapshot() {
  return Math.floor(Date.now() / 1000);
}

/** No time on the server, so the static export stays deterministic. */
function getServerSnapshot() {
  return null;
}

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "2-digit",
  month: "short",
};

/**
 * Live digital clock. Renders a placeholder until mounted so the server and
 * client markup stay identical during hydration.
 */
export function Clock() {
  const seconds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const now = seconds === null ? null : new Date(seconds * 1000);

  const time = now?.toLocaleTimeString("en-GB", TIME_FORMAT) ?? "--:--:--";
  const date = now?.toLocaleDateString("en-GB", DATE_FORMAT) ?? "";

  return (
    <div
      aria-label="Current time"
      className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 px-4 py-3 ring-1 ring-white/5 backdrop-blur-md"
    >
      <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.7)]" />
      <time
        dateTime={now?.toISOString()}
        className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.75)] sm:text-3xl"
      >
        {time}
      </time>
      <span className="text-xs uppercase tracking-[0.2em] text-zinc-300">
        {date}
      </span>
    </div>
  );
}
