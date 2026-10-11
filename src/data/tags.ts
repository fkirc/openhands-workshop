/**
 * Tag catalog for the app marketplace.
 * Each tag carries its own Tailwind color classes so a tag looks the same
 * everywhere it is rendered (app cards and the filter dropdown).
 */

export interface Tag {
  name: string;
  /** Tailwind classes for the chip border/background/text. */
  chip: string;
}

export const TAGS: Tag[] = [
  { name: "Games", chip: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-500/15 dark:text-indigo-200" },
  { name: "Arcade", chip: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-700 dark:border-fuchsia-400/30 dark:bg-fuchsia-500/15 dark:text-fuchsia-200" },
  { name: "Puzzle", chip: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-200" },
  { name: "Racing", chip: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:border-orange-400/30 dark:bg-orange-500/15 dark:text-orange-200" },
  { name: "Finance", chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200" },
  { name: "Web3", chip: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-500/15 dark:text-cyan-200" },
];

const TAG_MAP = new Map(TAGS.map((tag) => [tag.name, tag]));
const FALLBACK_CHIP = "border-black/15 bg-black/5 text-zinc-700 dark:border-white/15 dark:bg-white/10 dark:text-zinc-200";

export const TAG_NAMES = TAGS.map((tag) => tag.name);

export function getTagChipClasses(name: string): string {
  return TAG_MAP.get(name)?.chip ?? FALLBACK_CHIP;
}
