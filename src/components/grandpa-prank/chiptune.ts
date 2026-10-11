// A tiny keygen-style chiptune loop, generated with the Web Audio API.
// No audio assets and no packages: two oscillators (square lead + triangle
// bass) playing a short looping pattern, like the cracktro/keygen tunes of
// the 8/16-bit era.

const BPM = 148;
const STEP = 60 / BPM / 4; // one 16th note

// MIDI notes, 0 = rest. 32 steps = 2 bars.
const LEAD: number[] = [
  69, 72, 76, 81, 79, 76, 72, 76, 69, 72, 76, 81, 83, 81, 79, 76, 65, 69, 72,
  77, 76, 72, 69, 72, 67, 71, 74, 79, 77, 74, 71, 74,
];
// One root per bar (A, A, F, G), struck on the quarter notes.
const BASS_ROOTS = [45, 45, 41, 43];

let ctx: AudioContext | null = null;
let stopFn: (() => void) | null = null;

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export function stopChiptune() {
  if (!stopFn) return;
  stopFn();
  stopFn = null;
}

export function startChiptune() {
  if (stopFn || typeof window === "undefined") return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const audio = new AC();
  ctx = audio;
  // A user gesture already happened (opening the card), so resume is allowed.
  void audio.resume().catch(() => {});

  const master = audio.createGain();
  master.gain.value = 0;
  master.connect(audio.destination);
  master.gain.linearRampToValueAtTime(0.16, audio.currentTime + 0.15);

  const voice = (midi: number, at: number, dur: number, type: OscillatorType, level: number) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.value = midiToFreq(midi);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(level, at + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(gain).connect(master);
    osc.start(at);
    osc.stop(at + dur + 0.02);
  };

  let step = 0;
  let nextTime = audio.currentTime + 0.08;
  const timer = window.setInterval(() => {
    while (nextTime < audio.currentTime + 0.12) {
      const lead = LEAD[step];
      if (lead) voice(lead, nextTime, STEP * 0.9, "square", 0.32);
      if (step % 4 === 0) {
        const root = BASS_ROOTS[Math.floor(step / 8)] ?? BASS_ROOTS[0];
        voice(root, nextTime, STEP * 3.4, "triangle", 0.5);
      }
      nextTime += STEP;
      step = (step + 1) % LEAD.length;
    }
  }, 25);

  stopFn = () => {
    window.clearInterval(timer);
    if (ctx) {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + 0.12);
      const closing = ctx;
      window.setTimeout(() => closing.close().catch(() => {}), 300);
      ctx = null;
    }
  };
}
