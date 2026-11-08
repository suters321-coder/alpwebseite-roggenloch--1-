// Liest die Fill-Farben der Vektor-Operationen aus Moodboard.pdf aus,
// um die 5 Farbkreise zu finden – ohne das PDF komplett zu rendern
// (umgeht Probleme mit eingebetteten Fotos + native canvas-Abhängigkeit).
import { readFile } from "node:fs/promises";

const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

function toHex(r, g, b) {
  const c = (v) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

async function main() {
  const pdfPath = new URL("../Moodboard.pdf", import.meta.url);
  const data = new Uint8Array(await readFile(pdfPath));

  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const page = await pdf.getPage(1);
  const opList = await page.getOperatorList();

  const OPS = pdfjsLib.OPS;
  const fillColors = [];

  for (let i = 0; i < opList.fnArray.length; i++) {
    const fn = opList.fnArray[i];
    const args = opList.argsArray[i];

    if (fn === OPS.setFillRGBColor || fn === OPS.setFillColorN || fn === OPS.setFillColor) {
      fillColors.push({ op: "fill", args });
    }
    if (fn === OPS.setFillRGBColor) {
      const [r, g, b] = args;
      fillColors.push({ hex: toHex(r, g, b), rgb: [r, g, b] });
    }
  }

  console.log("Alle setFillRGBColor-Aufrufe (Vektor-Füllfarben) in Reihenfolge:");
  let count = 0;
  for (let i = 0; i < opList.fnArray.length; i++) {
    const fn = opList.fnArray[i];
    if (fn === OPS.setFillRGBColor) {
      const args = opList.argsArray[i];
      console.log(`  ${++count}: raw args =`, args, " type:", typeof args, Array.isArray(args));
    }
  }

  if (count === 0) {
    console.log("Keine setFillRGBColor gefunden. Versuche andere Farb-Operatoren...");
    const opNames = Object.keys(OPS);
    const seen = new Set();
    for (const fn of opList.fnArray) {
      const name = opNames.find((n) => OPS[n] === fn);
      if (name && name.toLowerCase().includes("fill") && !seen.has(name)) {
        seen.add(name);
        console.log("  gefunden:", name);
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
