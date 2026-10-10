import type { App } from "@/data/apps";
import { ArrowUpRightIcon } from "./icons";

interface AppCardProps {
  app: App;
}

export function AppCard({ app }: AppCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 shadow-sm ring-1 ring-white/5 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/40">
      <div className={`flex h-40 items-center justify-center bg-gradient-to-br ${app.cover} sm:h-44`}>
        <span className="text-6xl drop-shadow-lg" aria-hidden="true">
          {app.icon}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">
            {app.icon}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-white">{app.name}</h3>
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm text-zinc-400 transition-colors hover:text-zinc-200"
            >
              {app.domain}
            </a>
          </div>
        </div>

        <p className="text-sm leading-6 text-zinc-400">{app.slogan}</p>

        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-white transition-colors hover:text-zinc-300"
        >
          Open app
          <ArrowUpRightIcon className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}
