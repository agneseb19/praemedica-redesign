/**
 * Anteprima su GitHub Pages: il sito vive in una sottocartella (es. /praemedica-redesign/).
 * Astro aggiunge già il prefisso ai propri asset; questo script lo aggiunge ai link assoluti
 * scritti nei contenuti e nei componenti (href="/cardiologia/", src="/brand/logo.png", ...).
 * Uso: BASE_PATH=/praemedica-redesign/ node scripts/prefix-base.mjs
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const base = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');
if (base === '/') process.exit(0);
const strip = base.slice(0, -1); // "/praemedica-redesign"

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

const fix = (url) => (url.startsWith('/') && !url.startsWith('//') && !url.startsWith(base) ? strip + url : url);
let files = 0;
for await (const file of walk('dist')) {
  let html = await readFile(file, 'utf8');
  html = html
    .replace(/\b(href|src|action|poster|content)="(\/[^"]*)"/g, (_, a, u) => `${a}="${fix(u)}"`)
    .replace(/\bsrcset="([^"]*)"/g, (_, list) => `srcset="${list.split(',').map((part) => part.trim().replace(/^\S+/, (u) => fix(u))).join(', ')}"`)
    .replace(/"h":"(\/[^"]*)"/g, (_, u) => `"h":"${fix(u)}"`);
  await writeFile(file, html);
  files++;
}
console.log(`prefisso ${base} applicato a ${files} pagine`);
