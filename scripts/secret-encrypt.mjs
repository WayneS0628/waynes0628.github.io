// Encrypts the private page content for /secret.
//
//   1. Write the plain content to secret.local.json (gitignored, never commit it).
//      Shape: { "heading": "", "message": "", "videos": [{ "title": "", "url": "" }],
//               "playlist": { "label": "", "url": "" } }
//   2. Run: SECRET_PASSWORD=<digits> node scripts/secret-encrypt.mjs
//      (several accepted passwords: SECRET_PASSWORD="<digits> <digits>")
//   3. Commit src/data/secret.enc.json (ciphertext only).
//
// PBKDF2-SHA256 stretches the password into an AES-256-GCM key. The page
// (src/pages/secret.astro) does the reverse in the browser with WebCrypto.
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const ITERATIONS = 2_000_000;
const root = new URL('..', import.meta.url);
const source = new URL(process.argv[2] ?? 'secret.local.json', root);
const target = new URL('src/data/secret.enc.json', root);

// Same rule as the page: only the digits count, so commas and dashes are fine.
// Several accepted passwords can be given, separated by spaces.
const passwords = (process.env.SECRET_PASSWORD ?? '')
  .split(/\s+/)
  .map((p) => p.replace(/\D/g, ''))
  .filter(Boolean);
if (!passwords.length) {
  console.error('Set SECRET_PASSWORD (digits; separate alternatives with spaces) in the environment.');
  process.exit(1);
}

const content = JSON.parse(readFileSync(source, 'utf8'));
if (!Array.isArray(content.videos)) {
  console.error('Content needs a "videos" array.');
  process.exit(1);
}

const b64 = (bytes) => Buffer.from(bytes).toString('base64');
const plain = new TextEncoder().encode(JSON.stringify(content));
// One salt for every password, so the page stretches the typed password once
// and then tries each entry.
const salt = crypto.getRandomValues(new Uint8Array(16));
const entries = [];
for (const password of passwords) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  );
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);
  entries.push({ iv: b64(iv), data: b64(new Uint8Array(data)) });
}

writeFileSync(target, JSON.stringify({ v: 2, iterations: ITERATIONS, salt: b64(salt), entries }, null, 2) + '\n');
console.log(`Encrypted ${content.videos.length} video(s) for ${entries.length} password(s) into src/data/secret.enc.json`);
