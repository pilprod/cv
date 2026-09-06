#!/usr/bin/env python3
"""Language parity and PDF integrity checks; no browser or network needed."""
import hashlib
import json
import re
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET
from collections import Counter

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://papou.work/'

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.lang = None
        self.links = []
        self.refs = []
        self.times = []
        self.ids = set()
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html': self.lang = a.get('lang')
        if tag == 'link': self.links.append(a)
        if a.get('id'): self.ids.add(a['id'])
        if tag == 'time': self.times.append(a.get('datetime'))
        for key in ('href', 'src'):
            if key in a: self.refs.append(a[key])

def text(file):
    return (ROOT / file).read_text()

def bullets(html):
    return [unescape(re.sub('<[^>]+>', '', item)).strip() for block in re.findall(r'<ul class="achievements">(.*?)</ul>', html, re.S) for item in re.findall(r'<li>(.*?)</li>', block, re.S)]

def tech(html):
    return [unescape(re.sub('<[^>]+>', '', item)).strip() for block in re.findall(r'<ul class="tech-list">(.*?)</ul>', html, re.S) for item in re.findall(r'<li[^>]*>(.*?)</li>', block, re.S)]

for en_file, ru_file, en_url, ru_url in [('index.html','ru/index.html',BASE,BASE+'ru/'), ('portfolio.html','ru/portfolio.html',BASE+'portfolio.html',BASE+'ru/portfolio.html')]:
    en_html, ru_html = text(en_file), text(ru_file)
    en, ru = Page(en_html), Page(ru_html)
    assert en.lang == 'en' and ru.lang == 'ru'
    assert en.times == ru.times, 'Dates changed in translation'
    assert en.ids == ru.ids, 'Section anchors differ across languages'
    for page, expected in [(en,en_url),(ru,ru_url)]:
        assert next(l['href'] for l in page.links if l.get('rel') == 'canonical') == expected
        assert {l['hreflang']:l['href'] for l in page.links if 'hreflang' in l} == {'en':en_url,'ru':ru_url,'x-default':en_url}
    assert {r for r in en.refs if r.startswith('https://github.com/')} == {r for r in ru.refs if r.startswith('https://github.com/')}, 'GitHub references differ'
    for ref in ru.refs:
        parsed = urlsplit(ref)
        if parsed.scheme or not parsed.path: continue
        file = ROOT / unquote(parsed.path).lstrip('/') if parsed.path.startswith('/') else ROOT / 'ru' / unquote(parsed.path)
        if parsed.path.endswith('/'): file /= 'index.html'
        assert file.is_file(), f'Broken Russian resource: {ref}'
    assert 'location.replace' not in ru_html and 'navigator.language' not in ru_html, 'No automatic language redirect'

en_html, ru_html = text('index.html'), text('ru/index.html')
en_bullets, ru_bullets = bullets(en_html), bullets(ru_html)
assert len(en_bullets) == len(ru_bullets) == 35
for en, ru in zip(en_bullets,ru_bullets):
    assert re.search('[А-Яа-яЁё]',ru), 'Untranslated achievement'
    assert Counter(re.findall(r'\d+(?:\.\d+)?',en)) == Counter(re.findall(r'\d+(?:\.\d+)?',ru)), 'Numbers changed in translated achievement'
assert tech(en_html) == tech(ru_html), 'Technical skill names changed'
assert 'Buenos Aires Province' not in ru_html and '5000' not in ru_html
assert '<h1>Илья Попов</h1>' in ru_html and 'Илья Папоу' not in ru_html
assert 'https://papou.work/ru/portfolio.html' in ru_html
assert re.search(r'lang="en"[^>]*aria-current="page"', en_html)
assert re.search(r'lang="ru"[^>]*aria-current="page"', ru_html)
for html, flag in [(en_html,'🇬🇧'), (ru_html,'🇷🇺')]:
    assert 'class="language-switch"' not in html
    assert re.search(r'<div class="toolbar-actions">\s*<details class="language-menu">.*?</details>\s*<a id="open-pdf"', html, re.S), 'Language and PDF must stay grouped'
    assert html.index('class="language-menu"') < html.index('id="open-pdf"')
    assert f'<span class="current-language-flag" aria-hidden="true">{flag}</span>' in html
    assert '<details class="language-menu">' in html and 'class="language-options"' in html
    assert '>EN</a>' not in html and '>RU</a>' not in html

for file in ('portfolio.html', 'ru/portfolio.html'):
    toolbar = text(file).split('<div class="portfolio-toolbar">', 1)[1].split('</nav>', 1)[0]
    assert toolbar.index('class="language-menu"') < toolbar.index('href="https://github.com/pilprod"') < toolbar.index('href="https://www.linkedin.com/in/pilprod/"'), 'Portfolio language menu must precede profile links'

for suffix in ('','-ru'):
    manifest = json.loads(text(f'assets/cv-pdf{suffix}.json'))
    pdf = (ROOT / manifest['file']).read_bytes()
    assert len(pdf) == manifest['bytes'] < 1_000_000
    assert hashlib.sha256(pdf).hexdigest() == manifest['sha256']
    assert len(re.findall(rb'/Type\s*/Page\b',pdf)) == manifest['pages'] == 2
    for source,digest in manifest['sources'].items():
        assert not source.endswith('.pdf') and not re.search(r'cv-pdf.*\.json$', source), 'Circular PDF manifest'
        assert hashlib.sha256((ROOT/source).read_bytes()).hexdigest() == digest, 'Stale PDF: '+source

data = json.loads(text('portfolio.json'))
ru_graph = json.loads(text('ru/portfolio.jsonld'))['@graph']
assert sum(n['@type'] == 'ImageObject' for n in ru_graph) == len(data['photos']) == 9
assert sum(n['@type'] == 'SoftwareSourceCode' for n in ru_graph) == 16
assert next(n for n in ru_graph if n['@type'] == 'CollectionPage')['inLanguage'] == 'ru'
for p in data['photos']:
    assert '/'+p['file'] in text('ru/portfolio.html')
    assert BASE+p['file'] in text('ru/portfolio.md')
for p in data['projects']:
    for r in p['repositories']:
        assert 'https://github.com/pilprod/'+r['slug'] in text('ru/llms.txt')

ns = {'s':'http://www.sitemaps.org/schemas/sitemap/0.9','x':'http://www.w3.org/1999/xhtml'}
for page in ET.fromstring(text('sitemap.xml')).findall('s:url',ns):
    assert {n.attrib['hreflang'] for n in page.findall('x:link',ns)} == {'en','ru','x-default'}
print('PASS: EN primary, reciprocal RU language pages, 35 achievements, unchanged dates/skills/repositories, 9 photos, both two-page PDFs and source manifests.')
