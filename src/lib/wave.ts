// The "signal" behind the site: a clean waveform built from a few sines.
// The hero draws it on the server; the loader adds noise that fades out
// as the fake training loss drops, so it resolves into the same shape.

export function signal(x: number): number {
  // x in [0, 1]; returns roughly [-1, 1], tapered at both ends
  const env = Math.sin(Math.PI * x) ** 0.6;
  const s =
    0.55 * Math.sin(2 * Math.PI * 3 * x) +
    0.3 * Math.sin(2 * Math.PI * 7.2 * x + 1.1) +
    0.15 * Math.sin(2 * Math.PI * 13.5 * x + 0.4);
  return env * s;
}

/** SVG path for the clean signal across a width x height box. */
export function wavePath(width: number, height: number, samples = 240): string {
  const mid = height / 2;
  const amp = height * 0.42;
  let d = '';
  for (let i = 0; i <= samples; i++) {
    const x = i / samples;
    d += `${i ? 'L' : 'M'}${(x * width).toFixed(1)} ${(mid - signal(x) * amp).toFixed(1)}`;
  }
  return d;
}
