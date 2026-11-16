# shikoko.github.io

Bogdan Roatis's CV, published at **https://shikoko.github.io/**, with a [PDF version](https://shikoko.github.io/Bogdan-Roatis-CV.pdf).

## How it's made

The CV is one hand-written page, [`index.html`](index.html) with [`assets/css/resume.css`](assets/css/resume.css): light and dark themes on screen, and an A4 print stylesheet for the PDF. There's no framework or site generator.

`npm run build` ([`tools/build.cjs`](tools/build.cjs)) builds the site into `build/site/`. It copies the page and renders two files from it with Chromium, through Playwright:

- `Bogdan-Roatis-CV.pdf`, the copy the **Download PDF** button saves. The build fails if it isn't two A4 pages.
- `assets/social-preview.png`, the picture shown when the link is shared, from [`tools/social-card.html`](tools/social-card.html).

The [Deploy workflow](.github/workflows/deploy.yml) runs the build for every pull request into `main`, and publishes every push to `main` with GitHub Pages.

## Building it locally

You need Node.js 20 or newer (the workflow uses 22). From the repository's folder:

```bash
npm ci
```

```bash
npx playwright install chromium
```

```bash
npm run build
```

Then open `build/site/index.html` and `build/site/Bogdan-Roatis-CV.pdf`.

## Making changes

[`CLAUDE.md`](CLAUDE.md) has the rules for working here: one branch per change, pull requests into `main` merged with a merge commit, commit message style, and how to keep the PDF and the social preview in step with the page.

## History

Started in 2019 from Crisp's [Minimal Résumé](https://github.com/crispgm/resume) Jekyll template, and rewritten as a hand-written page in 2026.
