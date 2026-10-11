"use client";

import type {
  AnimationType,
  BackdropId,
  CameraMove,
  Character,
  MusicMood,
  Scene,
} from "@/lib/shadowtales/types";
import { MOOD_LABELS } from "@/lib/shadowtales/styles";

/** Right-hand inspector: edit every field of the selected scene live. */

const BACKDROPS: BackdropId[] = [
  "party",
  "castle",
  "forest",
  "mountain",
  "sky",
  "stars",
  "home",
  "street",
  "beach",
  "ballroom",
  "dragon-peak",
  "proposal",
];

const ANIMATIONS: AnimationType[] = [
  "appear",
  "walk-in-left",
  "walk-in-right",
  "walk-across",
  "meet",
  "talk",
  "turn",
  "hearts",
  "fall-object",
  "zoom",
  "static",
  "celebrate",
  "dragon",
];

const CAMERAS: CameraMove[] = ["none", "zoom-in", "zoom-out", "pan-left", "pan-right"];

const field =
  "w-full rounded-lg border border-amber-400/20 bg-black/30 px-3 py-2 text-sm text-amber-50 focus:border-amber-400/60 focus:outline-none";
const label = "block text-xs font-medium uppercase tracking-wide text-amber-200/70";

interface SceneEditorProps {
  scene: Scene;
  characters: Character[];
  onChange: (scene: Scene) => void;
}

export function SceneEditor({ scene, characters, onChange }: SceneEditorProps) {
  const patch = (p: Partial<Scene>) => onChange({ ...scene, ...p });

  const setDialogue = (i: number, text: string) =>
    patch({ dialogue: scene.dialogue.map((d, j) => (j === i ? { ...d, text } : d)) });

  const setDialogueCharacter = (i: number, characterId: string) =>
    patch({ dialogue: scene.dialogue.map((d, j) => (j === i ? { ...d, characterId } : d)) });

  const nameOf = (id: string) => characters.find((c) => c.id === id)?.name ?? "?";

  return (
    <div className="space-y-4">
      <div>
        <label className={label} htmlFor="sc-title">Szenentitel</label>
        <input
          id="sc-title"
          className={field}
          value={scene.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </div>

      <div>
        <label className={label} htmlFor="sc-narr">Erzähltext</label>
        <textarea
          id="sc-narr"
          rows={3}
          className={field}
          value={scene.narration}
          onChange={(e) => patch({ narration: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} htmlFor="sc-bg">Hintergrund</label>
          <select
            id="sc-bg"
            className={field}
            value={scene.backdrop}
            onChange={(e) => patch({ backdrop: e.target.value as BackdropId })}
          >
            {BACKDROPS.map((b) => (
              <option key={b} value={b} className="bg-zinc-900">{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="sc-anim">Animation</label>
          <select
            id="sc-anim"
            className={field}
            value={scene.animation}
            onChange={(e) => patch({ animation: e.target.value as AnimationType })}
          >
            {ANIMATIONS.map((a) => (
              <option key={a} value={a} className="bg-zinc-900">{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="sc-cam">Kamera</label>
          <select
            id="sc-cam"
            className={field}
            value={scene.camera}
            onChange={(e) => patch({ camera: e.target.value as CameraMove })}
          >
            {CAMERAS.map((c) => (
              <option key={c} value={c} className="bg-zinc-900">{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="sc-mood">Musikstimmung</label>
          <select
            id="sc-mood"
            className={field}
            value={scene.mood}
            onChange={(e) => patch({ mood: e.target.value as MusicMood })}
          >
            {(Object.keys(MOOD_LABELS) as MusicMood[]).map((m) => (
              <option key={m} value={m} className="bg-zinc-900">{MOOD_LABELS[m]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="sc-dur">Dauer · {scene.duration}s</label>
        <input
          id="sc-dur"
          type="range"
          min={3}
          max={20}
          step={1}
          value={scene.duration}
          onChange={(e) => patch({ duration: Number(e.target.value) })}
          className="w-full accent-amber-400"
        />
      </div>

      <div>
        <span className={label}>Figuren auf der Bühne</span>
        <div className="mt-2 space-y-2">
          {scene.characters.map((sc, i) => (
            <div key={`${sc.characterId}-${i}`} className="rounded-lg border border-amber-400/15 p-2">
              <div className="flex items-center gap-2">
                <select
                  className={`${field} flex-1`}
                  value={sc.characterId}
                  onChange={(e) =>
                    patch({
                      characters: scene.characters.map((x, j) =>
                        j === i ? { ...x, characterId: e.target.value } : x,
                      ),
                    })
                  }
                >
                  {characters.map((c) => (
                    <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded border border-red-400/30 px-2 py-1 text-xs text-red-200"
                  onClick={() =>
                    patch({ characters: scene.characters.filter((_, j) => j !== i) })
                  }
                >
                  ✕
                </button>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={0.05}
                  max={0.95}
                  step={0.01}
                  value={sc.x}
                  onChange={(e) =>
                    patch({
                      characters: scene.characters.map((x, j) =>
                        j === i ? { ...x, x: Number(e.target.value) } : x,
                      ),
                    })
                  }
                  className="flex-1 accent-amber-400"
                  aria-label={`Position von ${nameOf(sc.characterId)}`}
                />
                <select
                  className={`${field} w-24`}
                  value={sc.facing}
                  onChange={(e) =>
                    patch({
                      characters: scene.characters.map((x, j) =>
                        j === i ? { ...x, facing: e.target.value as "left" | "right" } : x,
                      ),
                    })
                  }
                >
                  <option value="left" className="bg-zinc-900">◀ links</option>
                  <option value="right" className="bg-zinc-900">rechts ▶</option>
                </select>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="rounded border border-dashed border-amber-400/40 px-2 py-1 text-xs text-amber-200"
            onClick={() =>
              patch({
                characters: [
                  ...scene.characters,
                  { characterId: characters[0]?.id ?? "", x: 0.5, facing: "left" },
                ],
              })
            }
          >
            + Figur
          </button>
        </div>
      </div>

      <div>
        <span className={label}>Dialog</span>
        <div className="mt-2 space-y-2">
          {scene.dialogue.map((d, i) => (
            <div key={i} className="flex gap-2">
              <select
                className={`${field} w-28`}
                value={d.characterId}
                onChange={(e) => setDialogueCharacter(i, e.target.value)}
              >
                {characters.map((c) => (
                  <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>
                ))}
              </select>
              <input
                className={`${field} flex-1`}
                value={d.text}
                onChange={(e) => setDialogue(i, e.target.value)}
              />
              <button
                type="button"
                className="rounded border border-red-400/30 px-2 text-xs text-red-200"
                onClick={() => patch({ dialogue: scene.dialogue.filter((_, j) => j !== i) })}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded border border-dashed border-amber-400/40 px-2 py-1 text-xs text-amber-200"
            onClick={() =>
              patch({
                dialogue: [
                  ...scene.dialogue,
                  { characterId: characters[0]?.id ?? "", text: "Neue Zeile …" },
                ],
              })
            }
          >
            + Dialogzeile
          </button>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="sc-card">Einblendung / Titel (optional)</label>
        <input
          id="sc-card"
          className={field}
          value={scene.titleCard ?? ""}
          onChange={(e) => patch({ titleCard: e.target.value || undefined })}
          placeholder="z. B. Und ihre Geschichte hatte gerade erst begonnen."
        />
      </div>
    </div>
  );
}
