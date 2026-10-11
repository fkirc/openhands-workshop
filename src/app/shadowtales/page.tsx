"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { STYLE_PRESETS } from "@/lib/shadowtales/styles";
import { createDemoStory, createInteractiveStory } from "@/lib/shadowtales/demo-story";
import { generateStory } from "@/lib/shadowtales/story-generator";
import type { StoryInput } from "@/lib/shadowtales/story-generator";
import { applyWhatIf } from "@/lib/shadowtales/what-if";
import * as storage from "@/lib/shadowtales/story-storage";
import type { Scene, Story, StoryStyle } from "@/lib/shadowtales/types";
import { OCCASION_LABELS } from "@/lib/shadowtales/types";
import { TheaterPlayer } from "@/components/shadowtales/theater-player";
import { SceneRenderer } from "@/components/shadowtales/scene-renderer";
import { StoryForm, EXAMPLE_INPUT } from "@/components/shadowtales/story-form";
import { CharacterEditor } from "@/components/shadowtales/character-editor";
import { StyleSelector } from "@/components/shadowtales/style-selector";
import { SceneEditor } from "@/components/shadowtales/scene-editor";
import { Timeline } from "@/components/shadowtales/timeline";
import { WhatIfPanel } from "@/components/shadowtales/what-if-panel";

type View = "home" | "library" | "create" | "characters" | "studio" | "theater";

const NAV: { id: View; label: string }[] = [
  { id: "home", label: "Startseite" },
  { id: "library", label: "Meine Geschichten" },
  { id: "create", label: "Geschichte erstellen" },
];

const btn =
  "rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-sm text-amber-50 transition hover:bg-amber-400/25";
const btnPrimary =
  "rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-amber-400";
const panel = "rounded-xl border border-amber-400/15 bg-black/20 p-4 sm:p-5";

export default function ShadowTalesPage() {
  const [view, setView] = useState<View>("home");
  const stories = useSyncExternalStore(
    storage.subscribe,
    storage.getSnapshot,
    storage.getServerSnapshot,
  );
  const [current, setCurrent] = useState<Story | null>(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [whatIfOpen, setWhatIfOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Seed the library and restore any state encoded in the URL. The URL is a
  // browser-only source, so it must be read after mount to keep the first
  // client render identical to the prerendered one.
  useEffect(() => {
    storage.ensureSeeded();
    const params = new URLSearchParams(window.location.search);
    const v = params.get("view") as View | null;
    const sid = params.get("story");
    const sc = params.get("scene");
    /* eslint-disable react-hooks/set-state-in-effect -- intentional one-time hydration of browser-only URL state */
    if (sid) {
      const story = storage.getStory(sid);
      if (story) {
        setCurrent(story);
        setView(v ?? "theater");
      }
    }
    if (v && !sid) setView(v);
    if (sc) setSceneIndex(Number(sc) || 0);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const preset = useMemo(
    () => STYLE_PRESETS[current?.style ?? "romance"],
    [current?.style],
  );

  const persist = useCallback((story: Story) => {
    const saved = storage.saveStory(story);
    setCurrent(saved);
    return saved;
  }, []);

  const openStory = useCallback((story: Story, target: View = "studio") => {
    setCurrent(story);
    setSceneIndex(0);
    setView(target);
  }, []);

  const openDemo = useCallback(() => {
    const demo = storage.getStory("demo-anna-max") ?? persist(createDemoStory());
    openStory(demo, "theater");
  }, [openStory, persist]);

  const openInteractive = useCallback(() => {
    const demo = storage.getStory("demo-interactive") ?? persist(createInteractiveStory());
    openStory(demo, "theater");
  }, [openStory, persist]);

  const handleCreate = useCallback(
    (input: StoryInput) => {
      const story = generateStory(input);
      persist(story);
      openStory(story, "characters");
      setToast("Geschichte erstellt — jetzt Figuren anpassen.");
    },
    [persist, openStory],
  );

  const updateCharacters = useCallback(
    (characters: Story["characters"]) => {
      if (!current) return;
      persist({ ...current, characters });
    },
    [current, persist],
  );

  const updateStyle = useCallback(
    (style: StoryStyle) => {
      if (!current) return;
      persist({ ...current, style });
    },
    [current, persist],
  );

  const updateScene = useCallback(
    (scene: Scene) => {
      if (!current) return;
      const scenes = current.scenes.map((s, i) => (i === sceneIndex ? scene : s));
      persist({ ...current, scenes });
    },
    [current, sceneIndex, persist],
  );

  const moveScene = useCallback(
    (from: number, to: number) => {
      if (!current || to < 0 || to >= current.scenes.length) return;
      const scenes = [...current.scenes];
      const [moved] = scenes.splice(from, 1);
      scenes.splice(to, 0, moved);
      persist({ ...current, scenes });
      setSceneIndex(to);
    },
    [current, persist],
  );

  const deleteScene = useCallback(
    (index: number) => {
      if (!current || current.scenes.length <= 1) return;
      const scenes = current.scenes.filter((_, i) => i !== index);
      persist({ ...current, scenes });
      setSceneIndex(Math.max(0, Math.min(index, scenes.length - 1)));
    },
    [current, persist],
  );

  const addScene = useCallback(() => {
    if (!current) return;
    const last = current.scenes.at(-1);
    const scene: Scene = {
      id: `scene-${Date.now().toString(36)}`,
      title: "Neue Szene",
      backdrop: last?.backdrop ?? "forest",
      characters: current.characters.map((c, i) => ({
        characterId: c.id,
        x: 0.35 + i * 0.25,
        facing: i === 0 ? "right" : "left",
      })),
      animation: "appear",
      camera: "none",
      narration: "Hier beginnt ein neuer Moment eurer Geschichte.",
      dialogue: [],
      duration: 8,
      mood: "warm",
    };
    const scenes = [...current.scenes, scene];
    persist({ ...current, scenes });
    setSceneIndex(scenes.length - 1);
  }, [current, persist]);

  const handleWhatIf = useCallback(
    (optionId: string, customText: string) => {
      if (!current) return;
      const variant = applyWhatIf(current, optionId, customText);
      persist(variant);
      setWhatIfOpen(false);
      setSceneIndex(0);
      setView("theater");
      setToast(`Neue Version erstellt: ${variant.variantLabel ?? ""}`);
    },
    [current, persist],
  );

  const handleExport = useCallback(() => {
    if (!current) return;
    storage.downloadStoryJson(current);
    setToast("JSON exportiert.");
  }, [current]);

  const handleImport = useCallback(
    async (file: File) => {
      try {
        const story = storage.importStoryJson(await file.text());
        persist(story);
        openStory(story, "studio");
        setToast("Geschichte importiert.");
      } catch {
        setToast("Import fehlgeschlagen: ungültige Datei.");
      }
    },
    [persist, openStory],
  );

  const scene = current?.scenes[sceneIndex];

  return (
    <div
      className="flex min-h-screen flex-1 flex-col text-amber-50"
      style={{ background: "linear-gradient(180deg, #1c1a19 0%, #141210 60%, #0e0c0a 100%)" }}
    >
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-amber-400/15 bg-[#141210]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setView("home")}
            className="font-serif text-xl text-amber-200"
          >
            🎭 ShadowTales
          </button>
          <nav className="flex flex-wrap gap-2">
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setView(n.id)}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  view === n.id
                    ? "bg-amber-400/20 text-amber-100"
                    : "text-amber-200/70 hover:bg-amber-400/10 hover:text-amber-100"
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {view === "home" && (
          <section className="mx-auto max-w-2xl py-10 text-center sm:py-16">
            <h1 className="font-serif text-4xl leading-tight text-amber-100 sm:text-6xl">
              Jede Geschichte verdient ein Märchen.
            </h1>
            <p className="mt-5 text-amber-200/70">
              Verwandle euer Kennenlernen in ein animiertes Schattentheater —
              mit Figuren, Kulissen, Kamerafahrten und einem Ende, das ihr selbst wählt.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button type="button" className={btnPrimary} onClick={() => setView("create")}>
                Geschichte erstellen
              </button>
              <button type="button" className={btn} onClick={openDemo}>
                Beispiel ansehen
              </button>
              <button type="button" className={btn} onClick={openInteractive}>
                Interaktives Beispiel
              </button>
            </div>
          </section>
        )}

        {view === "library" && (
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-2xl text-amber-100">Meine Geschichten</h2>
              <div className="flex gap-2">
                <button type="button" className={btn} onClick={() => fileInput.current?.click()}>
                  JSON importieren
                </button>
                <button type="button" className={btnPrimary} onClick={() => setView("create")}>
                  Neue Geschichte
                </button>
              </div>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleImport(f);
                e.target.value = "";
              }}
            />
            {stories.length === 0 ? (
              <p className="mt-6 text-amber-200/60">Noch keine Geschichten gespeichert.</p>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stories.map((s) => (
                  <article key={s.id} className={panel}>
                    <p className="text-xs uppercase tracking-wide text-amber-200/50">
                      {OCCASION_LABELS[s.occasion]} · {STYLE_PRESETS[s.style].name}
                    </p>
                    <h3 className="mt-1 font-serif text-lg text-amber-100">{s.title}</h3>
                    <p className="mt-1 text-xs text-amber-200/60">
                      {s.meta.person1} & {s.meta.person2} · {s.scenes.length} Szenen
                      {s.variantLabel ? ` · Variante: ${s.variantLabel}` : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" className={btn} onClick={() => openStory(s, "theater")}>
                        Abspielen
                      </button>
                      <button type="button" className={btn} onClick={() => openStory(s, "studio")}>
                        Bearbeiten
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-200/90 transition hover:bg-red-400/10"
                        onClick={() => {
                          storage.deleteStory(s.id);
                        }}
                      >
                        Löschen
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {view === "create" && (
          <section className="mx-auto max-w-3xl">
            <h2 className="font-serif text-2xl text-amber-100">Erzähle eure Geschichte</h2>
            <p className="mt-1 text-sm text-amber-200/60">
              Ein ausgefülltes Beispiel ist bereits eingetragen — du kannst es direkt ändern.
            </p>
            <div className={`mt-5 ${panel}`}>
              <StoryForm initial={EXAMPLE_INPUT} onSubmit={handleCreate} />
            </div>
          </section>
        )}

        {view === "characters" && current && (
          <section>
            <h2 className="font-serif text-2xl text-amber-100">Figuren gestalten</h2>
            <p className="mt-1 text-sm text-amber-200/60">
              Änderungen sind sofort in der Vorschau sichtbar.
            </p>
            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
              <div className={panel}>
                <CharacterEditor characters={current.characters} onChange={updateCharacters} />
              </div>
              <div className="space-y-5">
                <div className={panel}>
                  <h3 className="mb-3 font-serif text-lg text-amber-100">Stil & Stimmung</h3>
                  <StyleSelector value={current.style} onChange={updateStyle} />
                </div>
                <div className={panel}>
                  <h3 className="mb-3 font-serif text-lg text-amber-100">Vorschau</h3>
                  <SceneRenderer
                    key={`${current.style}-${sceneIndex}`}
                    scene={current.scenes[Math.min(sceneIndex, current.scenes.length - 1)]}
                    characters={current.characters}
                    style={current.style}
                    playing
                    showCaptions={false}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={btn} onClick={() => setView("create")}>
                    Zurück zum Formular
                  </button>
                  <button type="button" className={btnPrimary} onClick={() => setView("studio")}>
                    Weiter zum Story Studio
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === "studio" && current && scene && (
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl text-amber-100">Story Studio</h2>
                <p className="text-sm text-amber-200/60">{current.title}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={btn} onClick={() => setView("characters")}>
                  Figuren
                </button>
                <button type="button" className={btn} onClick={handleExport}>
                  JSON exportieren
                </button>
                <button type="button" className={btnPrimary} onClick={() => setView("theater")}>
                  ▶ Abspielen
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[220px_1fr_340px]">
              <div className={panel}>
                <h3 className="mb-3 text-sm uppercase tracking-wide text-amber-200/60">Szenen</h3>
                <Timeline
                  scenes={current.scenes}
                  currentIndex={sceneIndex}
                  onSelect={setSceneIndex}
                  onMove={moveScene}
                  onDelete={deleteScene}
                  onAdd={addScene}
                />
              </div>

              <div className="space-y-3">
                <SceneRenderer
                  key={`${scene.id}-${scene.animation}-${scene.camera}`}
                  scene={scene}
                  characters={current.characters}
                  style={current.style}
                  playing
                />
                <p className="text-center text-xs text-amber-200/50">
                  Live-Vorschau der Szene — Änderungen rechts erscheinen sofort.
                </p>
              </div>

              <div className={`${panel} max-h-[70vh] overflow-y-auto`}>
                <h3 className="mb-3 text-sm uppercase tracking-wide text-amber-200/60">
                  Bearbeiten
                </h3>
                <SceneEditor scene={scene} characters={current.characters} onChange={updateScene} />
              </div>
            </div>
          </section>
        )}

        {view === "theater" && current && (
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl text-amber-100">{current.title}</h2>
                <p className="text-sm text-amber-200/60">
                  {STYLE_PRESETS[current.style].name}
                  {current.variantLabel ? ` · ${current.variantLabel}` : ""}
                  {current.interactive ? " · Interaktiv" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={btn} onClick={() => setWhatIfOpen((v) => !v)}>
                  ✨ Was wäre, wenn …?
                </button>
                <button type="button" className={btn} onClick={() => setView("studio")}>
                  Szenen bearbeiten
                </button>
                <button type="button" className={btn} onClick={() => setView("library")}>
                  Meine Geschichten
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
              <div className="st-stage-wrap rounded-xl">
                <TheaterPlayer
                  story={current}
                  autoPlay
                  initialSceneId={current.scenes[sceneIndex]?.id}
                  onSceneChange={setSceneIndex}
                />
              </div>

              <div className="space-y-4">
                {whatIfOpen && (
                  <WhatIfPanel onCreate={handleWhatIf} onClose={() => setWhatIfOpen(false)} />
                )}
                <div className={panel}>
                  <h3 className="font-serif text-lg text-amber-100">Über diese Geschichte</h3>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-amber-200/50">Personen</dt>
                      <dd>{current.meta.person1} & {current.meta.person2}</dd>
                    </div>
                    {current.meta.date && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-amber-200/50">Kennenlernen</dt>
                        <dd>{current.meta.date}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-3">
                      <dt className="text-amber-200/50">Ort</dt>
                      <dd className="text-right">{current.meta.place}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-amber-200/50">Anlass</dt>
                      <dd>{OCCASION_LABELS[current.occasion]}</dd>
                    </div>
                  </dl>
                  {current.variantOf && (
                    <button
                      type="button"
                      className={`${btn} mt-4 w-full`}
                      onClick={() => {
                        const original = storage.getStory(current.variantOf!);
                        if (original) openStory(original, "theater");
                      }}
                    >
                      Zur Originalgeschichte wechseln
                    </button>
                  )}
                </div>
                <div className={panel}>
                  <h3 className="font-serif text-lg text-amber-100">Teilen & Speichern</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={btn}
                      onClick={() => {
                        persist(current);
                        setToast("Geschichte gespeichert.");
                      }}
                    >
                      Speichern
                    </button>
                    <button type="button" className={btn} onClick={handleExport}>
                      JSON exportieren
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-white/10 px-3 py-2 text-sm text-amber-200/40"
                      disabled
                    >
                      PNG-Export · Später verfügbar
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-white/10 px-3 py-2 text-sm text-amber-200/40"
                      disabled
                    >
                      Share-Link · Später verfügbar
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-amber-200/50">
                    Aktueller Stil: {preset.name} · {preset.tagline}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {(view === "characters" || view === "studio" || view === "theater") && !current && (
          <p className="text-amber-200/60">
            Keine Geschichte ausgewählt.{" "}
            <button type="button" className="underline" onClick={() => setView("library")}>
              Meine Geschichten öffnen
            </button>
          </p>
        )}
      </main>

      {toast && (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-amber-400/30 bg-[#1b140d] px-4 py-2 text-sm text-amber-100 shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
