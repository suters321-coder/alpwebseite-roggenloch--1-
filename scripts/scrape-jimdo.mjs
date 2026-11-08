// Einmaliges Scraping-Skript: sichert Text und Bild-Referenzen der bestehenden
// Jimdo-Seite ober-roggenloch.ch, bevor die neue Seite gebaut wird.
// Nutzung: node scripts/scrape-jimdo.mjs

import { writeFile, mkdir } from "node:fs/promises";
import * as cheerio from "cheerio";

const BASE = "https://www.ober-roggenloch.ch";

const PAGES = {
  startseite: "/unsere-alp/startseite/",
  root: "/",
  "ueber-uns": "/unsere-alp/über-uns/",
  "alp-beizli": "/unsere-alp/alp-beizli/",
  "foto-galerie": "/unsere-alp/foto-galerie/",
  "video-galerie": "/unsere-alp/video-galerie/",
  standort: "/unsere-alp/standort/",
  "milchkanne-kunst": "/unsere-alp/milchkanne-kunst/",
  kontakt: "/unsere-alp/kontakt/",
  links: "/unsere-alp/links/",
  "social-media": "/unsere-alp/social-media-folge-uns/",
};

const OUT_DIR = new URL("../content/raw/", import.meta.url);

async function fetchHtml(path) {
  const url = path.startsWith("http") ? path : BASE + path;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
  });
  if (!res.ok) {
    throw new Error(`GET ${url} -> ${res.status}`);
  }
  return res.text();
}

function extractPage($) {
  const title = $("title").first().text().trim();

  const headings = [];
  $("h1, h2, h3").each((_, el) => {
    const text = $(el).text().trim();
    if (text) headings.push({ tag: el.tagName, text });
  });

  const paragraphs = [];
  $("p").each((_, el) => {
    const text = $(el).text().trim();
    if (text) paragraphs.push(text);
  });

  const images = [];
  $("img").each((_, el) => {
    const src =
      $(el).attr("src") ||
      $(el).attr("data-src") ||
      $(el).attr("data-original");
    const alt = $(el).attr("alt") || "";
    if (src) images.push({ src: normalizeUrl(src), alt: alt.trim() });
  });

  // Jimdo-Galerien lagern oft weitere Bild-IDs in data-Attributen oder JSON
  // im Seiten-Markup (z.B. Lightbox-Konfiguration). Wir sammeln zusätzlich
  // alle image.jimcdn.com-Treffer im rohen HTML als Fallback.
  const links = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const text = $(el).text().trim();
    if (href) links.push({ href: normalizeUrl(href), text });
  });

  return { title, headings, paragraphs, images, links };
}

function normalizeUrl(src) {
  if (src.startsWith("//")) return "https:" + src;
  if (src.startsWith("/")) return BASE + src;
  return src;
}

function extractJimcdnIdsFromRawHtml(html) {
  const regex =
    /https:\/\/image\.jimcdn\.com\/app\/cms\/image\/transf\/[^"'\s)]+/g;
  const matches = html.match(regex) || [];
  return [...new Set(matches)];
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const summary = {};

  for (const [key, path] of Object.entries(PAGES)) {
    try {
      console.log(`Scraping ${key} (${path}) ...`);
      const html = await fetchHtml(path);
      const $ = cheerio.load(html);
      const page = extractPage($);
      const rawImageUrls = extractJimcdnIdsFromRawHtml(html);

      const data = { key, path, url: BASE + path, ...page, rawImageUrls };
      await writeFile(
        new URL(`${key}.json`, OUT_DIR),
        JSON.stringify(data, null, 2),
        "utf-8"
      );

      summary[key] = {
        paragraphs: page.paragraphs.length,
        images: page.images.length,
        rawImageUrls: rawImageUrls.length,
        links: page.links.length,
      };
    } catch (err) {
      console.error(`Fehler bei ${key}:`, err.message);
      summary[key] = { error: err.message };
    }
  }

  await writeFile(
    new URL("_summary.json", OUT_DIR),
    JSON.stringify(summary, null, 2),
    "utf-8"
  );

  console.log("\nFertig. Zusammenfassung:");
  console.table(summary);
}

main();
