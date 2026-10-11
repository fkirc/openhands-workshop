"use client";

import type { Scene } from "@/lib/shadowtales/types";

/** Left-hand scene overview: select, reorder, delete and add scenes. */

interface TimelineProps {
  scenes: Scene[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
}

export function Timeline({
  scenes,
  currentIndex,
  onSelect,
  onMove,
  onDelete,
  onAdd,
}: TimelineProps) {
  return (
    <div className="flex flex-col gap-2">
      {scenes.map((scene, i) => (
        <div
          key={scene.id}
          className={`rounded-lg border p-2 transition ${
            i === currentIndex
              ? "border-amber-400 bg-amber-400/10"
              : "border-amber-400/15 bg-black/20 hover:border-amber-400/40"
          }`}
        >
          <button
            type="button"
            onClick={() => onSelect(i)}
            className="block w-full text-left"
          >
            <span className="text-[11px] uppercase tracking-wide text-amber-200/60">
              Szene {i + 1} · {scene.duration}s
            </span>
            <span className="block truncate text-sm font-medium text-amber-100">
              {scene.title}
            </span>
            <span className="block truncate text-xs text-amber-200/50">
              {scene.backdrop} · {scene.animation}
            </span>
          </button>
          <div className="mt-2 flex gap-1 text-xs">
            <button
              type="button"
              onClick={() => onMove(i, i - 1)}
              disabled={i === 0}
              className="rounded border border-amber-400/20 px-2 py-0.5 text-amber-200/80 disabled:opacity-30"
              aria-label="Nach oben"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => onMove(i, i + 1)}
              disabled={i === scenes.length - 1}
              className="rounded border border-amber-400/20 px-2 py-0.5 text-amber-200/80 disabled:opacity-30"
              aria-label="Nach unten"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => onDelete(i)}
              disabled={scenes.length <= 1}
              className="ml-auto rounded border border-red-400/30 px-2 py-0.5 text-red-200/90 disabled:opacity-30"
            >
              Löschen
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="rounded-lg border border-dashed border-amber-400/40 px-3 py-2 text-sm text-amber-200 transition hover:bg-amber-400/10"
      >
        + Szene hinzufügen
      </button>
    </div>
  );
}
