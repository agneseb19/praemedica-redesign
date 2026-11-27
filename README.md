# Praemedica — sito web

Nuovo sito di [praemedica.it](https://praemedica.it), statico (Astro), font Plus Jakarta Sans, animazioni GSAP e smooth scroll Lenis.
Ogni voce del menu ha la sua pagina: Home, Chi Siamo, Alta Diagnostica (`/alta-diagnostica/`), Specializzazioni (`/specializzazioni/`), Medici, Convenzioni, Contatti.

## Comandi

| Comando | Cosa fa |
| --- | --- |
| `npm install` | installa le dipendenze |
| `npm run dev` | sito in sviluppo su http://localhost:4321 |
| `npm run build` | genera il sito finale in `dist/` |
| `npm run preview` | serve `dist/` in locale (http://127.0.0.1:4321) |
| `npm run extract` | riscarica testi, foto e PDF dal sito WordPress originale |
| `npm run verify` | controlla che ogni testo, link, foto e alt del sito originale sia presente in `dist/` |

## Struttura

- `src/data/pages/*.json` — contenuti estratti 1:1 dal sito originale (non modificarli a mano: rigenerali con `npm run extract`).
- `src/data/site.ts` — contatti, orari, menu, link Doctolib e iubenda.
- `src/pages/` — home, chi siamo, specializzazioni, alta diagnostica, medici, convenzioni, contatti e `[slug].astro` (template di ogni specializzazione / esame / articolo).
- `src/components/` — header, footer, card servizi, specialisti, griglia specializzazioni…
- `src/scripts/` — `ui.ts` (menu, filtri, caroselli, orari "Aperto ora"), `motion.ts` (animazioni).
- `public/contatti.php` — invio del modulo contatti a info@praemedica.it (PHP `mail()` su SiteGround).

## Pubblicazione (SiteGround)

1. `npm run build`
2. Carica **il contenuto** di `dist/` nella cartella `public_html` del dominio.
3. Gli URL restano quelli del vecchio sito (es. `/cardiologia/`), i CV PDF restano in `/wp-content/uploads/…`.

## Accessibilità e motion

Testo ingrandibile (A+/A−), barra azioni fissa su mobile, focus visibili, contrasti AA.
Con "riduci movimento" attivo nel sistema operativo il sito disattiva smooth scroll e animazioni.

## Anteprima su GitHub Pages

A ogni push su `main` il workflow `.github/workflows/deploy.yml` costruisce il sito con
`BASE_PATH=/praemedica-redesign/` e lo pubblica su https://agneseb19.github.io/praemedica-redesign/.
`scripts/prefix-base.mjs` aggiunge il prefisso della sottocartella ai link assoluti.
Il modulo contatti usa PHP (`public/contatti.php`): sull'anteprima non invia, funziona solo su SiteGround.
