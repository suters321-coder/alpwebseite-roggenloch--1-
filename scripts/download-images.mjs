// Lädt alle in content/raw/*.json gefundenen Jimdo-Bilder in höchstmöglicher
// Auflösung herunter und legt sie strukturiert unter public/images/<seite>/ ab.
// Nutzung: node scripts/download-images.mjs

import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const RAW_DIR = new URL("../content/raw/", import.meta.url);
const IMAGES_DIR = new URL("../public/images/", import.meta.url);

// Jimdo-Bild-URL-Muster:
// https://image.jimcdn.com/app/cms/image/transf/<TRANSFORM>/path/<SITE>/image|backgroundarea/<ID>/version/<V>/image.jpg
// Für Originalqualität ersetzen wir <TRANSFORM> durch "none".
function toOriginalUrl(url) {
  return url.replace(/\/transf\/[^/]+\//, "/transf/none/");
}

function extractIdFromUrl(url) {
  const match = url.match(/\/(image|backgroundarea)\/([a-z0-9]+)\/version/i);
  return match ? match[2] : null;
}

async function downloadOne(url, destPath) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
  });
  if (!res.ok || !res.body) {
    throw new Error(`GET ${url} -> ${res.status}`);
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
}

async function main() {
  const files = (await readdir(RAW_DIR)).filter(
    (f) => f.endsWith(".json") && f !== "_summary.json"
  );

  const report = {};

  for (const file of files) {
    const key = file.replace(/\.json$/, "");
    const data = JSON.parse(
      await readFile(new URL(file, RAW_DIR), "utf-8")
    );

    const urls = new Set([
      ...data.images.map((i) => i.src),
      ...(data.rawImageUrls || []),
    ]);

    // Nur echte Jimdo-CDN-Bilder behalten (keine Icons/Avatare o.ä. ausschliessen wir hier nicht,
    // da wir lieber zu viel als zu wenig sichern)
    const jimcdnUrls = [...urls].filter((u) => u.includes("image.jimcdn.com"));

    const destDir = new URL(`${key}/`, IMAGES_DIR);
    await mkdir(destDir, { recursive: true });

    let ok = 0;
    let failed = 0;
    const seenIds = new Set();
    let processed = 0;
    const candidateCount = jimcdnUrls.length;

    for (const url of jimcdnUrls) {
      processed++;
      if (processed % 50 === 0) {
        console.log(`  ${key}: ${processed}/${candidateCount} geprüft, ${ok} geladen`);
      }
      const id = extractIdFromUrl(url);
      if (!id || seenIds.has(id)) continue; // gleiches Bild in mehreren Auflösungen -> einmal reicht
      seenIds.add(id);

      const originalUrl = toOriginalUrl(url);
      const destPath = new URL(`${id}.jpg`, destDir);

      try {
        await stat(destPath);
        ok++; // schon vorhanden -> überspringen (resume-fähig)
        continue;
      } catch {
        // Datei existiert noch nicht -> herunterladen
      }

      try {
        await downloadOne(originalUrl, destPath);
        ok++;
      } catch (err) {
        // Fallback: manche Bilder liefern bei transf=none einen Fehler -> Original-URL nochmal probieren
        try {
          await downloadOne(url, destPath);
          ok++;
        } catch (err2) {
          console.error(`Fehler bei ${key}/${id}:`, err2.message);
          failed++;
        }
      }
    }

    report[key] = { total: seenIds.size, ok, failed };
    console.log(`${key}: ${ok}/${seenIds.size} Bilder geladen (${failed} Fehler)`);
  }

  await writeFile(
    new URL("_download-report.json", RAW_DIR),
    JSON.stringify(report, null, 2),
    "utf-8"
  );

  console.log("\nFertig.");
  console.table(report);
}

main();
