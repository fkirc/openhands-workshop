"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { App } from "@/data/apps";
import { Cop, JailCell, OldMan } from "./characters";
import { startChiptune, stopChiptune } from "./chiptune";

type Phase = "enter" | "mask" | "spray" | "police" | "jail" | "clean";

const TIMELINE: { phase: Phase; at: number }[] = [
  { phase: "enter", at: 0 },
  { phase: "mask", at: 2800 },
  { phase: "spray", at: 4200 },
  { phase: "police", at: 9400 },
  { phase: "jail", at: 12400 },
  { phase: "clean", at: 15400 },
];

const END_AT = 20000;

const SPEECH: Record<Phase, string | null> = {
  enter: "I may be old but I still got you hacked hahaha",
  mask: "Time to get to work...",
  spray: "I'm deleting your apps! One by one! Hahaha!",
  police: "Stop right there, you scoundrel!",
  jail: "Aww, busted...",
  clean: "Alright, alright, let me clean this up.",
};

/** A single app tile that can be blackened by spray and later wiped clean. */
function Tile({ app, black }: { app: App; black: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/70 p-3">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.icon} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{app.name}</p>
          <p className="truncate text-xs text-zinc-400">{app.domain}</p>
        </div>
      </div>
      <div
        className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-500 ${
          black ? "opacity-100" : "opacity-0"
        }`}
      />
      {black && (
        <span className="pointer-events-none absolute right-2 top-2 text-lg" aria-hidden="true">
          💥
        </span>
      )}
    </div>
  );
}

export function GrandpaPrank({ apps, onDone }: { apps: App[]; onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("enter");
  const [sprayed, setSprayed] = useState(0);
  const [cleaned, setCleaned] = useState(0);
  const [muted, setMuted] = useState(false);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  // Master timeline.
  useEffect(() => {
    const timers = TIMELINE.map(({ phase, at }) =>
      window.setTimeout(() => setPhase(phase), at),
    );
    const end = window.setTimeout(() => doneRef.current(), END_AT);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(end);
    };
  }, []);

  // Spray the apps one by one.
  useEffect(() => {
    if (phase !== "spray") return;
    const iv = window.setInterval(
      () => setSprayed((s) => Math.min(s + 1, apps.length)),
      950,
    );
    return () => clearInterval(iv);
  }, [phase, apps.length]);

  // Wipe the apps clean again, one by one.
  useEffect(() => {
    if (phase !== "clean") return;
    const iv = window.setInterval(
      () => setCleaned((c) => Math.min(c + 1, apps.length)),
      850,
    );
    return () => clearInterval(iv);
  }, [phase, apps.length]);

  // Keygen chiptune starts once grandpa puts on the mask, and keeps looping
  // through the remaining phases.
  const soundActive = phase !== "enter";
  useEffect(() => {
    if (soundActive && !muted) startChiptune();
    else stopChiptune();
    return () => stopChiptune();
  }, [soundActive, muted]);

  // Esc closes the sequence; the tune always stops with the overlay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") doneRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      stopChiptune();
    };
  }, []);

  const inJail = phase === "jail";
  const grandpaRight = phase === "police";
  const copVisible = phase === "police" || phase === "jail";
  const grandpaMask = phase !== "enter";
  const grandpaProp = phase === "spray" || phase === "police" ? "spray" : phase === "clean" ? "cloth" : "none";

  const tiles = useMemo(
    () =>
      apps.map((app, i) => ({
        app,
        black: i < sprayed && i >= cleaned,
      })),
    [apps, sprayed, cleaned],
  );

  const characterBox =
    "h-[42vh] min-h-[200px] max-h-[400px] w-[24vw] min-w-[130px] max-w-[280px]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Grandpa Explains AI"
    >
      <button
        type="button"
        onClick={onDone}
        className="absolute right-4 top-4 z-20 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
      >
        Close ✕
      </button>
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-pressed={muted}
        aria-label={muted ? "Unmute soundtrack" : "Mute soundtrack"}
        className="absolute right-4 top-16 z-20 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
      >
        {muted ? "🔇 Sound off" : "🔊 Sound on"}
      </button>

      <div className="relative mx-auto w-full max-w-5xl px-4 py-10">
        <h2 className="mb-4 text-center text-2xl font-bold tracking-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.8)] sm:text-3xl">
          Grandpa Explains AI
        </h2>

        {/* Speech bubble sits above the stage so the characters stay fully visible. */}
        {SPEECH[phase] && (
          <div className="mx-auto mb-6 max-w-md rounded-2xl border-2 border-[#241a2e] bg-[#fdf6e3] px-4 py-3 text-center text-sm font-semibold text-[#241a2e] shadow-xl sm:text-base">
            {SPEECH[phase]}
          </div>
        )}

        {inJail ? (
          // Cop stands outside the cell; only grandpa is locked inside.
          <div className="mx-auto flex max-w-3xl items-end justify-center gap-6">
            <div className="h-[46vh] min-h-[260px] w-[58%]">
              <JailCell>
                <div className="absolute inset-0 flex items-end justify-center pb-2">
                  <div className={characterBox}>
                    <OldMan mask prop="none" />
                  </div>
                </div>
              </JailCell>
            </div>
            <div className={`${characterBox} mb-2 shrink-0`}>
              <Cop mode="jail" />
            </div>
          </div>
        ) : (
          // Point-and-click "scene": a framed stage with a sky-to-floor backdrop.
          <div
            className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border-4 border-[#241a2e] shadow-[0_0_0_3px_#5a4a7a,0_18px_50px_rgba(0,0,0,0.7)]"
            style={{
              background:
                "linear-gradient(180deg,#3a2a5e 0%,#6b3f7a 42%,#a5618a 62%,#4a3550 62%,#2c1f38 100%)",
            }}
          >
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
              {tiles.map(({ app, black }) => (
                <Tile key={app.id} app={app} black={black} />
              ))}
            </div>
            {/* floor line to sell the stage */}
            <div className="pointer-events-none absolute inset-x-0 top-[62%] h-1 bg-black/30" />
          </div>
        )}

        {/* Characters */}
        <div className="pointer-events-none absolute inset-0">
          {!inJail && (
            <div
              className={`${characterBox} absolute bottom-2 transition-all duration-700 ease-in-out`}
              style={{ left: grandpaRight ? "58%" : "6%" }}
            >
              <OldMan mask={grandpaMask} prop={grandpaProp} />
            </div>
          )}
          {copVisible && !inJail && (
            <div
              className={`${characterBox} absolute bottom-2 transition-all duration-700 ease-in-out`}
              style={{ left: "76%" }}
            >
              <Cop />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
