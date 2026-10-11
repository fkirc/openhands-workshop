"use client";

import { useState } from "react";
import type { Occasion, StoryStyle } from "@/lib/shadowtales/types";
import { OCCASION_LABELS } from "@/lib/shadowtales/types";
import { STYLE_ORDER, STYLE_PRESETS } from "@/lib/shadowtales/styles";
import type { StoryInput } from "@/lib/shadowtales/story-generator";

/**
 * The "Erzähle eure Geschichte" form. It only collects input — the rule-based
 * generator turns it into scenes afterwards, so this stays a pure form.
 */

export const EXAMPLE_INPUT: StoryInput = {
  title: "Der verschüttete Abend",
  person1: "Anna",
  person2: "Max",
  date: "2019-05-18",
  place: "Studentenparty im Wohnheim",
  description:
    "Anna und Max haben sich 2019 auf einer Studentenparty kennengelernt. Max wollte Anna beeindrucken, verschüttete aber sein Getränk. Anna lachte darüber. Später gingen beide gemeinsam nach Hause und Max fragte nach ihrer Nummer.",
  occasion: "anniversary",
  style: "romance",
};

const field =
  "w-full rounded-lg border border-amber-400/20 bg-black/30 px-3 py-2.5 text-amber-50 placeholder:text-amber-200/30 focus:border-amber-400/60 focus:outline-none";
const label = "block text-sm font-medium text-amber-200/90";

interface StoryFormProps {
  initial?: StoryInput;
  onSubmit: (input: StoryInput) => void;
}

export function StoryForm({ initial, onSubmit }: StoryFormProps) {
  const [input, setInput] = useState<StoryInput>(initial ?? EXAMPLE_INPUT);

  const set = <K extends keyof StoryInput>(key: K, value: StoryInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(input);
      }}
    >
      <div>
        <label className={label} htmlFor="st-title">Titel der Geschichte</label>
        <input
          id="st-title"
          className={field}
          value={input.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="z. B. Der verschüttete Abend"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="st-p1">Name von Person 1</label>
          <input
            id="st-p1"
            className={field}
            value={input.person1}
            onChange={(e) => set("person1", e.target.value)}
            placeholder="Anna"
          />
        </div>
        <div>
          <label className={label} htmlFor="st-p2">Name von Person 2</label>
          <input
            id="st-p2"
            className={field}
            value={input.person2}
            onChange={(e) => set("person2", e.target.value)}
            placeholder="Max"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="st-date">Datum des Kennenlernens (optional)</label>
          <input
            id="st-date"
            type="date"
            className={field}
            value={input.date ?? ""}
            onChange={(e) => set("date", e.target.value)}
          />
        </div>
        <div>
          <label className={label} htmlFor="st-place">Ort des Kennenlernens</label>
          <input
            id="st-place"
            className={field}
            value={input.place}
            onChange={(e) => set("place", e.target.value)}
            placeholder="Studentenparty im Wohnheim"
          />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="st-desc">Beschreibung der Geschichte</label>
        <textarea
          id="st-desc"
          rows={5}
          className={field}
          value={input.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Erzähle in ein paar Sätzen, was passiert ist …"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="st-occ">Anlass</label>
          <select
            id="st-occ"
            className={field}
            value={input.occasion}
            onChange={(e) => set("occasion", e.target.value as Occasion)}
          >
            {(Object.keys(OCCASION_LABELS) as Occasion[]).map((o) => (
              <option key={o} value={o} className="bg-zinc-900">
                {OCCASION_LABELS[o]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="st-style">Stil</label>
          <select
            id="st-style"
            className={field}
            value={input.style}
            onChange={(e) => set("style", e.target.value as StoryStyle)}
          >
            {STYLE_ORDER.map((s) => (
              <option key={s} value={s} className="bg-zinc-900">
                {STYLE_PRESETS[s].name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-amber-500 px-5 py-3 font-medium text-zinc-950 transition hover:bg-amber-400"
      >
        Geschichte erstellen
      </button>
      <p className="text-xs text-amber-200/50">
        Die Beschreibung wird regelbasiert in 3–5 Szenen verwandelt. Kein API-Key nötig.
      </p>
    </form>
  );
}
