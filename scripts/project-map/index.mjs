// Builds src/data/project-map.json: every published project as a point in 2D.
//
// 1. Embed each project's description (title, summary, task, data, model,
//    stack) with all-MiniLM-L6-v2, mean-pooled and normalized.
// 2. Reduce the 384-dim embeddings to 2D with PCA.
// 3. Record each project's nearest neighbor (cosine similarity) for the
//    connecting lines on the map.
//
// Run with `npm run map` after adding or editing projects, then commit the JSON.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { pipeline, env } from '@huggingface/transformers';

const ROOT = new URL('../../', import.meta.url).pathname;
const DIR = join(ROOT, 'src/content/projects');
const OUT = join(ROOT, 'src/data/project-map.json');
const MODEL = 'Xenova/all-MiniLM-L6-v2';
env.cacheDir = new URL('./.cache', import.meta.url).pathname;

const projects = readdirSync(DIR)
  .filter((slug) => existsSync(join(DIR, slug, 'index.md')))
  .map((slug) => {
    const fm = parse(readFileSync(join(DIR, slug, 'index.md'), 'utf8').split('---')[1]);
    return { id: slug, ...fm };
  })
  .filter((p) => !p.draft);

const text = (p) =>
  [p.title, p.summary, `Task: ${p.task}`, `Data: ${p.data}`, `Model: ${p.model}`, `Stack: ${(p.stack ?? []).join(', ')}`]
    .filter((s) => s && !s.includes('TODO'))
    .join('. ');

const embed = await pipeline('feature-extraction', MODEL, { dtype: 'fp32' });
const vectors = [];
for (const p of projects) {
  const out = await embed(text(p), { pooling: 'mean', normalize: true });
  vectors.push(Array.from(out.data));
}

// PCA via the n x n Gram matrix (n projects << 384 dims), power iteration
// with deflation for the top two components.
const n = vectors.length;
const dim = vectors[0].length;
const mean = Array.from({ length: dim }, (_, j) => vectors.reduce((s, v) => s + v[j], 0) / n);
const X = vectors.map((v) => v.map((x, j) => x - mean[j]));
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
let G = X.map((a) => X.map((b) => dot(a, b)));

function topEigen(M) {
  let v = M.map((_, i) => 1 + i * 0.01);
  let lambda = 0;
  for (let it = 0; it < 500; it++) {
    const w = M.map((row) => dot(row, v));
    const norm = Math.hypot(...w);
    v = w.map((x) => x / norm);
    lambda = norm;
  }
  return { v, lambda };
}

const coords = [];
for (let k = 0; k < 2; k++) {
  const { v, lambda } = topEigen(G);
  // Projection of sample i onto component k = sqrt(lambda) * v_i
  coords.push(v.map((x) => x * Math.sqrt(lambda)));
  G = G.map((row, i) => row.map((g, j) => g - lambda * v[i] * v[j]));
}

// Make the layout stable between runs: flip each axis so its first project is positive.
coords.forEach((axis) => {
  if (axis[0] < 0) axis.forEach((_, i) => (axis[i] *= -1));
});

// Scale both axes together into [0.1, 0.9] so distances stay honest.
const all = coords.flat();
const lo = Math.min(...all);
const hi = Math.max(...all);
const scale = (x) => +(0.1 + (0.8 * (x - lo)) / (hi - lo || 1)).toFixed(4);

const points = projects.map((p, i) => {
  let best = -1;
  let sim = -Infinity;
  vectors.forEach((v, j) => {
    if (j === i) return;
    const s = dot(vectors[i], v);
    if (s > sim) [best, sim] = [j, s];
  });
  return { id: p.id, x: scale(coords[0][i]), y: scale(coords[1][i]), nearest: projects[best]?.id, similarity: +sim.toFixed(3) };
});

writeFileSync(OUT, JSON.stringify({ model: MODEL, method: 'mean-pooled sentence embeddings, PCA to 2D', points }, null, 2) + '\n');
console.log(`Wrote ${points.length} points to ${OUT}`);
points.forEach((p) => console.log(`  ${p.id.padEnd(26)} (${p.x}, ${p.y})  nearest: ${p.nearest} (${p.similarity})`));
