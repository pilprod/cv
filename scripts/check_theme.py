#!/usr/bin/env python3
"""Dependency-free checks for the screen-only device theme and text contrast."""
from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent


def declarations(body):
    return dict(re.findall(r"([\w-]+)\s*:\s*([^;]+);", body))


def luminance(color):
    color = color.removeprefix("#")
    channels = [int(color[index:index + 2], 16) / 255 for index in (0, 2, 4)]
    linear = [value / 12.92 if value <= .04045 else ((value + .055) / 1.055) ** 2.4
              for value in channels]
    return sum(value * weight for value, weight in zip(linear, (.2126, .7152, .0722)))


def contrast(foreground, background):
    high, low = sorted((luminance(foreground), luminance(background)), reverse=True)
    return (high + .05) / (low + .05)


class Metadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []

    def handle_starttag(self, tag, attrs):
        if tag == "meta":
            self.tags.append(dict(attrs))


def main():
    css = re.sub(r"/\*.*?\*/", "", (ROOT / "styles.css").read_text(), flags=re.S)
    # This stylesheet keeps top-level closing braces unindented. The dark block
    # must contain color rules only, with no nested breakpoint or print rules.
    blocks = re.findall(r"@media screen and \(prefers-color-scheme: dark\) \{\n(.*?)\n\}", css, re.S)
    assert len(blocks) == 1 and css.count("prefers-color-scheme") == 1, "One screen-only dark theme is required"
    base = declarations(re.search(r"^:root \{([^}]+)\}", css, re.M).group(1))
    rules = {}
    for selectors, body in re.findall(r"([^{}]+)\{([^{}]+)\}", blocks[0]):
        values = declarations(body)
        for prop in values:
            assert prop.startswith("--") or prop in {"color-scheme", "color", "background", "border-color", "box-shadow"}, \
                "Dark mode must not alter layout, typography or portrait geometry: " + prop
        for selector in selectors.split(","):
            rules[selector.strip()] = values
    dark = rules[":root"]
    assert base["color-scheme"] == "light" and dark["color-scheme"] == "dark"
    assert base["--paper"] == "#f7f9fb" and base["--sidebar"] == "#eaf2f5", "Keep print's original light palette"
    assert rules[".tech-group"] == rules[".tech-group + .tech-group"], "Later technology cards must also use dark surfaces"

    def resolve(value):
        if value == "white":
            return "#ffffff"
        if value.startswith("var("):
            return dark[value[4:-1]]
        return value

    def color(selector, prop):
        return resolve(rules[selector][prop])

    pairs = [
        ("headings", dark["--ink"], dark["--paper"]),
        ("body", dark["--text"], dark["--paper"]),
        ("sidebar", dark["--text"], dark["--sidebar"]),
        ("metadata", dark["--muted"], dark["--paper"]),
        ("footer", dark["--muted"], color("body", "background")),
        ("section labels", dark["--blue"], dark["--paper"]),
        ("contact hover", dark["--blue"], dark["--sidebar"]),
        ("links", dark["--teal"], dark["--paper"]),
        ("contacts", dark["--teal"], dark["--sidebar"]),
        ("navigation", dark["--teal"], color("body", "background")),
        ("project links", dark["--teal"], color(".project-agent", "background")),
        ("project body", dark["--text"], color(".project-agent", "background")),
        ("technology headings", dark["--teal"], color(".tech-group", "background")),
        ("technology chips", color(".tech-list li", "color"), color(".tech-list li", "background")),
        ("PDF action", "#ffffff", color(".site-toolbar .pdf-action", "background")),
        ("PDF hover", "#ffffff", color(".site-toolbar .pdf-action:hover", "background")),
        ("Allow cookies", color(".analytics-allow", "color"), dark["--teal"]),
    ]
    for label, foreground, background in pairs:
        ratio = contrast(foreground, background)
        assert ratio >= 4.5, f"{label}: text contrast {ratio:.2f}:1 is below 4.5:1"
    assert contrast(color(".site-toolbar .pdf-action", "border-color"), color("body", "background")) >= 3

    metadata = Metadata()
    metadata.feed((ROOT / "index.html").read_text())
    themes = {tag.get("media"): tag.get("content") for tag in metadata.tags if tag.get("name") == "theme-color"}
    assert themes == {"(prefers-color-scheme: light)": base["--paper"],
                      "(prefers-color-scheme: dark)": dark["--paper"]}, "Browser chrome must follow the device theme"
    assert any(tag.get("name") == "color-scheme" and tag.get("content") == "light dark" for tag in metadata.tags)
    print(f"Theme checks passed: screen-only colors, unchanged layout, light print defaults, adaptive metadata and {len(pairs)} text contrast pairs.")


if __name__ == "__main__":
    main()
