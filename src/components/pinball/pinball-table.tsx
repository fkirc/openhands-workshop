"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BOARD_H, BOARD_W, PinballEngine, type GameState } from "./engine";
import { PinballAudio } from "./sound";

const STORAGE_KEY = "fifties-flipper-high-score";
const MUTE_KEY = "fifties-flipper-muted";

interface Hud {
  score: number;
  ballsLeft: number;
  state: GameState;
  highScore: number;
}

function readHighScore(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const value = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(value) ? value : 0;
}

// Sound preference lives in localStorage, exposed as an external store so the
// button reflects it without a hydration mismatch.
const muteListeners = new Set<() => void>();

function subscribeMute(listener: () => void) {
  muteListeners.add(listener);
  return () => {
    muteListeners.delete(listener);
  };
}

function getMuteSnapshot(): boolean {
  return window.localStorage.getItem(MUTE_KEY) === "1";
}

function getMuteServerSnapshot(): boolean {
  return false;
}

function writeMute(muted: boolean) {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // Storage can be unavailable (private mode); the choice stays in memory.
  }
  for (const listener of muteListeners) listener();
}

export function PinballTable() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<PinballEngine | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const audioRef = useRef<PinballAudio | null>(null);
  const muted = useSyncExternalStore(subscribeMute, getMuteSnapshot, getMuteServerSnapshot);
  const [hud, setHud] = useState<Hud>({
    score: 0,
    ballsLeft: 3,
    state: "idle",
    highScore: 0,
  });

  const syncHud = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    setHud((prev) => {
      if (
        prev.score === engine.score &&
        prev.ballsLeft === engine.ballsLeft &&
        prev.state === engine.state &&
        prev.highScore === engine.highScore
      ) {
        return prev;
      }
      return {
        score: engine.score,
        ballsLeft: engine.ballsLeft,
        state: engine.state,
        highScore: engine.highScore,
      };
    });
  }, []);

  // Engine + render loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const engine = new PinballEngine();
    engine.highScore = readHighScore();
    engineRef.current = engine;

    const audio = new PinballAudio();
    audioRef.current = audio;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const params = new URLSearchParams(window.location.search);
    if (params.get("autoplay") === "1") engine.start();

    const frame = (now: number) => {
      const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
      lastRef.current = now;
      engine.step(dt);
      const cues = engine.drainSounds();
      if (cues.length > 0) audioRef.current?.play(cues);
      engine.draw(ctx, canvas.width, canvas.height);
      syncHud();
      rafRef.current = window.requestAnimationFrame(frame);
    };
    rafRef.current = window.requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = 0;
    };
  }, [syncHud]);

  // Persist the high score once a game ends.
  useEffect(() => {
    if (hud.state !== "gameover") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(hud.highScore));
    } catch {
      // Storage can be unavailable (private mode); the score stays in memory.
    }
  }, [hud.state, hud.highScore]);

  // Keep the audio engine in sync with the sound preference.
  useEffect(() => {
    audioRef.current?.setMuted(muted);
  }, [muted]);

  // Keyboard: Z/M or arrow keys drive the flippers.
  useEffect(() => {
    const onKey = (event: KeyboardEvent, pressed: boolean) => {
      const engine = engineRef.current;
      if (!engine) return;
      if (pressed) audioRef.current?.resume();
      const key = event.key.toLowerCase();
      if (key === "z" || key === "arrowleft") {
        engine.setFlipper("left", pressed);
        event.preventDefault();
      } else if (key === "m" || key === "/" || key === "arrowright") {
        engine.setFlipper("right", pressed);
        event.preventDefault();
      } else if (pressed && (key === " " || key === "enter")) {
        if (engine.state !== "playing") engine.start();
        event.preventDefault();
      }
    };
    const down = (e: KeyboardEvent) => onKey(e, true);
    const up = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const start = () => {
    audioRef.current?.resume();
    engineRef.current?.start();
    syncHud();
  };

  const setFlipper = (side: "left" | "right", pressed: boolean) => {
    if (pressed) audioRef.current?.resume();
    engineRef.current?.setFlipper(side, pressed);
  };

  const toggleMute = () => {
    const next = !muted;
    writeMute(next);
    audioRef.current?.setMuted(next);
    if (!next) audioRef.current?.resume();
  };

  return (
    <div className="pinball-cabinet">
      <div className="pinball-marquee">
        <span className="pinball-marquee__title">Fifties Flipper</span>
        <span className="pinball-marquee__sub">Amusement • Coin Op</span>
        <button
          type="button"
          className="pinball-mute"
          aria-pressed={muted}
          aria-label="Toggle sound"
          title={muted ? "Sound off" : "Sound on"}
          onClick={toggleMute}
        >
          {muted ? "🔇" : "🔊"}
          <span className="pinball-mute__label">{muted ? "Off" : "On"}</span>
        </button>
      </div>

      <div className="pinball-hud" aria-live="polite">
        <div className="pinball-hud__item">
          <span className="pinball-hud__label">Score</span>
          <span className="pinball-hud__value">{hud.score.toLocaleString()}</span>
        </div>
        <div className="pinball-hud__item">
          <span className="pinball-hud__label">Ball</span>
          <span className="pinball-hud__value">{Math.max(hud.ballsLeft, 1)}</span>
        </div>
        <div className="pinball-hud__item">
          <span className="pinball-hud__label">High</span>
          <span className="pinball-hud__value">{hud.highScore.toLocaleString()}</span>
        </div>
      </div>

      <div className="pinball-stage">
        <canvas
          ref={canvasRef}
          className="pinball-canvas"
          style={{ aspectRatio: `${BOARD_W} / ${BOARD_H}` }}
          aria-label="Pinball playfield"
        />

        {hud.state !== "playing" && (
          <div className="pinball-overlay">
            {hud.state === "gameover" ? (
              <>
                <p className="pinball-overlay__kicker">Game Over</p>
                <p className="pinball-overlay__score">{hud.score.toLocaleString()}</p>
              </>
            ) : (
              <p className="pinball-overlay__kicker">Ready to Play</p>
            )}
            <button type="button" className="pinball-button" onClick={start}>
              {hud.state === "gameover" ? "Play Again" : "Play Ball"}
            </button>
          </div>
        )}
      </div>

      <div className="pinball-controls">
        <button
          type="button"
          className="pinball-pad"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setFlipper("left", true);
          }}
          onPointerUp={() => setFlipper("left", false)}
          onPointerCancel={() => setFlipper("left", false)}
          onPointerLeave={() => setFlipper("left", false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          Left Flipper
        </button>
        <button
          type="button"
          className="pinball-pad"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setFlipper("right", true);
          }}
          onPointerUp={() => setFlipper("right", false)}
          onPointerCancel={() => setFlipper("right", false)}
          onPointerLeave={() => setFlipper("right", false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          Right Flipper
        </button>
      </div>

      <p className="pinball-hint">
        Keyboard: <kbd>Z</kbd> left flipper · <kbd>M</kbd> right flipper ·{" "}
        <kbd>Space</kbd> play ball
      </p>
    </div>
  );
}
