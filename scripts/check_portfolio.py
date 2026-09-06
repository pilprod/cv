#!/usr/bin/env python3
"""Validate visible portfolio evidence and its discovery graph, locally or live."""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
CANONICAL = 'https://papou.work/'


class EvidencePage(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links, self.images, self.scripts = [], [], [], []
        self.capture, self.current = False, []
        self.text = []

    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'a':
            self.links.append(attrs.get('href', ''))
        if tag == 'img':
            self.images.append(attrs)
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.capture, self.current = True, []

    def handle_endtag(self, tag):
        if tag == 'script' and self.capture:
            self.scripts.append(json.loads(''.join(self.current)))
            self.capture = False

    def handle_data(self, text):
        if self.capture:
            self.current.append(text)
        else:
            self.text.append(text)


def main():
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument('--url')
    opts = args.parse_args()
    base = opts.url.rstrip('/') + '/' if opts.url else None

    def read(name, binary=False):
        if base:
            request = Request(base + name, headers={'User-Agent':'CV-Portfolio-Check/1.0'})
            with urlopen(request, timeout=30) as response:
                assert response.status == 200, name
                assert 'noindex' not in response.headers.get('X-Robots-Tag','').lower(), name
                result = response.read()
        else:
            result = (ROOT / name).read_bytes()
        return result if binary else result.decode('utf-8')

    data = json.loads(read('portfolio.json'))
    page = EvidencePage()
    html = read('portfolio.html')
    page.feed(html)
    visible = ' '.join(' '.join(page.text).split())
    graph_doc = json.loads(read('portfolio.jsonld'))
    assert page.scripts == [graph_doc], 'Visible page and standalone graph differ'
    assert graph_doc['@context'] == 'https://schema.org'
    graph = graph_doc['@graph']
    by_id = {n['@id']: n for n in graph}
    assert len(by_id) == len(graph), 'Duplicate graph identities'
    assert len(set(page.ids)) == len(page.ids), 'Duplicate HTML IDs'
    for type_, count in [('CreativeWork',3),('SoftwareSourceCode',16),('ImageObject',11)]:
        assert sum(n['@type'] == type_ for n in graph) == count, type_
    person = by_id[data['person']]
    assert person['sameAs'] == [data['linkedin']['profile'],'https://github.com/pilprod'], 'Do not conflate person and repositories'
    assert set(person['alternateName']) == {'Ilya Popov','PILPROD','pilprod'}
    for kind in ['projects','experience']:
        assert data['linkedin'][kind] in page.links
        assert '/edit/' not in data['linkedin'][kind], 'LinkedIn editor must not be published as a public project URL'
    markdown = read('portfolio.md')
    for p in data['projects']:
        pid = data['canonical'] + '#' + p['id']
        node = by_id[pid]
        assert p['id'] in page.ids and p['name'] in visible
        assert p['period'] in visible and p['location'] in visible
        assert p['description'] in visible and p['scope'] in visible
        assert p['experience'] in visible and p['experienceCompany'] in visible
        assert node['creator']['@id'] == data['person']
        repos = ['https://github.com/pilprod/' + r['slug'] for r in p['repositories']]
        assert [ref['@id'] for ref in node['hasPart']] == repos
        for r, url in zip(p['repositories'], repos):
            repo = by_id[url]
            assert url in page.links and url in markdown
            assert repo['codeRepository'] == url and repo['isPartOf']['@id'] == pid
            assert r['description'] in visible and r['scope'] in visible
            assert 'author' not in repo, 'Do not assign upstream source authorship to the portfolio owner'
            assert repo.get('isBasedOn') == r.get('upstream')
            for variant in r.get('variants', []):
                variant_url = url + '/blob/main/' + variant['path']
                variant_node = by_id[variant_url]
                assert variant_url in page.links and variant_url in markdown
                assert variant['name'] in visible and variant['scope'] in visible
                assert variant_node['isPartOf']['@id'] == url
                assert variant_node['creativeWorkStatus'] == 'Archival prototype — not a final solution'
    assert len(page.images) == len(data['photos']) == 11
    assert sum(p['retouched'] for p in data['photos']) == 5
    for photo, img in zip(data['photos'],page.images):
        node = by_id[data['canonical'] + '#photo-' + photo['id']]
        assert img['src'] == photo['file'] and img['alt'] == photo['caption']
        assert int(img['width']) == photo['width'] and int(img['height']) == photo['height']
        assert photo['caption'] in visible
        assert node['contentUrl'] == CANONICAL + photo['file']
        assert node['about']['@id'] == data['canonical'] + '#home'
        assert node['isBasedOn'] == photo['source'] and photo['source'] in page.links
        assert bool('AI assistance' in node['caption']) == photo['retouched']
        image_bytes = read(photo['file'], binary=True)
        assert image_bytes.startswith(b'\xff\xd8') and image_bytes.endswith(b'\xff\xd9'), 'Invalid JPEG'
        assert CANONICAL + photo['file'] in markdown
    for link in page.links:
        if link.startswith('#'):
            assert link[1:] in page.ids, link
    ns = {'s':'http://www.sitemaps.org/schemas/sitemap/0.9','i':'http://www.google.com/schemas/sitemap-image/1.1'}
    sitemap = ET.fromstring(read('sitemap.xml'))
    urls = sitemap.findall('s:url', ns)
    portfolio_url = next(n for n in urls if n.findtext('s:loc', namespaces=ns) == data['canonical'])
    assert portfolio_url.findtext('s:lastmod', namespaces=ns) == data['modified']
    images = [n.text for n in portfolio_url.findall('i:image/i:loc', ns)]
    assert images == [CANONICAL + p['file'] for p in data['photos']], 'Image sitemap differs from visible gallery'
    llms = read('llms.txt')
    for resource in ['portfolio.html','portfolio.md','portfolio.jsonld']:
        assert CANONICAL + resource in llms
    assert 'href="portfolio.html"' in read('index.html'), 'CV must link to the portfolio page'
    assert '<link rel="canonical" href="'+data['canonical']+'">' in html
    print('PASS: 3 projects, 11 repositories, 5 archival firmware prototypes, 11 photographs, LinkedIn associations, visible/structured/Markdown consistency and image sitemap')


if __name__ == '__main__':
    main()
