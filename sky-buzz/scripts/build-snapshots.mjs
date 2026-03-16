import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";

const SITES = [
  "https://haionline.ro",
  "https://5dent.haionline.ro",
  "https://abtdental.haionline.ro",
  "https://agident.haionline.ro",
  "https://asociatiapensionariloritalieni.haionline.ro",
  "https://artz-dent.haionline.ro",
  "https://avocatgeaninadragu.haionline.ro",
  "https://beautyskin.haionline.ro",
  "https://biocaredental.haionline.ro",
  "https://casaardeleana.haionline.ro",
  "https://cascodentar.haionline.ro",
  "https://casemodularebuzau.haionline.ro",
  "https://clinicilepink.haionline.ro",
  "https://companiamica.haionline.ro",
  "https://constructiidurabile.haionline.ro",
  "https://dadudental.haionline.ro",
  "https://deosdental.haionline.ro",
  "https://dentimar.haionline.ro",
  "https://dentone.haionline.ro",
  "https://dianabeauty.haionline.ro",
  "https://dianaciobanu.haionline.ro",
  "https://doctordezambete.haionline.ro",
  "https://dpdental.haionline.ro",
  "https://drbogdan.haionline.ro",
  "https://drdameh.haionline.ro",
  "https://drgheorghiade.haionline.ro",
  "https://dristordent.haionline.ro",
  "https://duodent.haionline.ro",
  "https://estheticdentalcenter.haionline.ro",
  "https://eviakids.haionline.ro",
  "https://factorysalon.haionline.ro",
  "https://flordent.haionline.ro",
  "https://getnic.haionline.ro",
  "https://glambody.haionline.ro",
  "https://gradinitaoac.haionline.ro",
  "https://gradinitasteaua.haionline.ro",
  "https://hopsieu.haionline.ro",
  "https://ifloribucuresti.haionline.ro",
  "https://iratruck.haionline.ro",
  "https://jigaudentalclinic.haionline.ro",
  "https://kidsco.haionline.ro",
  "https://kinetoperfect.haionline.ro",
  "https://mikodental.haionline.ro",
  "https://miradent.haionline.ro",
  "https://numeris.haionline.ro",
  "https://optica87.haionline.ro",
  "https://pinkup.haionline.ro",
  "https://prolife.haionline.ro",
  "https://quantica720.haionline.ro",
  "https://rana-art-dent.haionline.ro",
  "https://renartdesign.haionline.ro",
  "https://restaurantnicoresti.haionline.ro",
  "https://saloneliza.haionline.ro",
  "https://salonmalibu.haionline.ro",
  "https://salonnicol.haionline.ro",
  "https://scoaladebeauty.haionline.ro",
  "https://sebdental.haionline.ro",
  "https://sunnylandkids.haionline.ro",
  "https://ultraestetic.haionline.ro",
  "https://ultimeledorinte.haionline.ro",
  "https://vanestetic.haionline.ro",
  "https://vitaldent.haionline.ro",
  "https://worlddentistry.haionline.ro",
  "https://salonbeautyarena.ro",
  "https://drdent.ro",
  "https://hrfluent.com",
  "https://clubulzambetelor.ro",
  "https://ringabell.ro",
  "https://pilotcenter.net",
  "https://muzicapentruviata.ro",
  "https://realview3d.ro",
  "https://enumismatica.ro",
  "https://avidobakery.ro",
];

const OUT_DIR = path.resolve(process.cwd(), "public", "snapshots");
const JSON_OUT = path.resolve(process.cwd(), "public", "snapshots", "index.json");
const FALLBACKS = [
  "https://picsum.photos/1200/900?grayscale&random=401",
  "https://picsum.photos/1200/900?grayscale&random=402",
  "https://picsum.photos/1200/900?grayscale&random=403",
  "https://picsum.photos/1200/900?grayscale&random=404",
  "https://picsum.photos/1200/900?grayscale&random=405",
  "https://picsum.photos/1200/900?grayscale&random=406",
  "https://picsum.photos/1200/900?grayscale&random=407",
  "https://picsum.photos/1200/900?grayscale&random=408",
];

const slug = (url) =>
  new URL(url)
    .hostname.replace(/^www\./, "")
    .replace(/[^a-z0-9.-]/gi, "_")
    .replace(/\./g, "_");

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function capturePage(page, url) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  return page.screenshot({ type: "png", fullPage: false });
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const mapping = {};

  for (let i = 0; i < SITES.length; i += 1) {
    const url = SITES[i];
    const file = `${slug(url)}.png`;
    const filePath = path.join(OUT_DIR, file);

    try {
      let buffer;
      try {
        buffer = await capturePage(page, url);
      } catch {
        const host = new URL(url).hostname.replace(/^www\./, "");
        const retries = [`https://www.${host}`, `http://${host}`];
        let captured = null;
        for (const retry of retries) {
          try {
            captured = await capturePage(page, retry);
            break;
          } catch {
            // noop
          }
        }
        if (!captured) {
          throw new Error("capture failed");
        }
        buffer = captured;
      }

      await fs.writeFile(filePath, buffer);
      mapping[url] = `/snapshots/${file}`;
      console.log(`[snapshots] ok ${url} -> ${file}`);
    } catch {
      mapping[url] = FALLBACKS[i % FALLBACKS.length];
      console.log(`[snapshots] fallback ${url} -> ${mapping[url]}`);
    }

    await timeout(150);
  }

  await fs.writeFile(JSON_OUT, JSON.stringify(mapping, null, 2), "utf8");
  await browser.close();
  console.log(`[snapshots] manifest written: ${JSON_OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
