#!/usr/bin/env node
// The user requested the original photograph, without AI portrait resynthesis.
// Render only type, simple layout and the unchanged existing photograph.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const photo = fs.readFileSync(path.join(root, 'assets/portrait-source.jpg'));
const font = fs.readFileSync(path.join(root, 'assets/fonts/ibm-plex-sans.ttf'));
const mono = fs.readFileSync(path.join(root, 'assets/fonts/ibm-plex-mono-medium.ttf'));
const destination = path.join(root, 'assets/social/cv-preview-20260906.jpg');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: Plex; src: url(data:font/ttf;base64,${font.toString('base64')}); font-weight: 100 900; }
@font-face { font-family: PlexMono; src: url(data:font/ttf;base64,${mono.toString('base64')}); font-weight: 500; }
* { box-sizing: border-box; }
html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
body { background: #f7f9fb; color: #0b1422; font-family: Plex, sans-serif; }
.card { width: 1200px; height: 630px; padding: 56px; display: grid; grid-template-columns: 640px 360px; gap: 88px; }
.copy { height: 518px; display: flex; flex-direction: column; }
.eyebrow { margin: 0 0 46px; font: 500 16px PlexMono; letter-spacing: 2px; color: #086e7c; }
h1 { font-size: 76px; line-height: 1.04; letter-spacing: -3px; margin: 0 0 25px; font-weight: 700; }
.role { font-size: 42px; line-height: 1.17; font-weight: 600; margin: 0; }
.rule { width: 62px; height: 4px; background: #3f62ff; margin: 29px 0 22px; }
.topics { margin: 0; font-size: 24px; line-height: 1.38; color: #43556b; }
.url { margin: auto 0 0; font-size: 27px; font-weight: 600; color: #086e7c; }
.portrait { margin: 57px 0 0; width: 360px; height: 405px; }
.portrait img { display: block; width: 360px; height: 405px; object-fit: contain; }
</style></head><body><main class="card">
<section class="copy"><p class="eyebrow">CV + R&amp;D PORTFOLIO</p>
<h1>ILYA PAPOU</h1><p class="role">Senior Platform &amp;<br>SRE Engineer</p>
<div class="rule"></div><p class="topics">Kubernetes · Cloud<br>Agent Infrastructure</p>
<p class="url">papou.work</p></section>
<figure class="portrait"><img src="data:image/jpeg;base64,${photo.toString('base64')}" width="896" height="1008" alt="Original portrait of Ilya Papou"></figure>
</main></body></html>`;

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.setContent(html);
    await page.evaluate(() => Promise.all([document.fonts.ready, document.querySelector('img').decode()]));
    const valid = await page.evaluate(() => {
      const image = document.querySelector('img');
      const bounds = image.getBoundingClientRect();
      return image.naturalWidth === 896 && image.naturalHeight === 1008
        && bounds.width / bounds.height === image.naturalWidth / image.naturalHeight
        && [...document.querySelectorAll('h1,p,img')].every(element => {
          const r = element.getBoundingClientRect();
          return r.left >= 50 && r.top >= 50 && r.right <= 1150 && r.bottom <= 580
            && element.scrollWidth <= element.clientWidth;
        });
    });
    if (!valid) throw new Error('Card content is clipped or portrait aspect ratio changed.');
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    await page.screenshot({ path: destination, type: 'jpeg', quality: 92 });
    console.log(`Rendered 1200x630 original-photo card: ${destination}`);
    console.log(`Original portrait SHA256: ${createHash('sha256').update(photo).digest('hex')}`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
