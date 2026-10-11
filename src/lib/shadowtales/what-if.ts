import { makeId } from "./story-generator";
import type { Scene, Story } from "./types";

export type WhatIfId =
  | "dragon"
  | "embarrassing"
  | "alternative-ending"
  | "villain"
  | "unexpected-line"
  | "romcom";

export interface WhatIfOption {
  id: WhatIfId | string;
  label: string;
  description: string;
  /** Implemented templates are selectable; the rest show "Später verfügbar". */
  available: boolean;
}

export const WHAT_IF_OPTIONS: WhatIfOption[] = [
  {
    id: "dragon",
    label: "Was wäre, wenn wir uns auf Drachen kennengelernt hätten?",
    description: "Verwandelt die Geschichte in ein episches Fantasy-Abenteuer.",
    available: true,
  },
  {
    id: "embarrassing",
    label: "Füge eine peinliche Situation hinzu.",
    description: "Eine extra Szene, in der wirklich alles schiefgeht.",
    available: true,
  },
  {
    id: "alternative-ending",
    label: "Erfinde ein alternatives Ende.",
    description: "Ein neues, noch romantischeres Finale.",
    available: true,
  },
  {
    id: "villain",
    label: "Füge einen Bösewicht hinzu.",
    description: "Später verfügbar.",
    available: false,
  },
  {
    id: "unexpected-line",
    label: "Lass eine Person etwas völlig Unerwartetes sagen.",
    description: "Später verfügbar.",
    available: false,
  },
  {
    id: "romcom",
    label: "Mach daraus eine übertriebene romantische Komödie.",
    description: "Später verfügbar.",
    available: false,
  },
];

function clone(story: Story): Story {
  return JSON.parse(JSON.stringify(story)) as Story;
}

function titleOf(story: Story): string {
  const { person1, person2 } = story.meta;
  return person1 && person2 ? `${person1} & ${person2}` : story.title;
}

/** Turn the story into a dragon fantasy adventure. */
function dragonVariant(story: Story): Story {
  const next = clone(story);
  const { person1, person2 } = story.meta;

  next.style = "fantasy";
  next.title = `Drachenfeuer — ${titleOf(story)}`;
  next.variantLabel = "Drachen-Abenteuer";
  next.characters = next.characters.map((c, i) => ({
    ...c,
    type: i === 0 ? "wizard" : "hero",
    outfit: "fantasy",
    hat: true,
    accessory: i === 0 ? "wand" : "sword",
  }));

  next.scenes = next.scenes.map((scene, i) => ({
    ...scene,
    backdrop: (["dragon-peak", "castle", "mountain", "dragon-peak", "proposal"] as const)[
      i % 5
    ],
    animation: (["dragon", "walk-in-left", "meet", "dragon", "celebrate"] as const)[i % 5],
    camera: (["zoom-in", "pan-left", "none", "zoom-out", "zoom-in"] as const)[i % 5],
    mood: i === 2 ? "tender" : "epic",
    narration: i === 0
      ? `Auf dem Drachenberg kreuzten sich die Wege von ${person1} und ${person2}.`
      : scene.narration,
  }));

  // Insert a dragon encounter right after the opening scene.
  const dragonScene: Scene = {
    id: makeId("scene"),
    title: "Der Drache",
    backdrop: "dragon-peak",
    characters: [
      { characterId: next.characters[0].id, x: 0.3, facing: "right" },
      { characterId: next.characters[1].id, x: 0.7, facing: "left" },
    ],
    animation: "dragon",
    camera: "zoom-in",
    narration: `Ein Drache kreiste über ihnen. ${person2} stellte sich schützend vor ${person1} — und der Drache neigte respektvoll den Kopf.`,
    dialogue: [
      { characterId: next.characters[1].id, text: "Bleib hinter mir. Ich habe einen Plan." },
      { characterId: next.characters[0].id, text: "Dein letzter Plan war ein Becher zu viel." },
    ],
    duration: 9,
    mood: "epic",
  };
  next.scenes.splice(1, 0, dragonScene);
  next.updatedAt = new Date().toISOString();
  return next;
}

/** Insert an over-the-top embarrassing scene. */
function embarrassingVariant(story: Story): Story {
  const next = clone(story);
  const { person1, person2 } = story.meta;

  next.title = `Pleiten, Pech & Pasta — ${titleOf(story)}`;
  next.variantLabel = "Peinliches Missgeschick";
  next.style = story.style === "romance" ? "comedy" : story.style;

  const scene: Scene = {
    id: makeId("scene"),
    title: "Die Peinlichkeit",
    backdrop: "home",
    characters: [
      { characterId: next.characters[0].id, x: 0.62, facing: "left" },
      { characterId: next.characters[1].id, x: 0.4, facing: "left" },
    ],
    animation: "fall-object",
    camera: "zoom-in",
    narration: `${person1} wollte beeindrucken und stolperte über den eigenen Teppich. Die Pizza landete kopfüber auf dem Sofa. ${person2} lachte so laut, dass die Nachbarn klopften.`,
    dialogue: [
      { characterId: next.characters[1].id, text: "Sag nichts. Das war Absicht." },
      { characterId: next.characters[0].id, text: "Natürlich. Sehr elegant, wirklich." },
    ],
    duration: 9,
    mood: "playful",
  };
  const at = Math.min(2, next.scenes.length);
  next.scenes.splice(at, 0, scene);
  next.updatedAt = new Date().toISOString();
  return next;
}

/** Replace the final scene with an alternative romantic ending. */
function alternativeEndingVariant(story: Story): Story {
  const next = clone(story);
  const { person1, person2 } = story.meta;

  next.title = `Ein neues Ende — ${titleOf(story)}`;
  next.variantLabel = "Alternatives romantisches Ende";
  if (next.style === "comedy" || next.style === "hollywood") next.style = "romance";

  const ending: Scene = {
    id: makeId("scene"),
    title: "Das neue Ende",
    backdrop: "proposal",
    characters: [
      { characterId: next.characters[0].id, x: 0.4, facing: "right" },
      { characterId: next.characters[1].id, x: 0.6, facing: "left" },
    ],
    animation: "hearts",
    camera: "zoom-out",
    narration: `${person1} blieb stehen, drehte sich zu ${person2} um und sagte: „Egal wie oft ich diesen Abend noch erzähle — du bist mein liebster Teil davon.“`,
    dialogue: [
      { characterId: next.characters[1].id, text: "Dann erzähl ihn mir noch einmal. Von Anfang an." },
    ],
    duration: 10,
    mood: "warm",
    titleCard: "Und diesmal endete die Geschichte mit einem Kuss.",
  };

  if (next.scenes.length > 0) {
    next.scenes[next.scenes.length - 1] = ending;
  } else {
    next.scenes.push(ending);
  }
  next.updatedAt = new Date().toISOString();
  return next;
}

/**
 * Produce a new story variant. The original story is never mutated — the
 * caller keeps both and can switch between them.
 */
export function applyWhatIf(
  story: Story,
  optionId: string,
  customText?: string,
): Story {
  let variant: Story;
  switch (optionId) {
    case "dragon":
      variant = dragonVariant(story);
      break;
    case "embarrassing":
      variant = embarrassingVariant(story);
      break;
    case "alternative-ending":
      variant = alternativeEndingVariant(story);
      break;
    default:
      return clone(story);
  }

  if (customText && customText.trim()) {
    variant.scenes.push({
      id: makeId("scene"),
      title: "Deine Idee",
      backdrop: variant.scenes.at(-1)?.backdrop ?? "forest",
      characters: [
        { characterId: variant.characters[0].id, x: 0.38, facing: "right" },
        { characterId: variant.characters[1].id, x: 0.62, facing: "left" },
      ],
      animation: "talk",
      camera: "zoom-in",
      narration: customText.trim(),
      dialogue: [],
      duration: 9,
      mood: "tender",
    });
  }

  variant.id = makeId("story");
  variant.variantOf = story.id;
  variant.updatedAt = new Date().toISOString();
  return variant;
}
