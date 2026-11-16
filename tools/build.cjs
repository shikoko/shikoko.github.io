// Builds the site into build/site, as the Deploy workflow publishes it: the
// page and its assets, the PDF the Download PDF button saves, and the social
// preview image, the last two rendered with Chromium. Also renders the
// 1280x640 copy of the card for the repository's social preview on GitHub
// into build/, outside the site.
//
// Run it with `npm run build`.

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const out = path.join(root, "build");
const site = path.join(out, "site");
const pdfPages = 2;

const fileUrl = (file) => "file://" + path.join(root, file);

async function open(browser, file, viewport) {
  const page = await browser.newPage(viewport ? { viewport } : {});
  await page.goto(fileUrl(file), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // The fonts come from Google Fonts. Without them the PDF and the card
  // would quietly use fallback fonts, so stop instead.
  const missing = await page.evaluate(() =>
    ["Inter", "JetBrains Mono"].filter((family) => !document.fonts.check(`16px "${family}"`))
  );
  if (missing.length) throw new Error(`${file}: ${missing.join(" and ")} didn't load.`);
  return page;
}

async function main() {
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(site, { recursive: true });
  fs.copyFileSync(path.join(root, "index.html"), path.join(site, "index.html"));
  fs.cpSync(path.join(root, "assets"), path.join(site, "assets"), { recursive: true });

  const browser = await chromium.launch();
  try {
    const cv = await open(browser, "index.html");
    await cv.evaluate(() => { document.title = "Bogdan Roatis - CV"; });
    const pdf = await cv.pdf({
      path: path.join(site, "Bogdan-Roatis-CV.pdf"),
      preferCSSPageSize: true,
      printBackground: true,
    });
    const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page(?![A-Za-z])/g) || []).length;
    if (pages !== pdfPages) {
      throw new Error(`The PDF has ${pages} pages instead of ${pdfPages}: shorten the content or tighten the print styles.`);
    }

    const cards = [
      { width: 1200, height: 630, file: path.join(site, "assets", "social-preview.png") },
      { width: 1280, height: 640, file: path.join(out, "github-social-preview.png") },
    ];
    for (const { width, height, file } of cards) {
      const card = await open(browser, "tools/social-card.html", { width, height });
      await card.screenshot({ path: file });
      await card.close();
    }
  } finally {
    await browser.close();
  }

  for (const file of ["site/index.html", "site/Bogdan-Roatis-CV.pdf", "site/assets/social-preview.png", "github-social-preview.png"]) {
    const size = fs.statSync(path.join(out, file)).size;
    console.log(`build/${file}  ${Math.ceil(size / 1024)} KB`);
  }
  console.log(`The PDF has ${pdfPages} pages.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
