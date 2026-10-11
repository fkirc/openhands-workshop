import type { BackdropId, MusicMood, StoryStyle } from "./types";

export interface StylePreset {
  id: StoryStyle;
  name: string;
  tagline: string;
  description: string;
  /** CSS colours used for the theatre light and UI accents. */
  palette: {
    /** Warm light behind the screen. */
    light: string;
    /** Deeper glow at the edges. */
    glow: string;
    /** Accent used for captions and controls. */
    accent: string;
  };
  /** Which backdrop a generated story prefers. */
  backdrop: BackdropId;
  /** Animations used by generated scenes, in order. */
  animations: string[];
  mood: MusicMood;
  /** Large title card shown on the first scene. */
  titleCard?: boolean;
  /** Faster cuts and bolder movement. */
  tempo: "slow" | "medium" | "fast";
}

export const STYLE_PRESETS: Record<StoryStyle, StylePreset> = {
  romance: {
    id: "romance",
    name: "Romantisches Märchen",
    tagline: "Warmes Licht, Herzen und ein langsamer Tanz.",
    description:
      "Warme Farben, Märchenwald, Herzen, Sterne und Mond. Ruhige, romantische Bewegungen.",
    palette: {
      light: "#f6d38a",
      glow: "#c9742f",
      accent: "#ffd9a0",
    },
    backdrop: "forest",
    animations: ["appear", "meet", "talk", "walk-across", "hearts"],
    mood: "warm",
    tempo: "slow",
  },
  fantasy: {
    id: "fantasy",
    name: "Episches Fantasy-Abenteuer",
    tagline: "Burgen, Drachen und Magie in der Dämmerung.",
    description:
      "Burgen, Drachen, Berge, magische Effekte und dramatische Bewegungen.",
    palette: {
      light: "#9fd0ff",
      glow: "#3b4a8f",
      accent: "#cfe3ff",
    },
    backdrop: "mountain",
    animations: ["zoom", "walk-in-left", "dragon", "meet", "celebrate"],
    mood: "epic",
    tempo: "medium",
  },
  comedy: {
    id: "comedy",
    name: "Lustige Komödie",
    tagline: "Übertrieben, schräg und ein bisschen peinlich.",
    description:
      "Übertriebene Animationen, lustige Sprechblasen, überraschende Reaktionen und humorvolle Szenenwechsel.",
    palette: {
      light: "#ffe08a",
      glow: "#e0722f",
      accent: "#fff0b8",
    },
    backdrop: "street",
    animations: ["walk-in-right", "fall-object", "turn", "celebrate", "hearts"],
    mood: "playful",
    tempo: "fast",
  },
  hollywood: {
    id: "hollywood",
    name: "Hollywood-Abenteuer",
    tagline: "Große Titel, schnelle Schnitte, weite Fahrten.",
    description:
      "Dramatische Kamerafahrten, große Titel-Einblendungen, schnelle Schnitte und abenteuerliche Stimmung.",
    palette: {
      light: "#ffd27a",
      glow: "#7a2f1a",
      accent: "#ffe6b0",
    },
    backdrop: "beach",
    animations: ["zoom", "walk-across", "meet", "celebrate", "hearts"],
    mood: "dramatic",
    titleCard: true,
    tempo: "fast",
  },
};

export const STYLE_ORDER: StoryStyle[] = [
  "romance",
  "fantasy",
  "comedy",
  "hollywood",
];

export const MOOD_LABELS: Record<MusicMood, string> = {
  warm: "Warm",
  playful: "Verspielt",
  epic: "Episch",
  mysterious: "Geheimnisvoll",
  tender: "Zart",
  dramatic: "Dramatisch",
};
