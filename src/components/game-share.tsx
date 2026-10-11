"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { encodeGame, type GamePlayer, type GameState } from "@/lib/game-codec";

/** Seat markers, in the same order as the player colours. */
export const SEAT = ["🔴", "🔵", "🟢", "🟡"];
const MAX_GLYPHS = 30;

interface Props {
  players: GamePlayer[];
  turn: number;
  won: boolean;
  winner: number | null;
}

const GLYPH: Record<string, string> = { m: "🟥", l: "🪜", s: "🐍" };

const glyphRow = (p: GamePlayer) =>
  p.glyphs
    .slice(-MAX_GLYPHS)
    .split("")
    .map((c) => GLYPH[c] ?? "🟥")
    .join("");

function standings(players: GamePlayer[]) {
  return [...players]
    .map((p, i) => ({ p, i }))
    .sort((a, b) => b.p.square - a.p.square)
    .map(({ p, i }, rank) => `${rank + 1}. ${SEAT[i]} ${p.name} — square ${p.square}`);
}

function buildShareText(players: GamePlayer[], won: boolean, winner: number | null, url: string) {
  if (players.every((p) => p.rolls === 0)) {
    return [
      "🎲🇦🇹 Austrian Snakes & Ladders — High Roller Edition",
      `${players.length} players, one table, casino lights.`,
      "No rolls yet. Pull up a chair and roll the dice.",
      "",
      `Take a seat → ${url}`,
    ].join("\n");
  }

  const rows = players.map((p, i) => `${SEAT[i]} ${p.name} ${glyphRow(p) || "—"}`);
  const board = standings(players).join("\n");

  if (won && winner !== null) {
    const w = players[winner];
    return [
      rows.join("\n"),
      "",
      `🏆 ${SEAT[winner]} ${w.name} takes the pot in ${w.rolls} rolls!`,
      board,
      `${w.ladders} ladder${w.ladders === 1 ? "" : "s"} up, ${w.snakes} snake${w.snakes === 1 ? "" : "s"} down. Free, obviously.`,
      "",
      `Beat that → ${url}`,
    ].join("\n");
  }

  return [
    rows.join("\n"),
    "",
    `🎲🇦🇹 Austrian Snakes & Ladders — in progress (${players.length} players)`,
    board,
    "",
    `Jump in → ${url}`,
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

/** Browser-only origin, read without an effect and without breaking hydration. */
function useOrigin() {
  return useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => "",
  );
}

export function GameShare({ players, turn, won, winner }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "failed">("idle");
  const origin = useOrigin();

  const inviteUrl = useMemo(() => {
    const state: GameState = { players, turn, winner };
    return `${origin}/snakes-and-ladders?g=${encodeGame(state)}`;
  }, [origin, players, turn, winner]);

  const shareText = useMemo(
    () => buildShareText(players, won, winner, inviteUrl),
    [players, won, winner, inviteUrl],
  );

  const inviter = players[0]?.name ?? "The table";
  const flash = useCallback((s: typeof status) => {
    setStatus(s);
    window.setTimeout(() => setStatus("idle"), 2200);
  }, []);

  const onInvite = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Austrian Snakes & Ladders — join my table",
          text: shareText,
          url: inviteUrl,
        });
        flash("shared");
        return;
      } catch {
        // user cancelled or share failed — fall back to copying
      }
    }
    flash((await copyText(shareText)) ? "copied" : "failed");
  }, [flash, inviteUrl, shareText]);

  const onCopyLink = useCallback(async () => {
    flash((await copyText(inviteUrl)) ? "copied" : "failed");
  }, [flash, inviteUrl]);

  const label =
    status === "copied"
      ? "Invite copied! Send it to a friend."
      : status === "shared"
        ? "Shared!"
        : status === "failed"
          ? "Copy failed — select the text below."
          : null;

  return (
    <div className="w-full max-w-[520px] rounded-2xl border border-amber-300/20 bg-zinc-900/50 p-5 backdrop-blur-md">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold text-white">Invite players</h2>
        <span className="text-sm text-zinc-400">{players.length} at the table</span>
      </div>

      <p className="mt-2 text-sm text-zinc-300">
        Send this link to a friend. Opening it drops them into{" "}
        <span className="font-semibold text-amber-200">{inviter}&apos;s table</span> at exactly this
        point — same squares, same turn.
      </p>

      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-sm leading-relaxed text-zinc-200">
        {shareText}
      </pre>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onInvite}
          className="rounded-full bg-gradient-to-b from-amber-200 to-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow transition hover:-translate-y-0.5 hover:from-amber-100 hover:to-amber-300"
        >
          🔗 Invite a player
        </button>
        <button
          type="button"
          onClick={onCopyLink}
          className="rounded-full border border-white/15 bg-zinc-900/60 px-5 py-2.5 text-sm font-semibold text-zinc-100 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/30"
        >
          📋 Copy link only
        </button>
      </div>

      <p className="mt-2 min-h-[1.25rem] text-xs text-emerald-300" aria-live="polite">
        {label}
      </p>

      <p className="mt-1 text-xs text-zinc-500">
        The link carries the whole game. Whoever opens it can keep rolling and send the link back —
        one device per turn. One glyph per roll: 🟥 a move, 🪜 a ladder up, 🐍 a snake down.
      </p>
    </div>
  );
}
