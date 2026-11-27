/**
 * Verifica che TUTTI i contenuti del sito originale siano presenti nel sito generato (dist/).
 * Per ogni pagina WordPress controlla: testi, link, immagini (per nome file) e testi alternativi.
 * Uso: npm run build && npm run verify   (usa la cache creata da extract-content in .cache-wp/)
 */
import * as cheerio from 'cheerio';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CACHE = path.join(ROOT, '.cache-wp');
const DIST = path.join(ROOT, 'dist');

// Frammenti tecnici del plugin WPForms/Trustindex che non sono contenuto (non visibili sul sito originale)
const IGNORE = [/^o dei Trattamento$/i, /^Abilita JavaScript/i, /^Caricamento$/i, /^Google star \d$/i, /^Google$/];

const norm = (s) =>
  s.replace(/​/g, '').replace(/[ \s]+/g, ' ').replace(/[’‘]/g, "'").replace(/[“”]/g, '"').trim().toLowerCase();
const normHref = (h) =>
  (h || '')
    .replace(/^https?:\/\/(www\.)?praemedica\.it(?=\/(?!wp-content))/, '')
    .replace(/^https?:\/\/(www\.)?praemedica\.it\/?$/, '/')
    .replace(/^http:\/\/praemedica\.it/, 'https://praemedica.it')
    .replace(/^https:\/\/praemedica\.it(\/wp-content)/, '$1')
    .replace(/&amp;/g, '&');
const baseName = (u) => path.basename(u).replace(/-\d+x\d+(\.[a-z]+)$/i, '$1').replace(/\.[a-z]+$/i, '').toLowerCase();

function builtFor(slug) {
  const file = slug === 'home' ? path.join(DIST, 'index.html') : path.join(DIST, slug, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(html);
  $('script, style').remove();
  // separa i testi di elementi diversi con uno spazio (come li legge un utente)
  $('body *').each((_, e) => { $(e).append(' '); });
  const text = norm($('body').text());
  const attrs = norm($('[alt],[aria-label],[title]').map((_, e) => [$(e).attr('alt'), $(e).attr('aria-label'), $(e).attr('title')].join(' | ')).get().join(' | '));
  const hrefs = new Set($('a[href], iframe[src]').map((_, a) => normHref($(a).attr('href') || $(a).attr('src'))).get());
  return { html: html.toLowerCase(), text, attrs, hrefs };
}

const pages = [...JSON.parse(fs.readFileSync(path.join(CACHE, 'pages.json'))), ...JSON.parse(fs.readFileSync(path.join(CACHE, 'posts.json')))];
let total = 0;
let missing = 0;

// La home è stata sintetizzata: i suoi testi devono esistere da qualche parte nel sito.
function wholeSite() {
  const files = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f); else if (e.name === 'index.html') files.push(f);
  });
  walk(DIST);
  const parts = files.map((f) => {
    const slug = path.relative(DIST, path.dirname(f)) || 'home';
    return builtFor(slug === '' ? 'home' : slug);
  });
  return {
    html: parts.map((x) => x.html).join(' '),
    text: parts.map((x) => x.text).join(' | '),
    attrs: parts.map((x) => x.attrs).join(' | '),
    hrefs: new Set(parts.flatMap((x) => [...x.hrefs])),
  };
}
let siteCache;
for (const p of pages) {
  const built = p.slug === 'home' ? (siteCache ??= wholeSite()) : builtFor(p.slug);
  const $ = cheerio.load(p.content.rendered);
  $('script, style, svg, noscript').remove();
  const problems = [];

  // testi
  const texts = new Set();
  $('body *').contents().each((_, n) => {
    if (n.type !== 'text') return;
    const t = norm($(n).text());
    if (t.length < 2 || IGNORE.some((r) => r.test(t))) return;
    texts.add(t);
  });
  for (const t of texts) {
    total++;
    if (!built.text.includes(t)) { missing++; problems.push(`TESTO  «${t.slice(0, 110)}»`); }
  }
  // link
  $('a[href]').each((_, a) => {
    const h = normHref($(a).attr('href'));
    if (!h || h === '#') return;
    total++;
    if (!built.hrefs.has(h)) { missing++; problems.push(`LINK   ${h}`); }
  });
  // immagini e alt
  $('img').each((_, img) => {
    const src = $(img).attr('data-src') || $(img).attr('src') || '';
    const alt = norm($(img).attr('alt') || '');
    if (/trustindex|googleusercontent|submit-spin/.test(src)) {
      // stelle/loghi Trustindex e avatar: verificati tramite testi e recensioni
    } else if (src) {
      total++;
      if (!built.html.includes(baseName(src) + '.')) { missing++; problems.push(`IMG    ${baseName(src)}`); }
    }
    if (alt && !IGNORE.some((r) => r.test(alt)) && !/^google star/.test(alt)) {
      total++;
      if (!built.attrs.includes(alt)) { missing++; problems.push(`ALT    «${alt.slice(0, 90)}»`); }
    }
  });

  console.log(`${problems.length ? '✗' : '✓'} ${p.slug.padEnd(28)} ${problems.length ? problems.length + ' mancanti' : 'completo'}`);
  problems.forEach((x) => console.log('    ' + x));
}

// header / footer globali (verificati sulla home)
const home = builtFor('home');
const globals = [
  'Via Prenestina Nuova 307/A', 'Presso edificio ITOP Officine Ortopediche', '00036 – Palestrina – (RM)',
  'Telefono: 0669451836', 'WhatsApp: 3294715527', 'Email: info@praemedica.it',
  'Orari: Lun/Ven 9:00 - 20:00', 'Orari: Sab 9:00 - 13:00', 'ALTA DIAGNOSTICA', 'Moc', 'Mammografia in Tomosintesi',
  'Ortopanoramica', 'PRIVACY', 'Privacy Policy', 'Cookie Policy', 'Copyright © 2025 Praemedica – C.F e P.IVA 17002711004 – Realizzato da',
  'Creation Web', 'PRENOTA ONLINE', 'Prenota un appuntamento online', 'Facebook', 'Instagram',
];
let gMiss = 0;
for (const g of globals) {
  total++;
  if (!home.text.includes(norm(g))) { gMiss++; missing++; console.log(`    GLOBALE «${g}»`); }
}
console.log(`${gMiss ? '✗' : '✓'} header/footer                ${gMiss ? gMiss + ' mancanti' : 'completo'}`);

console.log(`\nControlli: ${total} · Mancanti: ${missing}`);
process.exit(missing ? 1 : 0);
