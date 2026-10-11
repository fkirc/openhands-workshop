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
  /** True when `url` is a route inside this marketplace, false for external sites. */
  internal?: boolean;
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
  /**
   * When set, clicking the card plays an in-page sequence instead of opening
   * `url`. The value selects which sequence (see GrandpaPrank).
   */
  sequence?: "grandpa-prank";
}

export const APPS: App[] = [
  {
    id: "snakes-and-ladders",
    name: "Austrian Snakes & Ladders",
    domain: "nomomarket.netlify.app/snakes-and-ladders",
    url: "/snakes-and-ladders",
    internal: true,
    slogan: "Climb the Austrian ladders, dodge the Austrian snakes, reach 100.",
    icon: "/apps/snl-icon.svg",
    card: "/apps/snl-card.svg",
    publishedAt: "2026-10-11",
    popularity: 88,
    tags: ["Games"],
  },
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
    tags: ["Games", "Arcade"],
  },
  {
    id: "consulting-stanislava-doganova",
    name: "Consulting Stanislava Doganova",
    domain: "linkedin.com/in/stanislava-doganova",
    url: "https://www.linkedin.com/in/stanislava-doganova/",
    slogan: "Business Strategy for Creative Industries",
    icon: "/apps/consulting-stanislava-doganova-icon.svg",
    card: "/apps/consulting-stanislava-doganova-card.svg",
    publishedAt: "2026-10-11",
    popularity: 68,
    tags: [],
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
  {
    id: "fifties-flipper",
    name: "Fifties Flipper",
    domain: "nomomarket.netlify.app/pinball",
    url: "/pinball",
    slogan: "Pull the plunger, light the bumpers, tilt the room!",
    icon: "/apps/fifties-pinball-icon.svg",
    card: "/apps/fifties-pinball-card.svg",
    publishedAt: "2026-10-11",
    popularity: 68,
    tags: ["Games", "Arcade"],
  },
  {
    id: "2048",
    name: "2048",
    domain: "play2048.co",
    url: "https://play2048.co/",
    slogan: "Join the numbers and get to the 2048 tile!",
    icon: "/apps/2048-icon.svg",
    card: "/apps/2048-card.svg",
    publishedAt: "2026-10-11",
    popularity: 78,
    tags: ["Games", "Puzzle"],
  },
  {
    id: "grandpa-hacker",
    name: "Grandpa Explains AI",
    domain: "grandpa.nomo.zone",
    url: "https://grandpa.nomo.zone/",
    slogan: "Let Grandpa explain you AI.",
    icon: "/apps/grandpa-icon.svg",
    card: "/apps/grandpa-card.svg",
    publishedAt: "2026-10-11",
    popularity: 88,
    sequence: "grandpa-prank",
    tags: ["Games"],
  },
  {
    id: "black-spot",
    name: "Black Spot",
    domain: "black-spot",
    url: "/black-spot/",
    slogan: "Guess the pirate word before the crew runs you through!",
    icon: "/apps/black-spot-icon.svg",
    card: "/apps/black-spot-card.svg",
    publishedAt: "2026-10-11",
    popularity: 58,
    tags: ["Games", "Puzzle"],
  },
  {
    id: "shadowtales",
    name: "ShadowTales",
    domain: "nomomarket.netlify.app",
    url: "/shadowtales/",
    slogan: "Jede Geschichte verdient ein Märchen.",
    icon: "/apps/shadowtales-icon.svg",
    card: "/apps/shadowtales-card.svg",
    publishedAt: "2026-10-11",
    popularity: 88,
    tags: [],
  },
];

export function getApps(): App[] {
  return APPS;
}
