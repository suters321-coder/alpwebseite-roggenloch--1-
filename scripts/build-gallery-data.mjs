// Ordnet die 689 Foto-Galerie-Bilder ihren Jahres-Abschnitten zu, indem die
// Original-HTML-Struktur (Reihenfolge von h1-Überschriften und img-Tags im
// DOM) ausgewertet wird. Schreibt content/raw/foto-galerie-by-year.json.
import { writeFile } from "node:fs/promises";
import * as cheerio from "cheerio";

const BASE = "https://www.ober-roggenloch.ch";
const PATH = "/unsere-alp/foto-galerie/";

function extractIdFromUrl(url) {
  const match = url.match(/\/(image|backgroundarea)\/([a-z0-9]+)\/version/i);
  return match ? match[2] : null;
}

async function main() {
  const res = await fetch(BASE + PATH, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Jimdo rendert die Seite als Abfolge von Content-Widgets im Body.
  // Wir laufen durch alle Elemente im Dokument in Reihenfolge und merken uns,
  // unter welcher zuletzt gesehenen h1 (Jahres-Titel) ein Bild auftaucht.
  const sections = [];
  let current = { year: "Einleitung", ids: [] };
  sections.push(current);

  const knownYearHeadings = new Set([
    "Sommer 2023", "Sommer 2022", "Sommer 2021", "Winter im Roggenloch",
    "Sommer 2019", "Herbst/ Winter 2017", "Sommer 2017", "Bildergalerie",
  ]);

  $("body")
    .find("h1, img")
    .each((_, el) => {
      const tag = el.tagName.toLowerCase();
      if (tag === "h1") {
        const text = $(el).text().trim();
        if (knownYearHeadings.has(text)) {
          current = { year: text, ids: [] };
          sections.push(current);
        }
      } else if (tag === "img") {
        const src = $(el).attr("src") || $(el).attr("data-src");
        if (!src || !src.includes("image.jimcdn.com")) return;
        const id = extractIdFromUrl(src);
        if (id && !current.ids.includes(id)) current.ids.push(id);
      }
    });

  const cleaned = sections.filter((s) => s.ids.length > 0);

  await writeFile(
    new URL("../content/raw/foto-galerie-by-year.json", import.meta.url),
    JSON.stringify(cleaned, null, 2),
    "utf-8"
  );

  console.log(
    cleaned.map((s) => `${s.year}: ${s.ids.length} Bilder`).join("\n")
  );
  console.log(
    "Total zugeordnet:",
    cleaned.reduce((sum, s) => sum + s.ids.length, 0)
  );
}

main();
