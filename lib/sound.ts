// A few small sounds, the kind you'd hear in a classroom: a pencil ticking a mark, a key going
// down, the bell on the desk, a rubber stamp. Each is worked out sample by sample as it plays (no
// recordings, nothing to license) and comes out a little different every time, the way the real
// thing does, so it never sounds like the same beep twice.
export type SoundName = "tick" | "key" | "bell" | "stamp";

let ctx: AudioContext | null = null;
let out: GainNode | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    out = ctx.createGain();
    out.gain.value = 0.55;
    out.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** x, give or take a fraction of itself. */
const near = (x: number, by: number) => x * (1 + (Math.random() * 2 - 1) * by);
const between = (a: number, b: number) => a + Math.random() * (b - a);
const white = () => Math.random() * 2 - 1;

/** Something struck and left to ring: a sine that dies away. */
const ring = (t: number, freq: number, decay: number, phase = 0) => Math.sin(2 * Math.PI * freq * t + phase) * Math.exp(-t / decay);

function render(a: AudioContext, seconds: number, fill: (data: Float32Array, rate: number) => void): AudioBuffer {
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * seconds), a.sampleRate);
  fill(buf.getChannelData(0), a.sampleRate);
  return buf;
}

/** Plays a rendered sound through a chain of filters, each [type, frequency, Q, gain in dB]. */
function play(a: AudioContext, buf: AudioBuffer, volume: number, filters: [BiquadFilterType, number, number, number?][] = []) {
  const src = a.createBufferSource();
  src.buffer = buf;
  let node: AudioNode = src;
  for (const [type, frequency, q, gain] of filters) {
    const f = a.createBiquadFilter();
    f.type = type;
    f.frequency.value = frequency;
    f.Q.value = q;
    if (gain !== undefined) f.gain.value = gain;
    node.connect(f);
    node = f;
  }
  const g = a.createGain();
  g.gain.value = volume;
  node.connect(g);
  g.connect(out!);
  src.start();
}

/**
 * Graphite dragged over paper: noise whose loudness wobbles every millisecond or two as the tip
 * catches the grain, swelling in and trailing off as the pencil lifts.
 */
function scratch(data: Float32Array, rate: number, start: number, length: number, peak: number) {
  const from = Math.floor(start * rate);
  const n = Math.floor(length * rate);
  const grainEvery = Math.floor(rate * between(0.0012, 0.0022));
  let grain = 1;
  for (let i = 0; i < n && from + i < data.length; i++) {
    if (i % grainEvery === 0) grain = between(0.35, 1);
    const x = i / n;
    const shape = Math.pow(Math.sin(Math.PI * Math.min(1, x * 1.6)), 0.6) * (1 - 0.55 * x);
    data[from + i]! += white() * grain * shape * peak;
  }
}

const SOUNDS: Record<SoundName, (a: AudioContext) => void> = {
  // A pencil ticking a mark when a check passes: the tip lands, a short stroke down, a longer one up.
  tick(a) {
    const down = between(0.028, 0.04);
    const gap = between(0.018, 0.032);
    const up = between(0.065, 0.095);
    const buf = render(a, down + gap + up + 0.03, (data, rate) => {
      for (let i = 0; i < rate * 0.004; i++) data[i]! += white() * Math.exp(-i / (rate * 0.0007)) * 0.9;
      scratch(data, rate, 0.002, down, near(0.55, 0.15));
      scratch(data, rate, 0.002 + down + gap, up, near(0.75, 0.15));
    });
    play(a, buf, near(0.32, 0.1), [["highpass", near(1700, 0.1), 0.7], ["peaking", near(4300, 0.12), 1.2, 5], ["lowpass", 9500, 0.7]]);
  },

  // A key going down and coming back up, for Run: the click of the switch, the knock of the keycap
  // on the plate, then a lighter click on the way back.
  key(a) {
    const release = between(0.06, 0.095);
    const body = near(230, 0.1);
    const plate = near(1650, 0.08);
    const buf = render(a, release + 0.05, (data, rate) => {
      const hit = (start: number, loud: number, low: number) => {
        const from = Math.floor(start * rate);
        for (let i = 0; from + i < data.length && i < rate * 0.04; i++) {
          const t = i / rate;
          data[from + i]! += loud * (white() * Math.exp(-t / 0.0011) * 0.8 + ring(t, plate, 0.004) * 0.45 + ring(t, body, 0.012) * low);
        }
      };
      hit(0, near(0.9, 0.1), 0.6);
      hit(release, near(0.45, 0.15), 0.15);
    });
    play(a, buf, near(0.3, 0.1), [["lowpass", 7000, 0.7]]);
  },

  // The bell on Paul's desk when he signs a milestone off. A real bell's overtones don't sit on a
  // neat scale, and each is struck twice a hair apart so it shimmers as it dies away.
  bell(a) {
    const base = near(1780, 0.03);
    const partials: [number, number, number][] = [[1, 0.5, 1.3], [2.32, 0.28, 0.7], [4.25, 0.14, 0.35], [6.63, 0.07, 0.18]];
    const buf = render(a, 2.2, (data, rate) => {
      const phases = partials.map(() => [between(0, 6), between(0, 6)]);
      for (let i = 0; i < data.length; i++) {
        const t = i / rate;
        let s = 0;
        partials.forEach(([ratio, loud, decay], k) => {
          const f = base * ratio;
          s += loud * 0.5 * (ring(t, f, decay, phases[k]![0]) + ring(t, f + near(1.6, 0.4) * ratio, decay, phases[k]![1]));
        });
        if (i < rate * 0.003) s += white() * 0.25 * (1 - i / (rate * 0.003));
        data[i] = s;
      }
    });
    play(a, buf, near(0.16, 0.08), [["highpass", 400, 0.7]]);
  },

  // A rubber stamp when a project ships: the thump into the desk, the slap of the paper under it,
  // and the little unsticking as it comes back up.
  stamp(a) {
    const thump = near(105, 0.08);
    const wood = near(410, 0.08);
    const lift = between(0.12, 0.17);
    const buf = render(a, lift + 0.08, (data, rate) => {
      for (let i = 0; i < rate * 0.18 && i < data.length; i++) {
        const t = i / rate;
        const drop = thump * (1 - 0.35 * Math.min(1, t / 0.06));
        data[i]! += ring(t, drop, 0.045) * 0.8 + ring(t, wood, 0.02) * 0.35 + ring(t, wood * 2.1, 0.008) * 0.12;
        if (t < 0.012) data[i]! += white() * Math.exp(-t / 0.003) * 0.6;
      }
      const from = Math.floor(lift * rate);
      for (let i = 0; from + i < data.length && i < rate * 0.02; i++) data[from + i]! += white() * Math.sin((Math.PI * i) / (rate * 0.02)) * 0.07;
    });
    play(a, buf, near(0.5, 0.08), [["lowpass", 5200, 0.7]]);
  },
};

export function playSound(name: SoundName, enabled: boolean) {
  if (!enabled) return;
  const a = audio();
  if (a) SOUNDS[name](a);
}
