import type { Metadata } from "next";
import Link from "next/link";
import { PsychedelicBackground } from "@/components/psychedelic-bg";
import { WheelOfFortune } from "@/components/wheel-of-fortune";

export const metadata: Metadata = {
  title: "Wheel of Fortune · Nomo Apps Marketplace",
  description: "Spin the wheel. Everyone always wins.",
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
            ← Back to marketplace
          </Link>

          <div className="mt-8 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-300 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
              Nomo Apps Marketplace presents
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight [text-shadow:0_2px_18px_rgba(0,0,0,0.75)] sm:text-6xl">
              Wheel of Fortune
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-zinc-300 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
              The only wheel where the odds are rigged in your favour. Every
              prize is something free you can actually go and do.
            </p>
          </div>

          <WheelOfFortune />
        </section>
      </main>
    </div>
  );
}
