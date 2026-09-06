# Ilya Papou — CV

A static CV published at [papou.work](https://papou.work). English is primary; [Russian](https://papou.work/ru/) is an optional language version, with its own PDF and portfolio. There is no automatic language redirect.

A single current-language flag opens a native disclosure with named language links on every screen size, immediately to the left of Open PDF. PDF remains the rightmost control. The selector works without JavaScript. The redundant mobile CV brand is hidden to keep the section links, PDF and language choice compact. Language controls are excluded from print.

Russian content is generated from the English HTML and `portfolio.json`, with reviewed translations in `translations/ru.json`. Dates, links, technologies and prototype caveats share the English source. Run `node scripts/build_portfolio.cjs`, then `node scripts/build_ru.cjs`; stale translations fail validation instead of silently changing facts. Export both PDFs with `node scripts/export_pdf.cjs` and `node scripts/export_pdf.cjs --ru`, then render both for review. Language-specific PDF manifests exclude PDF outputs to avoid circular fingerprints. `python3 scripts/check_languages.py` checks the language pairs and Russian PDF.

Content source: [CV — Revised · Platform & Agent Systems](https://www.figma.com/design/IGMsmWvk5wS9uS77rJqMLd/?node-id=370-2), frames `370:3` and `370:105`. The website uses this editorial baseline and six selected-technology categories, with separate screen and print layouts. Semicolons in prose are replaced with sentence breaks without changing meaning.

September 5 factual correction: Sberbank Insurance Broker was Hybrid, not Remote. Per-experience industry labels are restored from the five existing, previously hidden Industry domain nodes in the revised Figma page, with I-Teco normalized to the sidebar's Public sector: Aviation & travel; Finance & insurance; Public sector; Cross-industry IT consulting; Telecommunications. Labels appear without a "Domain:" prefix, aligned to the right of company headings on desktop, mobile and print. The same labels and work arrangement are included in the downloadable PDF and llms.txt.

September 6 project metadata correction: at the user's request, dates and locations for the three personal R&D projects follow the freshly reloaded [LinkedIn Experience](https://www.linkedin.com/in/pilprod/details/experience/) entries, with the user's subsequent correction of YourOwn.Chat's location from Buenos Aires Province to the city: YourOwn.Chat — Jun 2026–Present, Buenos Aires, Argentina; Home Aeroponics — Aug 2024–Jan 2025, Moscow City, Russia; Zero-Trust Mesh — Jan–Mar 2025, Bangkok City, Thailand. These replace the earlier year-only periods across the web, print/PDF and llms.txt. Personal R&D/PoCs labels, project achievements and the five employer entries remain unchanged. No remote-work arrangement is inferred for the projects.

The featured R&D heading is now exactly `Agent Orchestration Infrastructure` on mobile, tablet, desktop and print/PDF, following the user's naming correction. It has one shared heading and accessible name rather than separate mobile and desktop variants.

September 6 portfolio links: each R&D project has a compact `Code` row shared by the web, print/PDF, llms.txt and the revised Figma CV. Agent Orchestration Infrastructure links to six public repositories (platform, external-worker runtime, kagent fork and integration, Mattermost fork and image build); Home Aeroponics links to its controllers and sensor firmware; Zero-Trust Mesh links to Ansible automation, access policy and the GCP network lab. Links wrap on narrow screens and remain clickable in the two-page PDF. The print layout only tightens project padding and internal gaps, without reducing typography or changing project facts. Fork, prototype and build-dependency caveats remain in the linked repositories; a link does not imply a production deployment or a fully public build. LinkedIn uses dedicated project media cards rather than repeated URL footers in descriptions.

September 5 update: the user requested a sidebar portrait and clearer AWS/Google Cloud emphasis. The summary ends with the user's preference for AWS and Google Cloud, the freelance bullet leads with AWS infrastructure, and the first YourOwn.Chat bullet describes its existing Google Cloud deployments. AWS and GCP are explicit tags in the shared Cloud infrastructure list, without parenthetical abbreviations. Prose retains the full Google Cloud name. No new projects, services, ownership or production claims were added. The approved text, sidebar portrait and spacing are synchronized to the revised Figma CV, preserving its two A4 frames, and included in the GitHub Pages release. The print identity row is 90px with 8px internal spacing to accommodate the added preference sentence without crowding the page footer.

- `index.html` contains the CV content.
- `styles.css` provides responsive layouts and two-page A4 printing.
- `assets/portrait-source.jpg` and `assets/fonts/` contain the high-resolution portrait and local fonts. `portrait.jpg` remains the screen/person image; `assets/social/cv-preview-20260906.jpg` is the landscape CV-sharing card.

Preview locally:

```sh
python3 -m http.server 8000
```

Open [localhost:8000](http://localhost:8000). The toolbar keeps the section links on the left and one black-filled **Open PDF** action at the far right. It opens the prepared two-page file in the same tab on every device, without JavaScript or browser detection. Print or save from the PDF viewer; there is no separate Print action. The site cannot force an embedded browser to launch Safari or Chrome. If iOS previews the file, use Share → Save to Files or Print.

The web page follows the visitor's device color scheme automatically, including changes while the page is open. A screen-only `prefers-color-scheme: dark` query adapts text, cards, links, controls and the cookie banner; media-qualified `theme-color` metadata also adapts supported browser chrome. There is no theme toggle, script, saved preference or cookie. The layout, typography and portrait stay unchanged. Native print and the prepared PDF always keep the original light palette; the exporter verifies this with a dark device preference. Run `python3 scripts/check_theme.py` to check scope, metadata and dark text contrast without browser dependencies.

Native browser print shortcuts still use the A4 stylesheet. Letter paper, printer margins or browser headers/footers may repaginate the HTML. Use **Open PDF** for consistent page breaks, including when printing on Letter paper with fit-to-page enabled.

### Refresh the downloadable PDF

After any HTML, CSS, portrait or font change, export the exact checkout using Node.js, Playwright and installed Google Chrome:

```sh
node scripts/export_pdf.cjs
python3 scripts/check_site.py
```

The exporter starts its own temporary localhost server and creates `assets/Ilya Papou CV — DevOps & SRE.pdf` plus `assets/cv-pdf.json`. With `--ru`, it instead exports `assets/Ilya Popov CV — DevOps & SRE — RU.pdf` plus `assets/cv-pdf-ru.json`. Each language's Open PDF link selects its own file. Older PDF aliases are not generated. It checks layout overflow, footer clearance, two pages and a size below 1 MB. Render and visually review **both pages of each language** before committing. The manifests record PDF and source hashes; release checks reject stale PDFs. Playwright is only needed for regeneration, not for the website or GitHub Pages deployment.

The downloadable PDF's title and native printing use `Ilya Papou CV — DevOps & SRE` for the suggested filename. Native printing restores the search-friendly browser title when printing ends or is cancelled. The print portrait is an eager-loaded HTML image rather than a CSS image replacement. The PDF exporter waits for it and the fonts before rendering the prepared file, so a failed image load cannot silently produce a portrait-free PDF.

The screen and prepared PDF share the original 896 × 1008 JPEG from Figma. The crop starts from image node `370:66` inside portrait frame `370:64`, then uses the user's final adjustment: `scale(1.1)` with an origin of `50% 25%`, keeping the shirt lettering outside the frame. Only the image transform changes, not the portrait container or responsive grid. The PDF keeps its 134 CSS-pixel portrait width and draws the existing thin frame in CSS, without baking the previous, tighter crop into the image. Text, lines and links remain vector-based. Check the exported PDF is below 1,000,000 bytes before release; browser and system PDF exporters can produce different sizes. Do not rasterize the entire CV or reduce the photo back to a preview thumbnail.

The print stylesheet follows the revised Figma frames and the supplied two-page PDF: original type sizes, 174px sidebar, aligned job headings and dividers, three technology columns, project cards and page counters. The 794 × 1123 source canvas is mapped to A4 while keeping text selectable and links clickable. Screen layouts retain fluid columns, flat cloud tags and the visible Ilya Popov alias. Print keeps compact technology rows, hides the web-only alias row and uses the exact Figma portrait crop. Export at 100% scale with browser headers/footers disabled and background graphics enabled.

Print artwork is exported directly from Figma. IBM Plex Mono Medium and SemiBold come from the [Google Fonts IBM Plex Mono distribution](https://github.com/google/fonts/tree/main/ofl/ibmplexmono), under the included SIL Open Font License.

The print layout keeps a 36px gutter beside the sidebar, 4px job separators and heading gaps, 2px sidebar row gaps and 12px gaps between page-two cards. The preview uses a 90px identity row and 8px internal gaps to accommodate the added preference sentence. It retains the source type sizes, high-resolution portrait and two-page A4 layout. Screen spacing remains independent.

The portrait aligns with the sidebar's text edges on desktop and in print. From 641–980px, the profile card keeps the portrait on the left and contacts on the right, aligned by their vertical centers. The contact title/context retain 12px/8px spacing, with 8px link-row gaps. Spoken languages span the full next row, followed by the expandable background.

At mobile widths up to 640px, the role label comes first, then a portrait exactly as wide as the name, then the name and experience headline, followed by the summary. An intrinsic grid track takes its width from the name; inline-size containment prevents the image from stretching that track. Text and photo share the left edge, with 20px gaps around the photo and before the summary. The divider between the summary and Contact is hidden only on mobile, without changing their spacing. The contact card no longer repeats the portrait: its six links form two columns, followed by full-width spoken languages and the expandable background. The mobile image uses the same original asset and crop; only one portrait is visible at any screen width, and the mobile copy is always hidden in print.

Only on mobile, the Profile & background toggle label and the headings/lists within its expanded sections are centered. The toggle's plus/minus remains at the right edge without shifting its label. The Contact heading and alias/location stay left-aligned. Contact links and spoken languages retain their existing grid and alignment; desktop, tablet and print remain unchanged.

Portrait widths are discrete, not viewport interpolation: mobile width follows the name at its fixed 27px font size up to 360px and 30px from 361–640px; the sidebar portrait stays 160px from 641–980px, 152px in the narrow desktop sidebar from 981–1180px, and 172px above 1180px. The screen 8:9 aspect ratio and letter-free crop are unchanged. Desktop/tablet portrait geometry and the two-page PDF remain unchanged by the mobile-only placement. Open PDF is black-filled with white text in both themes. Its frame is 30px high, with the original 13px desktop / 12px mobile text; the navigation row remains 36px high to preserve the header height. Desktop keeps its 12px top padding. Up to 640px, the full-width navigation keeps the section links on the left, Open PDF on the right, and equal 20px outside gutters, with 12px padding above and below the row for a 60px header without an extra gap before the CV.

The PDF omits the colored bar-and-dot accents above projects, the Contacts accent, the sidebar's colored edge and its circuit motif. Their former spacing is reclaimed by normal flow. Gray experience dividers, card outlines, contact icons and the separate page-two research motif remain unchanged. The same decoration cleanup is applied to the revised Figma CV.

The contact block includes `papou.work`, WhatsApp Business `papou.work` and Telegram `pilprod` in both screen and print layouts. Messaging usernames are displayed without an `@` prefix. Each contact uses a compact monochrome vector icon with an accessible channel label instead of a repeated text prefix. Messaging links use `https://wa.me/papou.work` and `https://t.me/pilprod`; no phone number is published.

GitHub Pages serves the repository root from `main`. No build step is required.

## Optional analytics

The GA4 web stream uses measurement ID `G-HHJNK65HTV`. `analytics.js` is a first-party consent controller, not an eagerly loaded Google tag. One combined **Cookies & analytics** notice controls optional analytics cookies and collection together. It loads Google Analytics only on `https://papou.work` after a visitor explicitly chooses **Allow cookies**. Until then, or after **Decline**, no Google Analytics script or measurement request is sent. Local previews never collect analytics.

The consent choice is stored on the visitor's device for 180 days. Expired choices require a new decision. Storage failures do not prevent the CV from working, and the current visit still respects the visitor's choice. **Cookie & analytics settings** remains available below the CV. Withdrawing consent disables collection, removes this site's `_ga` cookies and reloads the page without the tag. If permanent storage is unavailable, a session-only fallback is attempted. If neither storage can replace a stale approval, collection stays disabled without an automatic reload and the interface warns that the choice was not saved. Changes also apply across open tabs. The interface is hidden in print and never changes the CV's editorial content.

Only analytics consent can be granted. All advertising consent states remain denied, Google signals and advertising personalization are disabled, and no user ID, user properties or contact-click events are configured. The page URL is fixed to the canonical homepage. Referrers are reduced to HTTP(S) origins without paths, queries or credentials. The Google script itself is requested without a referrer. One explicit pageview is sent after consent. GA4 may also collect its standard session and engagement measurements. These controls minimize collection; they are not a claim of complete anonymity or legal compliance.

Keep **Enhanced measurement disabled** in the GA4 stream so contact URLs, site-search values, form data and history changes are not automatically recorded. Keep advertising and user-provided-data features disabled. Do not enable automatic event settings without reviewing the collected parameters. The visitor notice links to [Google's explanation of data use](https://policies.google.com/technologies/partner-sites).

At setup verification on September 5, 2026, the GA4 property had Google signals, user-provided data and advertising personalization disabled, with both event and user data retention set to **2 months**. A consented browser visit appeared in Realtime; the test ended with analytics declined again. Preserve these property-level controls as well as the site-side consent checks.

Run the dependency-free consent tests before release:

```sh
node scripts/check_analytics.cjs
```

Also verify a clean browser sends no Google requests before consent or after decline, a consenting visit appears in GA4, withdrawal stops collection, and both PDF pages remain unchanged. HTML/CSS updates require PDF regeneration because the release manifest fingerprints those files, even when the changed interface is print-hidden.

Implementation references: [basic consent mode](https://developers.google.com/tag-platform/security/concepts/consent-mode), [consent commands](https://developers.google.com/tag-platform/security/guides/consent), [privacy controls](https://developers.google.com/tag-platform/security/guides/privacy), [GA4 configuration](https://developers.google.com/analytics/devguides/collection/ga4/reference/config), [enhanced measurement](https://support.google.com/analytics/answer/9216061?hl=en).

## Search discoverability

### Link previews

- The CV shares a dedicated 1200 × 630 JPEG card with the current name and role, portrait and portfolio context. Open Graph and X Card title, description and image tags are delivered in the initial HTML; no JavaScript, cookie consent or login is needed to read them.
- `scripts/build_social_card.cjs` renders the card with the existing local fonts and the unchanged `assets/portrait-source.jpg`, scaled proportionally without cropping or AI resynthesis. The user explicitly selected original-photo composition. It uses the same local Playwright/Chrome setup as the PDF exporter. Inspect the resulting card before publishing; any changed asset also requires the normal PDF manifest refresh.
- The portfolio page has its own title, description and existing workbench photograph. It does not reuse the CV card or imply that the lab photograph verifies the archived firmware. Its AI-background-retouch disclosure is retained in the image description.
- Each page declares one canonical HTTPS URL and one primary image, including HTTPS image URL, JPEG MIME, dimensions and descriptive alt text. The image filename is versioned so later replacements can avoid an old image-cache entry. Do not invent social handles, app IDs or verification tokens.
- `python3 scripts/check_social.py` checks both pages, metadata consistency, real image dimensions, file size and crawler permissions. After deployment, use `--url https://papou.work/ --bots` to check delivery using common sharing-crawler user agents. This is an HTTP compatibility check, not proof that every app has refreshed or renders the same layout.
- LinkedIn and other apps can cache previously shared cards. Use [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) to inspect the canonical link. An existing message or post can retain its older card; display size and image cropping are controlled by each app and sometimes its user.
- References: [Open Graph](https://ogp.me/), [LinkedIn sharing requirements](https://www.linkedin.com/help/linkedin/answer/a521928), [Apple Messages rich previews](https://developer.apple.com/documentation/technotes/tn3156-create-rich-previews-for-messages).

### Project and image discovery

- `portfolio.html` is the supporting, indexable project-evidence page. It maps the three R&D projects to eleven public repositories, five archival firmware prototypes, the matching LinkedIn Projects/Experience labels and nine lab photographs. The CV links to it from the second-page introduction, including the two-page PDF, and the website footer.
- `portfolio.json` is the reviewed data source. `node scripts/build_portfolio.cjs` generates the visible page, `portfolio.md`, `portfolio.jsonld` and the image-aware `sitemap.xml`. Do not edit generated files individually. Use `--check` to reject stale generated resources without changing them.
- `portfolio-images/` contains the same privacy-reviewed JPEGs as the two aeroponics READMEs. Five images disclose AI background/identifying-area retouching. One root-chamber photograph shows both the roots and internal tubing, without repetitive views. The diagram and root evidence are not AI-redrawn. Do not replace these files with the unreviewed originals or claim a photography license that has not been granted.
- The breadboard photograph uses the replacement 1024 × 768 image supplied by the owner on September 6. The whole frame is preserved, without cropping, AI redraw or image-data re-encoding. Private metadata is removed while retaining its color profile. The new `breadboard-prototype-1024.jpg` filename avoids reusing the old image cache; display scales proportionally and links open the complete image.
- The portfolio graph uses separate `CreativeWork`, `SoftwareSourceCode` and `ImageObject` identities, with `hasPart/isPartOf`, `about` and `subjectOf` relationships. Source files are parts of their repository; repositories are parts of a project. `Person.sameAs` remains limited to the personal GitHub and LinkedIn profiles. Verified fork origins use `isBasedOn`, without assigning upstream authorship to Ilya. LinkedIn links are public section URLs, never owner-only edit URLs or invented per-entry permalinks.
- Firmware variants are archived 2024 experiments, not final solutions or releases. Missing modified libraries, incomplete callbacks/telemetry and unverified calibration/relay behavior remain explicit. Research periods are not repository publication dates. Photos document the wider lab and do not certify that archived code builds or runs safely.
- The complete CV is delivered as semantic HTML and remains readable without JavaScript.
- Canonical, Open Graph and social-card metadata use `https://papou.work/`.
- Ilya Papou is also known as Ilya Popov. Keep this identity link in visible contact details, search/social metadata, the Person's `alternateName` and `llms.txt`. Both names share one canonical page and one Person identity. Names in robots.txt comments do not affect indexing, and the sitemap lists URLs rather than keywords.
- `PILPROD` and `pilprod` are alternative forms of the same professional handle. Keep both in the Person's `alternateName`, `llms.txt` and explanatory comments in `robots.txt` and `sitemap.xml`, without adding them to visible headings, profile labels or the print layout. Existing profile URLs stay unchanged.
- The CV JSON-LD describes the `ProfilePage`, its `Person` and the `WebSite`, and mentions the three works on the supporting portfolio page. Keep it consistent with visible content. Agent Orchestration Infrastructure is personal R&D. Its source describes components deployed on Google Cloud, separately from designed orchestration, prepared release infrastructure and simulated-provider validation. Preserve those distinctions rather than applying a blanket deployment claim to the whole project.
- `robots.txt` allows search crawlers, explicitly including `OAI-SearchBot`, and advertises `sitemap.xml`. The existing open crawling policy is retained. Search access and model-training policies are separate concerns.
- `llms.txt` contains a navigation index and a complete Markdown copy of the same CV for agents. Keep it synchronized with `index.html`. It is not a ranking signal or an indexing guarantee. The named Figma page is the editorial source, and the HTML and Markdown must preserve its distinctions between built, deployed, designed, prepared and simulated work.
- The sitemap contains the CV and the supporting portfolio page, plus its nine image URLs and the CV portrait. Update `portfolio.json`'s `modified` when portfolio content changes. Keep `cvModified` aligned with the CV profile's `dateModified`; do not advance the CV date for portfolio-only edits or refresh dates just because a build runs. Keep each page's canonical URL distinct; both describe the same person.

Run the dependency-free checks before publishing:

```sh
python3 scripts/check_site.py
node scripts/build_portfolio.cjs --check
python3 scripts/check_portfolio.py
python3 scripts/check_site.py --url https://papou.work/
python3 scripts/check_portfolio.py --url https://papou.work/
```

GitHub Actions runs the local checks on pushes and pull requests. Pages publication continues to use the existing `main` branch deployment. Keep local audits and working documents untracked.

The checks protect the September 4, 2026 Figma/PDF baseline plus the user-directed cloud emphasis and September 6 R&D project revisions: all 35 achievement bullets, identity, sidebar facts, job titles and dates, project descriptions, contact/code links and 85 tags (83 existing technologies plus AWS and Google Cloud). OpenVPN was removed from the security tags at the user's request, while its experience mention remains. Section fingerprints ignore case and presentation punctuation, while retaining numbers and comparison signs. They intentionally allow the Ilya Popov alias, the flat cloud list with one IAM entry and the web placement of Zero-Trust Mesh's date. Mobile-only abbreviated names are excluded from the canonical source comparison. When the editorial source changes, review the source again and update the affected baseline together with the HTML and Markdown; do not refresh a fingerprint merely to make a failed check pass.

After deployment, the site owner can submit `https://papou.work/sitemap.xml` in Google Search Console and Bing Webmaster Tools, and use their URL inspection tools. This repository does not create verification tokens or automatically claim ownership. Crawling, indexing, rich results and AI citations depend on the search services.

Google Search Console setup was verified on September 5, 2026: ownership confirmed, the sitemap processed successfully with one discovered page, and URL Inspection reported the canonical homepage indexed with HTTPS and valid ProfilePage structured data. This is a point-in-time check, not a guarantee of future indexing or ranking. No Bing submission was performed in this setup.

References: [Google AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [ProfilePage structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [OpenAI crawlers](https://developers.openai.com/api/docs/bots), [llms.txt proposal](https://llmstxt.org/).
