import type { Metadata } from "next";
import Link from "next/link";
import { PinballTable } from "@/components/pinball/pinball-table";

export const metadata: Metadata = {
  title: "Fifties Flipper",
  description: "A fifties-style pinball simulator.",
};

export default function PinballPage() {
  return (
    <div className="pinball-room flex flex-1 flex-col">
      <header className="pinball-topbar">
        <Link href="/" className="pinball-back">
          ← Nomo Apps
        </Link>
        <span className="pinball-topbar__brand">Fifties Flipper</span>
      </header>

      <main className="pinball-main">
        <PinballTable />
      </main>
    </div>
  );
}
