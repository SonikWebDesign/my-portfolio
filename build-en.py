#!/usr/bin/env python3
"""Generate en.html (static English page) from index.html.

index.html is the single source of truth. Every translatable element carries
data-bg / data-en attributes; this script writes the English text into the
markup so search engines and AI crawlers can read it without JavaScript.

Run after every change to index.html:

    python3 build-en.py
"""
import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BASE = "https://sonikwebdesign.com/"
EN_URL = BASE + "en.html"
TITLE = "Web Design, SEO & AI Search Visibility | SONIK Web Design"
DESC = ("Web design studio for websites, online stores, SEO and visibility in AI search such as ChatGPT, Gemini and "
        "Perplexity. Clients in the USA, UK and Bulgaria. Explore SONIK’s work and request a tailored quote.")
OG_TITLE = "Websites, SEO & AI Search Visibility | SONIK"
OG_DESC = "Websites, online stores, SEO and AI search visibility, 3D and motion design. A distinctive presence for your business."

# Bulgarian strings that live in attributes or static text without data-en.
STATIC = {
    "New Shade — онлайн магазин и бизнес система": "New Shade — online store and business system",
    "New Shade — онлайн магазин, виртуален офис и автоматизация": "New Shade — online store, virtual office and automation",
    "Exclusive Barbershop — премиум сайт за барбършоп в САЩ": "Exclusive Barbershop — premium barbershop website in the USA",
    "Exclusive Barbershop — премиум сайт за барбършоп": "Exclusive Barbershop — premium barbershop website",
    "Анимация: кодът се изписва в редактор и се превръща в златния знак SONIK.": "Animation: code is typed in an editor and becomes the gold SONIK mark.",
    "SONIK Web Design — сайтове от 200 €": "SONIK Web Design — websites, SEO and AI search visibility",
    "Портфолио · Commerce автоматизация": "Portfolio · Commerce automation",
    ">Посетете живия сайт<": ">Visit the live website<",
    ">Пауза<": ">Pause<",
}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


class Finder(HTMLParser):
    """Records (inner_start, inner_end, english_html) for every [data-bg][data-en] element."""

    def __init__(self, text):
        super().__init__(convert_charrefs=False)
        self.starts = [0]
        for line in text.splitlines(keepends=True):
            self.starts.append(self.starts[-1] + len(line))
        self.stack, self.found = [], []

    def position(self):
        line, col = self.getpos()
        return self.starts[line - 1] + col

    def handle_starttag(self, tag, attrs):
        if tag in VOID:
            return
        a = dict(attrs)
        english = a.get("data-en") if "data-bg" in a else None
        self.stack.append((tag, self.position() + len(self.get_starttag_text()), english))

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        if not any(t == tag for t, _, _ in self.stack):
            return
        while self.stack:
            t, inner, english = self.stack.pop()
            if t == tag:
                if english is not None:
                    self.found.append((inner, self.position(), english))
                return


def translate_elements(text):
    finder = Finder(text)
    finder.feed(text)
    kept = []
    # Outermost elements only, applied back to front so offsets stay valid.
    for start, end, english in sorted(finder.found, key=lambda f: (f[0], -f[1])):
        if kept and start < kept[-1][1]:
            continue
        kept.append((start, end, english))
    for start, end, english in reversed(kept):
        text = text[:start] + english + text[end:]
    return text, len(kept)


def strip(value):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(value))).strip()


def structured_data(source):
    org = {"@id": BASE + "#org"}
    faq_section = source[source.index('<section id="faq"'):source.index('<section id="contact"')]
    faqs = [(strip(q), strip(a)) for q, a in re.findall(
        r'<details><summary><span data-bg="[^"]*" data-en="([^"]*)".*?</summary><p data-bg="[^"]*" data-en="([^"]*)"',
        faq_section, flags=re.S)]
    grid = source[source.index('<div class="work-grid">'):source.index('<p class="swipe-note work-swipe-note"')]
    works = [{"@type": "CreativeWork", "name": "New Shade",
              "description": "SONIK’s own venture: an online store for made-to-order sun-shading louvres with Stripe payments, a virtual office, automated invoices and first-party analytics.",
              "image": BASE + "work-new-shade.webp", "url": "https://new-shade.com",
              "mainEntityOfPage": BASE + "case-study-new-shade.html", "creator": org}]
    for card in re.findall(r'<article class="work-card.*?</article>', grid, flags=re.S):
        work = {
            "@type": "CreativeWork",
            "name": html.unescape(re.search(r"<h3>([^<]*)</h3>", card).group(1)),
            "description": strip(re.search(r'<p><span data-bg="[^"]*" data-en="([^"]*)"', card).group(1)),
            "image": BASE + re.search(r'<img src="([^"]*)"', card).group(1),
            "creator": org,
        }
        link = re.search(r'class="project-live-link" href="([^"]*)"', card)
        if link:
            work["url"] = link.group(1)
        case = re.search(r'class="project-case-link" href="[^"]*" data-en-href="([^"]*)"', card)
        if case:
            work["mainEntityOfPage"] = BASE + case.group(1)
        works.append(work)

    def offer(name, description, price=None):
        item = {"@type": "Offer", "name": name,
                "itemOffered": {"@type": "Service", "name": name, "description": description, "provider": org}}
        if price:
            item["priceSpecification"] = {"@type": "PriceSpecification", "minPrice": price, "priceCurrency": "EUR"}
        return item

    return {"@context": "https://schema.org", "@graph": [
        {"@type": "WebPage", "@id": EN_URL + "#webpage", "url": EN_URL, "name": TITLE, "description": DESC,
         "inLanguage": "en", "isPartOf": {"@id": BASE + "#website"}, "about": org,
         "primaryImageOfPage": BASE + "social-preview.png"},
        {"@type": "ProfessionalService", "@id": BASE + "#org", "name": "SONIK Web Design", "alternateName": "SONIK",
         "url": BASE,
         "description": "A web design studio building websites, SEO and AI search visibility, and 3D & motion design. "
                        "Based in Sofia, Bulgaria, working with clients in Bulgaria, the UK and the USA.",
         "slogan": "Precision. Character. Presence.", "email": "sonikwebco@gmail.com",
         "logo": BASE + "social-preview.png", "image": BASE + "social-preview.png",
         "areaServed": ["BG", "GB", "US"], "knowsLanguage": ["bg", "en"],
         "address": {"@type": "PostalAddress", "addressLocality": "Sofia", "addressCountry": "BG"},
         "sameAs": ["https://www.instagram.com/sonikwebdesign/", "https://github.com/SonikWebDesign"],
         "knowsAbout": ["Web design", "Website development", "Search engine optimization",
                        "AI search optimization (GEO / AEO)", "Schema.org structured data", "Online stores",
                        "3D and motion design"],
         "hasOfferCatalog": {"@type": "OfferCatalog", "name": "SONIK Web Design services", "itemListElement": [
             offer("Landing page", "A single page with up to 5 sections, phone and tablet layouts, and essential SEO metadata."),
             offer("Business website", "A complete digital presentation of a company — services, projects and expertise."),
             offer("Online store", "A catalogue, navigation and checkout designed around the customer."),
             offer("SEO & AI search visibility", "SEO and visibility in AI search such as ChatGPT, Gemini and Perplexity: technical audit, "
                   "structured data, AI crawler access, llms.txt, Google Search Console and local SEO. Tailored quote."),
             offer("3D & motion design", "Logo animations, 3D visuals, intro scenes and promotional videos for websites and social media. Tailored quote."),
         ]}},
        {"@type": "WebSite", "@id": BASE + "#website", "url": BASE, "name": "SONIK Web Design",
         "inLanguage": ["bg", "en"], "publisher": org},
        {"@type": "ItemList", "@id": EN_URL + "#portfolio", "name": "SONIK Web Design portfolio",
         "numberOfItems": len(works),
         "itemListElement": [{"@type": "ListItem", "position": n, "item": w} for n, w in enumerate(works, 1)]},
        {"@type": "FAQPage", "@id": EN_URL + "#faq", "inLanguage": "en",
         "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]},
    ]}


def sub(pattern, replacement, text):
    text, count = re.subn(pattern, lambda _: replacement, text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f"build-en.py: pattern not found: {pattern}")
    return text


def main():
    source = (ROOT / "index.html").read_text(encoding="utf-8")
    ld = json.dumps(structured_data(source), ensure_ascii=False).replace("</", "<\\/")
    text, count = translate_elements(source)

    e = lambda value: html.escape(value, quote=True)
    text = sub(r'<html lang="bg">', '<html lang="en">', text)
    text = sub(r"<title>.*?</title>", f"<title>{e(TITLE)}</title>", text)
    text = sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{e(DESC)}">', text)
    text = sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{EN_URL}">', text)
    text = sub(r'<meta property="og:locale" content="bg_BG"><meta property="og:locale:alternate" content="en_GB">',
               '<meta property="og:locale" content="en_GB"><meta property="og:locale:alternate" content="bg_BG">', text)
    text = sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{e(OG_TITLE)}">', text)
    text = sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{e(OG_DESC)}">', text)
    text = sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{EN_URL}">', text)
    text = sub(r'<meta name="twitter:title" content="[^"]*">', f'<meta name="twitter:title" content="{e(OG_TITLE)}">', text)
    text = sub(r'<meta name="twitter:description" content="[^"]*">', f'<meta name="twitter:description" content="{e(OG_DESC)}">', text)
    text = sub(r'<script type="application/ld\+json">.*?</script>', f'<script type="application/ld+json">{ld}</script>', text)
    text = sub(r'data-lang="bg" aria-pressed="true"', 'data-lang="bg" aria-pressed="false"', text)
    text = sub(r'data-lang="en" aria-pressed="false"', 'data-lang="en" aria-pressed="true"', text)
    # Links point to the English versions of the inner pages.
    text = re.sub(r'href="[^"]*"( data-en-href="([^"]*)")', r'href="\2"\1', text)
    # No fixed prices on the English page: every project is quoted.
    text, priced = re.subn(r'<p class="price">.*?</p><p class="price-unit"[^>]*>.*?</p>',
                           '<p class="price price--quote"><strong>Custom quote</strong></p><p class="price-unit">scoped to your project</p>', text, flags=re.S)
    if priced != 3:
        raise SystemExit(f"build-en.py: expected 3 price blocks, found {priced}")
    # Form placeholders.
    text = re.sub(r'placeholder="[^"]*"([^>]*data-en-placeholder="([^"]*)")', r'placeholder="\2"\1', text)
    for bg, en in sorted(STATIC.items(), key=lambda kv: -len(kv[0])):
        text = text.replace(e(bg), e(en)).replace(bg, en)

    # Image descriptions and accessibility labels: "Name — Български / English" → "Name — English".
    pairs = {strip(bg): strip(en) for bg, en in re.findall(r'data-bg="([^"]*)" data-en="([^"]*)"', source)}
    cyrillic = re.compile("[А-Яа-я]")

    def label(match):
        value = html.unescape(match.group(2))
        if " / " in value:
            head, tail = value.rsplit(" / ", 1)
            value = f"{head.split(' — ')[0]} — {tail}" if " — " in head else tail
        elif " — " in value:
            name, rest = value.split(" — ", 1)
            value = f"{name} — {pairs[rest]}" if rest in pairs else name
        else:
            value = pairs.get(value, value)
        return f'{match.group(1)}="{e(value)}"'

    text = re.sub(r'\b(alt|aria-label)="([^"]*[А-Яа-я][^"]*)"', label, text)

    (ROOT / "en.html").write_text(text, encoding="utf-8")
    print(f"en.html written — {count} translated elements")


if __name__ == "__main__":
    main()
