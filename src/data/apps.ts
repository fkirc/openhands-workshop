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
  /** Category tags; see src/data/tags.ts for the catalog. */
  tags: string[];
}

export const APPS: App[] = [
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
    tags: ["Games", "Arcade"],
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
    tags: ["Finance", "Web3"],
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
    tags: ["Games", "Puzzle"],
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
    tags: ["Games", "Racing"],
  },
];

export function getApps(): App[] {
  return APPS;
}
