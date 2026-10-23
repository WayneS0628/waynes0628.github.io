// A stylized NYC skyline, generated at build time from a fixed seed so it
// never changes between builds. Two layers (far and near) plus a few
// landmarks: One World Trade, the Chrysler crown, and the Empire State spire.

export const W = 1200;
export const H = 240;

type Rect = { x: number; y: number; w: number; h: number };
export type Window = Rect & { twinkle: boolean; delay: number };
export type Layer = { path: string; windows: Window[] };

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// A box from `bottom` up to `top`; `rect` is a box standing on the ground.
const box = (x: number, top: number, w: number, bottom: number) => `M${x} ${bottom}V${top}H${x + w}V${bottom}Z`;
const rect = (x: number, top: number, w: number) => box(x, top, w, H);

// Landmarks as path fragments rooted at the ground.
function oneWTC(x: number) {
  const base = 64, top = 46, h = 190;
  const y = H - h;
  return `M${x} ${H}L${x} ${y + 30}L${x + (base - top) / 2} ${y}L${x + (base + top) / 2} ${y}L${x + base} ${y + 30}L${x + base} ${H}Z` +
    `M${x + base / 2 - 1} ${y}V${y - 34}h2V${y}Z`;
}
function chrysler(x: number) {
  const w = 40, y = H - 150;
  let d = rect(x, y, w);
  // stepped crown, then needle
  d += `M${x + 4} ${y}V${y - 12}H${x + w - 4}V${y}Z`;
  d += `M${x + 9} ${y - 12}Q${x + w / 2} ${y - 40} ${x + w - 9} ${y - 12}Z`;
  d += `M${x + w / 2 - 1} ${y - 30}V${y - 58}h2V${y - 30}Z`;
  return d;
}
function empire(x: number) {
  const w = 54, y = H - 158;
  let d = rect(x, y, w);
  d += box(x + 9, y - 16, w - 18, y);
  d += `M${x + 18} ${y - 16}V${y - 30}H${x + w - 18}V${y - 16}Z`;
  d += `M${x + w / 2 - 1.5} ${y - 30}V${y - 64}h3V${y - 30}Z`;
  return d;
}

function windowsFor(r: Rect, rand: () => number, density: number): Window[] {
  const out: Window[] = [];
  const cols = Math.max(1, Math.floor((r.w - 6) / 7));
  const rows = Math.floor((r.h - 10) / 9);
  const pad = (r.w - cols * 7) / 2 + 2;
  for (let row = 0; row < rows; row++) {
    for (let c = 0; c < cols; c++) {
      if (rand() > density) continue;
      out.push({
        x: +(r.x + pad + c * 7).toFixed(1),
        y: r.y + 8 + row * 9,
        w: 3,
        h: 4,
        twinkle: rand() < 0.12,
        delay: +(rand() * 8).toFixed(2),
      });
    }
  }
  return out;
}

function layer(seed: number, minH: number, maxH: number, density: number, landmarks: [number, (x: number) => string, Rect][]): Layer {
  const rand = rng(seed);
  let path = '';
  const windows: Window[] = [];
  const pending = [...landmarks].sort((a, b) => a[0] - b[0]);
  let x = -10;
  while (x < W + 10) {
    const next = pending[0];
    if (next && x >= next[0] - 12) {
      // Close to (or past) a landmark's spot: place it and continue after it.
      const [lx, draw, body] = pending.shift()!;
      path += draw(lx);
      windows.push(...windowsFor(body, rand, density));
      x = lx + body.w + 3;
      continue;
    }
    let w = 18 + Math.floor(rand() * 34);
    if (next && x + w > next[0] - 2) w = next[0] - 2 - x; // stop short of the landmark
    const h = minH + Math.floor(rand() * (maxH - minH));
    const top = H - h;
    path += rect(x, top, w);
    // occasional setback or rooftop detail
    if (rand() < 0.3) path += box(x + w * 0.25, top - 8, w * 0.5, top);
    if (rand() < 0.15) path += `M${x + w / 2 - 0.75} ${top}V${top - 14}h1.5V${top}Z`;
    windows.push(...windowsFor({ x, y: top, w, h }, rand, density));
    x += w + (rand() < 0.4 ? 0 : 2 + Math.floor(rand() * 4));
  }
  return { path, windows };
}

export const far = layer(7, 50, 120, 0.08, []);
export const near = layer(28, 30, 100, 0.16, [
  [250, oneWTC, { x: 250, y: H - 160, w: 64, h: 160 }],
  [640, chrysler, { x: 640, y: H - 150, w: 40, h: 150 }],
  [760, empire, { x: 760, y: H - 158, w: 54, h: 158 }],
]);
