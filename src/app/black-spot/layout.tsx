import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Black Spot — Pirate Word Hunt",
  description:
    "Guess the pirate word before the crew runs you through. A pirate-themed hangman on the Nomo Apps Marketplace.",
};

export default function BlackSpotLayout({ children }: { children: ReactNode }) {
  return children;
}
