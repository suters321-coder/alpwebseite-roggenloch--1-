// Bausteine, die auf jeder Seite gleich sind (Kopfbereich der Unterseiten,
// Besuchs-Abschnitt vor dem Footer, Footer).
import { icon } from "./icons.mjs";

export function pageHero(label, title, intro = "") {
  return `  <section class="page-hero">
    <div class="container">
      <span class="section-label">${label}</span>
      <h1>${title}</h1>${intro ? `\n      <p>${intro}</p>` : ""}
    </div>
  </section>
`;
}

// Der Abschnitt steht auf jeder Seite; Überschrift, Buttons und der dritte
// Eintrag auf dem Brett weichen dort ab, wo sie sonst die Seite wiederholen.
export function visitBand(path = "") {
  const anfahrt = `<a href="standort.html" class="btn btn-lime">Anfahrt ansehen</a>`;
  const kontakt = (cls) => `<a href="kontakt.html" class="btn ${cls}">Kontakt</a>`;

  let titel = "Wir freuen uns auf deinen Besuch";
  let buttons = `${anfahrt}\n        ${kontakt("btn-outline")}`;
  let dritter = `<li><span class="dot dot-brown">${icon("phone")}</span><div><strong>Telefon</strong>079 429 33 03</div></li>`;

  if (path === "index.html") titel = "Der Weg zu uns";
  if (path === "standort.html") buttons = kontakt("btn-lime");
  if (path === "kontakt.html") {
    buttons = anfahrt;
    dritter = `<li><span class="dot dot-brown">${icon("home")}</span><div><strong>Alp-Beizli</strong>Täglich offen, je nach Wetter</div></li>`;
  }

  return `<section class="visit-band">
  <div class="visit-forest">
    <div class="visit-forest-inner">
      <span class="section-label">Besuch uns</span>
      <h2>${titel}</h2>
      <p>Die Alp Ober Roggenloch liegt auf 1600 m ü. M. im Muotathal. Vom Parkplatz beim 3. Weidrost sind es 1,3 km zu Fuss.</p>
      <div class="btn-row">
        ${buttons}
      </div>
    </div>
  </div>
  <div class="visit-table">
    <div class="visit-board">
      <h3>Gut zu wissen</h3>
      <ul>
        <li><span class="dot dot-red">${icon("calendar")}</span><div><strong>Saison</strong>Anfang Juni – Ende September</div></li>
        <li><span class="dot dot-pine">${icon("coins")}</span><div><strong>Bezahlung</strong>Nur mit Bargeld</div></li>
        ${dritter}
      </ul>
    </div>
  </div>
</section>`;
}

export function footer() {
  return `<footer>
  <div class="container">
    <div class="footer-inner">
      <div class="footer-col">
        <div class="footer-logo">${icon("mountain")} Alp Ober Roggenloch</div>
        <p>Familie Suter · 6436 Muotathal<br>Saison: Anfang Juni – Ende September</p>
        <div class="footer-social">
          <a href="https://www.instagram.com/ober.roggenloch/" target="_blank" rel="noopener" aria-label="Instagram">${icon("instagram")}</a>
          <a href="https://www.facebook.com/" target="_blank" rel="noopener" aria-label="Facebook">${icon("facebook")}</a>
        </div>
      </div>
      <div class="footer-col">
        <strong class="footer-title">Navigation</strong>
        <ul class="footer-nav">
          <li><a href="index.html">Startseite</a></li>
          <li><a href="ueber-uns.html">Über uns</a></li>
          <li><a href="alp-beizli.html">Alp-Beizli</a></li>
          <li><a href="foto-galerie.html">Foto-Galerie</a></li>
          <li><a href="standort.html">Standort</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <strong class="footer-title">Kontakt</strong>
        <p>Tel. 079 429 33 03<br>079 716 60 29<br><a href="mailto:info@ober-roggenloch.ch">info@ober-roggenloch.ch</a></p>
      </div>
    </div>
    <p class="footer-bottom">&copy; ${new Date().getFullYear()} Alp Ober Roggenloch – Familie Suter · Muotathal · <a href="impressum.html">Impressum</a> · <a href="datenschutz.html">Datenschutz</a></p>
  </div>
</footer>`;
}
