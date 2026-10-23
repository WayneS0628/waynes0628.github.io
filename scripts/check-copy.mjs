// Copy rules check, run before every build.
//   - Fails on em dashes anywhere in site copy (the house style forbids them).
//   - Lists every "TODO: Wayne" placeholder so nothing ships by accident unnoticed.
// Usage: node scripts/check-copy.mjs        (fails on em dashes)
//        node scripts/check-copy.mjs --todos (also prints TODOs)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const exts = /\.(astro|md|mdx|ts|css)$/;
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (exts.test(name)) files.push(p);
  }
})(join(ROOT, 'src'));

const dashes = [];
const todos = [];
for (const file of files) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      const where = `${relative(ROOT, file)}:${i + 1}`;
      if (line.includes('—')) dashes.push(`${where}  ${line.trim()}`);
      if (line.includes('TODO: Wayne')) todos.push(`${where}  ${line.trim().slice(0, 110)}`);
    });
}

if (process.argv.includes('--todos')) {
  console.log(`${todos.length} TODO: Wayne placeholder(s):\n`);
  todos.forEach((t) => console.log('  ' + t));
} else if (todos.length) {
  console.log(`[check-copy] ${todos.length} TODO: Wayne placeholder(s) left. Run "npm run todos" to list them.`);
}

if (dashes.length) {
  console.error('\n[check-copy] Em dashes are not allowed in site copy. Use a comma, colon, period, or parentheses:\n');
  dashes.forEach((d) => console.error('  ' + d));
  process.exit(1);
}
