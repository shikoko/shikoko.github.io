// Builds the site into build/site, as the Deploy workflow publishes it: the
// home page, the CV in cv/, their assets, the PDF the Download PDF button
// saves, and the two pages' social preview images, the last three rendered
// with Chromium.
// Also renders the 1280x640 copy of the card for the repository's social
// preview on GitHub into build/, outside the site. It stops if a page links
// to a file of the site that isn't there.
//
// Run it with `npm run build`.

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const out = path.join(root, "build");
const site = path.join(out, "site");
const maxPdfPages = 3;

const fileUrl = (file) => "file://" + path.join(root, file);

async function open(browser, file, viewport) {
  const page = await browser.newPage(viewport ? { viewport } : {});
  await page.goto(fileUrl(file), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // The fonts come from Google Fonts. Without them the PDF and the card
  // would quietly use fallback fonts, so stop instead. Each is asked for
  // first, since a page only downloads the weights it draws text in.
  const missing = await page.evaluate(async () => {
    const fonts = [["Google Sans", "400"], ["JetBrains Mono", "400"]];
    await Promise.all(fonts.map(([family, weight]) => document.fonts.load(`${weight} 16px "${family}"`).catch(() => [])));
    return fonts
      .filter(([family, weight]) => !document.fonts.check(`${weight} 16px "${family}"`))
      .map(([family]) => family);
  });
  if (missing.length) throw new Error(`${file}: ${missing.join(" and ")} didn't load.`);
  return page;
}

async function main() {
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(site, { recursive: true });
  fs.copyFileSync(path.join(root, "index.html"), path.join(site, "index.html"));
  fs.cpSync(path.join(root, "cv"), path.join(site, "cv"), { recursive: true });
  fs.cpSync(path.join(root, "assets"), path.join(site, "assets"), { recursive: true });

  let pdfPagesBuilt = 0;
  const browser = await chromium.launch();
  try {
    // The home page is opened too, so its fonts are checked like the CV's.
    await (await open(browser, "index.html")).close();
    const cv = await open(browser, "cv/index.html");
    await cv.evaluate(() => { document.title = "Bogdan Roatis - CV"; });
    const pdf = await cv.pdf({
      path: path.join(site, "Bogdan-Roatis-CV.pdf"),
      preferCSSPageSize: true,
      printBackground: true,
    });
    const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page(?![A-Za-z])/g) || []).length;
    if (pages > maxPdfPages) {
      throw new Error(`The PDF has ${pages} pages, more than ${maxPdfPages}: shorten the content or tighten the print styles.`);
    }
    pdfPagesBuilt = pages;

    const cards = [
      { source: "tools/social-card.html", width: 1200, height: 630, file: path.join(site, "assets", "social-preview.png") },
      { source: "tools/social-card.html", width: 1280, height: 640, file: path.join(out, "github-social-preview.png") },
      { source: "tools/home-card.html", width: 1200, height: 630, file: path.join(site, "assets", "home-preview.png") },
    ];
    for (const { source, width, height, file } of cards) {
      const card = await open(browser, source, { width, height });
      await card.screenshot({ path: file });
      await card.close();
    }
  } finally {
    await browser.close();
  }

  checkLinks(["index.html", "cv/index.html"]);

  for (const file of ["site/index.html", "site/cv/index.html", "site/Bogdan-Roatis-CV.pdf", "site/assets/social-preview.png", "site/assets/home-preview.png", "github-social-preview.png"]) {
    const size = fs.statSync(path.join(out, file)).size;
    console.log(`build/${file}  ${Math.ceil(size / 1024)} KB`);
  }
  console.log(`The PDF has ${pdfPagesBuilt} pages.`);
}

// Every src, href and poster on the pages that points into the site must be
// a file the build made or copied.
function checkLinks(pages) {
  const missing = [];
  for (const page of pages) {
    const html = fs.readFileSync(path.join(site, page), "utf8");
    for (const [, url] of html.matchAll(/(?:src|href|poster)="([^"#]+)/g)) {
      if (/^[a-z]+:/i.test(url) || url.startsWith("//")) continue;
      let file = path.join(site, path.dirname(page), url.split("?")[0]);
      if (url.endsWith("/")) file = path.join(file, "index.html");
      if (!fs.existsSync(file)) missing.push(`${page}: ${url}`);
    }
  }
  if (missing.length) throw new Error(`Links to files that aren't in the site:\n${missing.join("\n")}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
