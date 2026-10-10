import type { App } from "@/data/apps";
import { AppCard } from "./app-card";

interface MarketplaceProps {
  apps: App[];
}

export function Marketplace({ apps }: MarketplaceProps) {
  return (
    <section id="marketplace" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </section>
  );
}
