// Generiert alle statischen HTML-Seiten der Alp-Website aus den gesicherten
// Original-Inhalten (content/raw/*.json) und den lokal gespeicherten Bildern.
// Wird einmalig ausgeführt; das Ergebnis (die .html-Dateien im Projektroot)
// ist danach von Hand weiter pflegbar.
import { writeFile, readFile, readdir } from "node:fs/promises";
import { icon } from "./icons.mjs";
import { footer, visitBand, pageHero } from "./shared.mjs";
import { imageSizeFromFile } from "image-size/fromFile";
import { fileURLToPath } from "node:url";

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

function nav(active) {
  const mainItems = NAV.map(
    (item) =>
      `        <li><a href="${item.href}"${
        item.href === active ? ' class="active"' : ""
      }>${item.label}</a></li>`
  ).join("\n");

  const moreActive = NAV_MORE.some((item) => item.href === active);
  const moreItems = NAV_MORE.map(
    (item) =>
      `            <li><a href="${item.href}"${
        item.href === active ? ' class="active"' : ""
      }>${item.label}</a></li>`
  ).join("\n");

  const dropdown = `        <li class="nav-dropdown${moreActive ? " open" : ""}">
          <button class="nav-dropdown-toggle" type="button" aria-expanded="false">Mehr ${icon("chevronDown")}</button>
          <ul class="nav-dropdown-menu">
${moreItems}
          </ul>
        </li>`;

  return `${mainItems}\n${dropdown}`;
}

function header(active) {
  return `<header class="site-header">
  <div class="header-inner">
    <a href="index.html" class="logo"><span class="logo-icon">${icon("mountain")}</span>Alp <span>Ober Roggenloch</span></a>
    <nav>
      <ul class="nav-links" id="navLinks">
${nav(active)}
      </ul>
    </nav>
    <button class="nav-toggle" id="navToggle" aria-label="Menü öffnen">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>`;
}

const SITE_URL = "https://www.ober-roggenloch.ch";
const OG_IMAGE = `${SITE_URL}/public/images/hero-slider/i2c70be483a345958.jpg`;

const JSON_LD = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  "@id": "${SITE_URL}/#alp-ober-roggenloch",
  "name": "Alp Ober Roggenloch",
  "description": "Alpbetrieb und Alp-Beizli im Muotathal mit hausgemachtem Alpkäse und Milchspezialitäten. Geöffnet von Anfang Juni bis Ende September.",
  "url": "${SITE_URL}/",
  "image": "${OG_IMAGE}",
  "servesCuisine": "Schweizer Alpküche",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Alp Ober Roggenloch",
    "postalCode": "6436",
    "addressLocality": "Muotathal",
    "addressRegion": "SZ",
    "addressCountry": "CH"
  },
  "telephone": "+41794293303",
  "email": "info@ober-roggenloch.ch",
  "openingHours": "Jun-Sep",
  "sameAs": [
    "https://www.instagram.com/ober.roggenloch/"
  ]
}
</script>
`;

function page({ title, description, active, bodyMain, path = "index.html" }) {
  const canonical = `${SITE_URL}/${path === "index.html" ? "" : path}`;
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Alp Ober Roggenloch">
<meta property="og:locale" content="de_CH">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${OG_IMAGE}">
<link rel="stylesheet" href="css/style.css">
${path === "index.html" ? JSON_LD : ""}</head>
<body>

${header(active)}

<main>
${bodyMain}
</main>

${visitBand(path)}
${footer()}

<button class="back-to-top" id="backToTop" aria-label="Nach oben scrollen">${icon("arrowUp")}</button>

<script src="js/script.js"></script>
</body>
</html>
`;
}

// Baut ein klickbares Bildkarussell (Pfeile + Punkte), analog zum
// Original-Jimdo-Karussell auf der echten Startseite (/).
function buildCarousel(id, images, folder = "root") {
  const slides = images
    .map(
      (img, i) =>
        `        <div class="carousel-slide${i === 0 ? " active" : ""}"><img loading="${i === 0 ? "eager" : "lazy"}" src="public/images/${folder}/${img.id}.jpg" alt="${img.alt}"></div>`
    )
    .join("\n");
  const dots = images
    .map((_, i) => `          <button class="carousel-dot${i === 0 ? " active" : ""}" aria-label="Bild ${i + 1}"></button>`)
    .join("\n");

  return `<div class="carousel" id="${id}">
        <div class="carousel-track">
${slides}
        </div>
        <button class="carousel-arrow carousel-prev" aria-label="Vorheriges Bild">${icon("chevronLeft")}</button>
        <button class="carousel-arrow carousel-next" aria-label="Nächstes Bild">${icon("chevronRight")}</button>
        <div class="carousel-dots">
${dots}
        </div>
      </div>`;
}

async function writePage(filename, opts) {
  await writeFile(new URL(filename, ROOT), page({ ...opts, path: filename }), "utf-8");
  console.log("geschrieben:", filename);
}

// ---------- Startseite ----------

async function buildIndex() {
  const heroSlides = [
    "ib1378c0719b8e02f",
    "i40716e1226fc17ce",
    "i2c70be483a345958",
  ];
  const heroSlideDivs = heroSlides
    .map(
      (id, i) =>
        `      <div class="hero-slide${i === 0 ? " active" : ""}" style="background-image: url('public/images/hero-slider/${id}.jpg');"></div>`
    )
    .join("\n");

  const bodyMain = `  <section class="hero">
    <div class="hero-bg" id="heroSlider">
${heroSlideDivs}
    </div>
    <div class="hero-inner">
      <span class="hero-eyebrow">Alp Ober Roggenloch · Muotathal</span>
      <h1>Willkommen auf der <em>Alp Ober Roggenloch</em></h1>
      <p>Hoch über dem Tal, umgeben von saftigen Wiesen, alten Fichten, frischer Bergluft und glücklichen Tieren, da liegt die Alp Ober Roggenloch. Unsere wunderschöne Alp befindet sich im Muotathal, mitten im Herzen der Schweiz.</p>
      <div class="btn-row">
        <a href="alp-beizli.html" class="btn btn-primary">Alp-Beizli entdecken</a>
        <a href="standort.html" class="btn btn-outline">Anfahrt &amp; Standort</a>
      </div>
    </div>
  </section>

  <section class="intro">
    <div class="container intro-split">
      <div class="intro-visual"><img loading="lazy" src="public/images/root/ie4b381320d5156c1.jpg" alt="Ziegenherde auf dem Weg zum Alp-Beizli Ober Roggenloch"></div>
      <div class="intro-text">
        <span class="section-label">Herzlich willkommen</span>
        <h2 class="section-title">Familie Suter freut sich auf deinen Besuch</h2>
        <p>Die herrliche Landschaft und die frische Alpenluft werden dich begeistern. Bei einem Roggenlochplättli oder einem Älplerkaffee geniesst du die gemütliche Atmosphäre in unserer Gartenwirtschaft.</p>
        <p>Ebenfalls bieten wir für den süssen Gluscht Niidle mit Meringues oder ein leckeres Jogurt-Dessert an, garniert mit frischem Alpenrahm. Nach dem Gaumenschmaus besteht die Möglichkeit, selbstgemachte Milchspezialitäten wie Alpkäse, Wetterfroschkäse und Alp Butter zu kaufen.</p>
        <p>Verbinde diesen Ausflug zu unserer Alp mit einer Wanderung im schönen Bödmeren Wald auf der Urwaldspur.</p>
        <p>Wir bewirtschaften unsere Alp mit viel Herzblut und laden dich herzlich ein, bei uns vorbeizuschauen. Wir freuen uns auf deinen Besuch!</p>
      </div>
    </div>
  </section>

  <section class="gallery-preview band-wood">
    <div class="container">
      <div class="section-header">
        <span class="section-label">Impressionen</span>
        <h2 class="section-title">Ein Blick auf unsere Alp</h2>
      </div>
      ${buildCarousel("homeCarousel", [
        { id: "id89e43d1f6e960b1", alt: "Blick über die Alp Ober Roggenloch" },
        { id: "i76304b89377b8afc", alt: "Ziegenherde vor dem Alp-Beizli Ober Roggenloch" },
        { id: "if8ffa05e53f1eb48", alt: "Kuhherde auf dem Weg zur Alp Ober Roggenloch" },
        { id: "i7e1d3703d5f9a8c4", alt: "Zwei Esel auf der Alp Ober Roggenloch" },
        { id: "ie0ccc34cd7e95c0e", alt: "Das Alphüttli Ober Roggenloch mit Schweizer Fahnen" },
        { id: "i4b9e75319b04075b", alt: "Bergpanorama bei der Alp Ober Roggenloch" },
        { id: "ie4b381320d5156c1", alt: "Ziegenherde auf dem Weg zum Alp-Beizli Ober Roggenloch" },
      ])}
      <div style="text-align:center; margin-top: 2.5rem;">
        <a href="foto-galerie.html" class="btn btn-primary">Ganze Galerie ansehen</a>
      </div>
    </div>
  </section>`;

  await writePage("index.html", {
    title: "Alp Ober Roggenloch – Familie Suter, Muotathal",
    description:
      "Willkommen auf der Alp Ober Roggenloch im Muotathal: Alpbeizli, hausgemachter Alpkäse und atemberaubende Bergwelt. Familie Suter freut sich auf euren Besuch.",
    active: "index.html",
    bodyMain,
  });
}

// ---------- Über uns ----------

async function buildUeberUns() {
  const bodyMain = `${pageHero("Über uns", "Mit Leidenschaft auf der Alp")}
  <section>
    <div class="container about-grid">
      <div class="portrait">
        <img src="public/images/ueber-uns/ib2aa162950066016.jpg" alt="Historisches Foto der Alphütte Ober Roggenloch, erbaut 1886">
      </div>
      <div class="about-content">
        <h2>Familie Suter</h2>
        <p>Die Familie Suter – Beat, Margrit, Nadia, Marina und Sandra – verbringt jeden Sommer auf der Alp Ober Roggenloch. Wir kümmern uns um unsere Kühe, stellen Alpkäse her und servieren hausgemachte Spezialitäten. Das Leben hier oben ist einfach, aber authentisch.</p>

        <h2>Unsere Geschichte</h2>
        <p>Die Hütte wurde 1886 aus Fichtenholz erbaut. Beat Suters Urgrossvater erwarb die Alp und begründete damit eine Familientradition, die bis heute anhält. Seit 2009 führt Beat gemeinsam mit Margrit die Alp.</p>
        <p>Die Käseherstellung und Milchproduktion erfolgen bei uns in liebevoller Handarbeit. Besucherinnen und Besucher können bei uns Käse, Butter, Joghurt und Sahne geniessen und mitnehmen.</p>

        <div class="tag-list">
          <span class="tag-pill">Seit 1886</span>
          <span class="tag-pill">Familienbetrieb seit 2009</span>
          <span class="tag-pill">Handgemachter Alpkäse</span>
        </div>
      </div>
    </div>
  </section>`;

  await writePage("ueber-uns.html", {
    title: "Über uns – Familie Suter | Alp Ober Roggenloch",
    description:
      "Die Familie Suter bewirtschaftet die Alp Ober Roggenloch seit 2009. Erfahre mehr über unsere Geschichte seit 1886 und unsere handgemachten Milchspezialitäten.",
    active: "ueber-uns.html",
    bodyMain,
  });
}

// ---------- Alp-Beizli ----------

async function buildAlpBeizli() {
  const bodyMain = `${pageHero("Alp-Beizli", "Rast machen auf 1600 m ü. M.", "Unser Alp-Beizli liegt auf 1600 Metern über Meer und heisst Wanderer, Biker und Naturliebhaber herzlich willkommen.")}
  <section>
    <div class="container">
      <div class="intro-split" style="margin-bottom:4rem;">
        <div class="gallery-grid" style="grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="gallery-item"><img loading="lazy" src="public/images/alp-beizli/i007748f1dcfec973.jpg" alt="Roggenlochplättli mit Alpkäse, Salami und frischem Gemüse"></div>
          <div class="gallery-item"><img loading="lazy" src="public/images/alp-beizli/i55eadb40886dac29.jpg" alt="Dessert mit Joghurt, Sahne, Apfelscheiben und Blaubeere im Alp-Beizli"></div>
        </div>
        <div class="intro-text">
          <h2 class="section-title" style="font-size:1.8rem;">Unser Angebot</h2>
          <p>Bei uns gibt es hausgemachten Alpkäse, frisches Brot und unser beliebtes Roggenlochplättli. Dazu Älplerkaffee, Meringues mit Alpencreme und frisch gebackene Kuchen.</p>
          <p>Zum Trinken: Mineralwasser, verschiedene Sirupsorten, Bier, Cidre, frische Kuh- und Ziegenmilch, Kaffee sowie Kaffee mit Träsch.</p>
        </div>
      </div>

      <div class="cards">
        <div class="card">
          <span class="icon">${icon("calendar")}</span>
          <h3>Öffnungszeiten</h3>
          <p>Täglich offen von Mitte Juni bis Ende September (je nach Wetter).</p>
        </div>
        <div class="card">
          <span class="icon">${icon("users")}</span>
          <h3>Gruppen &amp; Brunch</h3>
          <p>Auf Anfrage per E-Mail, Telefon oder WhatsApp (079 429 33 03) – auch für Gruppen und Brunches.</p>
        </div>
        <div class="card">
          <span class="icon">${icon("coins")}</span>
          <h3>Bezahlung</h3>
          <p>Bei uns wird ausschliesslich mit Bargeld bezahlt.</p>
        </div>
      </div>

      <div style="text-align:center; margin-top:3.5rem;">
        <a href="kontakt.html" class="btn btn-primary">Jetzt reservieren</a>
      </div>
    </div>
  </section>`;

  await writePage("alp-beizli.html", {
    title: "Alp-Beizli – Rast auf 1600 m ü. M. | Alp Ober Roggenloch",
    description:
      "Unser Alp-Beizli auf 1600 m ü. M. bietet hausgemachten Alpkäse, Roggenlochplättli und Kuchen. Täglich offen von Mitte Juni bis Ende September.",
    active: "alp-beizli.html",
    bodyMain,
  });
}

// ---------- Video-Galerie ----------

async function buildVideoGalerie() {
  const bodyMain = `${pageHero("Video-Galerie", "Einblick in unsere Handarbeit", "Zwei kurze Videos zeigen, wie bei uns von Hand gebuttert und gekäst wird.")}
  <section>
    <div class="container">
      <div class="intro-split">
        <div>
          <h2 class="section-title" style="font-size:1.6rem;">Buttern</h2>
          <div class="map-embed">
            <a class="video-preview" href="https://www.youtube.com/watch?v=DV15exZ3_H8" target="_blank" rel="noopener" aria-label="Video &quot;Buttern&quot; auf YouTube ansehen">
              <img loading="lazy" src="https://i.ytimg.com/vi/DV15exZ3_H8/hqdefault.jpg" alt="Vorschaubild: Buttern auf der Alp Ober Roggenloch">
              <span class="video-play-btn">${icon("play")}</span>
            </a>
          </div>
        </div>
        <div>
          <h2 class="section-title" style="font-size:1.6rem;">Käsen</h2>
          <div class="map-embed">
            <a class="video-preview" href="https://www.youtube.com/watch?v=dwoAxG1zzZg" target="_blank" rel="noopener" aria-label="Video &quot;Käsen auf dem Holzfeuer&quot; auf YouTube ansehen">
              <img loading="lazy" src="https://i.ytimg.com/vi/dwoAxG1zzZg/hqdefault.jpg" alt="Vorschaubild: Käsen auf dem Holzfeuer, Alp Ober Roggenloch">
              <span class="video-play-btn">${icon("play")}</span>
            </a>
          </div>
        </div>
      </div>
      <p class="notice-box" style="margin-top:2.5rem;">Die Videos öffnen sich in einem neuen Tab auf YouTube.</p>
    </div>
  </section>`;

  await writePage("video-galerie.html", {
    title: "Video-Galerie | Alp Ober Roggenloch",
    description: "Videos vom Buttern und Käsen auf der Alp Ober Roggenloch – ein Einblick in unsere traditionelle Handarbeit.",
    active: "video-galerie.html",
    bodyMain,
  });
}

// ---------- Standort ----------

async function buildStandort() {
  const bodyMain = `${pageHero("Standort", "So findest du zu uns", "")}
  <section>
    <div class="container">
      <div class="map-embed" style="margin-bottom:3rem;">
        <iframe
          src="https://www.google.com/maps?q=46.9816953,8.8593516(Alp+Ober+Roggenloch)&z=15&output=embed"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="Karte: Alp Ober Roggenloch, Muotathal"></iframe>
      </div>

      <div class="intro-split" style="margin-bottom:3rem;">
        <div class="intro-visual"><img loading="lazy" src="public/images/standort/ib4dd576a03732f2c.jpg" alt="Wanderweg zur Alp Ober Roggenloch"></div>
        <div class="intro-text">
          <h2 class="section-title" style="font-size:1.8rem;">Anfahrt &amp; Wanderung</h2>
          <ol class="route-steps">
            <li>Autofahrt durch die Innerschweiz über Schwyz ins Muotathal.</li>
            <li>Weiter Richtung Pragelpass bis zum gekennzeichneten Parkplatz beim 3. Weidrost.</li>
            <li>Von dort aus 1,3 km Fussweg zur Alp – direkt nach dem Weidrost geht der Weg rechts weg.</li>
            <li>Sobald du das Restaurant «Unter Roggenloch» links unten siehst, gehst du noch 5 Minuten weiter geradeaus.</li>
          </ol>
          <p>Wer Lust auf mehr hat: Nachmittags lohnt sich eine rund zweistündige Rundwanderung zur Karstlandschaft Silberen.</p>
          <div class="notice-box"><span class="icon">${icon("warning")}</span> Am Wochenende ist der Zugang vom Glarnerland gesperrt.</div>
        </div>
      </div>
    </div>
  </section>`;

  await writePage("standort.html", {
    title: "Standort &amp; Anfahrt | Alp Ober Roggenloch",
    description:
      "So erreichst du die Alp Ober Roggenloch im Muotathal: Anfahrt über den Pragelpass, Parkplatz beim 3. Weidrost und 1,3 km Fussweg.",
    active: "standort.html",
    bodyMain,
  });
}

// ---------- Milchkanne Kunst ----------

async function buildMilchkanne() {
  const images = [
    "i1a1302af02320596", "ie4cde125ddce1446", "ic363db2aaff8c346",
    "icdfb3902bdbf0bd1", "i12991b1f37b335ec", "iaac500523a3eb52a",
  ];
  const grid = images
    .map(
      (id) =>
        `        <div class="gallery-item"><img loading="lazy" src="public/images/milchkanne-kunst/${id}.jpg" alt="Bemalte Milchkanne, Alp Ober Roggenloch"></div>`
    )
    .join("\n");

  const bodyMain = `${pageHero("Milchkanne Kunst", "Alte Milchkannen, neu verschönert", "Alte Milchkanne verschönert mit aufgemalten, ausgeschnittenen Motiven. Die Milchkanne kann als Dekoration, Schirmständer oder Laterne genutzt werden. Auf Anfrage sind Wunschmotive möglich.")}
  <section>
    <div class="container">
      <div class="gallery-grid">
${grid}
      </div>
      <div style="text-align:center; margin-top:3rem;">
        <a href="kontakt.html" class="btn btn-primary">Wunschmotiv anfragen</a>
      </div>
    </div>
  </section>`;

  await writePage("milchkanne-kunst.html", {
    title: "Milchkanne Kunst | Alp Ober Roggenloch",
    description:
      "Handbemalte, alte Milchkannen als Dekoration, Schirmständer oder Laterne – Wunschmotive auf Anfrage möglich.",
    active: "milchkanne-kunst.html",
    bodyMain,
  });
}

// ---------- Kontakt ----------

async function buildKontakt() {
  const bodyMain = `${pageHero("Kontakt", "Wir freuen uns auf deine Nachricht", "Fragen zur Reservation, zu unserem Alpkäse oder einfach Hallo sagen – melde dich gerne bei uns.")}
  <section>
    <div class="container">
      <div class="contact-grid">
        <div class="contact-info">
          <h3>Sommeradresse</h3>
          <div class="contact-detail">
            <span class="icon">${icon("mapPin")}</span>
            <div><strong>Alp Ober Roggenloch</strong>6436 Muotathal</div>
          </div>
          <div class="contact-detail">
            <span class="icon">${icon("phone")}</span>
            <div><strong>Telefon</strong>079 429 33 03 / 079 716 60 29</div>
          </div>
          <div class="contact-detail">
            <span class="icon">${icon("mail")}</span>
            <div><strong>E-Mail</strong>info@ober-roggenloch.ch</div>
          </div>

          <h3 style="margin-top:2.2rem;">Winteradresse</h3>
          <div class="contact-detail">
            <span class="icon">${icon("home")}</span>
            <div><strong>Beat und Margrit Suter</strong>Obriedenstr. 11, 6463 Bürglen</div>
          </div>

          <h3 style="margin-top:2.2rem;">Käse-Verkaufsstellen</h3>
          <div class="contact-detail">
            <span class="icon">${icon("cheese")}</span>
            <div>
              Wochenmarkt Altdorf<br>
              Dorfchäsi Eschenbach LU<br>
              Mooshof Adligenswil<br>
              Camping Torrent Susten (Leuk)
            </div>
          </div>

          <div class="social-row">
            <a href="https://www.instagram.com/ober.roggenloch/" target="_blank" rel="noopener" aria-label="Instagram">${icon("instagram")}</a>
            <a href="https://www.facebook.com/" target="_blank" rel="noopener" aria-label="Facebook">${icon("facebook")}</a>
          </div>
        </div>

        <form id="contactForm">
          <input type="hidden" name="access_key" value="BITTE-WEB3FORMS-KEY-EINTRAGEN">
          <input type="hidden" name="subject" value="Neue Nachricht über ober-roggenloch.ch">
          <input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">

          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required>
          </div>
          <div class="form-group">
            <label for="email">E-Mail</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="message">Nachricht</label>
            <textarea id="message" name="message" rows="5" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center;">Nachricht senden</button>
          <p class="form-note" id="formNote">Danke für deine Nachricht! Wir melden uns bald bei dir zurück.</p>
        </form>
      </div>
    </div>
  </section>`;

  await writePage("kontakt.html", {
    title: "Kontakt | Alp Ober Roggenloch",
    description:
      "Kontaktiere die Familie Suter auf der Alp Ober Roggenloch: Telefon, E-Mail oder direkt über das Kontaktformular.",
    active: "kontakt.html",
    bodyMain,
  });
}

// ---------- Links ----------

async function buildLinks() {
  const links = [
    { url: "http://www.boedmeren.ch", label: "boedmeren.ch", desc: "Der Bödmerenwald – einer der grössten Urwälder der Schweiz." },
    { url: "http://www.alpakaetzel.ch", label: "alpakaetzel.ch", desc: "Alpaka-Erlebnisse in der Region." },
    { url: "http://www.biomooshof.ch", label: "biomooshof.ch", desc: "Bio-Landwirtschaftsbetrieb Mooshof." },
    { url: "http://www.hofer-motos.ch", label: "hofer-motos.ch", desc: "Motorrad-Touren und mehr." },
  ];
  const cards = links
    .map(
      (l) => `        <a class="link-card" href="${l.url}" target="_blank" rel="noopener">
          <span class="icon">${icon("link")}</span>
          <div><strong>${l.label}</strong>${l.desc}</div>
        </a>`
    )
    .join("\n");

  const bodyMain = `${pageHero("Links", "Seiten, die uns gefallen", "")}
  <section>
    <div class="container">
      <div class="links-list">
${cards}
      </div>
    </div>
  </section>`;

  await writePage("links.html", {
    title: "Links | Alp Ober Roggenloch",
    description: "Empfehlenswerte externe Seiten aus der Region rund um die Alp Ober Roggenloch.",
    active: "links.html",
    bodyMain,
  });
}

// ---------- Foto-Galerie ----------

async function buildFotoGalerie() {
  const byYear = JSON.parse(
    await readFile(new URL("../content/raw/foto-galerie-by-year.json", import.meta.url), "utf-8")
  );

  const categoryMap = {
    "Sommer 2023": "sommer2023",
    "Sommer 2022": "sommer2022",
    "Sommer 2021": "sommer2021",
    "Winter im Roggenloch": "winter",
    "Sommer 2019": "sommer2019",
    "Sommer 2017": "sommer2017",
    "Bildergalerie": "weitere",
  };

  const filterLabels = [
    { key: "all", label: "Alle" },
    { key: "sommer2023", label: "Sommer 2023" },
    { key: "sommer2022", label: "Sommer 2022" },
    { key: "sommer2021", label: "Sommer 2021" },
    { key: "winter", label: "Winter" },
    { key: "sommer2019", label: "Sommer 2019" },
    { key: "sommer2017", label: "Sommer 2017" },
    { key: "weitere", label: "Weitere Impressionen" },
  ];

  const filterButtons = filterLabels
    .map(
      (f, i) =>
        `        <button class="filter-btn${i === 0 ? " active" : ""}" data-filter="${f.key}">${f.label}</button>`
    )
    .join("\n");

  // Echte Bildmasse auslesen und als width/height ins <img> schreiben, damit
  // der Browser den Platz in der Masonry-Galerie schon vor dem Laden reserviert
  // (kein Springen/"Nachladen" mehr beim Scrollen).
  async function galleryImgTag(id, cat, altSuffix) {
    const filePath = fileURLToPath(new URL(`../public/images/foto-galerie/${id}.jpg`, import.meta.url));
    let dims = "";
    try {
      const { width, height } = await imageSizeFromFile(filePath);
      dims = ` width="${width}" height="${height}"`;
    } catch {
      // Falls Masse nicht lesbar sind, ohne width/height weiterfahren
    }
    return `        <div class="gallery-item" data-cat="${cat}"><img loading="lazy" decoding="async"${dims} src="public/images/foto-galerie/${id}.jpg" alt="Impression Alp Ober Roggenloch – ${altSuffix}"></div>`;
  }

  const yearSections = (
    await Promise.all(
      byYear
        .filter((s) => categoryMap[s.year])
        .map(async (s) => {
          const cat = categoryMap[s.year];
          const items = (
            await Promise.all(s.ids.map((id) => galleryImgTag(id, cat, s.year)))
          ).join("\n");
          return `      <div class="gallery-year" data-year="${cat}">
        <h2>${s.year}</h2>
        <div class="gallery-grid gallery-masonry">
${items}
        </div>
      </div>`;
        })
    )
  ).join("\n\n");

  const bodyMain = `${pageHero("Foto-Galerie", "Einblicke in unser Alp-Leben", "In unserer Fotogalerie findest du Eindrücke von der Alp, den Tieren, dem Alpbeizli und der Umgebung – vom Sonnenaufgang in den Bergen bis zu frischem Käse direkt aus dem Kessi.")}
  <section>
    <div class="container">
      <div class="gallery-filters">
${filterButtons}
      </div>

${yearSections}

      <p class="gallery-empty" id="galleryEmpty">Für diese Auswahl sind aktuell keine Bilder vorhanden.</p>
    </div>
  </section>`;

  await writePage("foto-galerie.html", {
    title: "Foto-Galerie | Alp Ober Roggenloch",
    description:
      "Über 600 Fotos von der Alp Ober Roggenloch: Sommer und Winter, Tiere, Alp-Beizli und Bergwelt seit 2017.",
    active: "foto-galerie.html",
    bodyMain,
  });
}

async function main() {
  await buildIndex();
  await buildUeberUns();
  await buildAlpBeizli();
  await buildVideoGalerie();
  await buildStandort();
  await buildMilchkanne();
  await buildKontakt();
  await buildLinks();
  await buildFotoGalerie();
}

main();
