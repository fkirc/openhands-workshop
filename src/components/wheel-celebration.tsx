"use client";

import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/* Audio: a ridiculous little fanfare, synthesised with Web Audio.      */
/* No audio files, no packages — just oscillators.                      */
/* ------------------------------------------------------------------ */

let audioCtx: AudioContext | null = null;

/** Call inside a user gesture (a click) so later playback is allowed. */
export function resumeAudio() {
  if (typeof window === "undefined") return;
  type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };
  const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
  if (!Ctor) return;
  if (!audioCtx) audioCtx = new Ctor();
  if (audioCtx.state === "suspended") void audioCtx.resume();
}

/** A short note: pitch, start offset, length, waveform, loudness. */
function note(
  ctx: AudioContext,
  freq: number,
  at: number,
  dur: number,
  type: OscillatorType,
  gain: number,
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

/** A firework boom: a noise burst plus a low sine thump. */
function boom(ctx: AudioContext, at: number) {
  const len = Math.floor(ctx.sampleRate * 0.5);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(1800, at);
  lp.frequency.exponentialRampToValueAtTime(300, at + 0.4);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.5, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
  src.connect(lp).connect(g).connect(ctx.destination);
  src.start(at);

  const thump = ctx.createOscillator();
  const tg = ctx.createGain();
  thump.type = "sine";
  thump.frequency.setValueAtTime(120, at);
  thump.frequency.exponentialRampToValueAtTime(40, at + 0.35);
  tg.gain.setValueAtTime(0.6, at);
  tg.gain.exponentialRampToValueAtTime(0.0001, at + 0.4);
  thump.connect(tg).connect(ctx.destination);
  thump.start(at);
  thump.stop(at + 0.45);
}

/** The whole ridiculous Austrian victory jingle — a waltz, naturally. */
export function playFanfare(muted: boolean) {
  if (muted) return;
  resumeAudio();
  if (!audioCtx) return;
  const ctx = audioCtx;
  const t = ctx.currentTime + 0.02;

  // A three-four waltz, oom-pah-pah, then a big held chord on top.
  const melody = [523.25, 659.25, 783.99, 1046.5, 987.77, 1046.5, 1318.51];
  const beat = 0.22;
  melody.forEach((f, i) => {
    // Oom: low root on the downbeat.
    note(ctx, f / 4, t + i * beat * 3, beat * 0.9, "triangle", 0.16);
    // Pah-pah: chord stabs on beats two and three.
    [1.5, 1.25].forEach((mul, j) => {
      note(ctx, f * mul, t + i * beat * 3 + beat * (j + 1), beat * 0.6, "square", 0.08);
    });
    // Lead melody riding on top.
    note(ctx, f, t + i * beat * 3, beat * 1.4, "square", 0.12);
  });

  const chordAt = t + melody.length * beat * 3;
  [523.25, 659.25, 783.99, 1046.5].forEach((f) => {
    note(ctx, f, chordAt, 1.2, "triangle", 0.12);
  });

  // Sparkle: rapid high blips, like a zither run.
  for (let i = 0; i < 14; i++) {
    note(ctx, 1568 + (i % 4) * 220, chordAt + i * 0.05, 0.08, "square", 0.06);
  }

  // Booms, on the beat, for the fireworks.
  boom(ctx, t);
  boom(ctx, t + beat * 3);
  boom(ctx, t + beat * 6);
  boom(ctx, chordAt + 0.1);
}

/* ------------------------------------------------------------------ */
/* Canvas: fireworks, emoji explosions, shockwaves.                     */
/* ------------------------------------------------------------------ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  kind: "spark" | "emoji" | "ring" | "streak";
  text: string;
  rot: number;
  vr: number;
  gravity: number;
  drag: number;
}

interface Burst {
  at: number;
  x: number;
  y: number;
  kind: "firework" | "emoji" | "ring";
}

/** Red-white-red, with a few alpine accents. */
const PALETTE = [
  "#c8102e",
  "#ffffff",
  "#c8102e",
  "#ffffff",
  "#e63946",
  "#ffd400",
  "#00b894",
];

const EMOJI = ["🇦🇹", "🎉", "🎊", "🍰", "☕", "🎿", "🏔️", "💥", "✨", "🍺"];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export function WheelCelebration({
  fireKey,
  muted,
  enabled,
}: {
  fireKey: number;
  muted: boolean;
  enabled: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keep the canvas sized to the viewport (and crisp on retina).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Fire a fresh celebration whenever fireKey changes to a positive value.
  useEffect(() => {
    if (!enabled || fireKey <= 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    playFanfare(muted);

    const particles: Particle[] = [];
    let raf = 0;

    const spawnFirework = (x: number, y: number) => {
      const base = pick(PALETTE);
      const secondary = pick(PALETTE);
      const n = 90;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rand(-0.05, 0.05);
        const speed = rand(90, 430);
        particles.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 0,
          max: rand(0.7, 1.5),
          size: rand(1.5, 4),
          color: Math.random() < 0.5 ? base : secondary,
          kind: Math.random() < 0.15 ? "streak" : "spark",
          text: "",
          rot: 0,
          vr: 0,
          gravity: 320,
          drag: 0.985,
        });
      }
      for (let i = 0; i < 5; i++) {
        const a = rand(0, Math.PI * 2);
        const speed = rand(60, 200);
        particles.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 60,
          life: 0,
          max: rand(1.1, 1.9),
          size: rand(18, 34),
          color: "#fff",
          kind: "emoji",
          text: pick(EMOJI),
          rot: rand(0, Math.PI * 2),
          vr: rand(-4, 4),
          gravity: 260,
          drag: 0.99,
        });
      }
    };

    const spawnEmojiBurst = (x: number, y: number) => {
      for (let i = 0; i < 22; i++) {
        const a = rand(-Math.PI, 0);
        const speed = rand(180, 520);
        particles.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 0,
          max: rand(1.0, 2.0),
          size: rand(20, 44),
          color: "#fff",
          kind: "emoji",
          text: pick(EMOJI),
          rot: rand(0, Math.PI * 2),
          vr: rand(-6, 6),
          gravity: 700,
          drag: 0.995,
        });
      }
    };

    const spawnRing = (x: number, y: number) => {
      particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        life: 0,
        max: 0.8,
        size: 10,
        color: pick(PALETTE),
        kind: "ring",
        text: "",
        rot: 0,
        vr: 0,
        gravity: 0,
        drag: 1,
      });
    };

    // Stagger a volley of fireworks, emoji explosions and shockwaves.
    const now = performance.now();
    const w = window.innerWidth;
    const h = window.innerHeight;
    const bursts: Burst[] = [];
    for (let i = 0; i < 12; i++) {
      bursts.push({
        at: now + i * 130 + rand(0, 60),
        x: rand(w * 0.12, w * 0.88),
        y: rand(h * 0.08, h * 0.55),
        kind: "firework",
      });
    }
    for (let i = 0; i < 6; i++) {
      bursts.push({
        at: now + i * 260 + rand(0, 120),
        x: rand(w * 0.15, w * 0.85),
        y: rand(h * 0.6, h * 0.85),
        kind: "emoji",
      });
    }
    bursts.push({ at: now + 40, x: w / 2, y: h * 0.35, kind: "ring" });
    bursts.push({ at: now + 520, x: w * 0.3, y: h * 0.45, kind: "ring" });
    bursts.push({ at: now + 900, x: w * 0.7, y: h * 0.4, kind: "ring" });

    let last = now;
    const step = (frameNow: number) => {
      const dt = Math.min((frameNow - last) / 1000, 0.05);
      last = frameNow;

      for (let i = bursts.length - 1; i >= 0; i--) {
        if (bursts[i].at <= frameNow) {
          const b = bursts[i];
          bursts.splice(i, 1);
          if (b.kind === "firework") spawnFirework(b.x, b.y);
          else if (b.kind === "emoji") spawnEmojiBurst(b.x, b.y);
          else spawnRing(b.x, b.y);
        }
      }

      ctx.clearRect(0, 0, w, h);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        if (p.life >= p.max) {
          particles.splice(i, 1);
          continue;
        }
        const t = p.life / p.max;

        p.vy += p.gravity * dt;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;

        const fade = 1 - t;
        if (p.kind === "ring") {
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = fade * 0.8;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 8 * fade + 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 20 + t * 320, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.kind === "emoji") {
          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha = Math.min(1, fade * 1.6);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.font = `${p.size}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.text, 0, 0);
          ctx.restore();
        } else if (p.kind === "streak") {
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = fade;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03);
          ctx.stroke();
        } else {
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = fade;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (particles.length > 0 || bursts.length > 0) {
        raf = requestAnimationFrame(step);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };
    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [fireKey, enabled, muted]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}
