"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Puzzle {
  word: string;
  hint: string;
}

const PUZZLES: Puzzle[] = [
  { word: "PARROT", hint: "A talkative companion on the captain's shoulder" },
  { word: "KRAKEN", hint: "A legendary many-armed beast of the deep" },
  { word: "PLUNDER", hint: "Goods taken by force" },
  { word: "CUTLASS", hint: "A short, curved blade for boarding" },
  { word: "DOUBLOON", hint: "A shiny Spanish coin of gold" },
  { word: "MUTINY", hint: "When the crew turns on its captain" },
  { word: "GALLEON", hint: "A heavy treasure ship of the Spanish Main" },
  { word: "TREASURE", hint: "Buried, and marked with an X" },
  { word: "COMPASS", hint: "It always points the way north" },
  { word: "SCURVY", hint: "The disease of too little fruit at sea" },
  { word: "LANDLUBBER", hint: "One who fears the open water" },
  { word: "SPYGLASS", hint: "A captain's long telescope" },
  { word: "MAROONED", hint: "Left alone on a deserted isle" },
  { word: "CANNON", hint: "Boom! It fires the iron balls" },
  { word: "SHIPWRECK", hint: "A vessel dashed upon the rocks" },
  { word: "BILGE", hint: "The foul water sloshing in the hold" },
  { word: "GROG", hint: "A sailor's watered-down drink" },
  { word: "KEELHAUL", hint: "A punishment beneath the hull" },
];

const MAX_LIVES = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function pickPuzzle(): Puzzle {
  return PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
}

export function BlackSpotGame() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [guessed, setGuessed] = useState<Set<string>>(() => new Set());

  const startNewGame = useCallback(() => {
    setPuzzle(pickPuzzle());
    setGuessed(new Set());
  }, []);

  // The word is chosen after mount so server and client render the same markup.
  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const wrongGuesses = useMemo(() => {
    if (!puzzle) return [];
    return [...guessed].filter((letter) => !puzzle.word.includes(letter)).sort();
  }, [guessed, puzzle]);

  const livesLeft = MAX_LIVES - wrongGuesses.length;
  const isWon = puzzle
    ? [...puzzle.word].every((letter) => guessed.has(letter))
    : false;
  const isLost = !isWon && livesLeft <= 0;
  const isOver = isWon || isLost;

  const guess = useCallback((letter: string) => {
    setGuessed((prev) => {
      if (prev.has(letter)) return prev;
      const next = new Set(prev);
      next.add(letter);
      return next;
    });
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isOver) {
        if (event.key === "Enter") startNewGame();
        return;
      }
      if (/^[a-zA-Z]$/.test(event.key)) {
        guess(event.key.toUpperCase());
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [guess, isOver, startNewGame]);

  return (
    <div className="pirate-stage relative flex min-h-screen flex-col items-center px-4 py-8 text-amber-50">
      <div className="pirate-vignette pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-6">
        <Link
          href="/"
          className="self-start text-sm text-amber-200/70 underline-offset-4 transition-colors hover:text-amber-100 hover:underline"
        >
          ← Back to the marketplace
        </Link>

        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="pirate-title text-6xl leading-none sm:text-7xl">Black Spot</h1>
          <p className="max-w-md text-sm text-amber-100/70">
            Guess the pirate word, letter by letter, before the crew runs you
            through. Six wrong letters and the Black Spot is yours.
          </p>
        </header>

        <section className="pirate-panel w-full rounded-3xl p-5 sm:p-7">
          <div className="flex flex-col items-center gap-6">
            <div className="flex w-full flex-col items-center gap-3">
              <div className="flex items-center gap-2" aria-label={`${livesLeft} of ${MAX_LIVES} lives left`}>
                {Array.from({ length: MAX_LIVES }, (_, index) => (
                  <SkullIcon
                    key={index}
                    className={`h-7 w-7 transition-opacity ${
                      index < livesLeft ? "opacity-100" : "opacity-20"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200/60">
                {puzzle ? `Riddle — ${puzzle.hint}` : "Weighing anchor…"}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2" aria-live="polite">
              {puzzle
                ? [...puzzle.word].map((letter, index) => {
                    const revealed = guessed.has(letter) || isLost;
                    return (
                      <span
                        key={`${letter}-${index}`}
                        className={`flex h-12 w-9 items-center justify-center rounded-md border-2 text-2xl font-bold sm:h-14 sm:w-11 ${
                          revealed
                            ? isLost && !guessed.has(letter)
                              ? "border-red-800/70 bg-red-950/50 text-red-300"
                              : "border-amber-500/60 bg-amber-500/10 text-amber-200"
                            : "border-amber-900/40 bg-black/30 text-transparent"
                        }`}
                      >
                        {revealed ? letter : "•"}
                      </span>
                    );
                  })
                : null}
            </div>

            <div className="min-h-6 text-center text-lg font-semibold">
              {isWon ? (
                <span className="text-emerald-300">
                  Yo-ho-ho! The treasure is yours.
                </span>
              ) : isLost ? (
                <span className="text-red-300">
                  The Black Spot! The word was {puzzle?.word}.
                </span>
              ) : (
                <span className="text-amber-200/80">
                  {livesLeft} {livesLeft === 1 ? "life" : "lives"} left
                </span>
              )}
            </div>

            <div className="grid w-full grid-cols-7 gap-1.5 sm:grid-cols-9">
              {ALPHABET.map((letter) => {
                const isGuessed = guessed.has(letter);
                const isCorrect = Boolean(puzzle?.word.includes(letter));
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => guess(letter)}
                    disabled={isGuessed || isOver}
                    className={`rounded-lg border py-2 text-sm font-bold uppercase transition ${
                      isGuessed
                        ? isCorrect
                          ? "border-amber-500/60 bg-amber-500/20 text-amber-200"
                          : "border-red-900/60 bg-red-950/50 text-red-400/70 line-through"
                        : "border-amber-800/50 bg-black/30 text-amber-100 hover:border-amber-500/70 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            <div className="flex w-full items-center justify-between gap-4">
              <p className="text-xs text-amber-200/50">
                Type on your keyboard or tap the letters.
              </p>
              <button
                type="button"
                onClick={startNewGame}
                className="rounded-full border border-amber-500/60 bg-amber-500/10 px-5 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20"
              >
                {isOver ? "Sail again" : "New word"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SkullIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <g fill="#f4d58d">
        <path d="M256 120c-74 0-134 54-134 122 0 46 26 78 56 96 10 6 16 14 16 26v20c0 16 12 28 28 28h68c16 0 28-12 28-28v-20c0-12 6-20 16-26 30-18 56-50 56-96 0-68-60-122-134-122z" />
      </g>
      <g fill="#07101f">
        <circle cx="212" cy="246" r="30" />
        <circle cx="300" cy="246" r="30" />
        <path d="M256 292l-16 34h32z" />
        <rect x="224" y="344" width="12" height="30" rx="3" />
        <rect x="248" y="344" width="12" height="30" rx="3" />
        <rect x="272" y="344" width="12" height="30" rx="3" />
      </g>
    </svg>
  );
}
