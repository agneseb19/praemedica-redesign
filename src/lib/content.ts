import type { ImageMetadata } from 'astro';

/* ---------- tipi dei blocchi estratti (vedi scripts/extract-content.mjs) ---------- */
export type Block =
  | { type: 'heading'; level: number; html: string }
  | { type: 'text'; html: string }
  | { type: 'image'; src: string; alt: string; href?: string }
  | { type: 'iconbox'; title: string; html?: string; href?: string }
  | { type: 'button'; href: string; text: string }
  | { type: 'list'; items: { text: string; href?: string }[] }
  | { type: 'imagebox'; src: string; alt: string; title: string; desc: string }
  | { type: 'headline'; text: string; level: number }
  | { type: 'flip'; front: string; back: string; btn: string; href: string }
  | { type: 'slides'; slides: Slide[] }
  | { type: 'carousel'; slides: Block[][] }
  | { type: 'map'; src: string; title: string }
  | { type: 'form'; labels: string[]; submit: string }
  | { type: 'icon'; href: string }
  | { type: 'social'; items: { href: string; label: string }[] }
  | { type: 'reviews' };

export type Slide = { id: string; alt: string; heading: string; description: string; button: string; href?: string; bg: string };

export type Page = {
  slug: string;
  type: 'page' | 'post';
  title: string;
  date: string;
  seo?: { title?: string; description?: string };
  featured?: { src: string; alt: string };
  blocks: Block[];
};

export type Person = { name: string; nameHtml: string; role?: string; img?: string; alt?: string; cv?: string };

export type Section = {
  id: string;
  titleHtml: string;
  title: string;
  kind: 'default' | 'services' | 'team';
  blocks: Block[];
  people?: Person[];
};

/* ---------- dati ---------- */
const pageModules = import.meta.glob<Page>('/src/data/pages/*.json', { eager: true, import: 'default' });
const imageModules = import.meta.glob<{ default: ImageMetadata }>('/src/assets/wp/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}', { eager: true });

export function getPage(slug: string): Page {
  const p = pageModules[`/src/data/pages/${slug}.json`];
  if (!p) throw new Error(`Pagina non trovata: ${slug}`);
  return p;
}

export function allPages(): Page[] {
  return Object.values(pageModules);
}

/** Restituisce i metadati di un'immagine estratta ("wp/2025/01/foto.jpg"). */
export function getImage(key?: string): ImageMetadata | undefined {
  if (!key) return undefined;
  return imageModules[`/src/assets/${key}`]?.default;
}

/* ---------- utilità testo ---------- */
export const stripTags = (html: string) =>
  html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, '’').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

export function slugify(s: string) {
  return stripTags(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/* ---------- struttura delle pagine articolo ---------- */
const TEAM_RE = /i nostri specialisti/i;
const SERVICES_RE = /servizi offerti/i;

/** Raggruppa image/heading/button consecutivi in schede specialista. */
export function parsePeople(blocks: Block[]): Person[] {
  const people: Person[] = [];
  let cur: Person | null = null;
  for (const b of blocks) {
    if (b.type === 'image') {
      cur = { name: '', nameHtml: '', img: b.src, alt: b.alt };
      people.push(cur);
    } else if (b.type === 'heading' && cur) {
      if (!cur.name) { cur.name = stripTags(b.html); cur.nameHtml = b.html; }
      else cur.role = stripTags(b.html);
    } else if (b.type === 'button' && cur && /\.pdf$/i.test(b.href)) {
      cur.cv = b.href;
    }
  }
  return people.filter((p) => p.name);
}

export type Article = {
  titleHtml: string;
  title: string;
  intro: Block[];
  heroImages: Extract<Block, { type: 'image' }>[];
  sections: Section[];
};

export type Summary = { slug: string; label: string; href: string; img?: string; alt?: string; services: string[]; doctors: string[]; firstSentence: string };

/** Riepilogo di una pagina (foto, prestazioni, medici, prima frase) per elenchi e indici. */
export function summaryOf(href: string, label: string): Summary {
  const slug = href.replace(/\//g, '');
  const page = getPage(slug);
  const a = toArticle(page);
  const flat = (bs: Block[]): Block[] => bs.flatMap((b) => (b.type === 'carousel' ? flat(b.slides.flat()) : [b]));
  let services = a.sections
    .filter((s) => s.kind === 'services')
    .flatMap((s) => flat(s.blocks).filter((b) => b.type === 'iconbox').map((b: any) => b.title as string));
  if (!services.length) {
    services = a.sections.flatMap((s) => flat(s.blocks).filter((b) => b.type === 'list').flatMap((b: any) => b.items.filter((i: any) => !i.href).map((i: any) => i.text)));
  }
  const doctors = a.sections.filter((s) => s.kind === 'team').flatMap((s) => (s.people ?? []).map((p) => p.name));
  const introText = stripTags((a.intro[0] as any)?.html ?? '');
  const firstSentence = (introText.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? introText).trim();
  const img = a.heroImages[0];
  return { slug, label, href, img: img?.src, alt: img?.alt, services, doctors, firstSentence };
}

/**
 * Trasforma la sequenza di blocchi in: hero (h1, intro, immagini) + sezioni (una per ogni h2,
 * più la sezione "I Nostri Specialisti" anche quando è un h3).
 */
export function toArticle(page: Page): Article {
  const blocks = [...page.blocks];
  let i = 0;
  let titleHtml = page.title;
  if (blocks[0]?.type === 'heading' && blocks[0].level === 1) { titleHtml = blocks[0].html; i = 1; }

  const intro: Block[] = [];
  while (i < blocks.length && blocks[i].type === 'text') intro.push(blocks[i++]);
  const heroImages: Extract<Block, { type: 'image' }>[] = [];
  while (i < blocks.length && blocks[i].type === 'image' && heroImages.length < 2) heroImages.push(blocks[i++] as any);

  const sections: Section[] = [];
  let current: Section | null = null;
  const pre: Block[] = [];
  for (; i < blocks.length; i++) {
    const b = blocks[i];
    const isTeam = b.type === 'heading' && TEAM_RE.test(b.html);
    const isH2 = b.type === 'heading' && b.level === 2;
    if (b.type === 'heading' && (isTeam || isH2)) {
      const title = stripTags(b.html);
      current = {
        id: slugify(title) || `sezione-${sections.length + 1}`,
        titleHtml: b.html,
        title,
        kind: isTeam ? 'team' : SERVICES_RE.test(title) ? 'services' : 'default',
        blocks: [],
      };
      sections.push(current);
      continue;
    }
    (current ? current.blocks : pre).push(b);
  }
  if (pre.length) sections.unshift({ id: 'introduzione', titleHtml: '', title: '', kind: 'default', blocks: pre });
  for (const s of sections) if (s.kind === 'team') s.people = parsePeople(s.blocks);
  const seen = new Map<string, number>();
  for (const s of sections) {
    const n = seen.get(s.id) ?? 0;
    seen.set(s.id, n + 1);
    if (n) s.id = `${s.id}-${n + 1}`;
  }
  return { titleHtml, title: stripTags(titleHtml), intro, heroImages, sections };
}

/**
 * Correzioni ai loghi delle convenzioni. Sul sito originale il logo UniSalute (Unknown.jpeg,
 * senza testo alternativo) punta per errore a fasdac.it: qui va al sito di UniSalute.
 */
const LOGO_FIX: Record<string, { href: string; alt: string }> = {
  'Unknown.jpeg': { href: 'https://www.unisalute.it', alt: 'UniSalute' },
};
export function fixLogo<T extends { src: string; href?: string; alt: string }>(logo: T): T {
  const fix = LOGO_FIX[logo.src.split('/').pop() ?? ''];
  return fix ? { ...logo, href: fix.href, alt: logo.alt || fix.alt } : logo;
}
