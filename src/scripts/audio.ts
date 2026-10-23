// UI sound and background music. Off by default; the choice is remembered per
// visitor. Ticks are synthesized with Web Audio, so there are no files to load.
//
// This module runs once per visit: the site navigates client-side (Astro's
// ClientRouter), so the AudioContext and the music survive page changes.

const root = document.documentElement;
let ctx: AudioContext | null = null;
let ambient: HTMLAudioElement | null = null;
let lofi: { start(): void; stop(): void } | null = null;
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
  if (!c || c.state !== 'running') return;
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

// Fetch the lofi engine ahead of time so turning audio on starts it instantly.
let lofiModule: Promise<typeof import('./lofi')> | null = null;
const loadLofi = () => (lofiModule ??= import('./lofi'));

// Background music: a recorded loop if one is configured (site.ambient),
// otherwise the generative lofi loop. Must be called from a user gesture the
// first time, because browsers block audio until the visitor interacts.
async function syncMusic() {
  const src = root.dataset.ambient;
  if (src) {
    if (audioOn()) {
      ambient ??= Object.assign(new Audio(src), { loop: true, volume: 0.25 });
      ambient.play().catch(() => {});
    } else {
      ambient?.pause();
    }
    return;
  }
  if (!audioOn()) {
    lofi?.stop();
    return;
  }
  const c = context();
  if (!c) return;
  if (!lofi) lofi = (await loadLofi()).createLofi(c);
  if (audioOn()) lofi.start();
}

function syncButtons() {
  document
    .querySelectorAll('[data-audio-toggle]')
    .forEach((b) => b.setAttribute('aria-pressed', String(audioOn())));
}

export function setAudio(on: boolean) {
  root.dataset.audio = on ? 'on' : 'off';
  try {
    localStorage.setItem('audio', on ? 'on' : 'off');
  } catch {}
  syncButtons();
  syncMusic();
  tick('click');
}

export function initAudio() {
  // Event delegation, so the header buttons keep working after page swaps.
  document.addEventListener('click', (e) => {
    const el = (e.target as Element).closest('a, button, [role="option"], [data-tick]');
    if (!el) return;
    if (el.hasAttribute('data-audio-toggle')) setAudio(!audioOn());
    else tick('click');
  });

  document.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = (e.target as Element).closest('a, button, [role="option"], [data-tick]');
    if (!el || el.contains(e.relatedTarget as Node)) return;
    const now = performance.now();
    if (now - lastHover < 45) return;
    lastHover = now;
    tick('hover');
  });

  document.addEventListener('astro:page-load', syncButtons);

  // The engine is tiny (~4 KB); fetch it once the page is idle so the first
  // toggle starts music immediately.
  setTimeout(loadLofi, 1500);

  if (audioOn()) {
    loadLofi();
    // Returning visitor with audio on: start on their very first interaction
    // (any click, tap, or key), since browsers won't allow it before that.
    const start = () => {
      ['pointerdown', 'keydown', 'touchstart'].forEach((t) => document.removeEventListener(t, start, true));
      syncMusic();
    };
    ['pointerdown', 'keydown', 'touchstart'].forEach((t) => document.addEventListener(t, start, true));
  }
}
