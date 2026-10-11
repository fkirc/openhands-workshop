import { STYLE_PRESETS } from "./styles";
import type {
  Accessory,
  BackdropId,
  Character,
  Occasion,
  Scene,
  Story,
  StoryStyle,
} from "./types";

export interface StoryInput {
  title: string;
  person1: string;
  person2: string;
  date?: string;
  place: string;
  description: string;
  occasion: Occasion;
  style: StoryStyle;
}

export function makeId(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Guess a fitting accessory from free text so characters feel personal. */
function guessAccessory(text: string, fallback: Accessory): Accessory {
  const t = text.toLowerCase();
  if (t.includes("blume") || t.includes("rose") || t.includes("blüte")) return "flower";
  if (t.includes("getränk") || t.includes("cocktail") || t.includes("bier") || t.includes("becher"))
    return "cup";
  if (t.includes("buch") || t.includes("lesen") || t.includes("student")) return "book";
  if (t.includes("schwert") || t.includes("ritter") || t.includes("held")) return "sword";
  if (t.includes("krone") || t.includes("prinzessin") || t.includes("könig")) return "crown";
  if (t.includes("zauber") || t.includes("magie") || t.includes("hexe")) return "wand";
  return fallback;
}

/** Build a plausible silhouette for one person from their name + the story. */
export function defaultCharacter(
  name: string,
  index: number,
  description: string,
  style: StoryStyle,
): Character {
  const t = description.toLowerCase();
  const firstName = name.trim().split(/\s+/)[0] || `Person ${index + 1}`;
  const lower = firstName.toLowerCase();

  const femaleHints = ["a", "e", "i", "ne", "ia", "na"];
  const likelyFemale = femaleHints.some((h) => lower.endsWith(h));
  const hair = likelyFemale ? "long" : index === 0 ? "short" : "short";

  const fantasy = style === "fantasy" || t.includes("fantasy") || t.includes("zauber");

  return {
    id: `char-${index + 1}`,
    name: firstName,
    type: fantasy ? (index === 0 ? "wizard" : "hero") : "human",
    hair,
    height: index === 0 ? 1.0 : 1.08,
    glasses: t.includes("brille") && index === 1,
    hat: fantasy,
    outfit: style === "fantasy" ? "fantasy" : "everyday",
    accessory: guessAccessory(description, index === 0 ? "flower" : "cup"),
  };
}

const STYLE_INTRO: Record<StoryStyle, (p1: string, p2: string) => string> = {
  romance: (p1, p2) =>
    `In einer Nacht, in der die Sterne besonders tief hingen, kreuzten sich die Wege von ${p1} und ${p2}.`,
  fantasy: (p1, p2) =>
    `Weit hinter den Bergen begann die Legende von ${p1} und ${p2}.`,
  comedy: (p1, p2) =>
    `Manche Geschichten beginnen mit einem Knall. Diese hier mit ${p1}, ${p2} und einer ziemlich schlechten Idee.`,
  hollywood: (p1, p2) =>
    `Dies ist die wahre Geschichte von ${p1} und ${p2}.`,
};

const STYLE_END: Record<StoryStyle, string> = {
  romance: "Und ihre Geschichte hatte gerade erst begonnen.",
  fantasy: "Und so wurden aus zwei Fremden die Helden ihrer eigenen Legende.",
  comedy: "Fazit: Peinlich, aber irgendwie der beste Abend aller Zeiten.",
  hollywood: "Und genau so begann das größte Abenteuer ihres Lebens.",
};

function styleScenes(style: StoryStyle): { animations: string[]; backdrops: BackdropId[] } {
  const preset = STYLE_PRESETS[style];
  const backdrops: Record<StoryStyle, BackdropId[]> = {
    romance: ["forest", "forest", "ballroom", "stars", "proposal"],
    fantasy: ["mountain", "castle", "forest", "dragon-peak", "proposal"],
    comedy: ["street", "party", "home", "stars", "proposal"],
    hollywood: ["beach", "street", "ballroom", "stars", "proposal"],
  };
  return { animations: preset.animations, backdrops: backdrops[style] };
}

/**
 * Turn a form submission into 3–5 structured scenes.
 *
 * This is deliberately rule-based and deterministic: the description is split
 * into sentences and distributed over a classic five-beat arc. A language
 * model could later replace this function without touching the rest of the app,
 * because the output is exactly the same `Story` shape.
 */
export function generateStory(input: StoryInput): Story {
  const now = new Date().toISOString();
  const p1 = input.person1.trim() || "Person 1";
  const p2 = input.person2.trim() || "Person 2";
  const place = input.place.trim() || "einem besonderen Ort";
  const sentences = splitSentences(input.description);
  const { animations, backdrops } = styleScenes(input.style);
  const preset = STYLE_PRESETS[input.style];

  const characters: Character[] = [
    defaultCharacter(p1, 0, input.description, input.style),
    defaultCharacter(p2, 1, input.description, input.style),
  ];

  const s = (i: number) => sentences[i] ?? "";

  const scenes: Scene[] = [
    {
      id: makeId("scene"),
      title: "Die Begegnung",
      backdrop: backdrops[0],
      characters: [
        { characterId: characters[0].id, x: 0.32, facing: "right" },
        { characterId: characters[1].id, x: 0.85, facing: "left", delay: 1.2 },
      ],
      animation: (animations[0] as Scene["animation"]) ?? "appear",
      camera: "pan-left",
      narration: `${STYLE_INTRO[input.style](p1, p2)} ${
        s(0) || `Alles begann an ${place}.`
      }`,
      dialogue: [],
      duration: preset.tempo === "fast" ? 6 : 8,
      mood: preset.mood,
      titleCard: preset.titleCard ? input.title || "Eine wahre Geschichte" : undefined,
    },
    {
      id: makeId("scene"),
      title: "Der große Moment",
      backdrop: backdrops[1],
      characters: [
        { characterId: characters[1].id, x: 0.62, facing: "left" },
        { characterId: characters[0].id, x: 0.42, facing: "left" },
      ],
      animation: (animations[1] as Scene["animation"]) ?? "meet",
      camera: "zoom-in",
      narration: s(1) || `${p2} wollte unbedingt einen guten Eindruck machen.`,
      dialogue: [],
      duration: preset.tempo === "fast" ? 6 : 8,
      mood: preset.mood === "warm" ? "playful" : preset.mood,
    },
    {
      id: makeId("scene"),
      title: "Das Gespräch",
      backdrop: backdrops[2],
      characters: [
        { characterId: characters[0].id, x: 0.38, facing: "right" },
        { characterId: characters[1].id, x: 0.62, facing: "left" },
      ],
      animation: "talk",
      camera: "none",
      narration: s(2) || "",
      dialogue: [
        { characterId: characters[0].id, text: `Und, wie ist es dir bisher ergangen, ${p2}?` },
        { characterId: characters[1].id, text: `Besser, seit ich dich kenne, ${p1}.` },
      ],
      duration: preset.tempo === "fast" ? 7 : 9,
      mood: "tender",
    },
    {
      id: makeId("scene"),
      title: "Der Weg nach Hause",
      backdrop: backdrops[3],
      characters: [
        { characterId: characters[0].id, x: 0.34, facing: "right" },
        { characterId: characters[1].id, x: 0.52, facing: "right" },
      ],
      animation: (animations[3] as Scene["animation"]) ?? "walk-across",
      camera: "pan-right",
      narration:
        s(3) ||
        `${p1} und ${p2} liefen gemeinsam weiter, und keiner wollte, dass der Abend endet.`,
      dialogue: [],
      duration: preset.tempo === "fast" ? 7 : 9,
      mood: "tender",
    },
    {
      id: makeId("scene"),
      title: "Das Ende",
      backdrop: backdrops[4],
      characters: [
        { characterId: characters[0].id, x: 0.4, facing: "right" },
        { characterId: characters[1].id, x: 0.6, facing: "left" },
      ],
      animation: (animations[4] as Scene["animation"]) ?? "hearts",
      camera: "zoom-out",
      narration: s(4) || "",
      dialogue: [],
      duration: preset.tempo === "fast" ? 6 : 8,
      mood: "warm",
      titleCard: STYLE_END[input.style],
    },
  ];

  return {
    id: makeId("story"),
    title: input.title.trim() || `${p1} & ${p2}`,
    style: input.style,
    occasion: input.occasion,
    meta: {
      person1: p1,
      person2: p2,
      date: input.date || undefined,
      place,
      description: input.description,
    },
    characters,
    scenes,
    createdAt: now,
    updatedAt: now,
  };
}
