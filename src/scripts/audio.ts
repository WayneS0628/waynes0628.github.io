// UI sound. Off by default; the choice is remembered per visitor.
// Ticks are synthesized with Web Audio, so there are no files to load.

const root = document.documentElement;
let ctx: AudioContext | null = null;
let ambient: HTMLAudioElement | null = null;
let lastHover = 0;

export const audioOn = () => root.dataset.audio === 'on';

function context(): AudioContext | null {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function tick(kind: 'hover' | 'click' = 'hover') {
  if (!audioOn()) return;
  const c = context();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  const click = kind === 'click';
  osc.type = click ? 'triangle' : 'sine';
  osc.frequency.setValueAtTime(click ? 1250 : 2400, t);
  if (click) osc.frequency.exponentialRampToValueAtTime(620, t + 0.06);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(click ? 0.07 : 0.018, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + (click ? 0.08 : 0.03));
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.1);
}

function syncAmbient() {
  const src = root.dataset.ambient;
  if (!src) return;
  if (audioOn()) {
    ambient ??= Object.assign(new Audio(src), { loop: true, volume: 0.25 });
    ambient.play().catch(() => {
      /* blocked until the next user gesture */
    });
  } else {
    ambient?.pause();
  }
}

export function setAudio(on: boolean) {
  root.dataset.audio = on ? 'on' : 'off';
  try {
    localStorage.setItem('audio', on ? 'on' : 'off');
  } catch {}
  document.querySelectorAll('[data-audio-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(on)));
  syncAmbient();
  tick('click');
}

export function initAudio() {
  document.querySelectorAll('[data-audio-toggle]').forEach((b) => {
    b.setAttribute('aria-pressed', String(audioOn()));
    b.addEventListener('click', () => setAudio(!audioOn()));
  });

  const interactive = 'a, button, [role="option"], [data-tick]';
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = (e.target as Element).closest(interactive);
    if (!el || el.contains(e.relatedTarget as Node)) return;
    const now = performance.now();
    if (now - lastHover < 45) return;
    lastHover = now;
    tick('hover');
  });
  document.addEventListener('click', (e) => {
    const el = (e.target as Element).closest(interactive);
    if (el && !el.hasAttribute('data-audio-toggle')) tick('click');
  });
  // Browsers block audio until a gesture, so resume the ambient loop on the first one.
  document.addEventListener('pointerdown', syncAmbient, { once: true });
}
