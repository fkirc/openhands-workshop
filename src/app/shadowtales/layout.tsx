import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Playfair_Display } from "next/font/google";
import "./shadowtales.css";

const playfair = Playfair_Display({
  variable: "--font-shadowtales-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShadowTales — Jede Geschichte verdient ein Märchen",
  description:
    "Verwandelt persönliche Kennenlerngeschichten in animierte Schattentheater-Filme.",
};

export default function ShadowTalesLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${playfair.variable} flex flex-1 flex-col font-sans`}>
      {children}
    </div>
  );
}
