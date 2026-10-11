"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

/** Minimal prize shape the share grid needs. */
export interface SharePrize {
  emoji: string;
  short: string;
  color: string;
}

interface Props {
  /** Every spin so far, oldest first. Everyone always wins, so all of these are wins. */
  history: SharePrize[];
  wins: number;
}

const RED = "🟥";
const WHITE = "⬜";
const MAX_SQUARES = 30;

/** The spoiler-free result grid: one red-white square per spin. */
function grid(count: number) {
  const n = Math.min(count, MAX_SQUARES);
  return Array.from({ length: n }, (_, i) => (i % 2 === 0 ? RED : WHITE)).join("");
}

function buildShareText(history: SharePrize[], wins: number, url: string) {
  if (wins === 0) {
    return [
      "🎡 Wheel of Fortune",
      "The only wheel where everyone always wins.",
      "I haven't spun yet — help me break the losing streak I can't have.",
      "",
      `Play (and win) too → ${url}`,
    ].join("\n");
  }

  const medals = history.slice(-8).map((p) => p.emoji).join("");
  return [
    grid(wins),
    `🎡 Wheel of Fortune — ${wins} ${wins === 1 ? "spin" : "spins"}, ${wins} ${wins === 1 ? "win" : "wins"}, 0 losses.`,
    `Today I won: ${medals}`,
    "€0.00 spent. Every prize is free and real.",
    "",
    `Your turn — you literally can't lose → ${url}`,
  ].join("\n");
}

async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

const noopSubscribe = () => () => {};

/** Browser-only location, read without an effect and without breaking hydration. */
function useLocationKey() {
  return useSyncExternalStore(
    noopSubscribe,
    () => `${window.location.origin}|${window.location.search}`,
    () => "|",
  );
}

export function WheelShare({ history, wins }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "failed">("idle");
  const locationKey = useLocationKey();

  const { origin, challengeFrom, challengeAt } = useMemo(() => {
    const sep = locationKey.indexOf("|");
    const o = locationKey.slice(0, sep);
    const params = new URLSearchParams(locationKey.slice(sep + 1));
    const at = params.get("challenge");
    const from = params.get("from");
    return {
      origin: o,
      challengeFrom: from ? from.slice(0, 24) : null,
      challengeAt: at && Number.isFinite(Number(at)) ? Number(at) : null,
    };
  }, [locationKey]);

  const playUrl = `${origin}/wheel`;
  const shareText = useMemo(
    () => buildShareText(history, wins, playUrl),
    [history, wins, playUrl],
  );

  const challengeText = useMemo(() => {
    const beat = Math.max(wins, 1);
    return [
      `🎡 I dare you to beat my ${beat} ${beat === 1 ? "win" : "wins"} on the Wheel of Fortune.`,
      "Every spin wins, so good luck trying to lose.",
      "",
      `Accept the challenge → ${playUrl}?challenge=${beat}`,
    ].join("\n");
  }, [playUrl, wins]);

  const flash = useCallback((s: typeof status) => {
    setStatus(s);
    window.setTimeout(() => setStatus("idle"), 2200);
  }, []);

  const onShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Wheel of Fortune", text: shareText, url: playUrl });
        flash("shared");
        return;
      } catch {
        // user cancelled or share failed — fall back to copying
      }
    }
    flash((await copyText(shareText)) ? "copied" : "failed");
  }, [flash, playUrl, shareText]);

  const onChallenge = useCallback(async () => {
    flash((await copyText(challengeText)) ? "copied" : "failed");
  }, [challengeText, flash]);

  const beat = Math.max(wins, 1);
  const label =
    status === "copied"
      ? "Copied! Paste it anywhere."
      : status === "shared"
        ? "Shared!"
        : status === "failed"
          ? "Copy failed — select the text below."
          : null;

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/50 p-5 backdrop-blur-md">
      {challengeAt !== null && (
        <p className="mb-4 rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-center text-sm text-amber-200">
          🥊 {challengeFrom ? `${challengeFrom} dares you` : "You've been dared"} to beat{" "}
          <span className="font-semibold">
            {challengeAt} {challengeAt === 1 ? "win" : "wins"}
          </span>
          . Good luck losing — every spin wins.
        </p>
      )}

      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold text-white">Share your streak</h2>
        <span className="text-sm text-zinc-400">{wins} {wins === 1 ? "win" : "wins"}</span>
      </div>

      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-sm leading-relaxed text-zinc-200">
        {shareText}
      </pre>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onShare}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow transition hover:-translate-y-0.5 hover:bg-zinc-100"
        >
          📤 Share my wins
        </button>
        <button
          type="button"
          onClick={onChallenge}
          className="rounded-full border border-white/15 bg-zinc-900/60 px-5 py-2.5 text-sm font-semibold text-zinc-100 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/30"
        >
          🥊 Challenge a friend
        </button>
      </div>

      <p className="mt-2 min-h-[1.25rem] text-xs text-emerald-300" aria-live="polite">
        {label}
      </p>

      <p className="mt-1 text-xs text-zinc-500">
        Spoiler-free: friends see your squares, not your prizes. They can&apos;t lose either.
        Challenge link dares them to beat {beat}.
      </p>
    </div>
  );
}
