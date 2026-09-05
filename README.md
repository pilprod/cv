# Ilya Papou — CV

A static English CV published at [papou.work](https://papou.work).

Content source: [CV — Revised · Platform & Agent Systems](https://www.figma.com/design/IGMsmWvk5wS9uS77rJqMLd/?node-id=370-2), frames `370:3` and `370:105`. The website uses the complete current text and six selected-technology categories from this page, with separate screen and print layouts. Semicolons in prose are replaced with sentence breaks without changing meaning.

- `index.html` contains the CV content.
- `styles.css` provides responsive layouts and two-page A4 printing.
- `assets/portrait.jpg` and `assets/fonts/` contain the portrait and local fonts.

Preview locally:

```sh
python3 -m http.server 8000
```

Open [localhost:8000](http://localhost:8000). The toolbar has one filled **Open PDF** action at the far right, after the section links. It opens the prepared two-page file in the same tab on every device, without JavaScript or browser detection. Print or save from the PDF viewer; there is no separate Print action. The site cannot force an embedded browser to launch Safari or Chrome. If iOS previews the file, use Share → Save to Files or Print.

Native browser print shortcuts still use the A4 stylesheet. Letter paper, printer margins or browser headers/footers may repaginate the HTML. Use **Open PDF** for consistent page breaks, including when printing on Letter paper with fit-to-page enabled.

### Refresh the downloadable PDF

After any HTML, CSS, portrait or font change, export the exact checkout using Node.js, Playwright and installed Google Chrome:

```sh
node scripts/export_pdf.cjs
python3 scripts/check_site.py
```

The exporter starts its own temporary localhost server and creates `assets/Ilya-Papou-CV.pdf` plus `assets/cv-pdf.json`. It checks for layout overflow, two pages and a size below 1 MB. Render and visually review **both** PDF pages before committing them together. The manifest records PDF and source hashes; the dependency-free release check rejects a stale PDF. Playwright is only needed for regeneration, not for the website or GitHub Pages deployment.

Native printing temporarily uses the document title `Ilya Papou — CV` for the suggested PDF filename, then restores the search-friendly browser title when printing ends or is cancelled. The print portrait is an eager-loaded HTML image rather than a CSS image replacement. The PDF exporter waits for it and the fonts before rendering the prepared file, so a failed image load cannot silently produce a portrait-free PDF.

The prepared PDF retains the high-quality portrait. `portrait-print.png` is a 581 × 656 crop rendered from the original PDF's 896 × 1008 embedded photo, preserving the original framing and border without upscaling the source. At the unchanged 72.538 × 82 CSS-pixel print size, this provides about 768 effective PPI. Text, lines and links remain vector-based. Check the exported PDF is below 1,000,000 bytes before release; browser and system PDF exporters can produce different sizes. Do not rasterize the entire CV or reduce the photo back to a preview thumbnail.

The print stylesheet follows the revised Figma frames and the supplied two-page PDF: original type sizes, 174px sidebar, aligned job headings and dividers, three technology columns, project cards and page counters. The 794 × 1123 source canvas is mapped to A4 while keeping text selectable and links clickable. Screen layouts retain fluid columns, flat cloud tags and the visible Ilya Popov alias. Print restores the source cloud labels, hides the web-only alias row and uses the exact Figma portrait crop. Export at 100% scale with browser headers/footers disabled and background graphics enabled.

Print artwork is exported directly from Figma. IBM Plex Mono Medium and SemiBold come from the [Google Fonts IBM Plex Mono distribution](https://github.com/google/fonts/tree/main/ofl/ibmplexmono), under the included SIL Open Font License.

The approved spacing refinement is now the default print layout: a 36px gutter beside the sidebar, a 96px identity row, 4px job separators and heading gaps, 2px sidebar row gaps and 12px gaps between page-two cards. It preserves the source text, type sizes, high-resolution portrait and two-page A4 layout. Screen spacing remains independent.

The screen portrait is 96 × 108px on larger screens and 80 × 90px on phones. The original crop is retained and decorative corner marks are removed. These screen-only dimensions do not change the approved print portrait or PDF pagination.

The PDF omits the colored bar-and-dot accents above projects, the Contacts accent, the sidebar's colored edge and its circuit motif. Their former spacing is reclaimed by normal flow. Gray experience dividers, card outlines, contact icons and the separate page-two research motif remain unchanged. The same decoration cleanup is applied to the revised Figma CV.

The contact block includes `papou.work`, WhatsApp Business `papou.work` and Telegram `pilprod` in both screen and print layouts. Messaging usernames are displayed without an `@` prefix. Each contact uses a compact monochrome vector icon with an accessible channel label instead of a repeated text prefix. Messaging links use `https://wa.me/papou.work` and `https://t.me/pilprod`; no phone number is published.

GitHub Pages serves the repository root from `main`. No build step is required.

## Search discoverability

- The complete CV is delivered as semantic HTML and remains readable without JavaScript.
- Canonical, Open Graph and social-card metadata use `https://papou.work/`.
- Ilya Papou is also known as Ilya Popov. Keep this identity link in visible contact details, search/social metadata, the Person's `alternateName` and `llms.txt`. Both names share one canonical page and one Person identity. Names in robots.txt comments do not affect indexing, and the sitemap lists URLs rather than keywords.
- `PILPROD` and `pilprod` are alternative forms of the same professional handle. Keep both in the Person's `alternateName`, `llms.txt` and explanatory comments in `robots.txt` and `sitemap.xml`, without adding them to visible headings, profile labels or the print layout. Existing profile URLs stay unchanged.
- JSON-LD describes the `ProfilePage`, its `Person` and the `WebSite`. Keep it consistent with the visible CV. YourOwn.Chat is personal R&D, not employment. Its source describes components deployed on Google Cloud, separately from designed orchestration, prepared release infrastructure and simulated-provider validation. Preserve those distinctions rather than applying a blanket deployment claim to the whole project.
- `robots.txt` allows search crawlers, explicitly including `OAI-SearchBot`, and advertises `sitemap.xml`. The existing open crawling policy is retained. Search access and model-training policies are separate concerns.
- `llms.txt` contains a navigation index and a complete Markdown copy of the same CV for agents. Keep it synchronized with `index.html`. It is not a ranking signal or an indexing guarantee. The named Figma page is the editorial source, and the HTML and Markdown must preserve its distinctions between built, deployed, designed, prepared and simulated work.
- Update `sitemap.xml`'s `lastmod` and the profile's `dateModified` when the CV content materially changes. Do not refresh dates just because a build runs.

Run the dependency-free checks before publishing:

```sh
python3 scripts/check_site.py
python3 scripts/check_site.py --url https://papou.work/
```

GitHub Actions runs the local checks on pushes and pull requests. Pages publication continues to use the existing `main` branch deployment. Keep local audits and working documents untracked.

The checks also protect the September 4, 2026 Figma/PDF content baseline: all 33 achievement bullets, identity, sidebar facts, job titles and dates, project descriptions, six code/contact links and all 83 selected technologies. OpenVPN was subsequently removed from the security tags at the user's request, while its experience mention remains. Section fingerprints ignore case and presentation punctuation, while retaining numbers and comparison signs. They intentionally allow the Ilya Popov alias, the flat cloud list with one IAM entry and the web placement of Zero-Trust Mesh's date. When the editorial source changes, review the source again and update the affected baseline together with the HTML and Markdown; do not refresh a fingerprint merely to make a failed check pass.

After deployment, the site owner can submit `https://papou.work/sitemap.xml` in Google Search Console and Bing Webmaster Tools, and use their URL inspection tools. This repository does not create verification tokens or automatically claim ownership. Crawling, indexing, rich results and AI citations depend on the search services.

References: [Google AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [ProfilePage structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [OpenAI crawlers](https://developers.openai.com/api/docs/bots), [llms.txt proposal](https://llmstxt.org/).
