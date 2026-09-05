#!/usr/bin/env node
// Requires Playwright and Chrome. The published site has no runtime dependencies.
const { chromium } = require('playwright');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pdfTitle = 'Ilya Papou CV — SRE & DevOps';
const pdfPath = `assets/${pdfTitle}.pdf`;
const legacyPdfPath = 'assets/Ilya-Papou-CV.pdf';
const manifestPath = 'assets/cv-pdf.json';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const types = { '.html': 'text/html', '.css': 'text/css', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.pdf': 'application/pdf' };
const assetSources = directory => fs.readdirSync(path.join(root, directory), { withFileTypes: true })
  .flatMap(entry => entry.isDirectory() ? assetSources(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`])
  .filter(file => ![pdfPath, legacyPdfPath, manifestPath].includes(file));

(async () => {
  // Serve this exact checkout, not a possibly stale public or preview site.
  const server = http.createServer((request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
      if (!file.startsWith(root + path.sep) || !fs.statSync(file).isFile()) throw new Error('Not found');
      response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      fs.createReadStream(file).pipe(response);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => Promise.all([document.fonts.ready, document.querySelector('.portrait-print').decode()]));
    // Exercise the device-dark case on every export: print must still be light.
    await page.emulateMedia({ media: 'print', colorScheme: 'dark' });
    const lightPrint = await page.evaluate(() => {
      const rootStyle = getComputedStyle(document.documentElement);
      return rootStyle.colorScheme === 'light'
        && rootStyle.getPropertyValue('--paper').trim() === '#f7f9fb'
        && rootStyle.getPropertyValue('--sidebar').trim() === '#eaf2f5';
    });
    if (!lightPrint) throw new Error('Print must retain the light palette when the device uses dark mode.');
    const fits = await page.evaluate(() => {
      const sheets = [...document.querySelectorAll('.cv-page')];
      return sheets.length === 2 && sheets.every(sheet => sheet.scrollHeight <= sheet.offsetHeight
        && sheet.scrollWidth <= sheet.offsetWidth);
    });
    if (!fits) throw new Error('CV content exceeds the two-page print layout. Review it before exporting.');
    await page.evaluate(title => { document.title = title; }, pdfTitle);
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false });
    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length;
    if (pages !== 2 || pdf.length >= 1_000_000) throw new Error(`Expected 2 pages under 1 MB, got ${pages} pages and ${pdf.length} bytes.`);
    const sources = Object.fromEntries(['index.html', 'styles.css', ...assetSources('assets')].sort()
      .map(file => [file, hash(fs.readFileSync(path.join(root, file)))]));
    fs.writeFileSync(path.join(root, pdfPath), pdf);
    // Keep already-shared application links current without changing Open PDF behavior.
    fs.writeFileSync(path.join(root, legacyPdfPath), pdf);
    fs.writeFileSync(path.join(root, manifestPath), JSON.stringify({ file: pdfPath, title: pdfTitle,
      legacyFiles: [legacyPdfPath], pages, bytes: pdf.length,
      sha256: hash(pdf), sources }, null, 2) + '\n');
    console.log(`Exported ${pdfPath}: ${pages} A4 pages, ${pdf.length} bytes. Render both pages for visual review before publishing.`);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
