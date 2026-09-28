#!/usr/bin/env python3
"""Check the English-only publication and prevent Russian routes returning."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
for file in ('index.html', 'portfolio.html'):
    text = (ROOT / file).read_text()
    assert '<html lang="en">' in text, 'The published site must be English'
    assert 'language-menu' not in text and 'hreflang=' not in text, 'Remove language selection and alternates'
    assert not re.search(r'(?:href|src)=["\'][^"\']*/ru/', text), 'Russian link remains'
for file in ('llms.txt', 'portfolio.md', 'portfolio.jsonld', 'sitemap.xml'):
    assert 'papou.work/ru/' not in (ROOT/file).read_text(), 'Russian discovery URL remains: ' + file
assert not list((ROOT/'ru').glob('**/*')), 'Russian published files remain'
assert not list((ROOT/'assets').glob('*RU.pdf')), 'Russian downloadable PDF remains'
assert not (ROOT/'assets/cv-pdf-ru.json').exists(), 'Russian PDF manifest remains'
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls = [node.text for node in ET.fromstring((ROOT/'sitemap.xml').read_text()).findall('s:url/s:loc', ns)]
assert urls == ['https://papou.work/', 'https://papou.work/portfolio.html']
assert '<dt>Russian</dt><dd>Native</dd>' in (ROOT/'index.html').read_text(), 'Keep the factual spoken-language entry'
print('PASS: English-only CV and portfolio; no Russian pages, PDF, language menu or discovery links.')
