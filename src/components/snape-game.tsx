"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Snape — a snake variant set in the Hogwarts dungeons.
 * Guide Professor Snape around the stone map and let him gobble up potions.
 */

const COLS = 22;
const ROWS = 22;
const CELL = 28;
const W = COLS * CELL;
const H = ROWS * CELL;

const BASE_SPEED = 150; // ms per step
const MIN_SPEED = 72;
const GOLDEN_CHANCE = 0.16;

type Vec = { x: number; y: number };
type Dir = Vec;
type Status = "idle" | "running" | "paused" | "over";

interface Potion extends Vec {
  golden: boolean;
}

const DIRS: Record<string, Dir> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function key(x: number, y: number): string {
  return `${x},${y}`;
}

function buildWalls(): Set<string> {
  const walls = new Set<string>();
  for (let x = 0; x < COLS; x++) {
    walls.add(key(x, 0));
    walls.add(key(x, ROWS - 1));
  }
  for (let y = 0; y < ROWS; y++) {
    walls.add(key(0, y));
    walls.add(key(COLS - 1, y));
  }
  // Stone pillars scattered through the dungeon.
  const pillars: Vec[] = [
    { x: 5, y: 5 },
    { x: 6, y: 5 },
    { x: 5, y: 6 },
    { x: 16, y: 5 },
    { x: 15, y: 5 },
    { x: 16, y: 6 },
    { x: 5, y: 16 },
    { x: 6, y: 16 },
    { x: 5, y: 15 },
    { x: 16, y: 16 },
    { x: 15, y: 16 },
    { x: 16, y: 15 },
    { x: 11, y: 8 },
    { x: 11, y: 14 },
    { x: 11, y: 4 },
    { x: 11, y: 17 },
  ];
  pillars.forEach((p) => walls.add(key(p.x, p.y)));
  return walls;
}

const WALLS = buildWalls();

const START_SNAKE: Vec[] = [
  { x: 7, y: 11 },
  { x: 6, y: 11 },
  { x: 5, y: 11 },
  { x: 4, y: 11 },
];

function freeCell(occupied: Set<string>): Vec {
  const options: Vec[] = [];
  for (let y = 1; y < ROWS - 1; y++) {
    for (let x = 1; x < COLS - 1; x++) {
      if (!WALLS.has(key(x, y)) && !occupied.has(key(x, y))) {
        options.push({ x, y });
      }
    }
  }
  if (options.length === 0) return { x: 1, y: 1 };
  return options[Math.floor(Math.random() * options.length)];
}

function spawnPotion(occupied: Set<string>): Potion {
  const cell = freeCell(occupied);
  return { ...cell, golden: Math.random() < GOLDEN_CHANCE };
}

const POTION_COLORS = ["#38e07b", "#5ac8ff", "#c07bff", "#ff7ac0", "#ffd34d"];

export function SnapeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const snakeRef = useRef<Vec[]>(START_SNAKE.map((s) => ({ ...s })));
  const dirRef = useRef<Dir>(DIRS.right);
  const queueRef = useRef<Dir[]>([]);
  const potionRef = useRef<Potion>({ x: 15, y: 11, golden: false });
  const scoreRef = useRef(0);
  const statusRef = useRef<Status>("idle");
  const accRef = useRef(0);
  const lastRef = useRef(0);
  const colorRef = useRef(POTION_COLORS[0]);
  const growRef = useRef(0);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState<Status>("idle");

  const setStatusBoth = useCallback((next: Status) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const reset = useCallback(() => {
    snakeRef.current = START_SNAKE.map((s) => ({ ...s }));
    dirRef.current = DIRS.right;
    queueRef.current = [];
    scoreRef.current = 0;
    growRef.current = 0;
    accRef.current = 0;
    colorRef.current = POTION_COLORS[0];
    potionRef.current = spawnPotion(new Set(snakeRef.current.map((s) => key(s.x, s.y))));
    setScore(0);
  }, []);

  const start = useCallback(() => {
    if (statusRef.current === "over") reset();
    setStatusBoth("running");
  }, [reset, setStatusBoth]);

  const togglePause = useCallback(() => {
    if (statusRef.current === "running") setStatusBoth("paused");
    else if (statusRef.current === "paused") setStatusBoth("running");
    else if (statusRef.current === "idle") start();
    else if (statusRef.current === "over") start();
  }, [start, setStatusBoth]);

  const turn = useCallback((dir: Dir) => {
    const current = queueRef.current.length
      ? queueRef.current[queueRef.current.length - 1]
      : dirRef.current;
    // Ignore reversals and duplicate directions.
    if (current.x + dir.x === 0 && current.y + dir.y === 0) return;
    if (current.x === dir.x && current.y === dir.y) return;
    if (queueRef.current.length < 3) queueRef.current.push(dir);
  }, []);

  // Load best score once on mount. Reading localStorage after mount (rather
  // than during render) keeps server and client markup identical.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("snape-best");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from an external store
      if (stored) setBest(Number(stored) || 0);
    } catch {
      /* storage unavailable */
    }
  }, []);

  // Keyboard controls.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "ArrowUp" || k === "w" || k === "W") {
        turn(DIRS.up);
        e.preventDefault();
      } else if (k === "ArrowDown" || k === "s" || k === "S") {
        turn(DIRS.down);
        e.preventDefault();
      } else if (k === "ArrowLeft" || k === "a" || k === "A") {
        turn(DIRS.left);
        e.preventDefault();
      } else if (k === "ArrowRight" || k === "d" || k === "D") {
        turn(DIRS.right);
        e.preventDefault();
      } else if (k === " ") {
        togglePause();
        e.preventDefault();
      } else if (k === "r" || k === "R") {
        reset();
        start();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [turn, togglePause, reset, start]);

  // Main game loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    const step = () => {
      // Consume one queued direction per step.
      if (queueRef.current.length) {
        dirRef.current = queueRef.current.shift() as Dir;
      }
      const snake = snakeRef.current;
      const dir = dirRef.current;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      const hitsWall = WALLS.has(key(head.x, head.y));
      const hitsSelf = snake.some((s, i) => i < snake.length - 1 && s.x === head.x && s.y === head.y);
      if (hitsWall || hitsSelf) {
        setStatusBoth("over");
        setBest((b) => {
          const next = Math.max(b, scoreRef.current);
          try {
            window.localStorage.setItem("snape-best", String(next));
          } catch {
            /* ignore */
          }
          return next;
        });
        return;
      }

      snake.unshift(head);

      const potion = potionRef.current;
      if (head.x === potion.x && head.y === potion.y) {
        scoreRef.current += potion.golden ? 3 : 1;
        growRef.current += potion.golden ? 2 : 1;
        colorRef.current = POTION_COLORS[Math.floor(Math.random() * POTION_COLORS.length)];
        setScore(scoreRef.current);
        potionRef.current = spawnPotion(new Set(snake.map((s) => key(s.x, s.y))));
      }

      if (growRef.current > 0) {
        growRef.current -= 1;
      } else {
        snake.pop();
      }
    };

    const drawBoard = () => {
      // Floor tiles.
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const even = (x + y) % 2 === 0;
          ctx.fillStyle = even ? "#242a3d" : "#1d2231";
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        }
      }
      // Walls.
      WALLS.forEach((cell) => {
        const [x, y] = cell.split(",").map(Number);
        const px = x * CELL;
        const py = y * CELL;
        ctx.fillStyle = "#4b4f60";
        ctx.fillRect(px, py, CELL, CELL);
        ctx.fillStyle = "#5c6175";
        ctx.fillRect(px, py, CELL, 4);
        ctx.fillStyle = "#3a3d4a";
        ctx.fillRect(px, py + CELL - 4, CELL, 4);
        ctx.strokeStyle = "rgba(0,0,0,0.45)";
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 1, py + 1, CELL - 2, CELL - 2);
      });
    };

    const drawPotion = (p: Potion, t: number) => {
      const cx = p.x * CELL + CELL / 2;
      const cy = p.y * CELL + CELL / 2;
      const pulse = 0.85 + Math.sin(t / 220) * 0.15;
      const color = p.golden ? "#ffd34d" : colorRef.current;

      const glow = ctx.createRadialGradient(cx, cy, 1, cx, cy, CELL * pulse);
      glow.addColorStop(0, `${color}cc`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, CELL * pulse, 0, Math.PI * 2);
      ctx.fill();

      const bw = CELL * 0.5;
      const bh = CELL * 0.44;
      // Flask body.
      ctx.fillStyle = "rgba(225,240,255,0.35)";
      ctx.strokeStyle = "#dbe9ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 3, bw / 2, bh / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Liquid.
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, bw / 2 - 3, bh / 2 - 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Neck + cork.
      ctx.fillStyle = "#dbe9ff";
      ctx.fillRect(cx - 3, cy - 11, 6, 6);
      ctx.fillStyle = "#a3703f";
      ctx.fillRect(cx - 4, cy - 15, 8, 4);
      // Shine.
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.arc(cx - 3, cy + 1, 1.6, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawSnapeHead = (cx: number, cy: number, dir: Dir) => {
      const angle = Math.atan2(dir.y, dir.x);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const r = CELL * 0.42;
      // Black robes / hair mass behind the head.
      ctx.fillStyle = "#14161f";
      ctx.beginPath();
      ctx.arc(0, 0, r + 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Long dark hair sweeping backwards.
      ctx.fillStyle = "#0d0f16";
      ctx.beginPath();
      ctx.ellipse(-r * 0.55, 0, r * 0.95, r * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Pale face.
      ctx.fillStyle = "#e9cdb0";
      ctx.beginPath();
      ctx.ellipse(r * 0.15, 0, r * 0.72, r * 0.66, 0, 0, Math.PI * 2);
      ctx.fill();
      // Hooked nose pointing forward.
      ctx.fillStyle = "#dcbf9f";
      ctx.beginPath();
      ctx.moveTo(r * 0.7, -r * 0.14);
      ctx.lineTo(r * 1.25, 0);
      ctx.lineTo(r * 0.7, r * 0.16);
      ctx.closePath();
      ctx.fill();
      // Eyes.
      ctx.fillStyle = "#12141c";
      ctx.beginPath();
      ctx.arc(r * 0.5, -r * 0.3, r * 0.13, 0, Math.PI * 2);
      ctx.arc(r * 0.5, r * 0.3, r * 0.13, 0, Math.PI * 2);
      ctx.fill();
      // Stern brows.
      ctx.strokeStyle = "#2a2d38";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(r * 0.32, -r * 0.5);
      ctx.lineTo(r * 0.66, -r * 0.36);
      ctx.moveTo(r * 0.32, r * 0.5);
      ctx.lineTo(r * 0.66, r * 0.36);
      ctx.stroke();
      ctx.restore();
    };

    const drawSnake = (t: number) => {
      const snake = snakeRef.current;
      for (let i = snake.length - 1; i >= 1; i--) {
        const s = snake[i];
        const px = s.x * CELL;
        const py = s.y * CELL;
        const shade = i % 2 === 0 ? "#1a1d27" : "#20242f";
        ctx.fillStyle = shade;
        roundRect(ctx, px + 2, py + 2, CELL - 4, CELL - 4, 7);
        ctx.fill();
        ctx.strokeStyle = "rgba(90,98,120,0.7)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Faint highlight to suggest robe folds.
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        roundRect(ctx, px + 5, py + 5, CELL - 12, 4, 3);
        ctx.fill();
      }
      const head = snake[0];
      const bob = statusRef.current === "running" ? Math.sin(t / 180) * 1.2 : 0;
      drawSnapeHead(head.x * CELL + CELL / 2, head.y * CELL + CELL / 2 + bob, dirRef.current);
    };

    const render = (t: number) => {
      drawBoard();
      drawPotion(potionRef.current, t);
      drawSnake(t);
      if (statusRef.current === "over") {
        ctx.fillStyle = "rgba(6,4,12,0.66)";
        ctx.fillRect(0, 0, W, H);
      }
    };

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const last = lastRef.current || t;
      const dt = t - last;
      lastRef.current = t;

      if (statusRef.current === "running") {
        accRef.current += dt;
        const speed = Math.max(MIN_SPEED, BASE_SPEED - Math.floor(scoreRef.current / 3) * 8);
        while (accRef.current >= speed) {
          accRef.current -= speed;
          step();
          if (statusRef.current !== "running") {
            accRef.current = 0;
            break;
          }
        }
      }
      render(t);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lastRef.current = 0;
    };
  }, [setStatusBoth]);

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200">
            Potions&nbsp;
            <span className="font-mono text-base text-white">{score}</span>
          </span>
          <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
            Best&nbsp;<span className="font-mono text-base text-white">{best}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePause}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
          >
            {status === "running" ? "Pause" : status === "paused" ? "Resume" : "Start"}
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              start();
            }}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Restart
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        className="relative mx-auto aspect-square w-full max-w-[616px] overflow-hidden rounded-2xl border border-amber-500/20 shadow-[0_0_60px_rgba(0,0,0,0.6)]"
      >
        <canvas ref={canvasRef} width={W} height={H} className="block h-full w-full" />

        {status !== "running" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 px-6 text-center backdrop-blur-sm">
            {status === "over" ? (
              <>
                <h2 className="text-3xl font-semibold text-amber-300">Detention!</h2>
                <p className="text-zinc-300">
                  Snape slithered into a wall. You gathered {score} potion{score === 1 ? "" : "s"}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    start();
                  }}
                  className="mt-1 rounded-xl bg-amber-400 px-6 py-2.5 font-semibold text-black transition hover:bg-amber-300"
                >
                  Try again
                </button>
              </>
            ) : status === "paused" ? (
              <>
                <h2 className="text-3xl font-semibold text-amber-300">Paused</h2>
                <p className="text-zinc-300">Press Space to resume.</p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-semibold text-amber-300">Snape</h2>
                <p className="max-w-sm text-zinc-300">
                  Steer the Potions Master through the dungeons and gobble up every potion.
                  Golden potions are worth three.
                </p>
                <button
                  type="button"
                  onClick={start}
                  className="mt-1 rounded-xl bg-amber-400 px-6 py-2.5 font-semibold text-black transition hover:bg-amber-300"
                >
                  Start
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col items-center gap-4">
        <div className="grid grid-cols-3 grid-rows-2 gap-2 sm:hidden">
          <span />
          <DpadButton label="↑" onPress={() => turn(DIRS.up)} />
          <span />
          <DpadButton label="←" onPress={() => turn(DIRS.left)} />
          <DpadButton label="↓" onPress={() => turn(DIRS.down)} />
          <DpadButton label="→" onPress={() => turn(DIRS.right)} />
        </div>
        <p className="text-center text-sm text-zinc-400">
          Arrow keys / WASD to move · Space to pause · R to restart
        </p>
      </div>
    </div>
  );
}

function DpadButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="h-12 w-12 rounded-xl border border-white/15 bg-white/5 text-lg text-white transition active:bg-white/20"
    >
      {label}
    </button>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
