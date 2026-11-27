/**
 * Movimento: smooth scroll (Lenis), titoli che emergono per righe, comparsa a scalini,
 * immagini che si aprono, parallasse leggera, hero della TAC allo scroll, carosello orizzontale bloccato (desktop).
 * Con prefers-reduced-motion tutto resta fermo e leggibile.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);
(window as any).__pmMotion = true;

const root = document.documentElement;
const reduced = root.classList.contains('reduced') || matchMedia('(prefers-reduced-motion: reduce)').matches;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

if (reduced) root.classList.add('reduced');
else init();

function init() {
  const lenis = new Lenis({ lerp: 0.1 });
  (window as any).__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  /* titoli: righe che salgono da una maschera */
  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    $$('[data-lines]').forEach((el) => {
      const first = el.getBoundingClientRect().top < window.innerHeight * 0.9;
      SplitText.create(el, {
        type: 'lines', mask: 'lines', linesClass: 'line-mask', autoSplit: true,
        onSplit(self) {
          gsap.set(el, { visibility: 'visible' });
          return gsap.from(self.lines, {
            yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.08, delay: first ? 0.15 : 0,
            scrollTrigger: first ? undefined : { trigger: el, start: 'top 88%', once: true },
          });
        },
      });
    });
    ScrollTrigger.refresh();
  });

  /* comparsa a scalini (le parti già visibili partono subito) */
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 92%', once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.07, delay: 0.1, overwrite: true, onComplete() { els.forEach((e) => { e.classList.add('is-in'); gsap.set(e, { clearProps: 'opacity,transform' }); }); } }),
  });
  window.addEventListener('pm:filtered', () => ScrollTrigger.refresh());

  /* immagini: si aprono da un riquadro arrotondato */
  $$('[data-img]').forEach((el) => {
    const img = el.querySelector('img');
    const cs = getComputedStyle(el);
    const r = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].join(' ');
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    tl.to(el, { clipPath: `inset(0% 0% 0% 0% round ${r})`, duration: 1.3, ease: 'expo.out' });
    if (img) tl.to(img, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0);
    tl.add(() => { el.classList.add('is-in'); gsap.set([el, img].filter(Boolean), { clearProps: 'clipPath,transform' }); });
  });

  /* parallasse leggera */
  $$('[data-parallax]').forEach((el) => {
    const a = Number(el.dataset.parallax || 6);
    gsap.fromTo(el, { yPercent: -a }, { yPercent: a, ease: 'none', scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* hero: si parte dentro l'apertura della TAC (il titolo è lì dentro), la camera si allontana
     fino a mostrare il macchinario intero; poi arrivano titolo, pulsanti e dati tecnici */
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (hero) {
    const pin = hero.firstElementChild as HTMLElement;
    const box = hero.querySelector<HTMLElement>('[data-hero-machine]')!;
    const machine = box.querySelector<HTMLElement>('img')!;
    const inner = hero.querySelector('[data-hero-in]');
    const copy = hero.querySelector('[data-hero-copy]');
    const notes = hero.querySelector('[data-hero-notes]');
    /* centro e raggio dell'apertura, in frazioni della foto scontornata */
    const bx = Number(box.dataset.boreX), by = Number(box.dataset.boreY), br = Number(box.dataset.boreR);
    const geo = () => {
      const prev = machine.style.transform;
      machine.style.transform = 'none';
      const r = machine.getBoundingClientRect(), p = pin.getBoundingClientRect();
      machine.style.transform = prev;
      const s = (Math.min(p.width, p.height) * 0.32) / (br * r.width);
      return { x: p.left + p.width / 2 - (r.left + bx * r.width), y: p.top + p.height / 2 - (r.top + by * r.height), s };
    };
    gsap.set(machine, { transformOrigin: `${bx * 100}% ${by * 100}%` });
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true } })
      .fromTo(machine, { x: () => geo().x, y: () => geo().y, scale: () => geo().s }, { x: 0, y: 0, scale: 1, ease: 'power2.inOut', duration: 0.62 }, 0)
      .to(inner, { opacity: 0, scale: 0.7, ease: 'power1.in', duration: 0.22 }, 0.04)
      .fromTo(copy, { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.2 }, 0.5)
      .fromTo(notes, { opacity: 0, y: 20 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.15 }, 0.66)
      .to({}, { duration: 0.2 });
    gsap.from([machine, inner], { opacity: 0, duration: 1.4, ease: 'power2.out', stagger: 0.25 });
  }

  /* alta diagnostica (desktop): la sezione si ferma e i macchinari si susseguono come prodotti */
  gsap.matchMedia().add('(min-width: 1025px)', () => {
    const prod = document.querySelector<HTMLElement>('[data-prod]');
    if (!prod) return;
    const items = $$('[data-prod-item]', prod), dots = $$('[data-prod-dot]', prod);
    let cur = -1;
    const set = (i: number) => {
      if (i === cur) return;
      cur = i;
      items.forEach((it, k) => { it.classList.toggle('is-on', k === i); it.classList.toggle('is-past', k < i); });
      dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
    };
    const st = ScrollTrigger.create({
      trigger: prod, start: 'top top', end: 'bottom bottom',
      onUpdate: (s) => set(Math.min(items.length - 1, Math.floor(s.progress * items.length * 0.999))),
    });
    return () => st.kill();
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
}
