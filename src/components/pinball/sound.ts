import type { SoundCue, SoundEvent } from "./engine";

/**
 * Tiny Web Audio synth for the table's mechanical sounds. Every voice is
 * generated from oscillators and filtered noise, so the app ships no audio
 * assets. The AudioContext is created lazily and unlocked on the first user
 * gesture, as browsers require.
 */
export class PinballAudio {
  muted = false;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;

  /** Must be called from a user gesture so the browser allows playback. */
  resume() {
    const ctx = this.ensure();
    if (ctx.state === "suspended") void ctx.resume();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.5;
  }

  play(events: SoundEvent[]) {
    if (this.muted || events.length === 0) return;
    const ctx = this.ensure();
    if (ctx.state !== "running") return;
    const at = ctx.currentTime + 0.001;
    for (const event of events) this.voice(event.cue, event.detune, at);
  }

  private ensure(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.5;
      this.master.connect(this.ctx.destination);
      this.noise = this.makeNoise(this.ctx);
    }
    return this.ctx;
  }

  private makeNoise(ctx: AudioContext): AudioBuffer {
    const frames = Math.floor(ctx.sampleRate * 0.4);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  /** Pitched blip with an optional glide. */
  private tone(opts: {
    at: number;
    freq: number;
    endFreq?: number;
    type?: OscillatorType;
    dur: number;
    gain?: number;
  }) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type ?? "square";
    osc.frequency.setValueAtTime(opts.freq, opts.at);
    if (opts.endFreq) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(1, opts.endFreq),
        opts.at + opts.dur,
      );
    }
    const peak = opts.gain ?? 0.22;
    gain.gain.setValueAtTime(0.0001, opts.at);
    gain.gain.exponentialRampToValueAtTime(peak, opts.at + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, opts.at + opts.dur);
    osc.connect(gain).connect(this.master!);
    osc.start(opts.at);
    osc.stop(opts.at + opts.dur + 0.02);
  }

  /** Filtered noise burst for the mechanical clicks and clacks. */
  private noiseHit(opts: {
    at: number;
    dur: number;
    freq: number;
    q?: number;
    gain?: number;
  }) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = opts.freq;
    filter.Q.value = opts.q ?? 1;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(opts.gain ?? 0.3, opts.at);
    gain.gain.exponentialRampToValueAtTime(0.0001, opts.at + opts.dur);
    src.connect(filter).connect(gain).connect(this.master!);
    src.start(opts.at);
    src.stop(opts.at + opts.dur + 0.02);
  }

  private voice(cue: SoundCue, detune: number, at: number) {
    switch (cue) {
      case "flipper":
        this.noiseHit({ at, dur: 0.05, freq: 1600 * detune, q: 0.8, gain: 0.16 });
        this.tone({ at, freq: 240 * detune, endFreq: 130 * detune, dur: 0.05, gain: 0.1 });
        break;
      case "launch":
        this.tone({ at, freq: 170, endFreq: 640, type: "sawtooth", dur: 0.16, gain: 0.16 });
        break;
      case "bumper":
        this.tone({ at, freq: 520 * detune, endFreq: 300 * detune, dur: 0.09, gain: 0.2 });
        this.noiseHit({ at, dur: 0.05, freq: 2400, q: 0.7, gain: 0.12 });
        break;
      case "post":
        this.tone({ at, freq: 720 * detune, endFreq: 440 * detune, type: "triangle", dur: 0.06, gain: 0.13 });
        break;
      case "sling":
        this.tone({ at, freq: 300, endFreq: 900, type: "sawtooth", dur: 0.1, gain: 0.15 });
        this.noiseHit({ at, dur: 0.08, freq: 1200, q: 0.8, gain: 0.14 });
        break;
      case "target":
        this.tone({ at, freq: 880 * detune, dur: 0.06, gain: 0.16 });
        this.tone({ at: at + 0.06, freq: 1320 * detune, dur: 0.09, gain: 0.14 });
        break;
      case "jackpot":
        [660, 880, 1100, 1320].forEach((freq, i) =>
          this.tone({ at: at + i * 0.08, freq, type: "triangle", dur: 0.14, gain: 0.18 }),
        );
        break;
      case "drain":
        this.tone({ at, freq: 320, endFreq: 70, type: "sawtooth", dur: 0.4, gain: 0.18 });
        break;
      case "gameover":
        [440, 330, 262, 196].forEach((freq, i) =>
          this.tone({ at: at + i * 0.16, freq, endFreq: freq * 0.9, type: "triangle", dur: 0.3, gain: 0.2 }),
        );
        break;
    }
  }
}
