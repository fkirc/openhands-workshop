import type { Metadata } from "next";
import Link from "next/link";
import { PsychedelicBackground } from "@/components/psychedelic-bg";
import { SnakesAndLadders } from "@/components/snakes-and-ladders";

export const metadata: Metadata = {
  title: "Austrian Snakes & Ladders · Nomo Apps Marketplace",
  description:
    "Climb the Austrian ladders, dodge the Austrian snakes, reach square 100.",
};

export default function SnakesAndLaddersPage() {
  return (
    <div className="relative flex flex-1 flex-col text-white">
      <PsychedelicBackground />
      <main className="relative z-10 flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 self-start text-sm text-zinc-300 transition-colors hover:text-white"
          >
            ← Back to marketplace
          </Link>

          <div className="mt-8 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-300 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
              Nomo Apps Marketplace presents
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight [text-shadow:0_2px_18px_rgba(0,0,0,0.75)] sm:text-6xl">
              Austrian Snakes &amp; Ladders
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-zinc-300 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
              A board game where the ladders are lifts and the snakes are your own
              alpine decisions. Reach square 100 — it&apos;s free, obviously.
            </p>
          </div>

          <SnakesAndLadders />
        </section>
      </main>
    </div>
  );
}
