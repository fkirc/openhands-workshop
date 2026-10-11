"use client";

import { useMemo, useState } from "react";
import type { App } from "@/data/apps";
import { AppCard } from "./app-card";
import { GrandpaPrank } from "./grandpa-prank/grandpa-prank";
import { TagFilter } from "./tag-filter";

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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("featured");
  const [active, setActive] = useState<App | null>(null);

  const visibleApps = useMemo(() => {
    const filtered = selectedTags.length
      ? apps.filter((app) => app.tags.some((tag) => selectedTags.includes(tag)))
      : apps;
    return sortApps(filtered, sort);
  }, [apps, selectedTags, sort]);

  return (
    <section id="marketplace" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <TagFilter selected={selectedTags} onChange={setSelectedTags} />
        <div
          role="group"
          aria-label="Sort apps"
          className="inline-flex flex-wrap gap-1 rounded-full border border-amber-300/20 bg-[#241a06]/70 p-1 backdrop-blur-md"
        >
          {SORT_OPTIONS.map((option) => {
            const isActive = sort === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setSort(option.key)}
                aria-pressed={isActive}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-amber-200 text-amber-950"
                    : "text-amber-100/80 hover:text-amber-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {visibleApps.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleApps.map((app) => (
            <AppCard key={app.id} app={app} onActivate={setActive} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-zinc-400">
          No apps match the selected tags.
        </p>
      )}

      {active?.sequence === "grandpa-prank" && (
        <GrandpaPrank apps={apps} onDone={() => setActive(null)} />
      )}
    </section>
  );
}
