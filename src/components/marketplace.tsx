"use client";

import { useMemo, useState } from "react";
import type { App } from "@/data/apps";
import { AppCard } from "./app-card";

interface MarketplaceProps {
  apps: App[];
}

type SortKey = "featured" | "newest" | "popularity" | "name";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Newest" },
  { key: "popularity", label: "Popular" },
  { key: "name", label: "A–Z" },
];

function sortApps(apps: App[], key: SortKey): App[] {
  const sorted = [...apps];
  switch (key) {
    case "newest":
      return sorted.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    case "popularity":
      return sorted.sort((a, b) => b.popularity - a.popularity);
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

export function Marketplace({ apps }: MarketplaceProps) {
  const [sort, setSort] = useState<SortKey>("featured");
  const visibleApps = useMemo(() => sortApps(apps, sort), [apps, sort]);

  return (
    <section id="marketplace" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
      <div className="mb-5 flex items-center justify-end">
        <div
          role="group"
          aria-label="Sort apps"
          className="inline-flex flex-wrap gap-1 rounded-full border border-white/10 bg-zinc-900/60 p-1 backdrop-blur-md"
        >
          {SORT_OPTIONS.map((option) => {
            const active = sort === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setSort(option.key)}
                aria-pressed={active}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-zinc-900"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleApps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </section>
  );
}
