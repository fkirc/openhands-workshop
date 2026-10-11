"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WheelCelebration, resumeAudio } from "./wheel-celebration";
import { WheelShare } from "./wof-share";

interface Prize {
  /** Short text drawn on the wheel. */
  short: string;
  /** Full prize name shown in the result. */
  full: string;
  /** The free, real-life way to claim it. */
  claim: string;
  emoji: string;
  color: string;
}

/** Every slot is a real prize you can claim today, and every slot is free. */
const PRIZES: Prize[] = [
  { short: "Alpine Air", full: "A Mountain Peak, Freshly Aired Out", claim: "Climb the nearest hill, stand right at the top and take three deep breaths.", emoji: "🏔️", color: "#c8102e" },
  { short: "Melange", full: "A Melange with Way Too Much Foam", claim: "Find a coffee house, order one, and eat the foam with a spoon.", emoji: "☕", color: "#ffffff" },
  { short: "Alpenrose", full: "A Handful of Alpenrose, For Looking At", claim: "Walk uphill a bit and watch it glow red. Picking it is illegal, so just look.", emoji: "🌺", color: "#c8102e" },
  { short: "Sachertorte", full: "One Slice of Sachertorte, Very Slowly", claim: "Buy a slice and eat it in slow motion. With whipped cream. Non-negotiable.", emoji: "🍰", color: "#ffffff" },
  { short: "Yodel", full: "One Yodel, Loud and Proud", claim: "Stand on a hill and yodel. Nobody is watching. They never are.", emoji: "🎶", color: "#c8102e" },
  { short: "Waltz", full: "One Waltz, No Lessons Needed", claim: "Spin in a circle three times. One-two-three, one-two-three. Done.", emoji: "💃", color: "#ffffff" },
  { short: "Kaffeehaus", full: "A Whole Afternoon in a Coffee House", claim: "Sit down, order a Melange and read a newspaper you've never heard of.", emoji: "📰", color: "#c8102e" },
  { short: "Ski Run", full: "One Downhill Run, Lift Ticket Not Included", claim: "No snow? Picture the run in your head. Close enough.", emoji: "🎿", color: "#ffffff" },
  { short: "Goulash", full: "A Goulash with Extra Gravy", claim: "Cook one, or visit your trusted pub and ask for bread to mop it up.", emoji: "🍲", color: "#c8102e" },
  { short: "Fresh Air", full: "Fresh Alpine Air, Deep Breaths Included", claim: "Step outside, breathe in deep and look up.", emoji: "🌬️", color: "#ffffff" },
];

const SEG = 360 / PRIZES.length;
const R = 185;
const CX = 200;
const CY = 200;

/** Rotating, increasingly unhinged headlines. Every spin is a win, so… */
const HEADLINES = [
  "CONGRATULATIONS!!!",
  "OIDA, YOU WON AGAIN!!!",
  "AND THAT'S A WRAP!!!",
  "OI, LOOK AT THIS!!!",
  "THAT WENT WELL!!!",
  "SERVUS, LUCK!!!",
];

function polar(r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

/** Round to 2 decimals so server and client render byte-identical SVG coords. */
const round2 = (p: { x: number; y: number }) => ({
  x: Number(p.x.toFixed(2)),
  y: Number(p.y.toFixed(2)),
});

function wedgePath(a0: number, a1: number) {
  const p0 = polar(R, a0);
  const p1 = polar(R, a1);
  return `M${CX},${CY} L${p0.x.toFixed(2)},${p0.y.toFixed(2)} A${R},${R} 0 0 1 ${p1.x.toFixed(2)},${p1.y.toFixed(2)} Z`;
}

const WEDGES = PRIZES.map((prize, i) => {
  const a0 = i * SEG;
  const a1 = (i + 1) * SEG;
  const mid = a0 + SEG / 2;
  const label = round2(polar(R * 0.7, mid));
  const icon = round2(polar(R * 0.44, mid));
  return { prize, path: wedgePath(a0, a1), mid, label, icon };
});

/** Fixed confetti layout keeps server and client markup identical. */
const CONFETTI = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  delay: `${(i % 6) * 0.18}s`,
  duration: `${1.4 + (i % 5) * 0.22}s`,
  color: PRIZES[i % PRIZES.length].color,
}));

/** Rotating win lines. Every spin wins, so they escalate fast. */
const WIN_LINES = [
  "YOU WON! (Well, obviously.)",
  "YOU WON AGAIN!",
  "AND ANOTHER WIN!",
  "THIS CAN'T BE REAL!",
  "OIDA, AGAIN?!",
  "WINNING IS A SKILL!",
];

export function WheelOfFortune() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);
  const [wins, setWins] = useState(0);
  const [history, setHistory] = useState<Prize[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [muted, setMuted] = useState(false);
  const [celebrations, setCelebrations] = useState(0);
  const pending = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const finish = useCallback(() => {
    const prize = PRIZES[pending.current];
    setResult(prize);
    setWins((w) => w + 1);
    setHistory((h) => [prize, ...h].slice(0, 8));
    setSpinning(false);
    if (!reducedMotion) setCelebrations((c) => c + 1);
  }, [reducedMotion]);

  const spin = useCallback(() => {
    if (spinning) return;

    // Unlock audio inside the click gesture so the fanfare can play later.
    if (!reducedMotion) resumeAudio();

    // Land on a random wedge, nudged within its own slice so it never spills.
    const index = Math.floor(Math.random() * PRIZES.length);
    pending.current = index;
    const center = index * SEG + SEG / 2;
    const jitter = (Math.random() * 2 - 1) * (SEG / 2 - 5);
    const targetMod = (360 - (center + jitter) + 360) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    const delta = (targetMod - currentMod + 360) % 360;
    const turns = 5 + Math.floor(Math.random() * 3);

    setResult(null);
    setRotation(rotation + turns * 360 + delta);

    if (reducedMotion) {
      finish();
    } else {
      setSpinning(true);
    }
  }, [finish, reducedMotion, rotation, spinning]);

  const onTransitionEnd = useCallback(
    (event: React.TransitionEvent<SVGGElement>) => {
      if (event.propertyName === "transform" && spinning) finish();
    },
    [finish, spinning],
  );

  return (
    <div className="mt-8 flex flex-col items-center gap-6">
      <WheelCelebration
        fireKey={celebrations}
        muted={muted}
        enabled={!reducedMotion}
      />
      {celebrations > 0 && !reducedMotion && (
        <div key={celebrations} className="wof-flash" aria-hidden="true" />
      )}

      <div className="flex w-full max-w-[420px] items-center justify-end">
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-pressed={muted}
          className="rounded-full border border-white/15 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-300 backdrop-blur-md transition hover:border-white/30 hover:text-white"
        >
          {muted ? "🔇 Sound off" : "🔊 Sound on"}
        </button>
      </div>

      <div className="relative w-full max-w-[420px]">
        <svg
          viewBox="0 0 400 400"
          role="img"
          aria-label="Wheel of Fortune"
          className="w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
        >
          <defs>
            <radialGradient id="wof-hub" cx="50%" cy="38%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#e7e2ff" />
              <stop offset="100%" stopColor="#9d8ce0" />
            </radialGradient>
          </defs>

          <circle cx={CX} cy={CY} r={R + 8} fill="#0b0616" opacity="0.9" />

          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "200px 200px",
              transformBox: "view-box",
              transition: spinning
                ? "transform 4200ms cubic-bezier(0.16, 1, 0.3, 1)"
                : "none",
            }}
            onTransitionEnd={onTransitionEnd}
          >
            {WEDGES.map(({ prize, path, mid, label, icon }) => (
              <g key={prize.short}>
                <path d={path} fill={prize.color} stroke="#0b0616" strokeWidth="1.5" />
                <text
                  x={icon.x}
                  y={icon.y}
                  fontSize="26"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {prize.emoji}
                </text>
                <text
                  x={label.x}
                  y={label.y}
                  fontSize="11"
                  fontWeight="700"
                  fill="#111111"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  paintOrder="stroke"
                  strokeLinejoin="round"
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${mid - 90} ${label.x} ${label.y})`}
                >
                  {prize.short}
                </text>
              </g>
            ))}
          </g>

          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="4" />
          <circle cx={CX} cy={CY} r="26" fill="url(#wof-hub)" stroke="#0b0616" strokeWidth="3" />
          <text x={CX} y={CY} fontSize="20" textAnchor="middle" dominantBaseline="central">
            🎉
          </text>

          {/* Pointer, fixed above the wheel */}
          <path d="M200 4 L216 34 L184 34 Z" fill="#ffffff" stroke="#0b0616" strokeWidth="2" />
        </svg>
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={spinning}
        className="rounded-full bg-white px-10 py-4 text-lg font-semibold text-zinc-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {spinning ? "Spinning…" : "SPIN TO WIN"}
      </button>

      <div className="min-h-[9rem] w-full max-w-md" aria-live="polite">
        {result ? (
          <div className="wof-pop relative overflow-hidden rounded-2xl border border-white/15 bg-zinc-900/70 p-6 text-center backdrop-blur-md">
            {CONFETTI.map((c, i) => (
              <span
                key={i}
                className="wof-confetti"
                style={{
                  left: c.left,
                  backgroundColor: c.color,
                  animationDelay: c.delay,
                  animationDuration: c.duration,
                }}
              />
            ))}
            <p className="relative text-sm uppercase tracking-[0.25em] text-emerald-300">
              🇦🇹 {WIN_LINES[wins % WIN_LINES.length]} 🇦🇹
            </p>
            <p className="wof-headline relative mt-1 text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
              {HEADLINES[wins % HEADLINES.length]}
            </p>
            <p className="relative mt-2 text-2xl font-semibold text-white">{result.full}</p>
            <p className="relative mt-2 text-sm text-zinc-300">{result.claim}</p>
            <p className="relative mt-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
              Claimable right now · cost: €0.00 · no purchase necessary, ever
            </p>
          </div>
        ) : (
          <p className="pt-6 text-center text-sm text-zinc-400">
            Ten prizes. All free. All claimable today. Every slot is a winner.
          </p>
        )}
      </div>

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/50 p-5 backdrop-blur-md">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-white">Free things won today</h2>
          <span className="text-sm text-zinc-400">
            {wins} {wins === 1 ? "win" : "wins"} · 0 losses · €0.00 spent
          </span>
        </div>
        {history.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {history.map((prize, i) => (
              <li
                key={`${prize.short}-${i}`}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200"
              >
                {prize.emoji} {prize.short}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-zinc-400">
            Nothing won yet. Spin it — the whole thing is free.
          </p>
        )}
      </div>

      <WheelShare history={history} wins={wins} />
    </div>
  );
}
