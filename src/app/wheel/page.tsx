import type { Metadata } from "next";
import Link from "next/link";
import { PsychedelicBackground } from "@/components/psychedelic-bg";
import { WheelOfFortune } from "@/components/wheel-of-fortune";

export const metadata: Metadata = {
  title: "Glücksrad · Nomo Apps Marketplace",
  description: "Dreh am Glücksrad. Jeder gewinnt. Immer.",
};

export default function WheelPage() {
  return (
    <div className="relative flex flex-1 flex-col text-white">
      <PsychedelicBackground />
      <main className="relative z-10 flex flex-1 flex-col">
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-300 transition-colors hover:text-white"
          >
            ← Zurück zum Marktplatz
          </Link>

          <div className="mt-8 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-300 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
              Nomo Apps Marketplace präsentiert
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight [text-shadow:0_2px_18px_rgba(0,0,0,0.75)] sm:text-6xl">
              Glücksrad
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-zinc-300 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
              Des einzige Rad, bei dem&apos;d immer gwinnst. Jeder Preis is
              gratis und sofort einlösbar.
            </p>
          </div>

          <WheelOfFortune />
        </section>
      </main>
    </div>
  );
}
