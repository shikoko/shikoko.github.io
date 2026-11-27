# shikoko.github.io

Bogdan Roatis's site, published at **https://shikoko.github.io/**: his projects and the apps he's worked on, and his [CV](https://shikoko.github.io/cv/), with a [PDF version](https://shikoko.github.io/Bogdan-Roatis-CV.pdf).

## How it's made

Two hand-written pages, with no framework or site generator:

- **The home page**, [`index.html`](index.html) with [`assets/css/home.css`](assets/css/home.css) on top of the CV's stylesheet. It shows the projects (Tributary and Signature, each published from its own repository) as small versions of their README images, the two STEM apps with short silent loops on one black band, and the other apps with their store icons. Its pictures, loops and icons are in [`assets/work/`](assets/work/).
- **The CV**, [`cv/index.html`](cv/index.html) with [`assets/css/resume.css`](assets/css/resume.css): a scrolling, editorial layout with light and dark themes on screen, and an A4 print stylesheet for the PDF.

Both pages share the theme button, [`assets/js/theme.js`](assets/js/theme.js), and the choice it saves.

`npm run build` ([`tools/build.cjs`](tools/build.cjs)) builds the site into `build/site/`. It copies the pages, checks that every file they link to is there, and renders two files from the CV with Chromium, through Playwright:

- `Bogdan-Roatis-CV.pdf`, the copy the **CV** download button saves. The build fails if it's longer than three A4 pages.
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

Then serve `build/site/` and open it, for example with `python3 -m http.server -d build/site 8000` and http://localhost:8000, and open `build/site/Bogdan-Roatis-CV.pdf`.

## Making changes

[`CLAUDE.md`](CLAUDE.md) has the rules for working here: one branch per change, pull requests into `main` merged with a merge commit, commit message style, how to keep the PDF and the social preview in step with the CV, and how to add work to the home page.

The app icons on the home page are from the App Store and Google Play, and belong to their apps' owners.

## History

Started in 2019 from Crisp's [Minimal Résumé](https://github.com/crispgm/resume) Jekyll template, and rewritten as a hand-written page in 2026. The home page was added later in 2026, when the CV moved to `/cv/`.
