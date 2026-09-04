#!/usr/bin/env python3
"""Check the static CV locally, or its published copy with --url."""
import argparse
import datetime as dt
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urljoin, urlsplit
from urllib.request import Request, urlopen
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET

CANONICAL = "https://papou.work/"
ROOT = Path(__file__).resolve().parent.parent


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.meta, self.links, self.ids, self.refs = {}, [], set(), []
        self.text, self.title, self.names, self.jsonld = [], [], [], []
        self.tag, self.in_head, self.in_script = "", False, False
        self.capture_json, self.script, self.in_h1 = False, [], False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tag = tag
        self.in_head |= tag == "head"
        self.in_h1 |= tag == "h1"
        if "id" in attrs:
            assert attrs["id"] not in self.ids, "Duplicate HTML id: " + attrs["id"]
            self.ids.add(attrs["id"])
        if tag == "meta":
            key, value = attrs.get("name", attrs.get("property", "")), attrs.get("content", "")
            self.meta[key] = self.meta.get(key, "") + "," + value if key in ("robots", "googlebot", "bingbot") else value
        if tag == "link":
            self.links.append(attrs)
        if "href" in attrs or "src" in attrs:
            self.refs.append((tag, attrs.get("href", attrs.get("src"))))
        if tag == "script":
            self.in_script, self.script = True, []
            self.capture_json = attrs.get("type") == "application/ld+json"

    def handle_endtag(self, tag):
        if tag == "script":
            if self.capture_json:
                self.jsonld.append(json.loads("".join(self.script)))
            self.in_script = False
        if tag == "head":
            self.in_head = False
        if tag == "h1":
            self.in_h1 = False
        self.tag = ""

    def handle_data(self, data):
        if self.in_script:
            self.script.append(data)
        elif self.tag == "title":
            self.title.append(data)
        elif not self.in_head:
            self.text.append(data)
            if self.in_h1:
                self.names.append(data)


def main():
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument("--url", help="Check a deployed site instead of local files")
    options = args.parse_args()
    base = options.url.rstrip("/") + "/" if options.url else None
    if base:
        assert urlsplit(base).scheme in ("http", "https"), "--url must be HTTP(S)"
    checked = set()

    def resource(path, content=True):
        path = unquote(urlsplit(path).path).lstrip("/")
        if base:
            request = Request(urljoin(base, path), method="GET" if content else "HEAD",
                              headers={"User-Agent": "CV-Site-Check/1.0"})
            with urlopen(request, timeout=20) as response:
                assert response.status == 200, f"HTTP {response.status}: {path}"
                assert "noindex" not in response.headers.get("X-Robots-Tag", "").lower(), path + " has noindex"
                return response.read().decode("utf-8") if content else ""
        local = (ROOT / (path or "index.html")).resolve()
        assert local.is_relative_to(ROOT) and local.is_file(), "Missing local resource: " + path
        return local.read_text(encoding="utf-8") if content else ""

    page = Page()
    page.feed(resource("/"))
    title, name = "".join(page.title).strip(), "".join(page.names).strip()
    visible = " ".join(" ".join(page.text).split())
    meta = page.meta
    required = ("description", "author", "og:title", "og:description", "og:url", "og:type",
                "og:image", "og:image:alt", "twitter:card", "twitter:title", "twitter:description", "twitter:image")
    assert title and name, "Missing title or visible h1"
    assert all(meta.get(key, "").strip() for key in required), "Missing metadata: " + ", ".join(k for k in required if not meta.get(k))
    assert meta["author"] == name and name in title, "Title/author must identify the visible person"
    assert meta["og:title"] == title == meta["twitter:title"], "Search/social titles differ"
    assert meta["twitter:card"] in ("summary", "summary_large_image"), "Invalid Twitter card"
    assert meta["og:type"] == "profile", "OG type must be profile"
    assert meta["og:url"] == CANONICAL, "OG URL is not canonical"
    canonicals = [link.get("href") for link in page.links if "canonical" in link.get("rel", "").split()]
    assert canonicals == [CANONICAL], "Expected one canonical URL"
    for key, value in meta.items():
        if key in ("robots", "googlebot", "bingbot"):
            assert not ({"noindex", "none", "nosnippet"} & set(re.split(r"[,\s]+", value.lower()))), key + " blocks discovery"

    def check_ref(reference):
        target = urlsplit(urljoin(CANONICAL, reference))
        if target.scheme not in ("http", "https") or target.netloc != urlsplit(CANONICAL).netloc:
            return
        path = target.path or "/"
        if target.fragment and path in ("/", "/index.html"):
            assert unquote(target.fragment) in page.ids, "Missing fragment: " + reference
        if path not in checked:
            resource(path, content=False)
            checked.add(path)

    for _, reference in page.refs:
        check_ref(reference)
    for key in ("og:image", "twitter:image"):
        assert urlsplit(meta[key]).scheme == "https", key + " must be an absolute HTTPS URL"
        check_ref(meta[key])
    for link in page.links:
        if "stylesheet" in link.get("rel", "").split():
            css = resource(link["href"])
            for reference in re.findall(r"url\(['\"]?([^)'\"]+)['\"]?\)", css):
                check_ref(urljoin(urljoin(CANONICAL, link["href"]), reference))

    assert all(block.get("@context") == "https://schema.org" for block in page.jsonld), "Invalid JSON-LD context"
    graph = [node for block in page.jsonld for node in block.get("@graph", [block])]
    entities = {node.get("@type"): node for node in graph if isinstance(node.get("@type"), str)}
    assert all(kind in entities for kind in ("WebSite", "ProfilePage", "Person")), "Missing JSON-LD entities"
    person, profile = entities["Person"], entities["ProfilePage"]
    for kind, suffix in (("WebSite", "website"), ("ProfilePage", "profile"), ("Person", "person")):
        assert urljoin(CANONICAL, entities[kind].get("@id", "")) == CANONICAL + "#" + suffix, "Invalid " + kind + " id"
    assert person.get("name") == name and person.get("jobTitle", "!") in visible, "Person name/job differs from visible CV"
    assert person.get("url") == profile.get("url") == entities["WebSite"].get("url") == CANONICAL, "JSON-LD URLs differ"
    assert urljoin(CANONICAL, profile.get("mainEntity", {}).get("@id", "")) == CANONICAL + "#person", "Profile mainEntity differs"
    visible_links = {url.rstrip("/") for tag, url in page.refs if tag == "a"}
    assert person.get("sameAs") and all(url.rstrip("/") in visible_links for url in person["sameAs"]), "Person profiles must be visible links"
    if isinstance(person.get("image"), str):
        check_ref(person["image"])

    robots = RobotFileParser()
    robots.parse(resource("robots.txt").splitlines())
    assert CANONICAL + "sitemap.xml" in (robots.site_maps() or []), "robots.txt must advertise sitemap"
    assert all(robots.can_fetch(bot, CANONICAL) for bot in ("Googlebot", "bingbot", "OAI-SearchBot")), "Search crawler blocked"
    sitemap = ET.fromstring(resource("sitemap.xml"))
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    assert sitemap.findall("s:url/s:loc", ns) and [loc.text for loc in sitemap.findall("s:url/s:loc", ns)] == [CANONICAL], "Sitemap must contain canonical homepage only"
    lastmods = sitemap.findall("s:url/s:lastmod", ns)
    assert len(lastmods) == 1 and lastmods[0].text, "Missing sitemap lastmod"
    modified = dt.datetime.fromisoformat(lastmods[0].text.replace("Z", "+00:00"))
    assert modified.date() <= dt.date.today(), "Future sitemap lastmod"
    profile_modified = dt.datetime.fromisoformat(profile.get("dateModified", "").replace("Z", "+00:00"))
    assert profile_modified.date() == modified.date(), "Profile dateModified differs from sitemap lastmod"
    llms = resource("llms.txt")
    for reference in re.findall(r"\[[^\]]+\]\(([^)]+)\)", llms):
        check_ref(reference)
    for fragment in ("experience", "projects", "technologies", "home-aeroponics", "zero-trust-mesh"):
        assert "#" + fragment in llms and fragment in page.ids, "Missing llms.txt section: " + fragment
    print(f"PASS: {'live ' + base if base else 'local site'} — metadata, structured data, {len(checked)} resources, fragments, robots, sitemap and llms.txt")


if __name__ == "__main__":
    try:
        main()
    except (AssertionError, OSError, ValueError, ET.ParseError) as error:
        print("FAIL:", error, file=sys.stderr)
        sys.exit(1)
