// Generative lofi loop, synthesized live with Web Audio (no audio files).
// Four-bar progression in C (Fmaj7, Em7, Dm9, Cmaj9) at 70 bpm, with soft
// electric-piano chords, sine bass, swung boom-bap drums, a sparse pentatonic
// melody, tape wobble, and vinyl crackle. Loaded only when audio is turned on.

const BPM = 70;
const STEP = 60 / BPM / 4; // one 16th note
const SWING = 0.045; // seconds added to every off-beat 16th
const VOLUME = 0.16;

const CHORDS: { bass: number; notes: number[] }[] = [
  { bass: 41, notes: [53, 57, 60, 64] }, // Fmaj7
  { bass: 40, notes: [52, 55, 59, 62] }, // Em7
  { bass: 38, notes: [50, 53, 57, 60, 64] }, // Dm9
  { bass: 36, notes: [48, 52, 55, 59, 62] }, // Cmaj9
];
const MELODY = [72, 74, 76, 79, 81, 84]; // C major pentatonic, upper octave
const KICK = new Set([0, 7, 10]);
const SNARE = new Set([4, 12]);

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

export function createLofi(ctx: AudioContext) {
  // master: gain -> warm lowpass -> gentle compression -> out
  const master = ctx.createGain();
  master.gain.value = 0;
  const tone = Object.assign(ctx.createBiquadFilter(), { type: 'lowpass' });
  tone.frequency.value = 3200;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 3;
  master.connect(tone).connect(comp).connect(ctx.destination);

  const keysBus = ctx.createGain();
  keysBus.gain.value = 0.5;
  const keysTone = Object.assign(ctx.createBiquadFilter(), { type: 'lowpass' });
  keysTone.frequency.value = 1500;
  keysBus.connect(keysTone).connect(master);

  const drumBus = ctx.createGain();
  drumBus.gain.value = 0.55;
  const drumTone = Object.assign(ctx.createBiquadFilter(), { type: 'lowpass' });
  drumTone.frequency.value = 4500;
  drumBus.connect(drumTone).connect(master);

  // Tape wobble: a slow LFO on every pitched voice's detune.
  const wow = ctx.createOscillator();
  wow.frequency.value = 0.55;
  const wowDepth = ctx.createGain();
  wowDepth.gain.value = 7; // cents
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
    g.gain.value = 0.22;
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

  function voice(freq: number, t: number, dur: number, peak: number, bus: AudioNode, bright = 0.12) {
    const g = ctx.createGain();
    env(g, t, peak, 0.02, dur, 0.8);
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
      o.stop(t + dur + 1);
    }
  }

  function kick(t: number) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    o.connect(g).connect(drumBus);
    o.start(t);
    o.stop(t + 0.4);
  }

  function hit(t: number, type: BiquadFilterType, freq: number, peak: number, decay: number) {
    const src = Object.assign(ctx.createBufferSource(), { buffer: noise });
    const f = Object.assign(ctx.createBiquadFilter(), { type });
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + decay);
    src.connect(f).connect(g).connect(drumBus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + decay + 0.02);
  }

  let step = 0;
  let next = 0;
  let timer: number | undefined;

  function schedule(t: number, s: number) {
    const bar = Math.floor(s / 16) % CHORDS.length;
    const i = s % 16;
    const chord = CHORDS[bar];
    const barLen = STEP * 16;

    if (i === 0) {
      chord.notes.forEach((n, k) => voice(hz(n), t + k * 0.018, barLen * 0.92, 0.09 + Math.random() * 0.02, keysBus));
    }
    if (i === 0 || i === 8 || (i === 14 && Math.random() < 0.5)) {
      voice(hz(chord.bass), t, STEP * (i === 14 ? 2 : 6), 0.32, master, 0.02);
    }
    if (i % 2 === 0 && Math.random() < 0.22) {
      const n = MELODY[Math.floor(Math.random() * MELODY.length)];
      voice(hz(n), t, STEP * 3, 0.05, keysBus, 0.25);
    }
    if (KICK.has(i)) kick(t);
    if (SNARE.has(i)) {
      hit(t, 'bandpass', 1800, 0.28, 0.2);
    }
    if (i % 2 === 0) hit(t, 'highpass', 7000, i % 4 === 0 ? 0.07 : 0.035 + Math.random() * 0.02, 0.05);
  }

  function tick() {
    // Background tabs throttle timers to ~1 s, so look further ahead there.
    const ahead = document.hidden ? 1.5 : 0.15;
    while (next < ctx.currentTime + ahead) {
      schedule(next + (step % 2 ? SWING : 0), step);
      next += STEP;
      step = (step + 1) % (16 * CHORDS.length);
    }
  }

  return {
    start() {
      if (timer !== undefined) return;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(VOLUME, now + 2.5);
      step = 0;
      next = now + 0.1;
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
      master.gain.linearRampToValueAtTime(0, now + 0.8);
    },
  };
}
