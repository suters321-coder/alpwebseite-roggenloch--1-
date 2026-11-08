// Lädt Hintergrund-Texturen über die Pexels API. Sie dienen als Muster und
// Flächen im CSS, nicht als Bildinhalt.
// Benötigt PEXELS_API_KEY in .env.local (nicht eingecheckt).
//
//   node scripts/fetch-textures.mjs kandidaten <zielordner>   Vorschauen je Suchbegriff
//   node scripts/fetch-textures.mjs holen <name>=<pexels-id> ...   Auswahl in voller Grösse
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const ROOT = new URL("../", import.meta.url);

const SUCHEN = {
  holz: "dark brown wooden planks texture",
  holzhell: "light wood plank wall texture",
  karo: "red white checkered tablecloth pattern",
  wald: "pine forest mountains mist",
};

async function apiKey() {
  const env = await readFile(new URL(".env.local", ROOT), "utf-8");
  const match = env.match(/PEXELS_API_KEY=(.+)/);
  if (!match) throw new Error("PEXELS_API_KEY nicht in .env.local gefunden");
  return match[1].trim();
}

async function pexels(key, url) {
  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) throw new Error(`Pexels-Fehler ${res.status}: ${url}`);
  return res.json();
}

async function speichern(url, ziel) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download-Fehler ${res.status}: ${url}`);
  await writeFile(ziel, Buffer.from(await res.arrayBuffer()));
}

async function kandidaten(key, ordner) {
  const dir = pathToFileURL(path.resolve(ordner) + path.sep);
  await mkdir(dir, { recursive: true });
  for (const [name, query] of Object.entries(SUCHEN)) {
    const data = await pexels(
      key,
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`
    );
    for (const [i, foto] of data.photos.entries()) {
      await speichern(foto.src.tiny, new URL(`${name}-${i + 1}-${foto.id}.jpg`, dir));
      console.log(`${name}-${i + 1}: id ${foto.id} (${foto.photographer})`);
    }
  }
}

async function holen(key, auswahl) {
  const dir = new URL("public/images/textures/", ROOT);
  await mkdir(dir, { recursive: true });
  const nachweise = [];
  for (const eintrag of auswahl) {
    const [name, id] = eintrag.split("=");
    const foto = await pexels(key, `https://api.pexels.com/v1/photos/${id}`);
    const url = `${foto.src.original}?auto=compress&cs=tinysrgb&w=1920`;
    await speichern(url, new URL(`${name}.jpg`, dir));
    nachweise.push(`- ${name}.jpg: Foto von ${foto.photographer} auf Pexels, ${foto.url}`);
    console.log(`${name}.jpg <- ${foto.url}`);
  }
  await writeFile(
    new URL("BILDNACHWEISE.md", dir),
    `# Bildnachweise Texturen\n\n${nachweise.join("\n")}\n`,
    "utf-8"
  );
}

const [modus, ...rest] = process.argv.slice(2);
const key = await apiKey();
if (modus === "kandidaten") await kandidaten(key, rest[0]);
else if (modus === "holen") await holen(key, rest);
else console.log("Modus: kandidaten <ordner> | holen name=id ...");
