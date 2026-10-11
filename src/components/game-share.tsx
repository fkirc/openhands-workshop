"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

export type MoveKind = "move" | "ladder" | "snake";

/** One roll of the dice, as the share grid needs to see it. */
export interface ShareMove {
  roll: number;
  kind: MoveKind;
  square: number;
}

interface Props {
  moves: ShareMove[];
  /** Furthest square reached this run. */
  best: number;
  won: boolean;
  /** Squares on the board (100). */
  total: number;
}

const GLYPH: Record<MoveKind, string> = { move: "🟥", ladder: "🪜", snake: "🐍" };
const MAX_GLYPHS = 40;
const FINISH = "🏆";

function buildGrid(moves: ShareMove[]) {
  const shown = moves.slice(-MAX_GLYPHS).map((m) => GLYPH[m.kind]);
  return shown.join("");
}

function buildShareText(moves: ShareMove[], best: number, won: boolean, total: number, url: string) {
  if (moves.length === 0) {
    return [
      "🎲🇦🇹 Austrian Snakes & Ladders",
      "The board game where you can't lose the Austrian way of life.",
      "I haven't rolled yet. Alpine luck is loading…",
      "",
      `Play free → ${url}`,
    ].join("\n");
  }

  const ladders = moves.filter((m) => m.kind === "ladder").length;
  const snakes = moves.filter((m) => m.kind === "snake").length;
  const grid = buildGrid(moves);

  if (won) {
    return [
      grid,
      `${FINISH} Austrian Snakes & Ladders — reached square ${total} in ${moves.length} rolls!`,
      `${ladders} ladder${ladders === 1 ? "" : "s"} up, ${snakes} snake${snakes === 1 ? "" : "s"} down. Free, obviously.`,
      "",
      `Can you climb it faster? → ${url}`,
    ].join("\n");
  }

  return [
    grid,
    `🎲🇦🇹 Austrian Snakes & Ladders — reached square ${best}/${total} in ${moves.length} rolls.`,
    `${ladders} ladder${ladders === 1 ? "" : "s"} up, ${snakes} snake${snakes === 1 ? "" : "s"} down. Free to play.`,
    "",
    `Beat my run → ${url}`,
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

export function GameShare({ moves, best, won, total }: Props) {
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

  const playUrl = `${origin}/snakes-and-ladders`;
  const shareText = useMemo(
    () => buildShareText(moves, best, won, total, playUrl),
    [moves, best, won, total, playUrl],
  );

  const challengeText = useMemo(() => {
    const target = Math.max(best, 1);
    return [
      `🎲 I dare you to beat my Austrian Snakes & Ladders run — square ${target}/${total}.`,
      "Watch out: one wrong roll and a snake drops you right back.",
      "",
      `Accept the challenge → ${playUrl}?challenge=${target}`,
    ].join("\n");
  }, [best, playUrl, total]);

  const flash = useCallback((s: typeof status) => {
    setStatus(s);
    window.setTimeout(() => setStatus("idle"), 2200);
  }, []);

  const onShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Austrian Snakes & Ladders", text: shareText, url: playUrl });
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

  const target = Math.max(best, 1);
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
          🥊 {challengeFrom ? `${challengeFrom} dares you` : "You've been dared"} to reach{" "}
          <span className="font-semibold">square {challengeAt}</span>. Mind the snakes.
        </p>
      )}

      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold text-white">Share your run</h2>
        <span className="text-sm text-zinc-400">
          square {best}/{total}
        </span>
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
          📤 Share my run
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
        One glyph per roll: 🟥 a move, 🪜 a ladder up, 🐍 a snake down. The challenge link dares a
        friend to beat square {target}.
      </p>
    </div>
  );
}
