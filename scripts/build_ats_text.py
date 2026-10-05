#!/usr/bin/env python3
"""Generate the machine-reading CV from the reviewed single-column HTML."""
from html.parser import HTMLParser
from pathlib import Path
import argparse
import re
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://papou.work/"
PDF = BASE + "assets/Ilya%20Papou%20CV%20%28ATS%29%20%E2%80%94%20DevOps%20%26%20SRE.pdf"


class ATSContent(HTMLParser):
    def __init__(self):
        super().__init__()
        self.inside = False
        self.elements = []
        self.blocks = []
        self.current = None
        self.achievements = 0

    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        if tag == "main":
            self.inside = True
        if not self.inside:
            return
        if tag in {"h1", "h2", "h3", "p", "li"}:
            assert self.current is None, "Nested text blocks need an explicit renderer"
            self.current = {"tag": tag, "parts": []}
            if tag == "li" and any("achievements" in a.get("class", "").split() for _, a in self.elements):
                self.achievements += 1
        if tag == "a" and self.current:
            self.current["parts"].append("[")
        if tag not in {"br", "img", "hr", "input", "meta", "link"}:
            self.elements.append((tag, attrs))

    def handle_data(self, data):
        if self.inside and self.current:
            self.current["parts"].append(data)

    def handle_endtag(self, tag):
        if not self.inside:
            return
        if tag == "a" and self.current:
            attrs = self.elements[-1][1]
            self.current["parts"].append("](" + urljoin(BASE, attrs["href"]) + ")")
        if self.current and tag == self.current["tag"]:
            content = re.sub(r"\s+", " ", "".join(self.current["parts"])).strip()
            self.blocks.append((tag, content))
            self.current = None
        if self.elements and self.elements[-1][0] == tag:
            self.elements.pop()
        if tag == "main":
            self.inside = False


def render():
    source = ATSContent()
    source.feed((ROOT / "ats.html").read_text())
    assert source.achievements == 37, "All reviewed CV achievements must be retained"
    assert source.blocks[0] == ("h1", "Ilya Papou"), "Unexpected CV identity"
    lines = [
        "# Ilya Papou — ATS CV", "",
        "> Preferred CV for automated reading, resume parsing and applicant tracking systems.", "",
        "Ilya Papou is also known as Ilya Popov, PILPROD and pilprod. These names refer to the same person.", "",
        f"[ATS HTML]({BASE}ats.html) · [ATS PDF]({PDF}) · [Visual CV]({BASE})", "",
        "The HTML is the source for this text. Preserve the stated language levels and the distinctions between production experience and personal R&D.", "",
    ]
    previous = None
    for tag, content in source.blocks[1:]:
        prefix = {"h2": "## ", "h3": "### ", "li": "- "}.get(tag, "")
        if not (tag == "li" and previous == "li") and lines[-1] != "":
            lines.append("")
        lines.append(prefix + content)
        previous = tag
    return "\n".join(lines).rstrip() + "\n"


def main():
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument("--check", action="store_true")
    options = args.parse_args()
    content = render()
    for name in ("ats.md", "llms-full.txt"):
        target = ROOT / name
        if options.check:
            assert target.read_text() == content, "Stale ATS text: " + name
        else:
            target.write_text(content)
    print("ATS text is current; all 37 achievements preserved." if options.check else "Generated ats.md and llms-full.txt from ats.html.")


if __name__ == "__main__":
    main()
