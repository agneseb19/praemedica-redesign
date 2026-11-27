/**
 * I macchinari dell'alta diagnostica: l'esame in grande, il macchinario in piccolo,
 * una scheda tecnica di tre righe con dati presi dalle pagine originali.
 * Usati dallo scorrimento delle schede (home, pagina Alta Diagnostica) e dalla ricerca.
 */
import { getPage, summaryOf, type Block, type Summary } from './content';
import { altaDiagnostica } from '../data/site';
import tacCut from '../assets/cutout/tac.png';
import mammoCut from '../assets/cutout/mammo.png';
import rxCut from '../assets/cutout/rx.png';
import optCut from '../assets/cutout/opt.png';
import mocCut from '../assets/cutout/moc.png';

export interface Machine { exam: string; device: string; href: string; img: ImageMetadata; alt: string; spec: [string, string][] }

const [heroSlider, diagSlider] = getPage('home').blocks.filter((b) => b.type === 'slides') as Extract<Block, { type: 'slides' }>[];
const tac = heroSlider.slides[0];
const d = diagSlider.slides;

export const machines: Machine[] = [
  { exam: 'TAC', device: tac.heading, href: '/alta-diagnostica/', img: tacCut, alt: tac.alt || tac.heading,
    spec: [['Esame', 'Tomografia computerizzata'], ['Acquisizione', '128 strati'], ['Tecnologia', 'Siemens Healthineers']] },
  { exam: d[0].heading, device: 'Mammografo 3D con tomosintesi', href: '/mammografia-in-tomosintesi/', img: mammoCut, alt: d[0].alt,
    spec: [['Immagini', 'Tridimensionali ad alta risoluzione'], ['Dose', 'Proiezioni a bassa dose da diverse angolazioni'], ['Indicata', 'Per le donne sopra i 40 anni']] },
  { exam: d[1].heading, device: 'Radiologia generale', href: '/radiologia/', img: rxCut, alt: d[1].alt,
    spec: [['Servizio', 'Radiologia generale'], ['Tecnologia', 'Di ultima generazione'], ['Tempi', 'Diagnosi rapide, senza lunghe liste d’attesa']] },
  { exam: d[2].heading, device: 'Ortopantomografo', href: '/ortopanoramica/', img: optCut, alt: d[2].alt,
    spec: [['Esame', 'Radiografia panoramica dentale'], ['Area', 'Arcate dentarie, ossa mascellari, seni paranasali'], ['Paziente', 'Non invasiva, sicura e rapida']] },
  { exam: d[3].heading, device: 'Densitometro MOC DXA', href: '/densitometria-ossea/', img: mocCut, alt: d[3].alt,
    spec: [['Tecnica', 'MOC DXA, il gold standard'], ['Misura', 'Densità minerale ossea (BMD)'], ['Per', 'Prevenzione e monitoraggio dell’osteoporosi']] },
];

/**
 * "Altri esami" per le pagine di alta diagnostica: gli altri esami con foto e una riga sotto.
 * Radiologia non ha una foto propria e le sue liste sono quelle degli altri esami:
 * prende foto e voce delle Radiografie dalla home. Dove mancano le prestazioni, il nome del macchinario.
 */
export function otherExams(href: string): Summary[] {
  const rx = d[1];
  return [...altaDiagnostica, { label: 'Radiologia', href: '/radiologia/' }].filter((x) => x.href !== href).map((x) => {
    const s = summaryOf(x.href!, x.label);
    if (x.href === '/radiologia/') return { ...s, img: rx.bg, alt: rx.alt, services: ['Radiografie', 'Radiologia generale'] };
    const dev = machines.find((m) => m.href === x.href)?.device;
    return s.services.length || !dev ? s : { ...s, services: [dev] };
  });
}
