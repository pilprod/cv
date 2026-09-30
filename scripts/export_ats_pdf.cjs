#!/usr/bin/env node
// Export the separate ATS draft; the original designer PDF is untouched.
const { chromium } = require('playwright');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sourcePage = 'ats.html';
const pdfTitle = 'Ilya Papou CV (ATS) — DevOps & SRE';
const pdfPath = `assets/${pdfTitle}.pdf`;
const manifestPath = 'assets/cv-ats-pdf.json';
const sourceFiles = [sourcePage, 'ats.css', 'assets/fonts/ibm-plex-sans.ttf'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.ttf': 'font/ttf', '.pdf': 'application/pdf' };

(async () => {
  const server = http.createServer((request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = path.resolve(root, `.${pathname === '/' ? '/ats.html' : pathname}`);
      if (!file.startsWith(root + path.sep) || !fs.statSync(file).isFile()) throw new Error('Not found');
      response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      fs.createReadStream(file).pipe(response);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
    await page.goto(`http://127.0.0.1:${server.address().port}/${sourcePage}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: 'print', colorScheme: 'light' });
    const layout = await page.evaluate(() => {
      const cv = document.querySelector('.ats-cv');
      const style = getComputedStyle(cv);
      const bodyStyle = getComputedStyle(document.body);
      return {
        overflow: cv.scrollWidth > cv.clientWidth || document.documentElement.scrollWidth > document.documentElement.clientWidth,
        columns: style.columnCount,
        bodyFont: bodyStyle.fontSize,
        bullets: document.querySelectorAll('.achievements > li').length,
        hiddenActions: getComputedStyle(document.querySelector('.preview-actions')).display === 'none',
      };
    });
    if (layout.overflow || layout.columns !== 'auto' || layout.bullets !== 37 || !layout.hiddenActions)
      throw new Error(`ATS layout/content check failed: ${JSON.stringify(layout)}`);
    await page.evaluate(title => { document.title = title; }, pdfTitle);
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: false,
      displayHeaderFooter: false, tagged: true });
    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length;
    if (pages < 2 || pages > 3 || pdf.length >= 1_000_000)
      throw new Error(`Expected 2–3 ATS pages under 1 MB, got ${pages} pages and ${pdf.length} bytes.`);
    const sources = Object.fromEntries(sourceFiles.sort().map(file => [file, hash(fs.readFileSync(path.join(root, file)))]));
    fs.writeFileSync(path.join(root, pdfPath), pdf);
    fs.writeFileSync(path.join(root, manifestPath), JSON.stringify({ file: pdfPath, title: pdfTitle,
      pages, bytes: pdf.length, sha256: hash(pdf), tagged: true, sources }, null, 2) + '\n');
    console.log(`Exported ${pdfPath}: ${pages} A4 pages, ${pdf.length} bytes. Review all pages before publishing.`);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
