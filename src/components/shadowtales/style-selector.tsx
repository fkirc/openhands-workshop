"use client";

import { STYLE_ORDER, STYLE_PRESETS } from "@/lib/shadowtales/styles";
import type { StoryStyle } from "@/lib/shadowtales/types";

/** Style picker: each card previews the palette and the mood of the preset. */

interface StyleSelectorProps {
  value: StoryStyle;
  onChange: (style: StoryStyle) => void;
}

export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {STYLE_ORDER.map((id) => {
        const preset = STYLE_PRESETS[id];
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={active}
            className={`overflow-hidden rounded-xl border text-left transition ${
              active
                ? "border-amber-400 ring-2 ring-amber-400/40"
                : "border-amber-400/15 hover:border-amber-400/40"
            }`}
          >
            <div
              className="h-24 w-full"
              style={{
                background: `radial-gradient(120% 100% at 50% 40%, ${preset.palette.light} 0%, ${preset.palette.glow} 70%, #1b1207 100%)`,
              }}
            />
            <div className="bg-black/30 p-3">
              <p className="font-serif text-base text-amber-100">{preset.name}</p>
              <p className="mt-1 text-xs text-amber-200/70">{preset.description}</p>
              <p className="mt-2 text-xs text-amber-200/50">
                Tempo: {preset.tempo} · Stimmung: {preset.mood}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
