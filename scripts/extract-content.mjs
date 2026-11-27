/**
 * Estrae i contenuti del sito WordPress originale (praemedica.it) in JSON strutturati
 * e scarica le immagini/PDF alla risoluzione originale.
 *
 * Uso: node scripts/extract-content.mjs [cartella-cache]
 * Fonte: REST API WordPress (pages, posts) + CSS combinato per gli sfondi dello slider.
 */
import * as cheerio from 'cheerio';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CACHE = process.argv[2] || path.join(ROOT, '.cache-wp');
const OUT = path.join(ROOT, 'src/data');
const ASSETS = path.join(ROOT, 'src/assets/wp');
const PUBLIC = path.join(ROOT, 'public');
const UA = { 'User-Agent': 'Mozilla/5.0 (site-migration)' };
const SITE = 'https://praemedica.it';

fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(path.join(OUT, 'pages'), { recursive: true });

async function cached(name, url) {
  const file = path.join(CACHE, name);
  if (!fs.existsSync(file)) {
    const res = await fetch(url, { headers: UA });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return fs.readFileSync(file, 'utf8');
}

/* ---------- media ---------- */
const media = new Map(); // URL originale -> info

/** Converte un URL di WordPress ridimensionato (-1024x576) nell'originale. */
function originalUrl(u) {
  return u.replace(/^http:/, 'https:').replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
}

function registerMedia(u) {
  if (!u) return null;
  if (!/praemedica\.it\/wp-content\/uploads\//.test(u)) return u; // esterno
  const orig = originalUrl(u);
  const rel = orig.split('/wp-content/uploads/')[1];
  const isPdf = /\.pdf$/i.test(rel);
  const local = isPdf ? `/wp-content/uploads/${rel}` : `wp/${rel}`;
  media.set(orig, { local, isPdf, rel, fallback: u.replace(/^http:/, 'https:') });
  return local;
}

async function downloadMedia() {
  const items = [...media.entries()];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const [url, m] = items[i++];
      const dest = m.isPdf ? path.join(PUBLIC, 'wp-content/uploads', m.rel) : path.join(ASSETS, m.rel);
      if (fs.existsSync(dest)) continue;
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      let res = await fetch(url, { headers: UA });
      if (!res.ok) {
        console.warn('  originale non trovato, uso la versione ridimensionata:', url);
        res = await fetch(m.fallback, { headers: UA });
      }
      if (!res.ok) { console.error('  ERRORE download', url); continue; }
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker));
}

/* ---------- sanitizzazione html ---------- */
const KEEP = new Set(['p', 'ul', 'ol', 'li', 'a', 'strong', 'b', 'em', 'i', 'br', 'u']);

function normalizeHref(href) {
  if (!href) return href;
  return href
    .replace(/^https?:\/\/(www\.)?praemedica\.it(?=\/(?!wp-content))/, '')
    .replace(/^https?:\/\/(www\.)?praemedica\.it\/?$/, '/');
}

function cleanHtml($, el) {
  const $$ = cheerio.load(`<root>${$(el).html() || ''}</root>`, null, false);
  $$('script,style,svg,noscript').remove();
  // unwrap ripetuto finché restano solo i tag ammessi
  for (let k = 0; k < 10; k++) {
    let changed = false;
    $$('root *').each((_, n) => {
      if (!KEEP.has(n.tagName?.toLowerCase())) { $$(n).replaceWith($$(n).contents()); changed = true; }
    });
    if (!changed) break;
  }
  $$('root *').each((_, n) => {
    const tag = n.tagName.toLowerCase();
    const href = $$(n).attr('href');
    const target = $$(n).attr('target');
    for (const a of Object.keys(n.attribs || {})) $$(n).removeAttr(a);
    if (tag === 'a' && href) {
      $$(n).attr('href', isUploadPdf(href) ? registerMedia(href) : normalizeHref(href));
      const external = /^https?:/.test(href) && !/praemedica\.it\/(?!wp-content)/.test(href);
      if (external || target === '_blank') { $$(n).attr('target', '_blank'); $$(n).attr('rel', 'noopener'); }
    }
  });
  return ($$('root').html() || '')
    .replace(/ /g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/<p>\s*<\/p>/g, '')
    .trim();
}

const text = ($, el) => $(el).text().replace(/\s+/g, ' ').trim();
const imgSrc = ($img) => $img.attr('data-src') || $img.attr('data-lazy-src') || $img.attr('src');
const isUploadPdf = (h) => /\/wp-content\/uploads\/.+\.pdf$/i.test(h || '');
function hrefOf($a) {
  const h = $a.attr('href');
  if (!h) return undefined;
  return isUploadPdf(h) ? registerMedia(h) : normalizeHref(h);
}

/* ---------- widget -> blocchi ---------- */
function parseWidget($, w, ctx) {
  const type = $(w).attr('data-widget_type')?.replace('.default', '');
  const c = $(w);
  switch (type) {
    case 'heading': {
      const h = c.find('.elementor-heading-title').first();
      const tag = h[0]?.tagName?.toLowerCase();
      const level = /^h[1-6]$/.test(tag) ? +tag[1] : 0;
      const html = cleanHtml($, h);
      return html ? { type: 'heading', level, html } : null;
    }
    case 'text-editor': {
      const html = cleanHtml($, c);
      return html ? { type: 'text', html } : null;
    }
    case 'image': {
      const img = c.find('img').first();
      if (!img.length) return null;
      return { type: 'image', src: registerMedia(imgSrc(img)), alt: img.attr('alt') || '', href: hrefOf(c.find('a').first()) };
    }
    case 'icon-box': {
      const desc = c.find('.elementor-icon-box-description').first();
      return {
        type: 'iconbox',
        title: text($, c.find('.elementor-icon-box-title').first()),
        html: desc.length ? cleanHtml($, desc) : undefined,
        href: hrefOf(c.find('a').first()),
      };
    }
    case 'button': {
      const a = c.find('a').first();
      return { type: 'button', href: hrefOf(a), text: text($, a.find('.elementor-button-text').length ? a.find('.elementor-button-text') : a) };
    }
    case 'icon-list': {
      const items = c.find('li').map((_, li) => ({
        text: text($, $(li).find('.elementor-icon-list-text').length ? $(li).find('.elementor-icon-list-text') : li),
        href: hrefOf($(li).find('a').first()),
      })).get();
      return { type: 'list', items };
    }
    case 'image-box': {
      const img = c.find('img').first();
      return { type: 'imagebox', src: registerMedia(imgSrc(img)), alt: img.attr('alt') || '', title: text($, c.find('.elementor-image-box-title')), desc: text($, c.find('.elementor-image-box-description')) };
    }
    case 'animated-headline': {
      const h = c.find('.elementor-headline').first();
      return { type: 'headline', text: text($, h), level: +(h[0]?.tagName?.[1] || 3) };
    }
    case 'flip-box': {
      return {
        type: 'flip',
        front: text($, c.find('.elementor-flip-box__front .elementor-flip-box__layer__title')),
        back: text($, c.find('.elementor-flip-box__back .elementor-flip-box__layer__title')),
        btn: text($, c.find('.elementor-flip-box__button')),
        href: hrefOf(c.find('[href]').first()),
      };
    }
    case 'slides': {
      const seen = new Set();
      const slides = [];
      c.find('.swiper-slide').each((_, s) => {
        const id = ($(s).attr('class') || '').match(/elementor-repeater-item-[a-z0-9]+/)?.[0];
        if (!id || seen.has(id)) return;
        seen.add(id);
        slides.push({
          id,
          alt: $(s).find('.swiper-slide-bg').attr('aria-label') || '',
          heading: text($, $(s).find('.elementor-slide-heading')),
          description: text($, $(s).find('.elementor-slide-description')),
          button: text($, $(s).find('.elementor-slide-button')),
          href: hrefOf($(s).find('a[href]').first()),
        });
      });
      return { type: 'slides', slides };
    }
    case 'google_maps': {
      const f = c.find('iframe');
      return { type: 'map', src: f.attr('src') || f.attr('data-src'), title: f.attr('title') || '' };
    }
    case 'wpforms': {
      const labels = c.find('label').map((_, l) => text($, l)).get();
      return { type: 'form', labels, submit: text($, c.find('button[type=submit]')) };
    }
    case 'icon':
      return c.find('a').length ? { type: 'icon', href: hrefOf(c.find('a').first()) } : null;
    case 'shortcode':
      return { type: 'reviews' };
    case 'social-icons': {
      const items = c.find('a[href]').map((_, a) => ({ href: $(a).attr('href'), label: text($, a) })).get();
      return items.length ? { type: 'social', items } : null;
    }
    case 'spacer':
    case 'divider':
      return null;
    default:
      ctx.unknown.add(type);
      return null;
  }
}

/** Visita i widget in ordine di documento; i nested-carousel diventano gruppi di slide. */
function walk($, ctx) {
  const blocks = [];
  $('[data-widget_type]').each((_, w) => {
    if ($(w).parents('[data-widget_type="nested-carousel.default"]').length) return;
    if ($(w).attr('data-widget_type') === 'nested-carousel.default') {
      const slides = [];
      $(w).find('.swiper-slide').each((__, s) => {
        if ($(s).parents('.swiper-slide').length) return;
        const inner = [];
        $(s).find('[data-widget_type]').each((___, iw) => {
          const b = parseWidget($, iw, ctx);
          if (b) inner.push(b);
        });
        if (inner.length) slides.push(inner);
      });
      blocks.push({ type: 'carousel', slides });
      return;
    }
    const b = parseWidget($, w, ctx);
    if (b) blocks.push(b);
  });
  return blocks;
}

/* ---------- recensioni (Trustindex) ---------- */
function parseReviews($) {
  const reviews = [];
  $('.ti-review-item').each((_, r) => {
    const $r = $(r);
    const stars = $r.find('.ti-stars img').map((__, s) => $(s).attr('src') || '').get();
    const avatarImg = $r.find('.ti-profile-img img').first();
    reviews.push({
      name: text($, $r.find('.ti-name')),
      rating: stars.filter((s) => /\/f\.svg/.test(s)).length,
      text: cheerio.load(($r.find('.ti-review-content').html() || '').replace(/<br\s*\/?>/gi, '\n')).text()
        .split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n'),
      avatar: (avatarImg.attr('data-src') || avatarImg.attr('src') || '').replace(/^http:/, 'https:'),
    });
  });
  const verified = text($, $('.ti-verified-by-row, .ti-verified-review').first());
  return {
    label: text($, $('.ti-rating-text').first()),
    count: text($, $('.ti-rating-text').eq(1)) || text($, $('.ti-footer .ti-rating-text').first()),
    verified,
    reviews,
  };
}

/* ---------- main ---------- */
const ctx = { unknown: new Set() };
const pages = JSON.parse(await cached('pages.json', `${SITE}/wp-json/wp/v2/pages?per_page=100`));
const posts = JSON.parse(await cached('posts.json', `${SITE}/wp-json/wp/v2/posts?per_page=100`));
const homeHtml = await cached('home.html', `${SITE}/`);
const cssMatch = homeHtml.match(/siteground-optimizer-combined-css-[a-f0-9]+\.css/);
const combinedCss = cssMatch ? await cached('combined.css', `${SITE}/wp-content/uploads/siteground-optimizer-assets/${cssMatch[0]}`) : '';

const index = [];
for (const p of [...pages, ...posts]) {
  const $ = cheerio.load(p.content.rendered);
  const blocks = walk($, ctx);
  for (const b of blocks) {
    if (b.type !== 'slides') continue;
    for (const s of b.slides) {
      const m = combinedCss.match(new RegExp(`${s.id} \\.swiper-slide-bg\\{[^}]*background-image:url\\(([^)]+)\\)`));
      s.bg = m ? registerMedia(m[1]) : null;
    }
  }
  if (blocks.some((b) => b.type === 'reviews')) {
    const r = parseReviews(cheerio.load(homeHtml));
    // avatar salvati in locale (servono da /reviews/…)
    fs.mkdirSync(path.join(PUBLIC, 'reviews'), { recursive: true });
    for (const [n, rv] of r.reviews.entries()) {
      if (!rv.avatar) continue;
      const file = `reviews/avatar-${n + 1}.jpg`;
      const dest = path.join(PUBLIC, file);
      if (!fs.existsSync(dest)) {
        const res = await fetch(rv.avatar.replace(/=w40-h40/, '=w120-h120'), { headers: UA });
        if (res.ok) fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      }
      if (fs.existsSync(dest)) rv.avatar = `/${file}`;
    }
    fs.writeFileSync(path.join(OUT, 'reviews.json'), JSON.stringify(r, null, 2));
  }
  const title = cheerio.load(p.title.rendered).text();
  const data = {
    slug: p.slug,
    type: p.type,
    title,
    date: p.date,
    seo: p.yoast_head_json ? { title: p.yoast_head_json.title, description: p.yoast_head_json.description || p.yoast_head_json.og_description || '' } : undefined,
    blocks,
  };
  if (p.featured_media) {
    try {
      const m = JSON.parse(await cached(`media-${p.featured_media}.json`, `${SITE}/wp-json/wp/v2/media/${p.featured_media}`));
      data.featured = { src: registerMedia(m.source_url), alt: m.alt_text };
    } catch { /* nessuna immagine in evidenza */ }
  }
  fs.writeFileSync(path.join(OUT, 'pages', `${p.slug}.json`), JSON.stringify(data, null, 2));
  index.push({ slug: p.slug, title, type: p.type });
}
fs.writeFileSync(path.join(OUT, 'pages-index.json'), JSON.stringify(index, null, 2));

for (const u of ['2025/01/LOGO.png', '2025/01/cropped-favicon-praemedica-270x270.png']) registerMedia(`${SITE}/wp-content/uploads/${u}`);

/** SiteGround serve alcuni file come WebP pur con estensione .jpg/.png: li riallinea al formato dichiarato. */
async function normalizeFormats() {
  const { default: sharp } = await import('sharp');
  for (const m of media.values()) {
    if (m.isPdf) continue;
    const file = path.join(ASSETS, m.rel);
    if (!fs.existsSync(file)) continue;
    const head = fs.readFileSync(file).subarray(0, 12).toString('latin1');
    if (!(head.startsWith('RIFF') && head.includes('WEBP'))) continue;
    const ext = path.extname(file).toLowerCase();
    const img = sharp(file);
    const buf = ext === '.png' ? await img.png().toBuffer() : await img.jpeg({ quality: 92, mozjpeg: true }).toBuffer();
    fs.writeFileSync(file, buf);
  }
}

console.log('Widget non gestiti:', [...ctx.unknown]);
console.log('Media:', media.size);
await downloadMedia();
await normalizeFormats();
console.log('Fatto. Pagine:', index.length);
