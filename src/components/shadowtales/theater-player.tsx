"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Story } from "@/lib/shadowtales/types";
import { SceneRenderer } from "./scene-renderer";

/**
 * The theatre player: owns scene timing, play/pause/restart, scene stepping,
 * fullscreen and interactive choices. All visuals live in `SceneRenderer`, so
 * the studio preview and the distraction-free theatre mode stay identical.
 */

interface TheaterPlayerProps {
  story: Story;
  /** Autoplay when the player is mounted. */
  autoPlay?: boolean;
  /** Start at this scene id instead of the first scene. */
  initialSceneId?: string;
  onSceneChange?: (index: number) => void;
  className?: string;
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function TheaterPlayer({
  story,
  autoPlay = false,
  initialSceneId,
  onSceneChange,
  className,
}: TheaterPlayerProps) {
  const startIndex = Math.max(
    0,
    story.scenes.findIndex((s) => s.id === initialSceneId),
  );
  const [index, setIndex] = useState(startIndex);
  const [playing, setPlaying] = useState(autoPlay);
  const [elapsed, setElapsed] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const scene = story.scenes[index];
  const duration = scene?.duration ?? 8;

  // Scene clock. Advancing is handled by the tick itself (an event, not an
  // effect body), which keeps the render loop free of synchronous setState.
  useEffect(() => {
    if (!playing || !scene) return;
    const timer = window.setInterval(() => {
      setElapsed((prev) => {
        const next = Number((prev + 0.1).toFixed(2));
        if (next < duration) return next;
        if (scene.choice) {
          setPlaying(false);
          return duration;
        }
        if (index < story.scenes.length - 1) {
          setIndex((i) => i + 1);
          return 0;
        }
        setPlaying(false);
        return duration;
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing, scene, duration, index, story.scenes.length]);

  useEffect(() => {
    onSceneChange?.(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= story.scenes.length) return;
      setIndex(next);
      setElapsed(0);
    },
    [story.scenes.length],
  );

  const restart = useCallback(() => {
    setIndex(0);
    setElapsed(0);
    setPlaying(true);
  }, []);

  const chooseOption = useCallback(
    (nextSceneId: string) => {
      const next = story.scenes.findIndex((s) => s.id === nextSceneId);
      if (next < 0) return;
      setIndex(next);
      setElapsed(0);
      setPlaying(true);
    },
    [story.scenes],
  );

  const toggleFullscreen = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  }, []);

  if (!scene) {
    return <p className="text-amber-200">Diese Geschichte enthält noch keine Szenen.</p>;
  }

  const progress = Math.min(100, (elapsed / duration) * 100);
  const sceneProgress =
    story.scenes.length > 1 ? ((index + elapsed / duration) / story.scenes.length) * 100 : 100;

  const controlBtn =
    "inline-flex items-center gap-1.5 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-sm text-amber-50 transition hover:bg-amber-400/25 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className={className}>
      <div ref={stageRef} className="relative overflow-hidden rounded-xl bg-black">
        <SceneRenderer
          key={scene.id}
          scene={scene}
          characters={story.characters}
          style={story.style}
          playing={playing}
          elapsed={elapsed}
          onChoose={story.interactive ? chooseOption : undefined}
        />

        {/* scene badge */}
        <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-black/50 px-3 py-1 text-xs text-amber-100 backdrop-blur-sm">
          Szene {index + 1} / {story.scenes.length} · {scene.title}
        </div>

        {/* per-scene progress bar */}
        <div className="absolute inset-x-0 bottom-0 z-20 h-1 bg-black/40">
          <div
            className="h-full bg-amber-400 transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* story progress */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-amber-500/70 transition-[width] duration-200" style={{ width: `${sceneProgress}%` }} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={controlBtn}
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
        >
          ◀ Zurück
        </button>
        <button
          type="button"
          className={`${controlBtn} bg-amber-400/25 font-medium`}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? "❚❚ Pause" : "▶ Abspielen"}
        </button>
        <button type="button" className={controlBtn} onClick={restart}>
          ⟲ Neustart
        </button>
        <button
          type="button"
          className={controlBtn}
          onClick={() => goTo(index + 1)}
          disabled={index >= story.scenes.length - 1}
        >
          Weiter ▶
        </button>
        <span className="ml-auto text-xs tabular-nums text-amber-200/80">
          {formatTime(elapsed)} / {formatTime(duration)}
        </span>
        <button type="button" className={controlBtn} onClick={toggleFullscreen}>
          ⛶ Vollbild
        </button>
      </div>
    </div>
  );
}
