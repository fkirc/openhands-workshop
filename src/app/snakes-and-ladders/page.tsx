import type { Metadata } from "next";
import Link from "next/link";
import { PsychedelicBackground } from "@/components/psychedelic-bg";
import { InviteGate } from "@/components/invite-gate";

export const metadata: Metadata = {
  title: "Austrian Snakes & Ladders · High Roller Casino",
  description:
    "A casino-lit Austrian board game for 2–4 players. Invite a friend with a link, roll the big dice, climb the ladders, dodge the snakes.",
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
              Nomo Apps Marketplace · High Roller Edition
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight [text-shadow:0_2px_18px_rgba(0,0,0,0.75)] sm:text-6xl">
              Austrian Snakes &amp; Ladders
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-zinc-300 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
              Two to four players, one felt table, casino lights and a very big
              die. Invite a friend with a link and take turns on the same game —
              the ladders are lifts, the snakes are your own alpine decisions.
            </p>
          </div>

          <InviteGate />
        </section>
      </main>
    </div>
  );
}
