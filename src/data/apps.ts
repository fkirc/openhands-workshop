/**
 * Data source for the app marketplace.
 * Rendering lives in the React components; content lives here.
 */

export interface App {
  id: string;
  name: string;
  /** Public domain of the app, shown on the card and used for the link. */
  domain: string;
  url: string;
  slogan: string;
  /** Path to the square app icon. */
  icon: string;
  /** Path to the wide cover image shown on top of the card. */
  card: string;
  /** ISO date, used by the "Newest" sort. */
  publishedAt: string;
  /** Higher is more popular, used by the "Popularity" sort. */
  popularity: number;
}

export const APPS: App[] = [
  {
    id: "snape",
    name: "Snape",
    domain: "snape.nomo.zone",
    url: "/apps/snape",
    slogan: "The Potions Master slithers. Gobble up every potion!",
    icon: "/apps/snape-icon.svg",
    card: "/apps/snape-card.svg",
    publishedAt: "2026-10-11",
    popularity: 88,
  },
  {
    id: "nomo-snake",
    name: "Nomo Snake",
    domain: "snake.nomo.zone",
    url: "https://snake.nomo.zone/",
    slogan: "Slither to Victory: Conquer the Grid!",
    icon: "/apps/snake-icon.svg",
    card: "/apps/snake-card.svg",
    publishedAt: "2026-09-20",
    popularity: 80,
  },
  {
    id: "uniswap",
    name: "Uniswap",
    domain: "app.uniswap.org",
    url: "https://app.uniswap.org/",
    slogan: "Decentralized Finance Protocol.",
    icon: "/apps/uniswap-icon.svg",
    card: "/apps/uniswap-card.svg",
    publishedAt: "2026-08-05",
    popularity: 95,
  },
  {
    id: "minesweeper",
    name: "Minesweeper",
    domain: "minesweeper.online",
    url: "https://minesweeper.online/",
    slogan: "The classic logic game, free to play in your browser.",
    icon: "/apps/minesweeper-icon.svg",
    card: "/apps/minesweeper-card.svg",
    publishedAt: "2026-09-28",
    popularity: 70,
  },
  {
    id: "circuit-run",
    name: "Circuit Run Extreme Speed",
    domain: "circuitrun.netlify.app",
    url: "https://circuitrun.netlify.app/",
    slogan: "Drive a truck with airplane-speed!",
    icon: "/apps/circuitrun-icon.svg",
    card: "/apps/circuitrun-card.svg",
    publishedAt: "2026-10-05",
    popularity: 62,
  },
];

export function getApps(): App[] {
  return APPS;
}
