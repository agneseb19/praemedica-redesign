<?php
/**
 * Gestore del modulo "Richiedi Informazioni" (pagina /contatti/).
 * Invia la richiesta a info@praemedica.it. Pensato per l'hosting SiteGround (PHP mail()).
 * Risponde in JSON alle richieste fetch e reindirizza in caso di invio senza JavaScript.
 */
declare(strict_types=1);

const TO = 'info@praemedica.it';
const FROM = 'noreply@praemedica.it';

$wantsJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');

function reply(bool $ok, string $error = ''): void {
    global $wantsJson;
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($ok ? 200 : 400);
        echo json_encode(['ok' => $ok, 'error' => $error]);
    } else {
        header('Location: /contatti/?' . ($ok ? 'inviato=1' : 'errore=1'), true, 303);
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') reply(false, 'Metodo non consentito');

// trappola anti-spam: i bot compilano anche il campo nascosto
if (!empty($_POST['website'])) reply(true);

$clean = static fn(string $k, int $max = 200): string =>
    trim(mb_substr(str_replace(["\r", "\n"], ' ', strip_tags((string)($_POST[$k] ?? ''))), 0, $max));

$nome = $clean('nome');
$cognome = $clean('cognome');
$telefono = $clean('telefono', 40);
$email = filter_var(trim((string)($_POST['email'] ?? '')), FILTER_VALIDATE_EMAIL) ?: '';
$messaggio = trim(mb_substr(strip_tags((string)($_POST['messaggio'] ?? '')), 0, 4000));
$privacy = !empty($_POST['privacy']);

if ($nome === '' || $cognome === '' || $telefono === '' || !$privacy) {
    reply(false, 'Compila i campi obbligatori');
}

$body = "Nuova richiesta di informazioni dal sito praemedica.it\n\n"
    . "Nome: {$nome}\nCognome: {$cognome}\nTelefono: {$telefono}\n"
    . 'Email: ' . ($email ?: '-') . "\n\n"
    . "Messaggio:\n" . ($messaggio ?: '-') . "\n\n"
    . "Consenso al trattamento dei dati personali: sì\n"
    . 'Data: ' . date('d/m/Y H:i') . "\n";

$headers = [
    'From: Sito Praemedica <' . FROM . '>',
    'Content-Type: text/plain; charset=UTF-8',
];
if ($email) $headers[] = 'Reply-To: ' . $email;

$sent = mail(TO, '=?UTF-8?B?' . base64_encode("Richiesta informazioni - {$nome} {$cognome}") . '?=', $body, implode("\r\n", $headers));
reply($sent, $sent ? '' : 'Invio non riuscito');
