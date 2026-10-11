import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { App } from "@/data/apps";
import { ArrowUpRightIcon } from "./icons";

interface AppCardProps {
  app: App;
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

export function AppCard({ app }: AppCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-sm ring-1 ring-white/5 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/40">
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
            <AppLink
              app={app}
              className="block truncate text-sm text-zinc-400 transition-colors hover:text-zinc-200"
            >
              {app.domain}
            </AppLink>
          </div>
        </div>

        <p className="text-sm leading-6 text-zinc-400">{app.slogan}</p>

        <AppLink
          app={app}
          className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-white transition-colors hover:text-zinc-300"
        >
          Open app
          <ArrowUpRightIcon className="h-4 w-4" />
        </AppLink>
      </div>
    </article>
  );
}
