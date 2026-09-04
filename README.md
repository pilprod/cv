# Ilya Papou — CV

A static English CV published at [papou.work](https://papou.work).

Content source: [CV — Revised · Platform & Agent Systems](https://www.figma.com/design/IGMsmWvk5wS9uS77rJqMLd/?node-id=370-2). The website keeps the expanded technology cards and separate screen and print layouts.

- `index.html` contains the CV content.
- `styles.css` provides responsive layouts and two-page A4 printing.
- `assets/portrait.jpg` and `assets/fonts/` contain the portrait and local fonts.

Preview locally:

```sh
python3 -m http.server 8000
```

Open [localhost:8000](http://localhost:8000). Use the browser print dialog to save an A4 PDF.

GitHub Pages serves the repository root from `main`. No build step is required.

## Search discoverability

- The complete CV is delivered as semantic HTML and remains readable without JavaScript.
- Canonical, Open Graph and social-card metadata use `https://papou.work/`.
- JSON-LD describes the `ProfilePage`, its `Person` and the `WebSite`. Keep it consistent with the visible CV. Personal R&D is not presented as employment or a production deployment.
- `robots.txt` allows search crawlers, explicitly including `OAI-SearchBot`, and advertises `sitemap.xml`. The existing open crawling policy is retained. Search access and model-training policies are separate concerns.
- `llms.txt` is an optional navigation aid for agents. It is not a ranking signal or an indexing guarantee. The HTML CV remains the source of truth.
- Update `sitemap.xml`'s `lastmod` and the profile's `dateModified` when the CV content materially changes. Do not refresh dates just because a build runs.

Run the dependency-free checks before publishing:

```sh
python3 scripts/check_site.py
python3 scripts/check_site.py --url https://papou.work/
```

GitHub Actions runs the local checks on pushes and pull requests. Pages publication continues to use the existing `main` branch deployment. Keep local audits and working documents untracked.

After deployment, the site owner can submit `https://papou.work/sitemap.xml` in Google Search Console and Bing Webmaster Tools, and use their URL inspection tools. This repository does not create verification tokens or automatically claim ownership. Crawling, indexing, rich results and AI citations depend on the search services.

References: [Google AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [ProfilePage structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [OpenAI crawlers](https://developers.openai.com/api/docs/bots), [llms.txt proposal](https://llmstxt.org/).
