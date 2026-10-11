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
  { name: "Games", chip: "border-indigo-400/30 bg-indigo-500/15 text-indigo-200" },
  { name: "Arcade", chip: "border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-200" },
  { name: "Puzzle", chip: "border-amber-400/30 bg-amber-500/15 text-amber-200" },
  { name: "Racing", chip: "border-orange-400/30 bg-orange-500/15 text-orange-200" },
  { name: "Finance", chip: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200" },
  { name: "Web3", chip: "border-cyan-400/30 bg-cyan-500/15 text-cyan-200" },
];

const TAG_MAP = new Map(TAGS.map((tag) => [tag.name, tag]));
const FALLBACK_CHIP = "border-white/15 bg-white/10 text-zinc-200";

export const TAG_NAMES = TAGS.map((tag) => tag.name);

export function getTagChipClasses(name: string): string {
  return TAG_MAP.get(name)?.chip ?? FALLBACK_CHIP;
}
