import Image from "next/image";
import { getApps } from "@/data/apps";
import { Clock } from "@/components/clock";
import { Marketplace } from "@/components/marketplace";
import { PsychedelicBackground } from "@/components/psychedelic-bg";
import { Rocket } from "@/components/rocket";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalkingCat } from "@/components/walking-cat";
import { SpritzweinIcon } from "@/components/icons";
import { DanubeTemperature } from "@/components/danube-temperature";

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

        <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
          <figure className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl ring-1 ring-white/5 backdrop-blur-md sm:flex-row sm:gap-8 sm:p-8">
            <div className="relative h-56 w-56 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/15 sm:h-64 sm:w-64">
              <Image
                src="/hero/haeupl-spritzwein.jpg"
                alt="Michael Häupl"
                fill
                unoptimized
                sizes="(min-width: 640px) 256px, 224px"
                className="object-cover object-top"
                priority
              />
            </div>

            <figcaption className="text-center sm:text-left">
              <p className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-zinc-400 sm:justify-start">
                <SpritzweinIcon className="h-5 w-5 text-amber-300" />
                Wiener Original
              </p>
              <blockquote className="mt-3 text-2xl font-semibold leading-snug tracking-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.6)] sm:text-3xl">
                &ldquo;Man bringe den Spritzwein!&rdquo;
              </blockquote>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Michael Häupl, Bürgermeister von Wien 1994&ndash;2018.
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Foto:{" "}
                <a
                  href="https://commons.wikimedia.org/wiki/File:B%C3%BCrgermeister-Michael-H%C3%A4upl.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-dotted underline-offset-2 transition-colors hover:text-zinc-300"
                >
                  Derschueler
                </a>{" "}
                · CC BY-SA 3.0
              </p>
            </figcaption>
          </figure>
        </section>

        <DanubeTemperature />

        <Marketplace apps={apps} />
      </main>
      <WalkingCat />
    </div>
  );
}
