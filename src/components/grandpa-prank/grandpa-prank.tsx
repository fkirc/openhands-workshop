"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { App } from "@/data/apps";
import { Cop, JailCell, OldMan } from "./characters";

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
  spray: "Hahaha! Every app goes black!",
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

  // Esc closes the sequence.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") doneRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
      aria-label="Grandpa's Revenge prank animation"
    >
      <button
        type="button"
        onClick={onDone}
        className="absolute right-4 top-4 z-20 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
      >
        Close ✕
      </button>

      <div className="relative mx-auto w-full max-w-5xl px-4 py-10">
        <h2 className="mb-6 text-center text-2xl font-bold tracking-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.8)] sm:text-3xl">
          Grandpa&apos;s Revenge
        </h2>

        {inJail ? (
          <div className="mx-auto h-[46vh] min-h-[260px] w-full max-w-3xl">
            <JailCell>
              <div className="absolute inset-0 flex items-end justify-center gap-6 pb-2">
                <div className={`${characterBox} translate-x-4`}>
                  <OldMan mask prop="none" />
                </div>
                <div className={`${characterBox} -translate-x-4`}>
                  <Cop mode="jail" />
                </div>
              </div>
            </JailCell>
          </div>
        ) : (
          <div className="relative mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
            {tiles.map(({ app, black }) => (
              <Tile key={app.id} app={app} black={black} />
            ))}
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

        {/* Speech bubble */}
        {SPEECH[phase] && !inJail && (
          <div
            className={`absolute top-16 max-w-xs rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm font-semibold text-black shadow-xl transition-all duration-500 ${
              grandpaRight ? "left-[54%]" : "left-[18%]"
            }`}
          >
            {SPEECH[phase]}
            <span className="absolute -bottom-2 left-8 h-4 w-4 rotate-45 border-b-2 border-r-2 border-black bg-white" />
          </div>
        )}
      </div>
    </div>
  );
}
