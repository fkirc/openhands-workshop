import { getApps } from "@/data/apps";
import { Marketplace } from "@/components/marketplace";

export default function Home() {
  const apps = getApps();

  return (
    <div className="flex flex-1 flex-col bg-zinc-950 text-white">
      <main className="flex flex-1 flex-col">
        <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Welcome to</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-6xl">
            Nomo Apps Marketplace
          </h1>
        </section>

        <Marketplace apps={apps} />
      </main>
    </div>
  );
}

