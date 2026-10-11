"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

export type MoveKind = "move" | "ladder" | "snake";

/** One roll of the dice, as the share grid needs to see it. */
export interface ShareMove {
  roll: number;
  kind: MoveKind;
  square: number;
  /** Index into the players array. */
  player: number;
}

export interface SharePlayer {
  name: string;
  color: string;
  square: number;
  rolls: number;
  ladders: number;
  snakes: number;
}

interface Props {
  players: SharePlayer[];
  moves: ShareMove[];
  won: boolean;
  winner: number | null;
  /** Squares on the board (100). */
  total: number;
}

const GLYPH: Record<MoveKind, string> = { move: "🟥", ladder: "🪜", snake: "🐍" };
/** Seat markers, in the same order as the player colours. */
export const SEAT = ["🔴", "🔵", "🟢", "🟡"];
const MAX_GLYPHS = 30;

function gridRows(moves: ShareMove[], players: SharePlayer[]) {
  return players.map((p, i) => {
    const glyphs = moves
      .filter((m) => m.player === i)
      .slice(-MAX_GLYPHS)
      .map((m) => GLYPH[m.kind])
      .join("");
    return `${SEAT[i]} ${p.name} ${glyphs || "—"}`;
  });
}

function standings(players: SharePlayer[]) {
  return [...players]
    .map((p, i) => ({ p, i }))
    .sort((a, b) => b.p.square - a.p.square)
    .map(({ p, i }, rank) => `${rank + 1}. ${SEAT[i]} ${p.name} — square ${p.square}`);
}

function buildShareText(
  players: SharePlayer[],
  moves: ShareMove[],
  won: boolean,
  winner: number | null,
  total: number,
  url: string,
) {
  if (moves.length === 0) {
    return [
      "🎲🇦🇹 Austrian Snakes & Ladders — High Roller Edition",
      `${players.length} players, one table, casino lights.`,
      "No rolls yet. Place your chips… I mean, roll the dice.",
      "",
      `Take a seat → ${url}`,
    ].join("\n");
  }

  const rows = gridRows(moves, players);
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
    `Pull up a chair → ${url}`,
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

export function GameShare({ players, moves, won, winner, total }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "failed">("idle");
  const locationKey = useLocationKey();

  const { origin, challengeFrom, challengeAt, invitedPlayers } = useMemo(() => {
    const sep = locationKey.indexOf("|");
    const o = locationKey.slice(0, sep);
    const params = new URLSearchParams(locationKey.slice(sep + 1));
    const at = params.get("challenge");
    const from = params.get("from");
    const n = params.get("players");
    const seats = n && Number.isFinite(Number(n)) ? Math.min(4, Math.max(2, Number(n))) : null;
    return {
      origin: o,
      challengeFrom: from ? from.slice(0, 24) : null,
      challengeAt: at && Number.isFinite(Number(at)) ? Number(at) : null,
      invitedPlayers: seats,
    };
  }, [locationKey]);

  const playUrl = `${origin}/snakes-and-ladders`;
  const shareText = useMemo(
    () => buildShareText(players, moves, won, winner, total, playUrl),
    [players, moves, won, winner, total, playUrl],
  );

  const leader = useMemo(
    () => players.reduce((a, b) => (b.square > a.square ? b : a), players[0]),
    [players],
  );

  const challengeText = useMemo(() => {
    const target = Math.max(leader.square, 1);
    return [
      `🎲 I dare you to beat our Austrian Snakes & Ladders table — ${leader.name} sits on square ${target}/${total}.`,
      "Casino lights, big dice, no mercy. One wrong roll and a snake drops you back.",
      "",
      `Take a seat (${players.length} players) → ${playUrl}?challenge=${target}&players=${players.length}`,
    ].join("\n");
  }, [leader, players.length, playUrl, total]);

  const flash = useCallback((s: typeof status) => {
    setStatus(s);
    window.setTimeout(() => setStatus("idle"), 2200);
  }, []);

  const onShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Austrian Snakes & Ladders — High Roller Edition",
          text: shareText,
          url: playUrl,
        });
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

  const label =
    status === "copied"
      ? "Copied! Paste it anywhere."
      : status === "shared"
        ? "Shared!"
        : status === "failed"
          ? "Copy failed — select the text below."
          : null;

  return (
    <div className="w-full max-w-md rounded-2xl border border-amber-300/20 bg-zinc-900/50 p-5 backdrop-blur-md">
      {challengeAt !== null && (
        <p className="mb-4 rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-center text-sm text-amber-200">
          🥊 {challengeFrom ? `${challengeFrom} dares you` : "You've been dared"} to reach{" "}
          <span className="font-semibold">square {challengeAt}</span>. Mind the snakes.
        </p>
      )}

      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold text-white">Share the table</h2>
        <span className="text-sm text-zinc-400">
          {players.length} players
          {invitedPlayers ? ` · invited ${invitedPlayers}` : ""}
        </span>
      </div>

      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-sm leading-relaxed text-zinc-200">
        {shareText}
      </pre>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onShare}
          className="rounded-full bg-gradient-to-b from-amber-200 to-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow transition hover:-translate-y-0.5 hover:from-amber-100 hover:to-amber-300"
        >
          📤 Share the table
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
        One glyph per roll: 🟥 a move, 🪜 a ladder up, 🐍 a snake down. The challenge link invites a
        friend to beat square {Math.max(leader.square, 1)}.
      </p>
    </div>
  );
}
