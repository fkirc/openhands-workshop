"use client";

import type { Accessory, Character, CharacterType, HairStyle, Outfit } from "@/lib/shadowtales/types";
import {
  ACCESSORY_LABELS,
  CHARACTER_TYPE_LABELS,
  HAIR_LABELS,
  OUTFIT_LABELS,
} from "@/lib/shadowtales/types";
import { CharacterSilhouette } from "./character-silhouette";

/** Editor for one or more shadow puppets, with a live silhouette preview. */

const field =
  "w-full rounded-lg border border-amber-400/20 bg-black/30 px-3 py-2 text-amber-50 focus:border-amber-400/60 focus:outline-none";
const label = "block text-xs font-medium uppercase tracking-wide text-amber-200/70";

interface CharacterEditorProps {
  characters: Character[];
  onChange: (characters: Character[]) => void;
}

export function CharacterEditor({ characters, onChange }: CharacterEditorProps) {
  const update = (id: string, patch: Partial<Character>) =>
    onChange(characters.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {characters.map((c) => (
        <div
          key={c.id}
          className="rounded-xl border border-amber-400/15 bg-black/20 p-4"
        >
          <div className="flex gap-4">
            <div className="flex h-40 w-24 shrink-0 items-end justify-center rounded-lg bg-gradient-to-b from-amber-200/90 to-amber-400/80 p-1">
              <CharacterSilhouette character={c} className="h-[92%] w-auto" />
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <label className={label} htmlFor={`name-${c.id}`}>Name</label>
                <input
                  id={`name-${c.id}`}
                  className={field}
                  value={c.name}
                  onChange={(e) => update(c.id, { name: e.target.value })}
                />
              </div>
              <div>
                <label className={label} htmlFor={`type-${c.id}`}>Figurentyp</label>
                <select
                  id={`type-${c.id}`}
                  className={field}
                  value={c.type}
                  onChange={(e) => update(c.id, { type: e.target.value as CharacterType })}
                >
                  {(Object.keys(CHARACTER_TYPE_LABELS) as CharacterType[]).map((t) => (
                    <option key={t} value={t} className="bg-zinc-900">
                      {CHARACTER_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className={label} htmlFor={`hair-${c.id}`}>Frisur</label>
              <select
                id={`hair-${c.id}`}
                className={field}
                value={c.hair}
                onChange={(e) => update(c.id, { hair: e.target.value as HairStyle })}
              >
                {(Object.keys(HAIR_LABELS) as HairStyle[]).map((h) => (
                  <option key={h} value={h} className="bg-zinc-900">
                    {HAIR_LABELS[h]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label} htmlFor={`outfit-${c.id}`}>Kleidung</label>
              <select
                id={`outfit-${c.id}`}
                className={field}
                value={c.outfit}
                onChange={(e) => update(c.id, { outfit: e.target.value as Outfit })}
              >
                {(Object.keys(OUTFIT_LABELS) as Outfit[]).map((o) => (
                  <option key={o} value={o} className="bg-zinc-900">
                    {OUTFIT_LABELS[o]}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className={label} htmlFor={`acc-${c.id}`}>Accessoire</label>
              <select
                id={`acc-${c.id}`}
                className={field}
                value={c.accessory}
                onChange={(e) => update(c.id, { accessory: e.target.value as Accessory })}
              >
                {(Object.keys(ACCESSORY_LABELS) as Accessory[]).map((a) => (
                  <option key={a} value={a} className="bg-zinc-900">
                    {ACCESSORY_LABELS[a]}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className={label} htmlFor={`height-${c.id}`}>
                Körpergröße · {c.height.toFixed(2)}
              </label>
              <input
                id={`height-${c.id}`}
                type="range"
                min={0.8}
                max={1.2}
                step={0.02}
                value={c.height}
                onChange={(e) => update(c.id, { height: Number(e.target.value) })}
                className="w-full accent-amber-400"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-amber-100">
              <input
                type="checkbox"
                checked={c.glasses}
                onChange={(e) => update(c.id, { glasses: e.target.checked })}
                className="accent-amber-400"
              />
              Brille
            </label>
            <label className="flex items-center gap-2 text-sm text-amber-100">
              <input
                type="checkbox"
                checked={c.hat}
                onChange={(e) => update(c.id, { hat: e.target.checked })}
                className="accent-amber-400"
              />
              Hut
            </label>
          </div>
        </div>
      ))}
      <p className="text-xs text-amber-200/50 md:col-span-2">
        Foto-Import für personalisierte Silhouetten: <span className="text-amber-200/80">Später verfügbar</span>.
      </p>
    </div>
  );
}
