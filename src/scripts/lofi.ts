// Generative lofi hip-hop loop, synthesized live with Web Audio (no audio files).
// Four-bar progression in F minor (Fm9, Bbm9, Dbmaj9, C7#9) at 88 bpm: chopped
// electric-piano stabs, a bouncing sine bass, punchy swung boom-bap drums with
// ghost notes, a syncopated minor-pentatonic hook on a soft flute-like voice,
// a little sidechain pump, tape wobble, and vinyl crackle. Loaded only when audio is turned on.

const BPM = 88;
const STEP = 60 / BPM / 4; // one 16th note
const SWING = 0.028; // seconds added to every off-beat 16th
const VOLUME = 0.16;
const BARS = 4;

const CHORDS: { bass: number; notes: number[] }[] = [
  { bass: 41, notes: [56, 60, 63, 67] }, // Fm9 (rootless)
  { bass: 46, notes: [56, 60, 61, 65] }, // Bbm9
  { bass: 37, notes: [53, 56, 60, 63] }, // Dbmaj9 (rootless)
  { bass: 36, notes: [52, 55, 58, 63] }, // C7#9
];

// Chord stabs, like a chopped sample: [16th step, length in 16ths].
const STABS: [number, number][] = [[0, 5], [7, 2], [10, 4]];

// Bass line per bar: [step, semitones above the root, length in 16ths].
// Step 14 is a chromatic approach into the next bar's root.
const BASS: [number, number, number][] = [[0, 0, 3], [3, 0, 1], [6, 7, 2], [8, 12, 2], [11, 0, 2]];

// The hook: [bar, step, midi note, length in 16ths]. Plays every other loop.
// F minor pentatonic, landing on E natural over the C7#9 to pull back home.
const HOOK: [number, number, number, number][] = [
  [0, 3, 80, 1], [0, 4, 77, 2], [0, 6, 75, 2], [0, 9, 77, 1], [0, 10, 80, 3],
  [1, 3, 82, 1], [1, 4, 80, 2], [1, 6, 77, 2], [1, 11, 75, 1], [1, 12, 77, 3],
  [2, 3, 84, 1], [2, 4, 82, 2], [2, 6, 80, 2], [2, 9, 77, 1], [2, 10, 80, 2], [2, 13, 84, 2],
  [3, 2, 82, 2], [3, 4, 79, 2], [3, 7, 76, 3], [3, 11, 79, 1], [3, 12, 72, 3],
];

// Drums per bar (16 steps). Odd bars swap in a busier kick for bounce.
const KICK = [new Set([0, 7, 10]), new Set([0, 3, 8, 10, 15])];
const SNARE = new Set([4, 12]);
const GHOST = new Set([7, 11, 14]);

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

export function createLofi(ctx: AudioContext) {
  // master: gain -> warm lowpass -> glue compression -> out
  const master = ctx.createGain();
  master.gain.value = 0;
  const tone = Object.assign(ctx.createBiquadFilter(), { type: 'lowpass' });
  tone.frequency.value = 3800;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.ratio.value = 4;
  comp.attack.value = 0.01;
  comp.release.value = 0.15;
  master.connect(tone).connect(comp).connect(ctx.destination);

  const KEYS_LEVEL = 0.5;
  const keysBus = ctx.createGain();
  keysBus.gain.value = KEYS_LEVEL;
  const keysTone = Object.assign(ctx.createBiquadFilter(), { type: 'lowpass' });
  keysTone.frequency.value = 1700;
  keysBus.connect(keysTone).connect(master);

  const drumBus = ctx.createGain();
  drumBus.gain.value = 0.7;
  const drumTone = Object.assign(ctx.createBiquadFilter(), { type: 'lowpass' });
  drumTone.frequency.value = 5500;
  drumBus.connect(drumTone).connect(master);

  // Tape wobble: a slow LFO on every pitched voice's detune.
  const wow = ctx.createOscillator();
  wow.frequency.value = 0.55;
  const wowDepth = ctx.createGain();
  wowDepth.gain.value = 6; // cents
  wow.connect(wowDepth);
  wow.start();

  const noise = (() => {
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  })();

  // Vinyl: quiet hiss plus random crackle, on a 3 s loop.
  const vinyl = (() => {
    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * 0.06;
      if (Math.random() < 0.0004) d[i] += (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.5);
    }
    const src = Object.assign(ctx.createBufferSource(), { buffer: buf, loop: true });
    const hp = Object.assign(ctx.createBiquadFilter(), { type: 'highpass' });
    hp.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.value = 0.2;
    src.connect(hp).connect(g).connect(master);
    return src;
  })();
  vinyl.start();

  function env(g: GainNode, t: number, peak: number, attack: number, hold: number, release: number) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.setTargetAtTime(peak * 0.55, t + attack, hold / 3);
    g.gain.setTargetAtTime(0.0001, t + hold, release / 4);
  }

  function voice(freq: number, t: number, dur: number, peak: number, bus: AudioNode, bright = 0.12, release = 0.5) {
    const g = ctx.createGain();
    env(g, t, peak, 0.012, dur, release);
    g.connect(bus);
    for (const [type, mult, level] of [['sine', 1, 1], ['triangle', 2, bright]] as const) {
      const o = Object.assign(ctx.createOscillator(), { type });
      o.frequency.value = freq * mult;
      wowDepth.connect(o.detune);
      o.onended = () => wowDepth.disconnect(o.detune); // let finished notes be collected
      const lg = ctx.createGain();
      lg.gain.value = level;
      o.connect(lg).connect(g);
      o.start(t);
      o.stop(t + dur + release + 0.2);
    }
  }

  function kick(t: number, peak = 1) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.09);
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    o.connect(g).connect(drumBus);
    o.start(t);
    o.stop(t + 0.34);
    // Sidechain pump: duck the keys under each kick.
    keysBus.gain.setValueAtTime(KEYS_LEVEL * 0.55, t);
    keysBus.gain.linearRampToValueAtTime(KEYS_LEVEL, t + 0.16);
  }

  function hit(t: number, type: BiquadFilterType, freq: number, peak: number, decay: number, q = 1) {
    const src = Object.assign(ctx.createBufferSource(), { buffer: noise });
    const f = Object.assign(ctx.createBiquadFilter(), { type });
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + decay);
    src.connect(f).connect(g).connect(drumBus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + decay + 0.02);
  }

  function snare(t: number, peak: number) {
    hit(t, 'bandpass', 1900, peak, 0.18, 0.8);
    // Body: a short pitched thump under the noise.
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(230, t);
    o.frequency.exponentialRampToValueAtTime(160, t + 0.08);
    g.gain.setValueAtTime(peak * 0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    o.connect(g).connect(drumBus);
    o.start(t);
    o.stop(t + 0.12);
  }

  let step = 0;
  let loop = 0;
  let next = 0;
  let timer: number | undefined;

  function schedule(t: number, s: number) {
    const bar = Math.floor(s / 16);
    const i = s % 16;
    const chord = CHORDS[bar];

    // Keys: chopped stabs, slightly strummed.
    for (const [at, len] of STABS) {
      if (i !== at) continue;
      const peak = (at === 0 ? 0.1 : 0.075) + Math.random() * 0.015;
      chord.notes.forEach((n, k) => voice(hz(n), t + k * 0.012, STEP * len, peak, keysBus, 0.14, 0.35));
    }

    // Bass.
    for (const [at, interval, len] of BASS) {
      if (i === at) voice(hz(chord.bass + interval), t, STEP * len, 0.3, master, 0.05, 0.12);
    }
    if (i === 14 && Math.random() < 0.7) {
      const nextRoot = CHORDS[(bar + 1) % BARS].bass;
      voice(hz(nextRoot - 1), t, STEP * 1.5, 0.24, master, 0.05, 0.1);
    }

    // Hook on odd loops; on even loops, a few random notes from it as answers.
    for (const [b, at, n, len] of HOOK) {
      if (b !== bar || i !== at) continue;
      if (loop % 2 === 1 || Math.random() < 0.18) voice(hz(n), t, STEP * len, 0.065, keysBus, 0.04, 0.45);
    }

    // Drums.
    if (KICK[bar % 2].has(i)) kick(t, i === 15 ? 0.6 : 1);
    if (SNARE.has(i)) snare(t, 0.32);
    else if (GHOST.has(i) && Math.random() < 0.45) hit(t, 'bandpass', 2100, 0.07, 0.07, 0.8);
    if (i === 14 && bar % 2 === 1) {
      hit(t, 'highpass', 6500, 0.05, 0.22); // open hat
    } else if (i % 2 === 0) {
      hit(t, 'highpass', 7500, i % 4 === 0 ? 0.08 : 0.05 + Math.random() * 0.02, 0.045);
    } else if (Math.random() < 0.35) {
      hit(t, 'highpass', 8500, 0.025, 0.03); // 16th shuffle
    }
  }

  function tick() {
    // Background tabs throttle timers to ~1 s, so look further ahead there.
    const ahead = document.hidden ? 1.5 : 0.15;
    while (next < ctx.currentTime + ahead) {
      schedule(next + (step % 2 ? SWING : 0), step);
      next += STEP;
      step = (step + 1) % (16 * BARS);
      if (step === 0) loop++;
    }
  }

  return {
    start() {
      if (timer !== undefined) return;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(VOLUME, now + 0.5);
      step = 0;
      loop = 0;
      next = now + 0.03;
      tick();
      timer = window.setInterval(tick, 25);
    },
    stop() {
      if (timer === undefined) return;
      window.clearInterval(timer);
      timer = undefined;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.4);
    },
  };
}
