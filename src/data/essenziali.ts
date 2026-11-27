/**
 * Versioni essenziali dei testi delle specializzazioni (1-2 frasi con le informazioni chiave),
 * scritte a partire dai testi originali. Sulla pagina si legge questa versione; il testo
 * originale completo resta subito sotto, dietro "Leggi tutto".
 * intro: testo d'apertura · q: una voce per ogni domanda, nello stesso ordine della pagina.
 */
export const essenziali: Record<string, { intro: string; q: string[] }> = {
  allergologia: {
    intro: 'L’<strong>allergologia</strong> studia, diagnostica e cura le allergie: reazioni eccessive del sistema immunitario a pollini, polvere, peli di animali, alimenti o farmaci.',
    q: [
      'Individua l’allergene responsabile con <strong>test cutanei, test allergologici e analisi del sangue</strong>, imposta la cura e ti aiuta a gestire le allergie ogni giorno.',
      'Starnuti, prurito agli occhi, difficoltà a respirare, eruzioni o gonfiore? Con <strong>prick test, patch test</strong> ed esami del sangue l’allergologo trova la causa.',
    ],
  },
  angiologia: {
    intro: 'L’<strong>angiologia</strong> si occupa di arterie, vene e capillari: insufficienza venosa, arteriosclerosi, varici e trombosi, con diagnosi precoce e trattamenti non invasivi.',
    q: [
      'Quando compaiono <strong>gonfiore alle gambe, formicolii, crampi, vene varicose</strong> o dolori persistenti agli arti inferiori.',
      'L’<strong>angiologo</strong> cura tutto il sistema circolatorio (arterie, vene, vasi linfatici); il <strong>flebologo</strong> solo le vene, come varici e trombosi.',
    ],
  },
  cardiologia: {
    intro: 'La <strong>cardiologia</strong> previene, diagnostica e cura le malattie del cuore e dei vasi: ipertensione, aritmie, malattie coronariche.',
    q: [
      'In caso di <strong>dolore al petto, fiato corto, palpitazioni</strong> o stanchezza senza motivo. Controlli periodici se hai familiarità, colesterolo alto o altri fattori di rischio.',
      'Dolore o oppressione al petto, affanno, battito irregolare, stanchezza, <strong>caviglie gonfie e capogiri</strong>.',
    ],
  },
  dermatologia: {
    intro: 'La <strong>dermatologia</strong> cura pelle, capelli, unghie e mucose. Da Praemedica il controllo dei nei in <strong>epiluminescenza</strong>, per una diagnosi più accurata.',
    q: [
      'Acne, dermatiti, eczemi, psoriasi, infezioni, lupus, <strong>alopecia</strong>, cicatrici e macchie. E la prevenzione del melanoma con il controllo dei nei.',
      'Le più diffuse: <strong>acne, psoriasi, dermatiti, eczemi</strong>, infezioni come herpes e verruche, rosacea e alopecia.',
    ],
  },
  diabetologia: {
    intro: 'La <strong>diabetologia</strong> cura e previene il diabete. Il più diffuso è il <strong>tipo 2</strong> (90-95% dei casi), legato a stile di vita e sovrappeso: spesso si può prevenire.',
    q: [
      '<strong>Sete intensa, urinare spesso, fame eccessiva</strong>, stanchezza, perdita di peso, vista offuscata, ferite che guariscono lentamente.',
      'Bere acqua, una <strong>camminata di 15-30 minuti</strong> e cibi a basso indice glicemico. Con valori molto alti rivolgiti subito al medico.',
    ],
  },
  ecografia: {
    intro: 'L’<strong>ecografia</strong> usa onde sonore, <strong>senza radiazioni</strong>, per vedere organi, tessuti e il feto in gravidanza. È sicura e dà risultati immediati.',
    q: [
      'Con i nostri <strong>ecografi di ultima generazione</strong> le immagini sono molto precise; solo in pochi casi, come l’obesità, la visibilità si riduce.',
      'Cuore, reni, fegato, vescica, milza, il feto, <strong>muscoli, tendini e legamenti</strong>, vasi sanguigni, cisti e linfonodi.',
    ],
  },
  endocrinologia: {
    intro: 'L’<strong>endocrinologia</strong> studia ghiandole e ormoni che regolano metabolismo, crescita e riproduzione: diabete, <strong>tiroide</strong>, surrene, menopausa e infertilità.',
    q: [
      'Con stanchezza cronica, <strong>variazioni di peso</strong> senza motivo, ciclo irregolare, infertilità, sudorazione, tachicardia o problemi alla tiroide.',
      'Diabete, <strong>ipo e ipertiroidismo</strong>, morbo di Addison e sindrome di Cushing, disturbi della crescita, osteoporosi, squilibri in pubertà e menopausa.',
    ],
  },
  fisiatria: {
    intro: 'La <strong>fisiatria</strong> diagnostica e riabilita problemi muscolo-scheletrici, neurologici e post-traumatici, con terapie conservative: fisioterapia, terapia del dolore, <strong>infiltrazioni</strong>.',
    q: [
      'Per dolori a schiena, collo o articolazioni, <strong>ernia, scoliosi, lombalgia</strong>, recupero dopo un intervento o un ictus, disturbi neurologici e lesioni sportive.',
      'Il <strong>fisiatra</strong> cura senza chirurgia, con la riabilitazione; l’<strong>ortopedico</strong> è un chirurgo e interviene quando serve operare.',
    ],
  },
  fisioterapia: {
    intro: 'La <strong>fisioterapia</strong> aiuta a recuperare mobilità, forza e funzionalità dopo dolori, traumi o interventi, con terapie manuali, esercizi e tecnologie moderne.',
    q: [
      'Il prima possibile: dopo un trauma o un intervento, con dolori persistenti o patologie croniche come <strong>artrite e lombalgia</strong>.',
      'Percorsi su misura con <strong>tecarterapia, laserterapia, terapia manuale, magnetoterapia, elettroterapia</strong> e le altre terapie elencate qui sotto.',
      'La fisioterapia tratta il dolore; la <strong>palestra riabilitativa</strong> ricostruisce la forza con esercizi mirati. Insieme, un recupero completo.',
    ],
  },
  gastroenterologia: {
    intro: 'La <strong>gastroenterologia</strong> cura l’apparato digerente: stomaco, intestino, fegato, pancreas ed esofago. Reflusso, gastrite, colite e malattie del fegato.',
    q: [
      'Valuta i disturbi digestivi, ne trova la causa e imposta la cura, dal <strong>reflusso</strong> alle malattie croniche dell’intestino e del fegato.',
      'Con <strong>bruciore, gonfiore, dolore addominale</strong>, diarrea o stitichezza persistenti, sospette intolleranze o familiarità per colite e Crohn.',
    ],
  },
  ginecologia: {
    intro: 'La <strong>ginecologia</strong> si prende cura della salute femminile: prevenzione con <strong>pap test</strong>, disturbi del ciclo, infezioni e diagnosi precoce del tumore alla cervice.',
    q: [
      '<strong>Almeno una volta l’anno</strong>, anche senza sintomi. Prima, se hai dolori intensi, ciclo irregolare, perdite anomale o difficoltà a concepire.',
      'La <strong>visita ginecologica</strong> riguarda la salute dell’apparato riproduttivo; quella <strong>ostetrica</strong> gravidanza, parto e post-parto.',
    ],
  },
  'medicina-dello-sport': {
    intro: 'La <strong>medicina dello sport</strong> tutela chi fa attività fisica: prevenzione e cura degli infortuni e visite per fare sport in sicurezza.',
    q: [
      'Valuta la salute dello sportivo, cura gli infortuni e rilascia il <strong>certificato medico</strong> per l’attività sportiva.',
      'Storia clinica, esame fisico con pressione e frequenza cardiaca, <strong>ECG</strong> e, se serve, test da sforzo. Poi il rilascio del certificato.',
    ],
  },
  nefrologia: {
    intro: 'La <strong>nefrologia</strong> cura i reni, che filtrano il sangue e regolano liquidi e pressione: insufficienza renale, <strong>calcoli</strong>, proteinuria, ipertensione renale.',
    q: [
      'Controlla la funzione dei reni con <strong>pressione, esami delle urine e creatinina</strong>, anche quando non ci sono ancora sintomi.',
      'Stanchezza, <strong>gonfiore a gambe e palpebre</strong>, urine schiumose o scure, pressione alta, crampi notturni, nausea e prurito persistente.',
    ],
  },
  'neurologia-neurochirurgia': {
    intro: 'La <strong>neurologia</strong> cura le malattie del sistema nervoso, come ictus, epilessia e sclerosi multipla; la <strong>neurochirurgia</strong> interviene quando serve un’operazione.',
    q: [
      '<strong>Cefalee</strong>, neuropatie, sclerosi multipla, malattie neurodegenerative, disturbi del movimento, ictus ed epilessia.',
      'Per <strong>tumori cerebrali, ernie del disco</strong>, traumi cranici o lesioni del midollo, e con sintomi improvvisi come perdita di sensibilità o di forza.',
    ],
  },
  oculistica: {
    intro: 'L’<strong>oculistica</strong> previene e cura i disturbi della vista, da miopia e astigmatismo a <strong>cataratta, glaucoma</strong> e degenerazione maculare.',
    q: [
      'Misura della <strong>pressione dell’occhio</strong>, controllo di cornea, retina e nervo ottico, e verifica della vista per miopia, astigmatismo e ipermetropia.',
      'Nessuna nella sostanza: <strong>oculistica</strong> è il termine italiano, <strong>oftalmologia</strong> quello internazionale, più legato a ricerca e chirurgia.',
    ],
  },
  ortopedia: {
    intro: 'L’<strong>ortopedia</strong> cura ossa, articolazioni, legamenti, tendini e muscoli, con terapie conservative o chirurgia, per ridurre il dolore e tornare a muoversi.',
    q: [
      'Tratta <strong>fratture, distorsioni, artrosi</strong>, scoliosi e lesioni sportive, con fisioterapia e farmaci o, se serve, con un intervento.',
      'Il <strong>fisiatra</strong> riabilita senza chirurgia; l’<strong>ortopedico</strong> può anche operare per risolvere i problemi strutturali.',
    ],
  },
  otorinolaringoiatria: {
    intro: 'L’<strong>otorinolaringoiatria</strong> cura orecchie, naso e gola: otiti, sinusiti, calo dell’udito, <strong>vertigini</strong>, apnee notturne, riniti e disturbi della voce.',
    q: [
      'Con mal di gola persistente, difficoltà a deglutire, <strong>calo dell’udito, vertigini, ronzii</strong>, sinusiti croniche, russamento o voce alterata.',
      '<strong>Otorino</strong> è il modo breve di chiamare lo specialista; <strong>otorinolaringoiatria</strong> è il nome della disciplina.',
    ],
  },
  pneumologia: {
    intro: 'La <strong>pneumologia</strong> cura l’apparato respiratorio: <strong>asma, BPCO</strong>, infezioni polmonari e apnee notturne.',
    q: [
      'Diagnostica e cura asma, BPCO, infezioni e disturbi del respiro nel sonno, e segue nel tempo le malattie croniche.',
      'Con <strong>fiato corto, tosse cronica</strong> o oppressione al petto, per seguire asma e BPCO, e per i fumatori di lunga data.',
    ],
  },
  'scienza-dellalimentazione': {
    intro: 'La <strong>scienza dell’alimentazione</strong> studia il rapporto tra cibo e salute: equilibrio tra carboidrati, proteine e grassi, vitamine e fabbisogno di ognuno.',
    q: [
      'Valuta il tuo stato nutrizionale e prepara un <strong>piano alimentare su misura</strong>: per dimagrire, aumentare la massa muscolare, lo sport o una patologia.',
      'Il <strong>dietologo</strong> è un medico: diagnostica, prescrive farmaci ed esami. Il <strong>nutrizionista</strong> è un biologo che elabora piani alimentari.',
    ],
  },
  reumatologia: {
    intro: 'La <strong>reumatologia</strong> cura le malattie di articolazioni, muscoli, ossa e tessuti: <strong>artrite reumatoide</strong>, lupus, spondilite, fibromialgia e gotta.',
    q: [
      'Con <strong>dolore o gonfiore articolare</strong>, rigidità al mattino, stanchezza, febbricola o perdita di peso senza motivo, soprattutto se c’è familiarità.',
      'Oltre 150 malattie: <strong>artrite reumatoide e psoriasica</strong>, spondilite, lupus, sindrome di Sjögren, sclerodermia e le altre elencate qui sotto.',
    ],
  },
  senologia: {
    intro: 'La <strong>senologia</strong> previene, diagnostica e cura le patologie del seno, con visita, <strong>ecografia mammaria e mammografia</strong>.',
    q: [
      '<strong>Ecografia ogni anno dai 30-35 anni</strong>; dai 40 anni anche la mammografia annuale, come raccomanda la Fondazione Veronesi.',
      'Con la palpazione il senologo cerca <strong>noduli, cisti</strong> o alterazioni di pelle e capezzoli, e se serve prescrive altri esami.',
      'Immagini 3D ad alta risoluzione, a strati sottili: <strong>lesioni più piccole</strong>, meno falsi positivi, ideale per il seno denso.',
    ],
  },
  urologia: {
    intro: 'L’<strong>urologia</strong> cura le vie urinarie, maschili e femminili, e l’apparato riproduttivo maschile: infezioni, <strong>calcoli, prostata</strong>, incontinenza.',
    q: [
      'Con dolore o difficoltà a urinare, <strong>sangue nelle urine</strong>, infezioni frequenti, incontinenza, problemi alla prostata o di erezione.',
      'L’<strong>urologo</strong> cura le vie urinarie di uomini e donne; l’<strong>andrologo</strong> solo la salute sessuale e riproduttiva maschile.',
    ],
  },
  'palestra-riabilitativa': {
    intro: 'La <strong>palestra riabilitativa</strong> aiuta a recuperare forza e mobilità dopo un infortunio o un intervento, con programmi personalizzati seguiti dai fisioterapisti.',
    q: [
      'Trattamenti per <strong>recuperare il movimento</strong>, ridurre il dolore e prevenire ricadute: stretching, rinforzo, terapia manuale e apparecchiature.',
      '<strong>Esercizio terapeutico, ginnastica correttiva e posturale</strong>, rieducazione neuromotoria: ogni percorso è adattato a te.',
    ],
  },
};
