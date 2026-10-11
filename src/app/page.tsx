import { getApps } from "@/data/apps";
import { Clock } from "@/components/clock";
import { Marketplace } from "@/components/marketplace";
import { PsychedelicBackground } from "@/components/psychedelic-bg";
import { Rocket } from "@/components/rocket";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalkingCat } from "@/components/walking-cat";

export default function Home() {
  const apps = getApps();

  return (
    <div className="relative flex flex-1 flex-col text-amber-50">
      <PsychedelicBackground />
      <Rocket />
      <ThemeToggle />
      <main className="relative z-10 flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-10 pt-14 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pt-20">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-200/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">Welcome to</p>
            <h1 className="mt-2 bg-gradient-to-b from-amber-100 via-yellow-200 to-amber-400 bg-clip-text text-4xl font-semibold tracking-tight text-transparent [text-shadow:0_2px_18px_rgba(0,0,0,0.35)] sm:text-6xl">
              Nomo Apps Marketplace
            </h1>
          </div>
          <Clock />
        </section>

        <Marketplace apps={apps} />
      </main>
      <WalkingCat />
    </div>
  );
}

