// Erzeugt einfache Impressum- und Datenschutz-Seiten mit den bekannten
// Kontaktdaten. Diese Platzhalter sollten vor dem Live-Gang von der Familie
// Suter bzw. einer Rechtsberatung geprüft/ergänzt werden.
import { writeFile } from "node:fs/promises";
import { icon } from "./icons.mjs";
import { footer, visitBand, pageHero } from "./shared.mjs";

const ROOT = new URL("../", import.meta.url);

const NAV = [
  { href: "index.html", label: "Startseite" },
  { href: "ueber-uns.html", label: "Über uns" },
  { href: "alp-beizli.html", label: "Alp-Beizli" },
  { href: "foto-galerie.html", label: "Foto-Galerie" },
  { href: "standort.html", label: "Standort" },
  { href: "kontakt.html", label: "Kontakt" },
];

const NAV_MORE = [
  { href: "video-galerie.html", label: "Video-Galerie" },
  { href: "milchkanne-kunst.html", label: "Milchkanne Kunst" },
  { href: "links.html", label: "Links" },
];

function nav() {
  const mainItems = NAV.map((item) => `        <li><a href="${item.href}">${item.label}</a></li>`).join("\n");
  const moreItems = NAV_MORE.map((item) => `            <li><a href="${item.href}">${item.label}</a></li>`).join("\n");
  const dropdown = `        <li class="nav-dropdown">
          <button class="nav-dropdown-toggle" type="button" aria-expanded="false">Mehr ${icon("chevronDown")}</button>
          <ul class="nav-dropdown-menu">
${moreItems}
          </ul>
        </li>`;
  return `${mainItems}\n${dropdown}`;
}

function header() {
  return `<header class="site-header">
  <div class="header-inner">
    <a href="index.html" class="logo"><span class="logo-icon">${icon("mountain")}</span>Alp <span>Ober Roggenloch</span></a>
    <nav>
      <ul class="nav-links" id="navLinks">
${nav()}
      </ul>
    </nav>
    <button class="nav-toggle" id="navToggle" aria-label="Menü öffnen">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>`;
}

const SITE_URL = "https://www.ober-roggenloch.ch";

function page(title, description, bodyMain, path) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${SITE_URL}/${path}">
<meta name="robots" content="noindex, follow">
<link rel="stylesheet" href="css/style.css">
</head>
<body>

${header()}

<main>
${bodyMain}
</main>

${visitBand()}
${footer()}

<button class="back-to-top" id="backToTop" aria-label="Nach oben scrollen">${icon("arrowUp")}</button>

<script src="js/script.js"></script>
</body>
</html>
`;
}

const impressum = `${pageHero("Rechtliches", "Impressum")}
  <section class="legal">
    <div class="container">

      <h2>Verantwortlich für den Inhalt</h2>
      <p>Familie Suter<br>Alp Ober Roggenloch<br>6436 Muotathal</p>
      <p>Winteradresse: Obriedenstr. 11, 6463 Bürglen</p>
      <p>Telefon: 079 429 33 03 / 079 716 60 29<br>E-Mail: info@ober-roggenloch.ch</p>

      <h2>Haftungsausschluss</h2>
      <p>Alle Angaben auf dieser Website erfolgen ohne Gewähr. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte wird keine Haftung übernommen.</p>

      <p style="margin-top:2.5rem; font-size:0.9rem; color:var(--color-ink-soft);">Hinweis: Dieses Impressum ist ein Platzhalter mit den bekannten Kontaktdaten und sollte vor dem Live-Gang der Website geprüft und bei Bedarf ergänzt werden.</p>
    </div>
  </section>`;

const datenschutz = `${pageHero("Rechtliches", "Datenschutz")}
  <section class="legal">
    <div class="container">

      <h2>Allgemeines</h2>
      <p>Wir nehmen den Schutz deiner persönlichen Daten ernst und behandeln sie vertraulich entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>

      <h2>Kontaktformular</h2>
      <p>Wenn du uns über das Kontaktformular Anfragen zukommen lässt, werden deine Angaben aus dem Anfrageformular inklusive der von dir dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage gespeichert. Der Versand erfolgt über den Dienstleister Web3Forms. Rechtsgrundlage ist unser berechtigtes Interesse an der Bearbeitung deiner Anfrage.</p>

      <h2>Google Maps</h2>
      <p>Auf der Seite «Standort» binden wir eine Karte von Google Maps ein, damit du die Anfahrt zur Alp besser nachvollziehen kannst. Beim Aufruf dieser Seite wird eine Verbindung zu Servern von Google Ireland Ltd. (Gordon House, Barrow Street, Dublin 4, Irland) hergestellt, wobei deine IP-Adresse übermittelt werden kann. Weitere Informationen findest du in der Datenschutzerklärung von Google: https://policies.google.com/privacy</p>

      <h2>YouTube-Videos</h2>
      <p>Auf der Seite «Video-Galerie» binden wir Videos von YouTube im datenschutzfreundlichen Modus (youtube-nocookie.com) ein. Auch dabei kann beim Abspielen eine Verbindung zu Servern von Google/YouTube hergestellt werden.</p>

      <h2>Deine Rechte</h2>
      <p>Du hast jederzeit das Recht auf Auskunft, Berichtigung oder Löschung deiner bei uns gespeicherten personenbezogenen Daten. Bei Fragen wende dich bitte an info@ober-roggenloch.ch.</p>

      <p style="margin-top:2.5rem; font-size:0.9rem; color:var(--color-ink-soft);">Hinweis: Diese Datenschutzerklärung ist ein Platzhalter, der auf die tatsächlich eingesetzten Dienste dieser neuen Website zugeschnitten ist (Web3Forms, Google Maps, YouTube). Sie sollte vor dem Live-Gang geprüft und bei Bedarf durch eine Rechtsberatung ergänzt werden.</p>
    </div>
  </section>`;

async function main() {
  await writeFile(
    new URL("impressum.html", ROOT),
    page("Impressum | Alp Ober Roggenloch", "Impressum der Alp Ober Roggenloch, Familie Suter.", impressum, "impressum.html"),
    "utf-8"
  );
  await writeFile(
    new URL("datenschutz.html", ROOT),
    page("Datenschutz | Alp Ober Roggenloch", "Datenschutzerklärung der Alp Ober Roggenloch.", datenschutz, "datenschutz.html"),
    "utf-8"
  );
  console.log("geschrieben: impressum.html, datenschutz.html");
}

main();
