/**
 * Informazioni globali (header/footer) riportate testualmente dal sito originale praemedica.it.
 */
export const site = {
  name: 'Praemedica',
  title: 'Praemedica - Centro Diagnostico Polispecialistico',
  address: {
    street: 'Via Prenestina Nuova 307/A',
    building: 'Presso edificio ITOP Officine Ortopediche',
    city: '00036 – Palestrina – (RM)',
    cityContacts: '00036, Palestrina (RM)',
    maps: 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id=ChIJl5kKaRV_JRMRcDzu3g95Noo',
    mapEmbed: 'https://maps.google.com/maps?q=praemedica&t=m&z=14&output=embed&iwloc=near',
  },
  phone: { label: '06.69451836', footer: '0669451836', href: 'tel:0669451836' },
  whatsapp: { label: '3294715527', href: 'https://api.whatsapp.com/send?phone=393294715527' },
  email: { label: 'info@praemedica.it', href: 'mailto:info@praemedica.it' },
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61571968782167',
    facebookContacts: 'https://www.facebook.com/share/1RmPanRawR/?mibextid=wwXIfr',
    instagram: 'https://www.instagram.com/praemedica?igsh=MTY3dHVoZ2c1YzZ0',
  },
  /** Orari: footer ("Orari: Lun/Ven 9:00 - 20:00") e pagina contatti ("Lunedì / Venerdì 9.00 - 20.00"). */
  hours: {
    footer: ['Orari: Lun/Ven 9:00 - 20:00', 'Orari: Sab 9:00 - 13:00'],
    contacts: ['Lunedì / Venerdì 9.00 - 20.00', 'Sabato 9.00 - 13.00', 'Domenica chiusi'],
    // [giorno (0=dom), apertura, chiusura] in minuti — usato per il badge "Aperto ora"
    schedule: [
      [1, 540, 1200], [2, 540, 1200], [3, 540, 1200], [4, 540, 1200], [5, 540, 1200], [6, 540, 780],
    ] as [number, number, number][],
  },
  doctolib: {
    label: 'PRENOTA ONLINE',
    href: 'https://www.doctolib.it/centro-medico/palestrina/praemedica',
    floatingLabel: 'Prenota un appuntamento online',
    floatingHref:
      'https://www.doctolib.it/centro-medico/palestrina/praemedica/booking?source=external_referral&utm_campaign=website-button&utm_source=praemedica-website-button&utm_medium=referral&utm_content=withoutpreview-blue-floating-bottom-right&utm_term=praemedica',
    logo: 'https://pro.doctolib.it/external_button/doctolib-white-transparent.png',
  },
  privacy: {
    policy: { label: 'Privacy Policy', href: 'https://www.iubenda.com/privacy-policy/61878891' },
    cookie: { label: 'Cookie Policy', href: 'https://www.iubenda.com/privacy-policy/61878891/cookie-policy' },
  },
  copyright: 'Copyright © 2025 Praemedica – C.F e P.IVA 170027​11004 – Realizzato da',
  credits: { label: 'Creation Web', href: 'https://creationweb.it/' },
} as const;

export type NavItem = { label: string; href?: string; children?: NavItem[] };

export const altaDiagnostica: NavItem[] = [
  { label: 'Densitometria Ossea (MOC)', href: '/densitometria-ossea/' },
  { label: 'Mammografia 3D in Tomosintesi', href: '/mammografia-in-tomosintesi/' },
  { label: 'Ortopanoramica', href: '/ortopanoramica/' },
];

/** Voci del menu "Specializzazioni" (ordine ed etichette del menu originale). */
export const specializzazioniMenu: NavItem[] = [
  { label: 'Allergologia', href: '/allergologia/' },
  { label: 'Angiologia', href: '/angiologia/' },
  { label: 'Cardiologia', href: '/cardiologia/' },
  { label: 'Dermatologia', href: '/dermatologia/' },
  { label: 'Diabetologia', href: '/diabetologia/' },
  { label: 'Ecografia', href: '/ecografia/' },
  { label: 'Endocrinologia', href: '/endocrinologia/' },
  { label: 'Fisiatria', href: '/fisiatria/' },
  { label: 'Fisioterapia', href: '/fisioterapia/' },
  { label: 'Gastroenterologia', href: '/gastroenterologia/' },
  { label: 'Ginecologia', href: '/ginecologia/' },
  { label: 'Medicina dello Sport', href: '/medicina-dello-sport/' },
  { label: 'Nefrologia', href: '/nefrologia/' },
  { label: 'Neurologia e Neurochirurgia', href: '/neurologia-neurochirurgia/' },
  { label: 'Oculistica', href: '/oculistica/' },
  { label: 'Ortopedia', href: '/ortopedia/' },
  { label: 'Otorinolaringoiatria', href: '/otorinolaringoiatria/' },
  { label: 'Pneumologia', href: '/pneumologia/' },
  { label: 'Radiologia', href: '/radiologia/' },
  { label: 'Scienza dell’alimentazione', href: '/scienza-dellalimentazione/' },
  { label: 'Reumatologia', href: '/reumatologia/' },
  { label: 'Senologia', href: '/senologia/' },
  { label: 'Urologia', href: '/urologia/' },
];

export const mainNav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Chi Siamo', href: '/chi-siamo/' },
  { label: 'Alta Diagnostica', children: altaDiagnostica },
  { label: 'Specializzazioni', children: specializzazioniMenu },
  { label: 'Medici', href: '/medici/' },
  { label: 'Convenzioni', href: '/convenzioni/' },
  { label: 'Contatti', href: '/contatti/' },
];

/** Icone (Tabler) per ogni area: solo decorative. */
export const icons: Record<string, string> = {
  allergologia: 'virus',
  angiologia: 'droplet-heart',
  cardiologia: 'heart-rate-monitor',
  dermatologia: 'hand-sanitizer',
  diabetologia: 'droplet',
  ecografia: 'device-heart-monitor',
  endocrinologia: 'flask',
  fisiatria: 'wheelchair',
  fisioterapia: 'massage',
  gastroenterologia: 'salad',
  ginecologia: 'gender-female',
  'medicina-dello-sport': 'run',
  nefrologia: 'test-pipe',
  'neurologia-neurochirurgia': 'brain',
  oculistica: 'eye',
  ortopedia: 'bone',
  otorinolaringoiatria: 'ear',
  pneumologia: 'lungs',
  radiologia: 'radioactive',
  'scienza-dellalimentazione': 'apple',
  reumatologia: 'hand-grab',
  senologia: 'ribbon-health',
  urologia: 'stethoscope',
  'densitometria-ossea': 'body-scan',
  'mammografia-in-tomosintesi': 'scan',
  ortopanoramica: 'dental',
  'palestra-riabilitativa': 'stretching',
};
