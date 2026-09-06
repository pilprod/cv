#!/usr/bin/env python3
"""Check static sharing metadata and assets, optionally on the deployed site."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
import struct
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, urlopen
from urllib.robotparser import RobotFileParser

ROOT = Path(__file__).resolve().parent.parent
CANONICAL = 'https://papou.work/'
BOTS = ('LinkedInBot/1.0', 'facebookexternalhit/1.1', 'Twitterbot/1.0',
        'TelegramBot', 'WhatsApp/2.23.20.0', 'Slackbot-LinkExpanding 1.0',
        'Discordbot/2.0', 'Applebot/0.1')


class SharingHead(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_head = self.in_title = False
        self.meta, self.title, self.canonical = {}, [], []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'head':
            self.in_head = True
        if not self.in_head:
            return
        if tag == 'title':
            self.in_title = True
        if tag == 'meta':
            key = attrs.get('property', attrs.get('name'))
            if key and (key.startswith(('og:', 'twitter:')) or key == 'description'):
                assert key not in self.meta, 'Duplicate sharing tag: ' + key
                self.meta[key] = attrs.get('content', '')
        if tag == 'link' and 'canonical' in attrs.get('rel', '').split():
            self.canonical.append(attrs.get('href'))

    def handle_endtag(self, tag):
        if tag == 'head':
            self.in_head = False
        if tag == 'title':
            self.in_title = False

    def handle_data(self, text):
        if self.in_head and self.in_title:
            self.title.append(text)


def jpeg_dimensions(data):
    assert data[:2] == b'\xff\xd8' and data[-2:] == b'\xff\xd9', 'Expected JPEG image'
    offset = 2
    while offset < len(data):
        assert data[offset] == 0xff, 'Invalid JPEG marker'
        while data[offset] == 0xff:
            offset += 1
        marker = data[offset]
        offset += 1
        if marker in (0xd8, 0xd9, 0x01) or 0xd0 <= marker <= 0xd7:
            continue
        size = int.from_bytes(data[offset:offset + 2], 'big')
        assert size >= 2, 'Invalid JPEG segment'
        if marker in (0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
                      0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf):
            height, width = struct.unpack('>HH', data[offset + 3:offset + 7])
            return width, height
        offset += size
    raise AssertionError('JPEG dimensions not found')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url')
    parser.add_argument('--bots', action='store_true', help='Check HTTP delivery for sharing-crawler user agents; not app UI testing')
    args = parser.parse_args()
    assert not args.bots or args.url, '--bots requires a deployed --url'
    base = args.url.rstrip('/') + '/' if args.url else None
    if base:
        assert urlsplit(base).scheme in ('http', 'https')

    def read(relative, mime, bot='CV-Social-Check/1.0'):
        if base:
            with urlopen(Request(urljoin(base, relative), headers={'User-Agent': bot}), timeout=25) as response:
                assert response.status == 200, (relative, response.status)
                assert response.headers.get_content_type() == mime, (relative, response.headers.get_content_type())
                assert 'noindex' not in response.headers.get('X-Robots-Tag', '').lower(), relative
                return response.read()
        target = (ROOT / (relative or 'index.html')).resolve()
        assert target.is_relative_to(ROOT) and target.is_file(), relative
        return target.read_bytes()

    robots = RobotFileParser()
    robots.parse(read('robots.txt', 'text/plain').decode().splitlines())

    def check_page(relative, bot='CV-Social-Check/1.0'):
        raw = read(relative, 'text/html', bot)
        assert len(raw) < 1_000_000, 'HTML too large for a lightweight preview fetch'
        page = SharingHead()
        page.feed(raw.decode('utf-8'))
        meta = page.meta
        required = ('og:type', 'og:site_name', 'og:locale', 'og:title', 'og:description',
                    'og:url', 'og:image', 'og:image:secure_url', 'og:image:type',
                    'og:image:width', 'og:image:height', 'og:image:alt',
                    'twitter:card', 'twitter:title', 'twitter:description',
                    'twitter:image', 'twitter:image:alt', 'description')
        assert all(meta.get(k, '').strip() for k in required), 'Missing sharing metadata'
        assert page.canonical == [urljoin(CANONICAL, relative)]
        assert meta['og:url'] == page.canonical[0]
        assert meta['og:title'] == meta['twitter:title'] == ''.join(page.title)
        assert meta['description'] == meta['og:description'] == meta['twitter:description']
        assert 40 <= len(meta['description']) <= 200, 'Keep descriptions concise and useful'
        assert meta['twitter:card'] == 'summary_large_image'
        assert meta['og:image'] == meta['og:image:secure_url'] == meta['twitter:image']
        assert meta['og:image:alt'] == meta['twitter:image:alt']
        image_url = urlsplit(meta['og:image'])
        assert image_url.scheme == 'https' and image_url.netloc == 'papou.work'
        assert not image_url.query and not image_url.fragment, 'Use a stable versioned asset path'
        assert meta['og:image:type'] == 'image/jpeg'
        image_data = read(image_url.path.lstrip('/'), 'image/jpeg', bot)
        dimensions = jpeg_dimensions(image_data)
        assert dimensions == (int(meta['og:image:width']), int(meta['og:image:height']))
        assert len(image_data) < 1_000_000, 'Keep image transfer below 1 MB'
        if relative == '':
            assert dimensions == (1200, 630), 'CV uses the reviewed landscape card'
            assert 'Senior Platform & SRE Engineer' in meta['og:title']
        else:
            assert dimensions == (1200, 900)
            assert image_url.path == '/portfolio-images/electronics-workbench.jpg'
            assert 'AI assistance' in meta['og:image:alt']
        for user_agent in BOTS:
            assert robots.can_fetch(user_agent, meta['og:url'])
            assert robots.can_fetch(user_agent, meta['og:image'])
        return meta

    baseline = {relative: check_page(relative) for relative in ('', 'portfolio.html')}
    if args.bots:
        def bot_check(item):
            relative, bot = item
            assert check_page(relative, bot) == baseline[relative], 'Crawler receives different metadata'
        with ThreadPoolExecutor(max_workers=4) as pool:
            list(pool.map(bot_check, [(p, b) for p in baseline for b in BOTS]))
    suffix = ' across 8 sharing-crawler user agents' if args.bots else ''
    print('PASS: both sharing cards, exact descriptions, JPEG dimensions/MIME/size and crawler access' + suffix)


if __name__ == '__main__':
    main()
