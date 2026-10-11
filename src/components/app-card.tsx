"use client";

import Image from "next/image";
import type { App } from "@/data/apps";
import { ArrowUpRightIcon } from "./icons";

interface AppCardProps {
  app: App;
  /** Called when the app defines an in-page `sequence` instead of a plain link. */
  onActivate?: (app: App) => void;
}

export function AppCard({ app, onActivate }: AppCardProps) {
  const interactive = Boolean(app.sequence && onActivate);

  const inner = (
    <>
      <div className="relative h-40 overflow-hidden bg-zinc-800 sm:h-44">
        <Image
          src={app.card}
          alt={`${app.name} cover`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10">
            <Image
              src={app.icon}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 object-cover"
            />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-white">{app.name}</h3>
            {interactive ? (
              <span className="block truncate text-sm text-zinc-400">{app.domain}</span>
            ) : (
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-sm text-zinc-400 transition-colors hover:text-zinc-200"
              >
                {app.domain}
              </a>
            )}
          </div>
        </div>

        <p className="text-sm leading-6 text-zinc-400">{app.slogan}</p>

        {interactive ? (
          <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-white transition-colors group-hover:text-zinc-300">
            Watch the prank
            <ArrowUpRightIcon className="h-4 w-4" />
          </span>
        ) : (
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-white transition-colors hover:text-zinc-300"
          >
            Open app
            <ArrowUpRightIcon className="h-4 w-4" />
          </a>
        )}
      </div>
    </>
  );

  const shell =
    "group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 text-left shadow-sm ring-1 ring-white/5 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/40";

  if (interactive) {
    return (
      <button
        type="button"
        onClick={() => onActivate?.(app)}
        aria-label={`Play ${app.name}`}
        className={shell}
      >
        {inner}
      </button>
    );
  }

  return <article className={shell}>{inner}</article>;
}
