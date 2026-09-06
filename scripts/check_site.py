#!/usr/bin/env python3
"""Check the static CV locally, or its published copy with --url."""
import argparse
import datetime as dt
import hashlib
from html import unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import unicodedata
from urllib.parse import quote, unquote, urljoin, urlsplit
from urllib.request import Request, urlopen
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET

CANONICAL = "https://papou.work/"
ALTERNATIVE_NAME = "Ilya Popov"
HANDLE_ALIASES = {"PILPROD", "pilprod"}
ROOT = Path(__file__).resolve().parent.parent
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

# Reviewed against Figma frames 370:3 / 370:105 and the supplied PDF on 2026-09-04.
# Lines retain the editorial print grouping. Explicit AWS/GCP tags were added
# on September 5 at the user's request. Providers share a flat list of services.
# The second IAM entry is intentionally omitted from the screen presentation.
# OpenVPN was subsequently removed from the tags at the user's request, not from experience.
SOURCE_TECHNOLOGIES = {
    "platform": ("Platform & delivery", (
        "Linux · Kubernetes · RKE2 · Docker", "Terraform · HCP Terraform Stacks",
        "Helm · Argo CD · Ansible", "GitLab CI/CD · Jenkins", "GitHub Actions · Nexus")),
    "cloud": ("Cloud infrastructure", (
        "AWS · GCP",
        "S3 · Lambda · EKS · IAM", "GKE · Cloud SQL · GCS",
        "Artifact Registry · Cloud Build & Deploy", "WIF · Secret Manager",
        "Cloud KMS · Pub/Sub · Cloudflare")),
    "programming": ("Software engineering", (
        "Go · Python · Bash · JavaScript", "React · Next.js · Node.js · Express",
        "Java · Spring · C++", "OpenAPI · gRPC", "Schema validation · contract tests")),
    "security": ("Security & reliability", (
        "Vault · ESO · Keycloak · mTLS · Kyverno", "GitGuardian · Trivy",
        "Prometheus · VictoriaMetrics", "Grafana · ELK · OpenTelemetry",
        "Tailscale · OPNsense")),
    "data": ("ML & data infrastructure", (
        "Airflow · Slurm · JupyterHub · MLflow", "PostgreSQL · Patroni · Redis",
        "Kafka · RabbitMQ · Cassandra", "MinIO · VectorDB · BigQuery")),
    "agents": ("Agent infrastructure & R&D", (
        "kagent · agentgateway", "MCP · A2A · RAG", "Temporal · Human-in-the-loop",
        "LangChain · ADK", "Codex · Claude Code · Gemini", "vLLM · Langfuse")),
}
SOURCE_PARTS = {
    "identity": ("identity",),
    "sidebar": ("sidebar/contact", "sidebar/languages", "sidebar/strengths", "sidebar/environments", "sidebar/domains"),
    "job": ("job/Sirena-Travel", "job/Sberbank", "job/I-Teco", "job/Freelance-Flant", "job/MTS"),
    "page-intro": ("page-intro",),
    "project": ("project/YourOwn.Chat", "project/Home Aeroponics", "project/Zero-Trust Mesh"),
}
# Source-derived fingerprints cover every word in the editorial sections, not
# just a few selected keywords. Update only after reviewing changed source text.
SOURCE_DIGESTS = {
    # September 5 user-directed cloud emphasis: the final summary preference,
    # AWS-first freelance wording and deployed GCP components first in R&D.
    # These approved editorial changes are synchronized to the revised Figma CV.
    # Experience headline now reads "5+ in DevOps & SRE" at the user's request.
    "identity": "7398dd3d9ce9d1ab97bcd4bdc2f09b904e671909cd82bf530966aa7b7cb7ce53",
    # Website and messaging handles explicitly added by the user after the baseline.
    "sidebar/contact": "e747534971c633d6d393b88ae7e244210e86ec756c117d06503496b1a4c71c3b",
    "sidebar/languages": "d711fe74f8189d23348779a52492365a2483f26a9683eb0066b91edd001e1572",
    "sidebar/strengths": "5eddd31c856782aa6d067cbd9f59c47ab5fd5c09dd58b07b1df42b695bc1c192",
    "sidebar/environments": "59f89af421cabf2610fc3b177fce1b276523cb2d4bdc4b6a2a7f4435518c953b",
    "sidebar/domains": "af8993ed452f0f0e2628d93963363c8869efd0a2385924e2c424a137dd098b37",
    # September 5: restore the existing Figma domains and user-confirmed Sber Hybrid.
    "job/Sirena-Travel": "5e27096f34bb9f31639ebae4ce57b31babfb1ee8bb637d05b54455224260012f",
    "job/Sberbank": "e3ae8fe8fdd501f99263f59e5de132576834acc7dfd6bdc1bf2412911c30f8b0",
    "job/I-Teco": "8f9cf7cee4a2983e2156ad502846733006ab4f4e1dc20904ce571e6cfb865543",
    # User-requested heading: Flant & Freelance.
    "job/Freelance-Flant": "7ac34f8227b7209b6f028d6f24dfa48c46f7690a316f197834d49e155006303d",
    # User-requested employer name: MTS (Mobile TeleSystems).
    "job/MTS": "876877b59b95625109a51edaef6d659e6fa08216c544bf9b11bc67dcb5e3f91f",
    "page-intro": "90e16fbcab2f683c5e9dc5cc83bc6cf53801271fde4a6fc09b2e4d318dd10e5f",
    # September 6: project dates/locations refreshed from LinkedIn Experience.
    # The user subsequently corrected YourOwn.Chat's location to Buenos Aires city.
    # Preserve Personal R&D / PoCs labels and the reviewed achievement text.
    # User-requested shared heading: Agent Orchestration Infrastructure.
    "project/YourOwn.Chat": "4498c2ffe688132ab906fcf6bd018f9cb77ca824f0919df752a81ec5c35734a2",
    # User-directed status wording: Personal project -> Personal R&D.
    # User clarified Python/MQTT automation, Home Assistant UI and preparatory Prometheus work.
    "project/Home Aeroponics": "90d7598431d6810b3f0079855586404316b95ef625c853c198fbae2be68d8bad",
    # User confirmed automated network configuration and one-click node onboarding.
    "project/Zero-Trust Mesh": "cee98493976f507c51414d6d50e886e8d0f634bc1876cb53f99fa53732c9f0ca",
}
SOURCE_LINKS = {
    "https://sirena-travel.com", "https://www.sberbank.com", "https://www.i-teco.ru",
    "https://flant.ru", "https://mts.ru",
    "https://papou.work",
    "https://wa.me/papou.work", "https://t.me/pilprod",
    "mailto:ilya@papou.email", "https://www.linkedin.com/in/pilprod", "https://github.com/pilprod",
    "https://github.com/pilprod/yourown-chat", "https://github.com/pilprod/kagent", "https://github.com/pilprod/mattermost",
    "https://github.com/pilprod/substrate", "https://github.com/pilprod/yourown-chat-kagent",
    "https://github.com/pilprod/yourown-chat-mattermost",
    "https://github.com/pilprod/aeroponics-iot-control", "https://github.com/pilprod/aeroponics-sensor-firmware",
    "https://github.com/pilprod/lab-network-automation", "https://github.com/pilprod/zero-trust-mesh-policy",
    "https://github.com/pilprod/gcp-ngfw-network-lab",
}
PROJECT_LINKS = {
    "agent": (("Platform", "https://github.com/pilprod/yourown-chat"),
              ("Agent runtime", "https://github.com/pilprod/substrate"),
              ("kagent fork", "https://github.com/pilprod/kagent"),
              ("kagent integration", "https://github.com/pilprod/yourown-chat-kagent"),
              ("Mattermost fork", "https://github.com/pilprod/mattermost"),
              ("Image build", "https://github.com/pilprod/yourown-chat-mattermost")),
    "home": (("Controllers", "https://github.com/pilprod/aeroponics-iot-control"),
             ("Sensor firmware", "https://github.com/pilprod/aeroponics-sensor-firmware")),
    "mesh": (("Ansible", "https://github.com/pilprod/lab-network-automation"),
             ("Access policy", "https://github.com/pilprod/zero-trust-mesh-policy"),
             ("GCP network lab", "https://github.com/pilprod/gcp-ngfw-network-lab")),
}


def normalize_text(value):
    return " ".join(unescape(value).split())


def normalize_source_text(value):
    """Ignore editorial punctuation/case, but preserve numbers and comparisons."""
    value = unicodedata.normalize("NFKC", unescape(value)).casefold()
    return "".join(char for char in value if char.isalnum() or char in "+~<=>")


def check_source_content(page):
    assert page.project_links == {key: list(links) for key, links in PROJECT_LINKS.items()}, "Project repository labels, URLs or groupings differ from reviewed links"
    assert "Other engineering experience" not in page.cv_content["detail"], "Secondary projects should have no extra section heading"
    assert page.source_content["project"][0].startswith("Agent Orchestration Infrastructure "), "Preserve the shared Agent Orchestration Infrastructure heading"
    project_metadata = (
        "Jun 2026 – Present · Personal R&D · PoCs · Buenos Aires, Argentina",
        "Aug 2024 — Jan 2025 · Personal R&D · Moscow City, Russia",
        "Jan 2025 — Mar 2025 · Personal R&D · Bangkok City, Thailand",
    )
    for item, metadata in zip(page.source_content["project"], project_metadata):
        assert metadata in item, "Project dates/locations differ from the reviewed LinkedIn source"
    assert "8 years in IT · 5+ in DevOps & SRE" in page.source_content["identity"][0], "Preserve the requested experience headline"
    assert len(page.cv_content["achievement"]) == 35, "Expected all 35 reviewed achievement bullets"
    domains = ("Aviation & travel", "Finance & insurance", "Public sector",
               "Cross-industry IT consulting", "Telecommunications")
    assert len(page.source_content["job"]) == len(domains), "Expected five professional experiences"
    for item, domain in zip(page.source_content["job"], domains):
        assert "Domain:" not in item and domain in item, "Missing experience domain or unwanted Domain prefix"
    assert "Full-time · Russia · Hybrid" in page.source_content["job"][1], "Sber's work arrangement must be Hybrid"
    for kind, labels in SOURCE_PARTS.items():
        items = page.source_content[kind]
        assert len(items) == len(labels), f"Missing or extra {kind} source sections"
        for label, item in zip(labels, items):
            if label == "sidebar/contact":
                item = item.replace("Also known as " + ALTERNATIVE_NAME, "")
            digest = hashlib.sha256(normalize_source_text(item).encode("utf-8")).hexdigest()
            assert digest == SOURCE_DIGESTS[label], f"CV differs from reviewed Figma/PDF source in {label}. Review the source before changing its fingerprint."


def check_technologies(page, llms):
    assert set(page.technologies) == set(SOURCE_TECHNOLOGIES), "Expected all six selected-technology categories"
    markdown_groups = {
        heading.strip(): [token.strip() for line in body.splitlines() if line.startswith("- ")
                          for token in line[2:].split(" · ")]
        for heading, body in re.findall(r"^#### ([^\n]+)\n(.*?)(?=^#{1,4} |\Z)", llms, flags=re.M | re.S)
    }
    assert set(markdown_groups) == {title for title, _ in SOURCE_TECHNOLOGIES.values()}, "llms.txt technology categories differ from HTML/source"
    count = 0
    for category, (title, lines) in SOURCE_TECHNOLOGIES.items():
        expected = [token for line in lines for token in line.split(" · ")]
        group = page.technologies[category]
        assert group["title"] == title, f"Technology heading differs from source: {category}"
        assert group["items"] == expected, f"Technology list differs from source: {title}"
        assert len(group["items"]) == len(set(group["items"])), f"Duplicate technology in {title}"
        assert markdown_groups[title] == expected, f"llms.txt technology list differs: {title}"
        line_ends, position = [], 0
        for line in lines:
            position += len(line.split(" · "))
            line_ends.append(position)
        assert group["line_ends"] == line_ends, f"Print technology grouping differs from source: {title}"
        count += len(expected)
    assert count == 85, "Expected 83 source technologies plus the requested AWS/GCP tags"
    return count


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.meta, self.links, self.ids, self.refs = {}, [], set(), []
        self.images = []
        self.text, self.title, self.names, self.jsonld = [], [], [], []
        self.tag, self.in_head, self.in_script = "", False, False
        self.capture_json, self.script, self.in_h1 = False, [], False
        self.elements = []
        self.cv_content = {kind: [] for kind in ("achievement", "summary", "project-summary", "detail")}
        self.source_content = {kind: [] for kind in SOURCE_PARTS}
        self.technologies = {}
        self.project_links = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = set(attrs.get("class", "").split())
        ancestors = set().union(*(element["classes"] for element in self.elements))
        project_group = attrs.get("data-project") if "project-links" in classes else next(
            (element["project_group"] for element in reversed(self.elements) if element["project_group"]), None)
        if "project-links" in classes:
            assert project_group and project_group not in self.project_links, "Missing or duplicate project repository group"
            self.project_links[project_group] = []
        project_href = attrs.get("href") if tag == "a" and project_group else None
        capture = None
        if tag == "li" and "achievements" in ancestors and {"job", "project"} & ancestors:
            capture = "achievement"
        elif tag == "p":
            capture = next((kind for kind in ("summary", "project-summary") if kind in classes), None)
        if capture is None and "cv" in ancestors and (
            tag in ("h1", "h2", "h3") and "tech-group" not in ancestors
            or tag == "p" and (classes & {"eyebrow", "headline", "job-role", "job-meta", "project-meta"} or "page-intro" in ancestors)
            or tag == "li" and "sidebar-section" in ancestors
            or tag == "div" and "language-list" in ancestors
            or tag == "span" and "job-domain" in classes
            or tag in ("span", "a") and "contact-list" in ancestors
        ):
            capture = "detail"
        if "job-domain" in classes:
            assert "job-title-line" in ancestors and "job-meta" not in ancestors, "Industry labels must be beside company headings, not dates"
        source = next((kind for kind, css_class in (("identity", "identity"), ("sidebar", "sidebar-section"),
                      ("job", "job"), ("project", "project"), ("page-intro", "page-intro")) if css_class in classes), None)
        category = attrs.get("data-category") if "tech-group" in classes else next(
            (element["category"] for element in reversed(self.elements) if element["category"]), None)
        if "tech-group" in classes:
            assert category and category not in self.technologies, "Missing or duplicate technology category"
            self.technologies[category] = {"title": "", "items": [], "line_ends": []}
        tech_capture = ("title" if tag == "h3" else "item" if tag == "li" else None) if category else None
        if tag == "br":
            for element in self.elements:
                if element["capture"] or element["source"] or element["tech_capture"]:
                    element["text"].append(" ")
        elif tag not in VOID_TAGS:
            self.elements.append({"tag": tag, "classes": classes, "capture": capture, "source": source,
                                  "category": category, "tech_capture": tech_capture, "text": [],
                                  "project_group": project_group, "project_href": project_href})
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
        if tag == "img":
            self.images.append(attrs)
        if "href" in attrs or "src" in attrs:
            self.refs.append((tag, attrs.get("href", attrs.get("src"))))
        if tag == "script":
            self.in_script, self.script = True, []
            self.capture_json = attrs.get("type") == "application/ld+json"

    def handle_endtag(self, tag):
        for index in range(len(self.elements) - 1, -1, -1):
            if self.elements[index]["tag"] == tag:
                for element in self.elements[index:]:
                    content = normalize_text("".join(element["text"]))
                    if element["project_href"]:
                        self.project_links[element["project_group"]].append((content, element["project_href"]))
                    if element["capture"]:
                        self.cv_content[element["capture"]].append(content)
                    if element["source"]:
                        self.source_content[element["source"]].append(content)
                    if element["tech_capture"]:
                        group = self.technologies[element["category"]]
                        if element["tech_capture"] == "title":
                            assert not group["title"], "Duplicate technology heading"
                            group["title"] = content
                        else:
                            group["items"].append(content)
                            if "line-end" in element["classes"]:
                                group["line_ends"].append(len(group["items"]))
                del self.elements[index:]
                break
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
        if not self.in_script:
            in_project_links = any("project-links" in element["classes"] for element in self.elements)
            # Responsive/print-only variants repeat the canonical source wording.
            print_repetition = any({"print-only", "company-name-short"} & element["classes"] for element in self.elements)
            for element in self.elements:
                if not print_repetition and (element["capture"] or element["tech_capture"] or element["project_href"] or element["source"] and not in_project_links):
                    element["text"].append(data)
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

    def resource(path, content=True, binary=False):
        path = unquote(urlsplit(path).path).lstrip("/")
        if base:
            request = Request(urljoin(base, quote(path, safe="/")), method="GET" if content else "HEAD",
                              headers={"User-Agent": "CV-Site-Check/1.0"})
            with urlopen(request, timeout=20) as response:
                assert response.status == 200, f"HTTP {response.status}: {path}"
                assert "noindex" not in response.headers.get("X-Robots-Tag", "").lower(), path + " has noindex"
                if binary:
                    assert response.headers.get_content_type() == "application/pdf", "Expected application/pdf: " + path
                    return response.read()
                return response.read().decode("utf-8") if content else ""
        local = (ROOT / (path or "index.html")).resolve()
        assert local.is_relative_to(ROOT) and local.is_file(), "Missing local resource: " + path
        if binary:
            return local.read_bytes()
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
    assert ALTERNATIVE_NAME in visible, "Alternate name missing from visible CV"
    assert title == "Ilya Papou CV — Senior DevOps & SRE", "Preserve the user-requested search/social title"
    for key in ("description", "og:description", "twitter:description"):
        assert name in meta[key] and ALTERNATIVE_NAME in meta[key], key + " must identify both names"
    assert meta["twitter:card"] in ("summary", "summary_large_image"), "Invalid Twitter card"
    assert meta["og:type"] == "profile", "OG type must be profile"
    assert meta["og:url"] == CANONICAL, "OG URL is not canonical"
    print_portraits = [image for image in page.images if "portrait-print" in image.get("class", "").split()]
    assert len(print_portraits) == 1, "Print portrait must be a real HTML image, not a print-time CSS replacement"
    assert print_portraits[0].get("src") == "assets/portrait-source.jpg", "Print portrait must share the Figma source and crop with the screen portrait"
    assert print_portraits[0].get("loading") == "eager", "Print portrait must load before opening print preview"
    assert int(print_portraits[0].get("width", 0)) >= 896 and int(print_portraits[0].get("height", 0)) >= 1008, "Print portrait must retain the high-resolution Figma source"
    assert not any("portrait-marks" in image.get("class", "").split() for image in page.images), "Keep decorative corners removed from the portrait"
    assert not any("sidebar-motif" in image.get("class", "").split() for image in page.images), "Keep the removed sidebar circuit decoration out of the CV"
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
    pdf_manifest = json.loads(resource("assets/cv-pdf.json"))
    pdf_title = "Ilya Papou CV — DevOps & SRE"
    pdf_path = f"assets/{pdf_title}.pdf"
    assert pdf_manifest["file"] == pdf_path, "Unexpected downloadable PDF path"
    assert pdf_manifest["title"] == pdf_title, "Unexpected suggested PDF title"
    assert sum(tag == "a" and unquote(urlsplit(ref).path) == pdf_path for tag, ref in page.refs) == 1, "Keep one Open PDF action usable without JavaScript"
    assert "open-pdf" in page.ids and not {"print-cv", "download-cv"} & page.ids, "Expected only Open PDF, without separate print/download controls"
    assert "pdf-help" not in page.ids, "Keep the toolbar free of the removed PDF instruction text"
    assert not any(text in visible for text in ("Ready-to-save PDF", "For web printing, use A4", "2 pages · under 1 MB")), "Removed PDF helper text must not be visible"
    pdf_bytes = resource(pdf_path, binary=True)
    assert pdf_bytes.startswith(b"%PDF-"), "Download is not a PDF"
    assert len(pdf_bytes) == pdf_manifest["bytes"] < 1_000_000, "PDF must be below 1 MB"
    assert len(re.findall(rb"/Type\s*/Page\b", pdf_bytes)) == pdf_manifest["pages"] == 2, "Download must contain exactly two pages"
    assert hashlib.sha256(pdf_bytes).hexdigest() == pdf_manifest["sha256"], "PDF differs from reviewed export"
    assert not pdf_manifest.get("legacyFiles"), "Only the current canonical PDF should be generated"
    # Local release check prevents a newer CV being published with a stale PDF.
    # On the live check, compare the manifest and PDF, not local unpublished edits.
    assert {"index.html", "styles.css", "assets/portrait-source.jpg"} <= set(pdf_manifest["sources"])
    if not base:
        for source, digest in pdf_manifest["sources"].items():
            source_path = (ROOT / source).resolve()
            assert source_path.is_relative_to(ROOT) and source_path.is_file(), "Missing PDF source: " + source
            assert hashlib.sha256(source_path.read_bytes()).hexdigest() == digest, "PDF is stale. Run scripts/export_pdf.cjs and review both pages: " + source
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
    aliases = person.get("alternateName", [])
    assert isinstance(aliases, list) and {ALTERNATIVE_NAME, *HANDLE_ALIASES} <= set(aliases), "Person alternateName must preserve name and handle aliases"
    for kind, suffix in (("WebSite", "website"), ("ProfilePage", "profile"), ("Person", "person")):
        assert urljoin(CANONICAL, entities[kind].get("@id", "")) == CANONICAL + "#" + suffix, "Invalid " + kind + " id"
    assert person.get("name") == name and person.get("jobTitle", "!") in visible, "Person name/job differs from visible CV"
    assert len(page.cv_content["summary"]) == 1, "Expected one visible professional summary"
    assert normalize_text(person.get("description", "")) == page.cv_content["summary"][0], "Person description differs from visible professional summary"
    assert person.get("url") == profile.get("url") == entities["WebSite"].get("url") == CANONICAL, "JSON-LD URLs differ"
    assert urljoin(CANONICAL, profile.get("mainEntity", {}).get("@id", "")) == CANONICAL + "#person", "Profile mainEntity differs"
    visible_links = {url.rstrip("/") for tag, url in page.refs if tag == "a"}
    assert person.get("sameAs") and all(url.rstrip("/") in visible_links for url in person["sameAs"]), "Person profiles must be visible links"
    assert SOURCE_LINKS <= visible_links, "A contact or selected-code link from the source is missing"
    if isinstance(person.get("image"), str):
        check_ref(person["image"])

    robots_text = resource("robots.txt")
    robots_comments = "\n".join(line for line in robots_text.splitlines() if line.startswith("#"))
    assert all(alias in robots_comments for alias in HANDLE_ALIASES), "Missing handle aliases in robots.txt comments"
    robots = RobotFileParser()
    robots.parse(robots_text.splitlines())
    assert CANONICAL + "sitemap.xml" in (robots.site_maps() or []), "robots.txt must advertise sitemap"
    assert all(robots.can_fetch(bot, CANONICAL) for bot in ("Googlebot", "bingbot", "OAI-SearchBot")), "Search crawler blocked"
    sitemap_text = resource("sitemap.xml")
    sitemap_comments = " ".join(re.findall(r"<!--(.*?)-->", sitemap_text, flags=re.S))
    assert all(alias in sitemap_comments for alias in HANDLE_ALIASES), "Missing handle aliases in sitemap.xml comments"
    sitemap = ET.fromstring(sitemap_text)
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    assert sitemap.findall("s:url/s:loc", ns) and [loc.text for loc in sitemap.findall("s:url/s:loc", ns)] == [CANONICAL], "Sitemap must contain canonical homepage only"
    lastmods = sitemap.findall("s:url/s:lastmod", ns)
    assert len(lastmods) == 1 and lastmods[0].text, "Missing sitemap lastmod"
    modified = dt.datetime.fromisoformat(lastmods[0].text.replace("Z", "+00:00"))
    assert modified.date() <= dt.date.today(), "Future sitemap lastmod"
    profile_modified = dt.datetime.fromisoformat(profile.get("dateModified", "").replace("Z", "+00:00"))
    assert profile_modified.date() == modified.date(), "Profile dateModified differs from sitemap lastmod"
    llms = resource("llms.txt")
    intro = normalize_text(llms.partition("\n## ")[0])
    assert name in intro and ALTERNATIVE_NAME in intro, "llms.txt introduction must identify both names"
    assert all(alias in intro for alias in HANDLE_ALIASES), "llms.txt introduction must identify both handle variants"
    for reference in re.findall(r"\[[^\]]+\]\(([^)]+)\)", llms):
        check_ref(reference)
    markdown_links = {url.rstrip("/") for url in re.findall(r"\[[^\]]+\]\(([^)]+)\)", llms)}
    assert SOURCE_LINKS <= markdown_links, "llms.txt is missing a contact or selected-code link from the source"
    for fragment in ("experience", "projects", "technologies", "home-aeroponics", "zero-trust-mesh"):
        assert "#" + fragment in llms and fragment in page.ids, "Missing llms.txt section: " + fragment
    assert page.cv_content["achievement"], "No job or project achievements found"
    llms_content = normalize_text(llms)
    llms_source_content = normalize_source_text(llms)
    for kind, items in page.cv_content.items():
        for item in items:
            matches = normalize_source_text(item) in llms_source_content if kind == "detail" else item in llms_content
            assert item and matches, f"llms.txt differs from visible {kind}: {item[:120]}"
    check_source_content(page)
    technology_count = check_technologies(page, llms)
    count = len(page.cv_content["achievement"])
    print(f"PASS: {'live ' + base if base else 'local site'} — metadata, structured data, {len(checked)} resources, fragments, robots, sitemap and llms.txt ({count} source achievements, all profile details and {technology_count} technologies preserved)")


if __name__ == "__main__":
    try:
        main()
    except (AssertionError, OSError, ValueError, ET.ParseError) as error:
        print("FAIL:", error, file=sys.stderr)
        sys.exit(1)
