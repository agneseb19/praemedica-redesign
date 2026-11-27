/**
 * Interazioni: barra, menu, dimensione del testo, "Aperto ora", ricerca,
 * vetrina dell'alta diagnostica, pulsante Doctolib, modulo contatti, ancore.
 */
import { site } from '../data/site';

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const lenis = () => (window as any).__lenis as { stop(): void; start(): void; scrollTo(t: any, o?: any): void } | undefined;

/* ---------- barra ---------- */
const header = $('[data-header]');
const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- menu (tablet e telefono) ---------- */
const menuBtn = $<HTMLButtonElement>('[data-menu-toggle]');
const menu = $('[data-mobile-menu]');
function toggleMenu(force?: boolean) {
  if (!menuBtn || !menu) return;
  const open = force ?? menuBtn.getAttribute('aria-expanded') !== 'true';
  menuBtn.setAttribute('aria-expanded', String(open));
  const label = $('.bar__menu-label', menuBtn);
  if (label) label.textContent = open ? 'Chiudi' : 'Menu';
  if (open && header) menu.style.setProperty('--mm-top', `${$('.bar__in', header)!.getBoundingClientRect().bottom}px`);
  menu.hidden = !open;
  document.documentElement.style.overflow = open ? 'hidden' : '';
  if (open) lenis()?.stop(); else lenis()?.start();
}
menuBtn?.addEventListener('click', () => toggleMenu());
menu?.addEventListener('click', (e) => { if ((e.target as Element).closest('a')) toggleMenu(false); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuBtn?.getAttribute('aria-expanded') === 'true') { toggleMenu(false); menuBtn.focus(); }
});

/* ---------- dimensione del testo ---------- */
const SIZES = ['', 'lg', 'xl'];
$$<HTMLButtonElement>('[data-text-size]').forEach((b) =>
  b.addEventListener('click', () => {
    const d = document.documentElement;
    const i = SIZES.indexOf(d.dataset.text ?? '');
    const next = SIZES[Math.max(0, Math.min(SIZES.length - 1, i + (b.dataset.textSize === 'up' ? 1 : -1)))];
    if (next) d.dataset.text = next; else delete d.dataset.text;
    try { localStorage.setItem('pm-text', next); } catch { /* memoria non disponibile */ }
    window.dispatchEvent(new Event('resize'));
  }),
);

/* ---------- "Aperto ora" (ora di Roma) ---------- */
const DAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const fmt = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
function openStatus() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const today = site.hours.schedule.find(([d]) => d === day);
  if (today && mins >= today[1] && mins < today[2]) return { open: true, text: `Aperto ora, chiude alle ${fmt(today[2])}` };
  for (let k = 0; k < 8; k++) {
    const d = (day + k) % 7;
    const s = site.hours.schedule.find(([x]) => x === d);
    if (!s || (k === 0 && mins >= s[1])) continue;
    return { open: false, text: `Chiuso ora, riapre ${k === 0 ? 'oggi' : k === 1 ? 'domani' : DAYS[d]} alle ${fmt(s[1])}` };
  }
  return { open: false, text: 'Chiuso ora' };
}
function updateOpen() {
  const s = openStatus();
  $$('[data-open-badge]').forEach((el) => {
    el.classList.toggle('is-open', s.open);
    const t = $('[data-open-text]', el);
    if (t) t.textContent = s.text;
  });
}
updateOpen();
setInterval(updateOpen, 60_000);

/* ---------- ricerca ---------- */
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
$$<HTMLInputElement>('[data-filter-input]').forEach((inp) => {
  const key = inp.dataset.filterInput!;
  inp.addEventListener('input', () => {
    const q = norm(inp.value);
    let visible = 0;
    $$(`[data-filter-list="${key}"] [data-filter-item]`).forEach((it) => {
      const ok = norm(it.dataset.name ?? '').includes(q);
      it.hidden = !ok;
      if (ok) visible++;
    });
    const empty = $(`[data-filter-empty="${key}"]`);
    if (empty) empty.hidden = visible > 0;
    const count = $(`[data-filter-count="${key}"]`);
    if (count) count.textContent = String(visible);
    window.dispatchEvent(new CustomEvent('pm:filtered'));
  });
  // ricerca arrivata dalla home (/specializzazioni/?q=…)
  const q = new URLSearchParams(location.search).get('q');
  if (q) { inp.value = q; inp.dispatchEvent(new Event('input')); }
});

/* ---------- pannello Specializzazioni: anteprima della voce indicata ---------- */
$$('[data-mega]').forEach((panel) => {
  $$<HTMLElement>('[data-preview]', panel).forEach((a) => {
    const show = () => $$<HTMLElement>('[data-preview-pic]', panel).forEach((p) => p.classList.toggle('is-on', p.dataset.previewPic === a.dataset.preview));
    a.addEventListener('pointerenter', show);
    a.addEventListener('focus', show);
  });
});

/* ---------- scegli e cambia immagine (specializzazioni, alta diagnostica) ---------- */
$$('[data-switch]').forEach((root) => {
  const btns = $$<HTMLElement>('[data-switch-btn]', root);
  const beam = $('[data-switch-beam]', root);
  let current = '0';
  const select = (i: string) => {
    if (i === current) return;
    current = i;
    btns.forEach((b) => {
      b.classList.toggle('is-on', b.dataset.switchBtn === i);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', String(b.dataset.switchBtn === i));
    });
    $$('[data-switch-pane]', root).forEach((p) => p.classList.toggle('is-on', p.dataset.switchPane === i));
    if (beam) { beam.classList.remove('is-run'); void beam.offsetWidth; beam.classList.add('is-run'); }
  };
  (root as any).__select = select;
  const clickOnly = root.hasAttribute('data-switch-click');
  btns.forEach((b) => {
    if (!clickOnly) {
      b.addEventListener('pointerenter', () => select(b.dataset.switchBtn!));
      b.addEventListener('focus', () => select(b.dataset.switchBtn!));
    }
    if (b.tagName === 'BUTTON') b.addEventListener('click', () => select(b.dataset.switchBtn!));
  });
});

/* ---------- sequenza fotografica (hero) ---------- */
$$('[data-slides]').forEach((root) => {
  const slides = $$('[data-slide]', root);
  const caps = $$('[data-slide-cap]', root);
  const btn = $<HTMLButtonElement>('[data-slides-pause]', root);
  if (slides.length < 2) return;
  let i = 0, paused = document.documentElement.classList.contains('reduced'), timer: number | undefined;
  const go = (n: number) => {
    slides[i].classList.remove('is-on'); caps[i]?.classList.remove('is-on');
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('is-on'); caps[i]?.classList.add('is-on');
    root.style.setProperty('--n', String(i));
    plan();
  };
  const plan = () => { clearTimeout(timer); if (!paused && !document.hidden) timer = window.setTimeout(() => go(i + 1), 6000); };
  btn?.addEventListener('click', () => {
    paused = !paused;
    btn.setAttribute('aria-pressed', String(paused));
    btn.setAttribute('aria-label', paused ? 'Riprendi le immagini' : 'Ferma le immagini');
    plan();
  });
  $('[data-slides-next]', root)?.addEventListener('click', () => go(i + 1));
  $('[data-slides-prev]', root)?.addEventListener('click', () => go(i - 1));
  document.addEventListener('visibilitychange', plan);
  plan();
});

/* ---------- recensioni: una alla volta ---------- */
$$('[data-quotes]').forEach((root) => {
  const items = $$('[data-quote]', root);
  const count = $('[data-quote-n]', root);
  let i = 0;
  const go = (n: number) => {
    items[i].classList.remove('is-on'); items[i].setAttribute('aria-hidden', 'true');
    i = (n + items.length) % items.length;
    items[i].classList.add('is-on'); items[i].removeAttribute('aria-hidden');
    if (count) count.textContent = `${i + 1} / ${items.length}`;
  };
  $('[data-quote-prev]', root)?.addEventListener('click', () => go(i - 1));
  $('[data-quote-next]', root)?.addEventListener('click', () => go(i + 1));
});

/* ---------- pulsante Doctolib: compare dopo la prima schermata ---------- */
const doc = $('[data-doctolib]');
if (doc) {
  const showDoc = () => doc.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8);
  showDoc();
  window.addEventListener('scroll', showDoc, { passive: true });
}

/* ---------- indice delle pagine interne: voce attiva ---------- */
const tocLinks = $$<HTMLAnchorElement>('[data-toc] a');
if (tocLinks.length && 'IntersectionObserver' in window) {
  const map = new Map(tocLinks.map((a) => [a.getAttribute('href')!.slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      tocLinks.forEach((l) => l.removeAttribute('aria-current'));
      map.get(en.target.id)?.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  $$('[data-toc-section]').forEach((s) => io.observe(s));
}

/* ---------- modulo contatti ---------- */
$$<HTMLFormElement>('[data-ajax-form]').forEach((form) => {
  const status = $('[data-form-status]', form)!;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const btn = $<HTMLButtonElement>('button[type=submit]', form)!;
    btn.disabled = true;
    status.className = 'form-status';
    status.textContent = 'Invio in corso…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Errore');
      form.reset();
      status.textContent = 'Richiesta inviata. Ti ricontatteremo nel più breve tempo possibile.';
    } catch {
      status.classList.add('is-error');
      status.innerHTML = `Invio non riuscito. Riprova, oppure chiama il <a href="${site.phone.href}">${site.phone.label}</a>.`;
    } finally {
      btn.disabled = false;
    }
  });
});

/* ---------- ricerca rapida (home): specializzazioni, esami, medici ---------- */
$$('[data-search]').forEach((box) => {
  const input = $<HTMLInputElement>('[data-search-input]', box)!;
  const out = $('[data-search-results]', box)!;
  const index: { t: string; k: string; h: string; x: string }[] = JSON.parse($('[data-search-index]', box)?.textContent || '[]');
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  const render = () => {
    const q = norm(input.value);
    if (q.length < 2) { out.hidden = true; out.innerHTML = ''; return; }
    const hits = index
      .map((r) => ({ r, s: norm(r.t).startsWith(q) ? 0 : norm(r.t).includes(q) ? 1 : norm(`${r.k} ${r.x}`).includes(q) ? 2 : 9 }))
      .filter((m) => m.s < 9).sort((a, b) => a.s - b.s).slice(0, 8);
    out.innerHTML = hits.length
      ? hits.map(({ r }) => `<li><a href="${esc(r.h)}"><span>${esc(r.t)}</span><small>${esc(r.k)}</small></a></li>`).join('')
      : `<li class="empty">Nessun risultato. Prova con una specializzazione, per esempio “Cardiologia”, o chiama il ${site.phone.label}.</li>`;
    out.hidden = false;
  };
  input.addEventListener('input', render);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { input.value = ''; render(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); $<HTMLAnchorElement>('a', out)?.focus(); }
    if (e.key === 'Enter') { const a = $<HTMLAnchorElement>('a', out); if (a) { e.preventDefault(); location.href = a.href; } }
  });
  out.addEventListener('keydown', (e) => {
    const links = $$<HTMLAnchorElement>('a', out);
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); links[Math.min(links.length - 1, i + 1)]?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); (i <= 0 ? input : links[i - 1]).focus(); }
  });
  document.addEventListener('click', (e) => { if (!box.contains(e.target as Node)) out.hidden = true; });
});

/* ---------- ancore con smooth scroll ---------- */
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
  if (!a) return;
  const url = new URL(a.href);
  if (url.pathname !== location.pathname || !url.hash) return;
  const target = document.querySelector<HTMLElement>(url.hash);
  const l = lenis();
  if (!target || !l) return;
  e.preventDefault();
  l.scrollTo(target, { offset: -90 });
  history.replaceState(null, '', url.hash);
});
