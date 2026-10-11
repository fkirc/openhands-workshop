import Link from "next/link";
import { SnapeGame } from "@/components/snape-game";
import { ArrowUpRightIcon } from "@/components/icons";

export const metadata = {
  title: "Snape · Nomo Apps Marketplace",
  description: "A Harry Potter themed snake variant. Help Snape gobble up potions.",
};

export default function SnapePage() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col bg-[radial-gradient(120%_90%_at_50%_0%,#1b1030_0%,#0a0714_60%,#05030b_100%)] text-white">
      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/"
          className="mb-6 inline-flex w-fit items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
        >
          ← Nomo Apps Marketplace
        </Link>

        <header className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">Dungeons of Hogwarts</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Snape
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            A snake variant for potion lovers. Guide Professor Snape through the stone
            corridors and let him gobble up every potion in sight.
          </p>
        </header>

        <SnapeGame />

        <p className="mt-10 text-center text-xs text-zinc-500">
          A fan-made tribute. Not affiliated with the Harry Potter rights holders.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
        >
          Back to the marketplace
          <ArrowUpRightIcon className="h-4 w-4" />
        </Link>
      </main>
    </div>
  );
}
