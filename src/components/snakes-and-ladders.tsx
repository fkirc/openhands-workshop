"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Celebration, resumeAudio } from "./celebration";
import { GameShare, SEAT } from "./game-share";
import {
  cleanName,
  defaultName,
  freshState,
  MAX_PLAYERS,
  TOTAL,
  type GamePlayer,
} from "@/lib/game-codec";

const COLS = 10;
const CELL = 44;
const SIZE = COLS * CELL;
const PAD = 44;
const START_Y = SIZE + PAD / 2;
const GLYPH_CHAR = { move: "m", ladder: "l", snake: "s" } as const;

interface Link {
  from: number;
  to: number;
  /** Austrian name, shown in the legend and the event card. */
  name: string;
  /** One-line English gloss. */
  note: string;
}

/** Ladders go up. Every one is something Austria gives you for free. */
const LADDERS: Link[] = [
  { from: 3, to: 22, name: "Bergbahn", note: "The cable car does the climbing for you." },
  { from: 8, to: 26, name: "Sessellift", note: "Straight up, skis dangling." },
  { from: 20, to: 41, name: "Gipfelsturm", note: "Ridge line, no crowd, big view." },
  { from: 28, to: 84, name: "Gipfelkreuz", note: "The summit. Massive shortcut." },
  { from: 36, to: 44, name: "Skiwachsel", note: "Freshly waxed, suddenly fast." },
  { from: 50, to: 67, name: "Standseilbahn", note: "Funicular. Zero effort, all ascent." },
  { from: 71, to: 92, name: "Almhütten-Aufstieg", note: "Powered by Kaiserschmarrn." },
  { from: 80, to: 99, name: "Edelweiß-Fund", note: "Rare, protected, and lucky." },
];

/** Snakes go down. Every one is an Austrian own goal. */
const SNAKES: Link[] = [
  { from: 98, to: 79, name: "Aperol am Morgen", note: "Never a good idea at altitude." },
  { from: 95, to: 75, name: "Schnitzel zu schwer", note: "Too much for one descent." },
  { from: 88, to: 24, name: "Radler statt Almdudler", note: "Baffling choice. Massive drop." },
  { from: 62, to: 18, name: "Handy am Berg", note: "Signal gone, footing gone." },
  { from: 48, to: 26, name: "Touristen am Gipfel", note: "Selfie queue. Lose an hour." },
  { from: 32, to: 10, name: "Ohne Geld ins Kaffeehaus", note: "Sit, order, realise. Ouch." },
  { from: 17, to: 7, name: "Auf der Schi zu weit", note: "Overcooked the corner." },
];

/** Chip colour and seat animal, by seat index. */
const SEATS = [
  { color: "#e11d48", avatar: "🦊" },
  { color: "#2563eb", avatar: "🐻" },
  { color: "#059669", avatar: "🦅" },
  { color: "#d97706", avatar: "🐄" },
];

const HEADLINES: Record<"move" | "ladder" | "snake" | "win", string[]> = {
  ladder: ["LADDER UP!", "ALPINE LIFT!", "GIPFELSTURM!", "SERVUS, GIPFEL!"],
  snake: ["SNAKE!", "OIDA, GEFALLEN!", "BACK DOWN!", "DAS WAR NIX!"],
  move: ["ONWARDS!", "ROLLING!", "WEITER SO!"],
  win: ["JACKPOT!!!", "GIPFEL ERREICHT!!!", "GEWONNEN!!!", "TAKES THE POT!!!"],
};

/** Pip layouts, as percentages of a face. */
const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[30, 30], [70, 70]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]],
  5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
  6: [[30, 25], [70, 25], [30, 50], [70, 50], [30, 75], [70, 75]],
};

/** Which cube rotation shows each face value. */
const CUBE_ROTATION: Record<number, string> = {
  6: "rotateX(0deg) rotateY(0deg)",
  1: "rotateX(0deg) rotateY(180deg)",
  5: "rotateX(0deg) rotateY(-90deg)",
  2: "rotateX(0deg) rotateY(90deg)",
  3: "rotateX(-90deg) rotateY(0deg)",
  4: "rotateX(90deg) rotateY(0deg)",
};

/** Round to 2 decimals so server and client render byte-identical SVG. */
const f = (n: number) => Number(n.toFixed(2));

/** Centre of a square, boustrophedon: row 1 left→right, row 2 right→left, … */
function squareCenter(n: number) {
  const idx = n - 1;
  const row = Math.floor(idx / COLS);
  const colInRow = idx % COLS;
  const col = row % 2 === 0 ? colInRow : COLS - 1 - colInRow;
  return { x: col * CELL + CELL / 2, y: (COLS - 1 - row) * CELL + CELL / 2 };
}

const tokenCenter = (pos: number) =>
  pos < 1 ? { x: SIZE / 2, y: START_Y } : squareCenter(pos);

function ladderGeometry(a: number, b: number) {
  const p = squareCenter(a);
  const q = squareCenter(b);
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const w = 6;
  const rails = [1, -1].map((s) => ({
    x1: f(p.x + nx * w * s),
    y1: f(p.y + ny * w * s),
    x2: f(q.x + nx * w * s),
    y2: f(q.y + ny * w * s),
  }));
  const count = Math.max(2, Math.floor(len / 22));
  const rungs = Array.from({ length: count - 1 }, (_, i) => {
    const t = (i + 1) / count;
    const cx = p.x + dx * t;
    const cy = p.y + dy * t;
    return {
      x1: f(cx + nx * w),
      y1: f(cy + ny * w),
      x2: f(cx - nx * w),
      y2: f(cy - ny * w),
    };
  });
  return { rails, rungs };
}

function snakeGeometry(a: number, b: number) {
  const p = squareCenter(a);
  const q = squareCenter(b);
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const waves = Math.max(2, Math.round(len / 44));
  const amp = 9;
  const segs = waves * 10;
  let d = `M ${f(p.x)} ${f(p.y)}`;
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    const off = Math.sin(t * waves * Math.PI * 2) * amp * (1 - t * 0.35);
    d += ` L ${f(p.x + dx * t + nx * off)} ${f(p.y + dy * t + ny * off)}`;
  }
  return { d, head: p };
}

const SQUARES = Array.from({ length: TOTAL }, (_, i) => {
  const n = i + 1;
  const { x, y } = squareCenter(n);
  return { n, x: f(x), y: f(y), light: Math.floor((n - 1) / COLS) % 2 === 0 };
});

const LADDER_SHAPES = LADDERS.map((l) => ({ ...l, ...ladderGeometry(l.from, l.to) }));
const SNAKE_SHAPES = SNAKES.map((s) => ({ ...s, ...snakeGeometry(s.from, s.to) }));

/** Casino bulbs around the frame, fixed positions for identical SSR markup. */
const BULBS = [
  ...Array.from({ length: 11 }, (_, i) => ({ x: 20 + i * 40, y: 14 })),
  ...Array.from({ length: 11 }, (_, i) => ({ x: 20 + i * 40, y: SIZE - 14 })),
  ...Array.from({ length: 11 }, (_, i) => ({ x: 14, y: 20 + i * 40 })),
  ...Array.from({ length: 11 }, (_, i) => ({ x: SIZE - 14, y: 20 + i * 40 })),
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

interface Event {
  kind: "move" | "ladder" | "snake" | "win";
  name: string | null;
  note: string;
  headline: string;
  square: number;
  player: number;
}

/** A pip face of the die. */
function DieFace({ value, size = 76 }: { value: number; size?: number }) {
  return (
    <div
      className="relative rounded-[14%] bg-gradient-to-br from-white to-zinc-200 shadow-[inset_0_2px_6px_rgba(255,255,255,0.9),inset_0_-4px_10px_rgba(0,0,0,0.18)] ring-1 ring-black/10"
      style={{ width: size, height: size }}
    >
      {PIPS[value].map(([px, py], i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${px}%`,
            top: `${py}%`,
            width: "18%",
            height: "18%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle at 35% 30%, #6b7280, #111827 70%)",
            boxShadow: "inset 0 -1px 2px rgba(255,255,255,0.35)",
          }}
        />
      ))}
    </div>
  );
}

/** The big roll: a real 3D cube that tumbles, then lands on the value. */
function BigDie({ value, rolling }: { value: number; rolling: boolean }) {
  const half = 44;
  const faces: { v: number; transform: string }[] = [
    { v: 6, transform: `translateZ(${half}px)` },
    { v: 1, transform: `rotateY(180deg) translateZ(${half}px)` },
    { v: 5, transform: `rotateY(90deg) translateZ(${half}px)` },
    { v: 2, transform: `rotateY(-90deg) translateZ(${half}px)` },
    { v: 3, transform: `rotateX(90deg) translateZ(${half}px)` },
    { v: 4, transform: `rotateX(-90deg) translateZ(${half}px)` },
  ];
  return (
    <div className="snl-dice-stage" style={{ width: 88, height: 88 }}>
      <div
        className="snl-cube"
        style={{
          width: 88,
          height: 88,
          transform: CUBE_ROTATION[value] ?? CUBE_ROTATION[6],
          transitionDuration: rolling ? "0.18s" : "0.65s",
        }}
      >
        {faces.map((fc) => (
          <div key={fc.v} className="snl-cube-face" style={{ transform: fc.transform }}>
            <DieFace value={fc.v} size={88} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Marquee() {
  return (
    <div className="snl-marquee w-full max-w-[520px]" aria-hidden="true">
      <div className="snl-marquee-inner">
        <span className="snl-marquee-text">★ HIGH ROLLER EDITION ★ SNAKES &amp; LADDERS ★</span>
      </div>
      <div className="snl-marquee-bulbs">
        {Array.from({ length: 26 }, (_, i) => (
          <span key={i} className="snl-marquee-bulb" style={{ animationDelay: `${(i % 5) * 0.12}s` }} />
        ))}
      </div>
    </div>
  );
}

/**
 * The game itself. `initial` is the state decoded from an invitation link (or
 * null for a fresh table); `invited` marks that someone arrived via a link.
 */
export function SnakesAndLadders({ initial = null, invited = false }: { initial?: import("@/lib/game-codec").GameState | null; invited?: boolean }) {
  const [players, setPlayers] = useState<GamePlayer[]>(
    () => initial?.players ?? freshState(2).players,
  );
  const [current, setCurrent] = useState(initial?.turn ?? 0);
  const [winner, setWinner] = useState<number | null>(initial?.winner ?? null);
  const [rolling, setRolling] = useState(false);
  const [tumbling, setTumbling] = useState(false);
  const [dice, setDice] = useState(6);
  const [event, setEvent] = useState<Event | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [muted, setMuted] = useState(false);
  const [celebrations, setCelebrations] = useState(0);

  const posRefs = useRef<number[]>(
    Array.from({ length: MAX_PLAYERS }, (_, i) => initial?.players[i]?.square ?? 0),
  );
  const currentRef = useRef(initial?.turn ?? 0);
  const winnerRef = useRef<number | null>(initial?.winner ?? null);
  const busy = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const celebrate = useCallback(() => {
    if (!reducedMotion) setCelebrations((c) => c + 1);
  }, [reducedMotion]);

  const setSquare = useCallback((pi: number, square: number) => {
    posRefs.current[pi] = square;
    setPlayers((ps) => ps.map((p, i) => (i === pi ? { ...p, square } : p)));
  }, []);

  const stepTo = useCallback(
    async (pi: number, target: number, stepMs: number) => {
      let p = posRefs.current[pi];
      while (p < target && p < TOTAL) {
        p += 1;
        setSquare(pi, p);
        if (stepMs) await sleep(stepMs);
      }
      return p;
    },
    [setSquare],
  );

  const jumpTo = useCallback(
    async (pi: number, target: number, dur: number) => {
      setSquare(pi, target);
      if (dur) await sleep(dur);
    },
    [setSquare],
  );

  const roll = useCallback(async () => {
    if (busy.current || winnerRef.current !== null) return;
    busy.current = true;
    const pi = currentRef.current;
    setRolling(true);
    setEvent(null);
    if (!reducedMotion) resumeAudio();

    const value = 1 + Math.floor(Math.random() * 6);
    if (!reducedMotion) {
      setTumbling(true);
      for (let i = 0; i < 9; i++) {
        setDice(1 + Math.floor(Math.random() * 6));
        await sleep(58);
      }
      setTumbling(false);
    }
    setDice(value);

    const stepMs = reducedMotion ? 0 : 160;
    let landed = await stepTo(pi, posRefs.current[pi] + value, stepMs);

    const ladder = LADDERS.find((l) => l.from === landed);
    const snake = SNAKES.find((s) => s.from === landed);
    let kind: "move" | "ladder" | "snake" = "move";
    let name: string | null = null;
    let note = "";

    if (ladder) {
      kind = "ladder";
      name = ladder.name;
      note = ladder.note;
      if (!reducedMotion) await sleep(280);
      await jumpTo(pi, ladder.to, reducedMotion ? 0 : 240);
      landed = ladder.to;
    } else if (snake) {
      kind = "snake";
      name = snake.name;
      note = snake.note;
      if (!reducedMotion) await sleep(280);
      await jumpTo(pi, snake.to, reducedMotion ? 0 : 240);
      landed = snake.to;
    }

    setPlayers((ps) =>
      ps.map((p, i) =>
        i === pi
          ? {
              ...p,
              square: landed,
              rolls: p.rolls + 1,
              ladders: p.ladders + (kind === "ladder" ? 1 : 0),
              snakes: p.snakes + (kind === "snake" ? 1 : 0),
              glyphs: (p.glyphs + GLYPH_CHAR[kind]).slice(-60),
            }
          : p,
      ),
    );

    const finished = landed >= TOTAL;
    setEvent({
      kind: finished ? "win" : kind,
      name,
      note: finished ? `${players[pi].name} reaches 100 and takes the pot.` : note,
      headline: pick(HEADLINES[finished ? "win" : kind]),
      square: landed,
      player: pi,
    });

    if (finished) {
      winnerRef.current = pi;
      setWinner(pi);
      celebrate();
    } else {
      if (kind !== "move") celebrate();
      currentRef.current = (pi + 1) % players.length;
      setCurrent(currentRef.current);
    }

    setRolling(false);
    busy.current = false;
  }, [celebrate, jumpTo, players, reducedMotion, stepTo]);

  const reset = useCallback((n = players.length) => {
    if (busy.current) return;
    const fresh = freshState(n).players;
    posRefs.current = Array.from({ length: MAX_PLAYERS }, () => 0);
    currentRef.current = 0;
    winnerRef.current = null;
    setPlayers(fresh);
    setCurrent(0);
    setDice(6);
    setWinner(null);
    setEvent(null);
  }, [players.length]);

  const changeCount = useCallback(
    (n: number) => {
      if (busy.current || n === players.length) return;
      reset(n);
    },
    [players.length, reset],
  );

  const rename = useCallback((i: number, raw: string) => {
    setPlayers((ps) => ps.map((p, j) => (j === i ? { ...p, name: raw } : p)));
  }, []);

  const commitName = useCallback((i: number) => {
    setPlayers((ps) =>
      ps.map((p, j) => (j === i ? { ...p, name: cleanName(p.name, defaultName(i)) } : p)),
    );
  }, []);

  const tokens = useMemo(() => {
    const groups = new Map<number, number[]>();
    players.forEach((p, i) => {
      const list = groups.get(p.square) ?? [];
      list.push(i);
      groups.set(p.square, list);
    });
    const out: { x: number; y: number }[] = [];
    groups.forEach((idxs, square) => {
      const base = tokenCenter(square);
      idxs.forEach((pi, j) => {
        const n = idxs.length;
        const ang = (j / Math.max(n, 1)) * Math.PI * 2;
        const r = n > 1 ? 9 : 0;
        out[pi] = { x: base.x + Math.cos(ang) * r, y: base.y + Math.sin(ang) * r };
      });
    });
    return out;
  }, [players]);

  const leader = players.reduce((a, b) => (b.square > a.square ? b : a), players[0]);
  const turn = SEATS[current];
  const turnName = players[current]?.name ?? "Player";
  const turnStyle = { "--turn": turn.color } as CSSProperties;
  const rolling0 = players.every((p) => p.rolls === 0);

  return (
    <div className="mt-8 flex w-full flex-col items-center gap-6">
      <Celebration fireKey={celebrations} muted={muted} enabled={!reducedMotion} />
      {celebrations > 0 && !reducedMotion && <div key={celebrations} className="snl-flash" aria-hidden="true" />}

      <Marquee />

      {invited && (
        <p className="w-full max-w-[520px] rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-center text-sm text-amber-200">
          🔗 You joined {players[0].name}&apos;s table. It&apos;s{" "}
          <span className="font-semibold">{turnName}&apos;s</span> turn —{" "}
          {winner !== null ? `${players[winner].name} already took the pot.` : "roll when ready."}
        </p>
      )}

      <div className="snl-spotlight relative w-full max-w-[520px]">
        <div className="flex items-center justify-between gap-3 px-1 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-200/80">Table</span>
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => changeCount(n)}
                aria-pressed={players.length === n}
                className={`h-7 w-7 rounded-full text-xs font-bold transition ${
                  players.length === n
                    ? "bg-gradient-to-b from-amber-200 to-amber-400 text-zinc-900 shadow"
                    : "border border-white/15 bg-zinc-900/60 text-zinc-300 hover:border-white/30"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => reset()}
              disabled={rolling || (rolling0 && winner === null)}
              className="rounded-full border border-white/15 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-300 backdrop-blur-md transition hover:border-white/30 hover:text-white disabled:opacity-40"
            >
              ↺ New game
            </button>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-pressed={muted}
              className="rounded-full border border-white/15 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-300 backdrop-blur-md transition hover:border-white/30 hover:text-white"
            >
              {muted ? "🔇 Sound off" : "🔊 Sound on"}
            </button>
          </div>
        </div>

        <div className="snl-table relative rounded-[26px] p-4">
          <svg
            viewBox={`-16 -16 ${SIZE + 32} ${SIZE + PAD + 32}`}
            role="img"
            aria-label="Austrian Snakes and Ladders casino board"
            className="w-full drop-shadow-[0_26px_60px_rgba(0,0,0,0.7)]"
          >
            <defs>
              <linearGradient id="snl-felt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f6b45" />
                <stop offset="100%" stopColor="#073b25" />
              </linearGradient>
              <linearGradient id="snl-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f7e08a" />
                <stop offset="45%" stopColor="#d9a520" />
                <stop offset="100%" stopColor="#8a6210" />
              </linearGradient>
            </defs>

            {/* Casino table felt */}
            <rect x="-16" y="-16" width={SIZE + 32} height={SIZE + PAD + 32} rx="22" fill="url(#snl-felt)" />
            <rect
              x="-16"
              y="-16"
              width={SIZE + 32}
              height={SIZE + PAD + 32}
              rx="22"
              fill="none"
              stroke="url(#snl-gold)"
              strokeWidth="7"
            />
            <rect
              x="-6"
              y="-6"
              width={SIZE + 12}
              height={SIZE + PAD + 12}
              rx="16"
              fill="none"
              stroke="#000"
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />

            {BULBS.map((b, i) => (
              <circle key={i} cx={b.x} cy={b.y} r="3.4" fill="#fff3c4">
                <animate
                  attributeName="opacity"
                  values="1;0.25;1"
                  dur="1.8s"
                  begin={`${(i % 5) * 0.16}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}

            {SQUARES.map(({ n, x, y, light }) => (
              <g key={n}>
                <rect
                  x={f(x - CELL / 2)}
                  y={f(y - CELL / 2)}
                  width={CELL}
                  height={CELL}
                  fill={light ? "#fbf7ee" : "#0e5c3a"}
                  stroke="url(#snl-gold)"
                  strokeOpacity="0.55"
                  strokeWidth="1.1"
                />
                <text
                  x={f(x - CELL / 2 + 4)}
                  y={f(y - CELL / 2 + 12)}
                  fontSize="9"
                  fontWeight="700"
                  fill={light ? "#8a1020" : "#f4d47c"}
                >
                  {n}
                </text>
              </g>
            ))}

            {LADDER_SHAPES.map((l) => (
              <g key={`L${l.from}`} strokeLinecap="round">
                {l.rails.map((r, i) => (
                  <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#8a6210" strokeWidth="5" />
                ))}
                {l.rails.map((r, i) => (
                  <line key={`g${i}`} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="url(#snl-gold)" strokeWidth="3.4" />
                ))}
                {l.rungs.map((r, i) => (
                  <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#f7e08a" strokeWidth="2.6" />
                ))}
              </g>
            ))}

            {SNAKE_SHAPES.map((s) => (
              <g key={`S${s.from}`}>
                <path d={s.d} fill="none" stroke="#3d0a12" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                <path d={s.d} fill="none" stroke="#e11d48" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <path d={s.d} fill="none" stroke="#f7e08a" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 9" />
                <circle cx={f(s.head.x)} cy={f(s.head.y)} r="7" fill="#3d0a12" />
                <circle cx={f(s.head.x)} cy={f(s.head.y)} r="5" fill="#e11d48" />
                <circle cx={f(s.head.x - 2)} cy={f(s.head.y - 1.6)} r="1.5" fill="#fff3c4" />
                <circle cx={f(s.head.x + 2)} cy={f(s.head.y - 1.6)} r="1.5" fill="#fff3c4" />
              </g>
            ))}

            <rect x="0" y={SIZE + 4} width={SIZE} height={PAD - 8} rx="6" fill="#03170f" stroke="url(#snl-gold)" strokeWidth="1.5" />
            <text x={SIZE / 2} y={START_Y} fontSize="14" fill="#f7e08a" textAnchor="middle" dominantBaseline="central" fontWeight="700" letterSpacing="2">
              START · PLACE YOUR BETS
            </text>

            {players.map((p, i) => {
              const t = tokens[i];
              if (!t) return null;
              return (
                <g
                  key={i}
                  style={{
                    transform: `translate(${f(t.x)}px, ${f(t.y)}px)`,
                    transition: rolling ? "transform 160ms ease-out" : "transform 240ms cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                >
                  <circle r="13.5" fill="#000" opacity="0.35" />
                  <circle r="12.5" fill={SEATS[i].color} stroke="#f7e08a" strokeWidth="2.6" />
                  <text fontSize="13" textAnchor="middle" dominantBaseline="central">
                    {SEATS[i].avatar}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Dealer's tray: whose turn, the big dice, the button */}
      <div className="w-full max-w-[520px] rounded-3xl border border-amber-300/25 bg-gradient-to-b from-zinc-900/80 to-black/70 p-5 backdrop-blur-md">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-xl"
              style={{ background: turn.color, boxShadow: `0 0 22px ${turn.color}99` }}
            >
              {turn.avatar}
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-amber-200/80">
                {winner === null ? "Now rolling" : "Winner"}
              </p>
              <p className="text-lg font-semibold text-white">
                {winner === null ? turnName : players[winner].name}
              </p>
            </div>
          </div>

          <BigDie value={dice} rolling={tumbling} />

          <button
            type="button"
            onClick={roll}
            disabled={rolling || winner !== null}
            style={turnStyle}
            className="snl-roll-button rounded-full px-8 py-4 text-lg font-black uppercase tracking-wider text-zinc-900 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {rolling ? "Rolling…" : winner !== null ? "Table closed" : "Roll the dice"}
          </button>
        </div>
      </div>

      <div className="min-h-[6.5rem] w-full max-w-[520px]" aria-live="polite">
        {event ? (
          <div
            className="snl-pop relative overflow-hidden rounded-2xl border p-5 text-center backdrop-blur-md"
            style={{ borderColor: `${SEATS[event.player].color}66`, background: "rgba(9,9,11,0.72)" }}
          >
            <p className="relative text-sm uppercase tracking-[0.25em] text-amber-200">
              {SEAT[event.player]} {players[event.player].name} ·{" "}
              {event.kind === "win" ? "JACKPOT" : event.kind === "ladder" ? "LADDER" : event.kind === "snake" ? "SNAKE" : "ROLLED"}
            </p>
            <p className="snl-headline relative mt-1 text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
              {event.headline}
            </p>
            <p className="relative mt-2 text-2xl font-semibold text-white">
              {event.name ?? `Square ${event.square}`}
            </p>
            <p className="relative mt-2 text-sm text-zinc-300">{event.note}</p>
          </div>
        ) : (
          <p className="pt-6 text-center text-sm text-zinc-400">
            {players.length} players at the table. Climb the ladders, dodge the snakes, reach square 100.
          </p>
        )}
      </div>

      <div className="w-full max-w-[520px] rounded-2xl border border-amber-300/20 bg-zinc-900/50 p-5 backdrop-blur-md">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-white">The table</h2>
          <span className="text-sm text-zinc-400">leader: {leader.square}/100</span>
        </div>
        <ul className="mt-3 space-y-2">
          {players.map((p, i) => {
            const pct = Math.round((p.square / TOTAL) * 100);
            return (
              <li key={i} className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base ${
                    current === i && winner === null ? "snl-turn-ring" : ""
                  }`}
                  style={{ background: SEATS[i].color }}
                >
                  {SEATS[i].avatar}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <input
                      value={p.name}
                      onChange={(e) => rename(i, e.target.value)}
                      onBlur={() => commitName(i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                      }}
                      maxLength={14}
                      aria-label={`Player ${i + 1} name`}
                      className="min-w-0 flex-1 rounded-md bg-transparent font-medium text-white outline-none transition focus:bg-white/10 focus:px-1"
                    />
                    <span className="shrink-0 text-zinc-400">
                      {winner === i ? "🏆 " : ""}
                      {p.square} · {p.rolls} rolls
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${pct}%`, background: SEATS[i].color }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid w-full max-w-[520px] gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-amber-300/20 bg-zinc-900/50 p-4 backdrop-blur-md">
          <h2 className="text-sm font-semibold text-amber-300">🪜 Ladders up</h2>
          <ul className="mt-2 space-y-1 text-xs text-zinc-300">
            {LADDERS.map((l) => (
              <li key={l.name}>
                <span className="font-semibold text-white">
                  {l.from}→{l.to}
                </span>{" "}
                {l.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-300/20 bg-zinc-900/50 p-4 backdrop-blur-md">
          <h2 className="text-sm font-semibold text-rose-300">🐍 Snakes down</h2>
          <ul className="mt-2 space-y-1 text-xs text-zinc-300">
            {SNAKES.map((s) => (
              <li key={s.name}>
                <span className="font-semibold text-white">
                  {s.from}→{s.to}
                </span>{" "}
                {s.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <GameShare players={players} turn={current} won={winner !== null} winner={winner} />
    </div>
  );
}
