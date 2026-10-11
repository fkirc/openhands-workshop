import { getApps } from "@/data/apps";
import { Marketplace } from "@/components/marketplace";
import { PsychedelicBackground } from "@/components/psychedelic-bg";
import { DanubeTemperature } from "@/components/danube-temperature";

export default function Home() {
  const apps = getApps();

  return (
    <div className="relative flex flex-1 flex-col text-white">
      <PsychedelicBackground />
      <main className="relative z-10 flex flex-1 flex-col">
        <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-300 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">Welcome to</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight [text-shadow:0_2px_18px_rgba(0,0,0,0.75)] sm:text-6xl">
            Nomo Apps Marketplace
          </h1>
        </section>

        <DanubeTemperature />

        <Marketplace apps={apps} />
      </main>
    </div>
  );
}

