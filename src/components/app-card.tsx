"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { App } from "@/data/apps";
import { ArrowUpRightIcon } from "./icons";
import { TagChip } from "./tag-chip";

interface AppCardProps {
  app: App;
  /** Called when the app defines an in-page `sequence` instead of a plain link. */
  onActivate?: (app: App) => void;
}

/** Internal routes use client-side navigation; external apps open in a new tab. */
function AppLink({
  app,
  className,
  children,
}: {
  app: App;
  className?: string;
  children: ReactNode;
}) {
  if (app.internal) {
    return (
      <Link href={app.url} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

export function AppCard({ app, onActivate }: AppCardProps) {
  const interactive = Boolean(app.sequence && onActivate);

  const inner = (
    <>
      <div className="relative h-40 overflow-hidden bg-[#2a1d05] sm:h-44">
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
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-amber-200/10">
            <Image
              src={app.icon}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 object-cover"
            />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-amber-100">{app.name}</h3>
            {interactive ? (
              <span className="block truncate text-sm text-amber-200/70">{app.domain}</span>
            ) : (
              <AppLink
                app={app}
                className="block truncate text-sm text-amber-200/70 transition-colors hover:text-amber-100"
              >
                {app.domain}
              </AppLink>
            )}
          </div>
        </div>

        <p className="text-sm leading-6 text-amber-100/70">{app.slogan}</p>

        {app.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {app.tags.map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
          </div>
        )}

        {interactive ? (
          <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-amber-200 transition-colors group-hover:text-amber-100">
            Learn AI
            <ArrowUpRightIcon className="h-4 w-4" />
          </span>
        ) : (
          <AppLink
            app={app}
            className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-amber-200 transition-colors hover:text-amber-100"
          >
            Open app
            <ArrowUpRightIcon className="h-4 w-4" />
          </AppLink>
        )}
      </div>
    </>
  );

  const shell =
    "group flex flex-col overflow-hidden rounded-2xl border border-amber-300/20 bg-[#241a06]/70 text-left shadow-sm ring-1 ring-amber-200/10 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-amber-300/45 hover:shadow-2xl hover:shadow-amber-950/50";

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
