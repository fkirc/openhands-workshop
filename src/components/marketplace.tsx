"use client";

import { useState } from "react";
import type { App } from "@/data/apps";
import { AppCard } from "./app-card";
import { GrandpaPrank } from "./grandpa-prank/grandpa-prank";
import { TagFilter } from "./tag-filter";

interface MarketplaceProps {
  apps: App[];
}

export function Marketplace({ apps }: MarketplaceProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [active, setActive] = useState<App | null>(null);

  const visibleApps = selectedTags.length
    ? apps.filter((app) => app.tags.some((tag) => selectedTags.includes(tag)))
    : apps;

  return (
    <section id="marketplace" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
      <div className="mb-8">
        <TagFilter selected={selectedTags} onChange={setSelectedTags} />
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
