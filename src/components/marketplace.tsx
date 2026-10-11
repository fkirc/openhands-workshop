"use client";

import { useState } from "react";
import type { App } from "@/data/apps";
import { AppCard } from "./app-card";
import { GrandpaPrank } from "./grandpa-prank/grandpa-prank";

interface MarketplaceProps {
  apps: App[];
}

export function Marketplace({ apps }: MarketplaceProps) {
  const [active, setActive] = useState<App | null>(null);

  return (
    <section id="marketplace" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <AppCard key={app.id} app={app} onActivate={setActive} />
        ))}
      </div>

      {active?.sequence === "grandpa-prank" && (
        <GrandpaPrank apps={apps} onDone={() => setActive(null)} />
      )}
    </section>
  );
}
