// A few diegetic sounds, synthesised with Web Audio (no recordings, nothing to license).
// Off by default; played only when the learner turns sound on.
type SoundName = "bell" | "key" | "stamp" | "blip";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function envelope(a: AudioContext, peak: number, attack: number, decay: number): GainNode {
  const g = a.createGain();
  const t = a.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  g.connect(a.destination);
  return g;
}

function noise(a: AudioContext, seconds: number): AudioBufferSourceNode {
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * seconds), a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  return src;
}

const SOUNDS: Record<SoundName, (a: AudioContext) => void> = {
  // The bell over the bakery door: two bright partials, a long ring.
  bell(a) {
    for (const [freq, peak] of [[1318, 0.12], [2637, 0.05], [3951, 0.02]] as const) {
      const o = a.createOscillator();
      o.type = "sine";
      o.frequency.value = freq;
      o.connect(envelope(a, peak, 0.005, 1.4));
      o.start();
      o.stop(a.currentTime + 1.5);
    }
  },
  // A typewriter key for Run.
  key(a) {
    const n = noise(a, 0.04);
    const f = a.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 2400;
    f.Q.value = 3;
    n.connect(f);
    f.connect(envelope(a, 0.18, 0.002, 0.035));
    n.start();
  },
  // A short square-wave blip as a new line of dialogue starts, the way old games did.
  blip(a) {
    const o = a.createOscillator();
    o.type = "square";
    o.frequency.value = 660;
    o.connect(envelope(a, 0.03, 0.002, 0.05));
    o.start();
    o.stop(a.currentTime + 0.06);
  },
  // The stamp thunk when a job ships.
  stamp(a) {
    const o = a.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(140, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(55, a.currentTime + 0.12);
    o.connect(envelope(a, 0.35, 0.004, 0.16));
    o.start();
    o.stop(a.currentTime + 0.2);
    const n = noise(a, 0.05);
    const f = a.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 900;
    n.connect(f);
    f.connect(envelope(a, 0.12, 0.002, 0.05));
    n.start();
  },
};

export function playSound(name: SoundName, enabled: boolean) {
  if (!enabled) return;
  const a = audio();
  if (a) SOUNDS[name](a);
}
