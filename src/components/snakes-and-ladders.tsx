"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Celebration, resumeAudio } from "./celebration";
import { GameShare, type MoveKind, type ShareMove } from "./game-share";

const TOTAL = 100;
const COLS = 10;
const CELL = 44;
const SIZE = COLS * CELL;
const PAD = 44;
const START_Y = SIZE + PAD / 2;

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

const HEADLINES: Record<MoveKind | "win", string[]> = {
  ladder: ["LADDER UP!", "ALPINE LIFT!", "GIPFELSTURM!", "SERVUS, GIPFEL!"],
  snake: ["SNAKE!", "OIDA, GEFALLEN!", "BACK DOWN!", "DAS WAR NIX!"],
  move: ["ONWARDS!", "ROLLING!", "WEITER SO!"],
  win: ["GIPFEL ERREICHT!!!", "GEWONNEN!!!", "DU HAST ES GESCHAFFT!!!"],
};

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

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
  return { n, x: f(x), y: f(y) };
});

const LADDER_SHAPES = LADDERS.map((l) => ({ ...l, ...ladderGeometry(l.from, l.to) }));
const SNAKE_SHAPES = SNAKES.map((s) => ({ ...s, ...snakeGeometry(s.from, s.to) }));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

interface Event {
  kind: MoveKind | "win";
  name: string | null;
  note: string;
  headline: string;
  square: number;
}

export function SnakesAndLadders() {
  const [pos, setPos] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [dice, setDice] = useState<number | null>(null);
  const [moves, setMoves] = useState<ShareMove[]>([]);
  const [best, setBest] = useState(0);
  const [won, setWon] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [muted, setMuted] = useState(false);
  const [celebrations, setCelebrations] = useState(0);

  const posRef = useRef(0);
  const bestRef = useRef(0);
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

  const moveTo = useCallback(
    async (target: number, stepMs: number) => {
      let p = posRef.current;
      while (p < target && p < TOTAL) {
        p += 1;
        posRef.current = p;
        setPos(p);
        if (stepMs) await sleep(stepMs);
      }
      return p;
    },
    [],
  );

  const roll = useCallback(async () => {
    if (busy.current || won) return;
    busy.current = true;
    setRolling(true);
    setEvent(null);
    if (!reducedMotion) resumeAudio();

    const value = 1 + Math.floor(Math.random() * 6);
    if (!reducedMotion) {
      for (let i = 0; i < 7; i++) {
        setDice(1 + Math.floor(Math.random() * 6));
        await sleep(70);
      }
    }
    setDice(value);

    const stepMs = reducedMotion ? 0 : 185;
    const start = posRef.current;
    let landed = await moveTo(start + value, stepMs);

    const ladder = LADDERS.find((l) => l.from === landed);
    const snake = SNAKES.find((s) => s.from === landed);
    let kind: MoveKind = "move";
    let name: string | null = null;
    let note = "";

    if (ladder) {
      kind = "ladder";
      name = ladder.name;
      note = ladder.note;
      if (!reducedMotion) await sleep(320);
      posRef.current = ladder.to;
      setPos(ladder.to);
      landed = ladder.to;
    } else if (snake) {
      kind = "snake";
      name = snake.name;
      note = snake.note;
      if (!reducedMotion) await sleep(320);
      posRef.current = snake.to;
      setPos(snake.to);
      landed = snake.to;
    }

    const nextBest = Math.max(bestRef.current, landed);
    bestRef.current = nextBest;
    setBest(nextBest);
    setMoves((m) => [...m, { roll: value, kind, square: landed }]);

    const finished = landed >= TOTAL;
    setEvent({
      kind: finished ? "win" : kind,
      name,
      note: finished
        ? `Square ${TOTAL} reached in ${moves.length + 1} rolls. Austrian champion.`
        : note,
      headline: pick(HEADLINES[finished ? "win" : kind]),
      square: landed,
    });

    if (finished) {
      setWon(true);
      celebrate();
    } else if (kind !== "move") {
      celebrate();
    }

    setRolling(false);
    busy.current = false;
  }, [celebrate, moveTo, moves.length, reducedMotion, won]);

  const reset = useCallback(() => {
    if (busy.current) return;
    posRef.current = 0;
    bestRef.current = 0;
    setPos(0);
    setDice(null);
    setMoves([]);
    setBest(0);
    setWon(false);
    setEvent(null);
  }, []);

  const { x: tokenX, y: tokenY } = tokenCenter(pos);

  return (
    <div className="mt-8 flex flex-col items-center gap-6">
      <Celebration fireKey={celebrations} muted={muted} enabled={!reducedMotion} />
      {celebrations > 0 && !reducedMotion && (
        <div key={celebrations} className="snl-flash" aria-hidden="true" />
      )}

      <div className="flex w-full max-w-[460px] items-center justify-between">
        <p className="text-sm text-zinc-300 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
          🎲 {moves.length} {moves.length === 1 ? "roll" : "rolls"} · square {best}/{TOTAL}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={rolling || (pos === 0 && !won)}
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

      <div className="relative w-full max-w-[460px]">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE + PAD}`}
          role="img"
          aria-label="Austrian Snakes and Ladders board"
          className="w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
        >
          <defs>
            <linearGradient id="snl-board" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbf7ee" />
              <stop offset="100%" stopColor="#efe6d3" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width={SIZE} height={SIZE} rx="8" fill="url(#snl-board)" />
          <rect x="0" y="0" width={SIZE} height={SIZE} rx="8" fill="none" stroke="#0b0616" strokeWidth="3" />

          {SQUARES.map(({ n, x, y }) => {
            const col = Math.floor((n - 1) / COLS) % 2;
            return (
              <g key={n}>
                <rect
                  x={f(x - CELL / 2)}
                  y={f(y - CELL / 2)}
                  width={CELL}
                  height={CELL}
                  fill={col === 0 ? "#f7f1e3" : "#e9dfc8"}
                  stroke="#d8cbb0"
                  strokeWidth="1"
                />
                <text x={f(x - CELL / 2 + 4)} y={f(y - CELL / 2 + 12)} fontSize="9" fill="#8a7c60" fontWeight="600">
                  {n}
                </text>
              </g>
            );
          })}

          {LADDER_SHAPES.map((l) => (
            <g key={`L${l.from}`} stroke="#b8860b" strokeLinecap="round">
              {l.rails.map((r, i) => (
                <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} strokeWidth="4" />
              ))}
              {l.rungs.map((r, i) => (
                <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} strokeWidth="2.5" stroke="#d9a520" />
              ))}
            </g>
          ))}

          {SNAKE_SHAPES.map((s) => (
            <g key={`S${s.from}`}>
              <path d={s.d} fill="none" stroke="#7a1020" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              <path d={s.d} fill="none" stroke="#c8102e" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 7" />
              <circle cx={f(s.head.x)} cy={f(s.head.y)} r="6.5" fill="#7a1020" />
              <circle cx={f(s.head.x - 2.2)} cy={f(s.head.y - 2)} r="1.5" fill="#ffe6e6" />
              <circle cx={f(s.head.x + 2.2)} cy={f(s.head.y - 2)} r="1.5" fill="#ffe6e6" />
            </g>
          ))}

          <rect x="0" y={SIZE + 4} width={SIZE} height={PAD - 8} rx="6" fill="#0b0616" opacity="0.85" />
          <text x={SIZE / 2} y={START_Y} fontSize="14" fill="#ffd400" textAnchor="middle" dominantBaseline="central" fontWeight="700">
            START · roll the dice
          </text>

          <g
            style={{
              transform: `translate(${f(tokenX)}px, ${f(tokenY)}px)`,
              transition: rolling ? "transform 185ms ease-out" : "transform 220ms ease-out",
            }}
          >
            <circle r="13" fill="#c8102e" stroke="#ffffff" strokeWidth="3" />
            <text fontSize="14" textAnchor="middle" dominantBaseline="central">
              🇦🇹
            </text>
          </g>
        </svg>
      </div>

      <div className="flex items-center gap-5">
        <span className="text-6xl leading-none" aria-hidden="true">
          {dice ? DICE_FACES[dice - 1] : "🎲"}
        </span>
        <button
          type="button"
          onClick={roll}
          disabled={rolling || won}
          className="rounded-full bg-white px-10 py-4 text-lg font-semibold text-zinc-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {rolling ? "Rolling…" : won ? "You won!" : "ROLL THE DICE"}
        </button>
      </div>

      <div className="min-h-[7rem] w-full max-w-md" aria-live="polite">
        {event ? (
          <div className="snl-pop relative overflow-hidden rounded-2xl border border-white/15 bg-zinc-900/70 p-6 text-center backdrop-blur-md">
            <p className="relative text-sm uppercase tracking-[0.25em] text-emerald-300">
              🇦🇹 {event.kind === "win" ? "FINISHED" : event.kind === "ladder" ? "LADDER" : event.kind === "snake" ? "SNAKE" : "ROLLED"} 🇦🇹
            </p>
            <p className="snl-headline relative mt-1 text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
              {event.headline}
            </p>
            <p className="relative mt-2 text-2xl font-semibold text-white">
              {event.name ?? `Square ${event.square}`}
            </p>
            <p className="relative mt-2 text-sm text-zinc-300">{event.note}</p>
            {event.kind !== "win" && (
              <p className="relative mt-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Now on square {event.square} · cost: €0.00
              </p>
            )}
          </div>
        ) : (
          <p className="pt-6 text-center text-sm text-zinc-400">
            Roll the dice. Climb the ladders, dodge the snakes, reach square 100. Free to play.
          </p>
        )}
      </div>

      <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4 backdrop-blur-md">
          <h2 className="text-sm font-semibold text-amber-300">🪜 Ladders up</h2>
          <ul className="mt-2 space-y-1 text-xs text-zinc-300">
            {LADDERS.map((l) => (
              <li key={l.name}>
                <span className="font-semibold text-white">{l.from}→{l.to}</span> {l.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4 backdrop-blur-md">
          <h2 className="text-sm font-semibold text-red-300">🐍 Snakes down</h2>
          <ul className="mt-2 space-y-1 text-xs text-zinc-300">
            {SNAKES.map((s) => (
              <li key={s.name}>
                <span className="font-semibold text-white">{s.from}→{s.to}</span> {s.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <GameShare moves={moves} best={best} won={won} total={TOTAL} />
    </div>
  );
}
