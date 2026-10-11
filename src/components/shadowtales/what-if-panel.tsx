"use client";

import { useState } from "react";
import { WHAT_IF_OPTIONS } from "@/lib/shadowtales/what-if";

/** "Was wäre, wenn?" dialog: pick a change, optionally add free text, create. */

interface WhatIfPanelProps {
  onCreate: (optionId: string, customText: string) => void;
  onClose: () => void;
}

export function WhatIfPanel({ onCreate, onClose }: WhatIfPanelProps) {
  const [selected, setSelected] = useState<string>("dragon");
  const [custom, setCustom] = useState("");

  return (
    <div className="rounded-xl border border-amber-400/20 bg-black/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg text-amber-100">Was wäre, wenn …?</h3>
          <p className="text-xs text-amber-200/60">
            Erstelle eine neue Version. Das Original bleibt erhalten.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-amber-400/20 px-2 py-1 text-xs text-amber-200/80"
        >
          Schließen
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {WHAT_IF_OPTIONS.map((opt) => (
          <label
            key={opt.id}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
              selected === opt.id
                ? "border-amber-400 bg-amber-400/10"
                : "border-amber-400/15 hover:border-amber-400/40"
            } ${opt.available ? "" : "opacity-50"}`}
          >
            <input
              type="radio"
              name="whatif"
              className="mt-1 accent-amber-400"
              checked={selected === opt.id}
              disabled={!opt.available}
              onChange={() => setSelected(opt.id)}
            />
            <span>
              <span className="block text-sm text-amber-100">{opt.label}</span>
              <span className="block text-xs text-amber-200/50">
                {opt.available ? opt.description : "Später verfügbar"}
              </span>
            </span>
          </label>
        ))}
      </div>

      <div className="mt-4">
        <label className="block text-xs font-medium uppercase tracking-wide text-amber-200/70" htmlFor="whatif-custom">
          Eigene Idee (optional)
        </label>
        <textarea
          id="whatif-custom"
          rows={2}
          className="mt-1 w-full rounded-lg border border-amber-400/20 bg-black/30 px-3 py-2 text-sm text-amber-50 focus:border-amber-400/60 focus:outline-none"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="z. B. Lass einen Hund die Geschichte erzählen."
        />
      </div>

      <button
        type="button"
        onClick={() => onCreate(selected, custom)}
        className="mt-4 w-full rounded-lg bg-amber-500 px-4 py-2.5 font-medium text-zinc-950 transition hover:bg-amber-400"
      >
        Neue Version erstellen
      </button>
    </div>
  );
}
