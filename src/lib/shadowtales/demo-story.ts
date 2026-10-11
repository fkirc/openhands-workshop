import type { Character, Story } from "./types";

export const ANNA: Character = {
  id: "anna",
  name: "Anna",
  type: "human",
  hair: "long",
  height: 1.0,
  glasses: false,
  hat: false,
  outfit: "everyday",
  accessory: "flower",
};

export const MAX: Character = {
  id: "max",
  name: "Max",
  type: "hero",
  hair: "short",
  height: 1.1,
  glasses: true,
  hat: false,
  outfit: "everyday",
  accessory: "cup",
};

/**
 * The five-scene demo story. This is the example that is available the first
 * time the app is opened, and it is used as the reference for every feature.
 */
export function createDemoStory(): Story {
  const now = "2026-10-11T12:00:00.000Z";
  return {
    id: "demo-anna-max",
    title: "Anna & Max — Der verschüttete Abend",
    style: "romance",
    occasion: "anniversary",
    meta: {
      person1: "Anna",
      person2: "Max",
      date: "2019-05-18",
      place: "Studentenparty im Wohnheim",
      description:
        "Anna und Max haben sich 2019 auf einer Studentenparty kennengelernt. Max wollte Anna beeindrucken, verschüttete aber sein Getränk. Anna lachte darüber. Später gingen beide gemeinsam nach Hause und Max fragte nach ihrer Nummer.",
    },
    characters: [ANNA, MAX],
    scenes: [
      {
        id: "demo-s1",
        title: "Die Begegnung",
        backdrop: "party",
        characters: [
          { characterId: "anna", x: 0.32, facing: "right" },
          { characterId: "max", x: 0.85, facing: "left", delay: 1.2 },
        ],
        animation: "walk-in-right",
        camera: "pan-left",
        narration: "Es war ein ganz gewöhnlicher Abend. Zumindest dachte Max das.",
        dialogue: [],
        duration: 8,
        mood: "warm",
      },
      {
        id: "demo-s2",
        title: "Das Missgeschick",
        backdrop: "party",
        characters: [
          { characterId: "anna", x: 0.42, facing: "left" },
          { characterId: "max", x: 0.66, facing: "left" },
        ],
        animation: "fall-object",
        camera: "zoom-in",
        narration: "Max hatte einen perfekten Plan. Leider hatte sein Getränk einen anderen.",
        dialogue: [],
        duration: 8,
        mood: "playful",
      },
      {
        id: "demo-s3",
        title: "Das Gespräch",
        backdrop: "ballroom",
        characters: [
          { characterId: "anna", x: 0.38, facing: "right" },
          { characterId: "max", x: 0.62, facing: "left" },
        ],
        animation: "talk",
        camera: "none",
        narration: "",
        dialogue: [
          { characterId: "anna", text: "Passiert dir das öfter?" },
          { characterId: "max", text: "Nur bei besonders interessanten Menschen." },
        ],
        duration: 9,
        mood: "tender",
      },
      {
        id: "demo-s4",
        title: "Der Heimweg",
        backdrop: "stars",
        characters: [
          { characterId: "anna", x: 0.34, facing: "right" },
          { characterId: "max", x: 0.52, facing: "right" },
        ],
        animation: "walk-across",
        camera: "pan-right",
        narration:
          "Aus einem kleinen Missgeschick wurde ein ziemlich großer Anfang.",
        dialogue: [],
        duration: 9,
        mood: "tender",
      },
      {
        id: "demo-s5",
        title: "Das Ende",
        backdrop: "proposal",
        characters: [
          { characterId: "anna", x: 0.4, facing: "right" },
          { characterId: "max", x: 0.6, facing: "left" },
        ],
        animation: "hearts",
        camera: "zoom-out",
        narration: "",
        dialogue: [],
        duration: 8,
        mood: "warm",
        titleCard: "Und ihre Geschichte hatte gerade erst begonnen.",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * A small interactive example story: one decision with two different
 * follow-up scenes. Used by the "Interaktives Spiel" mode.
 */
export function createInteractiveStory(): Story {
  const now = "2026-10-11T12:00:00.000Z";
  return {
    id: "demo-interactive",
    title: "Die Party — Du entscheidest",
    style: "comedy",
    occasion: "friendship",
    interactive: true,
    meta: {
      person1: "Anna",
      person2: "Max",
      date: "2019-05-18",
      place: "Studentenparty im Wohnheim",
      description:
        "Eine interaktive Version des Kennenlernens: An der entscheidenden Stelle wählst du, wie es weitergeht.",
    },
    characters: [ANNA, { ...MAX, accessory: "none" }],
    scenes: [
      {
        id: "int-s1",
        title: "Die Begegnung",
        backdrop: "party",
        characters: [
          { characterId: "anna", x: 0.32, facing: "right" },
          { characterId: "max", x: 0.8, facing: "left", delay: 1 },
        ],
        animation: "walk-in-right",
        camera: "pan-left",
        narration:
          "Max sieht Anna auf der Party. Sein Herz klopft bis in die Ohren. Was soll er tun?",
        dialogue: [],
        duration: 6,
        mood: "playful",
        choice: {
          prompt: "Was soll Max tun?",
          options: [
            { id: "bold", label: "Mutig auf Anna zugehen", nextSceneId: "int-bold" },
            { id: "drink", label: "Erst ein Getränk holen", nextSceneId: "int-drink" },
            {
              id: "wizard",
              label: "So tun, als wäre er ein berühmter Zauberer",
              nextSceneId: "int-wizard",
            },
          ],
        },
      },
      {
        id: "int-bold",
        title: "Mutig voran",
        backdrop: "ballroom",
        characters: [
          { characterId: "anna", x: 0.42, facing: "left" },
          { characterId: "max", x: 0.62, facing: "left" },
        ],
        animation: "talk",
        camera: "zoom-in",
        narration: "Max holt tief Luft und geht einfach hinüber.",
        dialogue: [
          { characterId: "max", text: "Hi, ich bin Max. Ich wollte dich unbedingt kennenlernen." },
          { characterId: "anna", text: "Mutig. Das gefällt mir." },
        ],
        duration: 9,
        mood: "warm",
      },
      {
        id: "int-drink",
        title: "Der Umweg",
        backdrop: "party",
        characters: [
          { characterId: "max", x: 0.55, facing: "right" },
        ],
        animation: "fall-object",
        camera: "zoom-in",
        narration:
          "Max holt sich erst einmal Mut an. Leider ausgerechnet in einem zu vollen Becher.",
        dialogue: [
          { characterId: "anna", text: "Passiert dir das öfter?" },
          { characterId: "max", text: "Nur bei besonders interessanten Menschen." },
        ],
        duration: 9,
        mood: "playful",
      },
      {
        id: "int-wizard",
        title: "Der falsche Zauberer",
        backdrop: "forest",
        characters: [
          { characterId: "anna", x: 0.4, facing: "left" },
          { characterId: "max", x: 0.6, facing: "left" },
        ],
        animation: "turn",
        camera: "none",
        narration:
          "Max stellt sich als „der größte Zauberer des Wohnheims“ vor. Anna prustet los.",
        dialogue: [
          { characterId: "max", text: "Ich bin im Grunde ein berühmter Zauberer. Nur heute ohne Hut." },
          { characterId: "anna", text: "Und ohne Zaubersprüche, wie es aussieht." },
        ],
        duration: 9,
        mood: "playful",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}
