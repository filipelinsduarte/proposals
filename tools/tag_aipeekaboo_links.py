#!/usr/bin/env python3
"""Add UTM tags to every aipeekaboo.com link in the deployed proposal decks.

A prospect clicking from a deck to aipeekaboo.com used to land in GA4 as an
anonymous "filipelinsduarte.github.io / referral" session. Tagged, it reports
as utm_source=proposal, utm_medium=deck, utm_campaign=<deck file name>, so the
click is attributable to the deck that earned it and easy to filter out.

Usage:  python3 tools/tag_aipeekaboo_links.py            # rewrite every *.html
        python3 tools/tag_aipeekaboo_links.py --check    # exit 1 if any link is untagged

Only href attributes are rewritten. Image src URLs on aipeekaboo.com stay as they are.
Running it twice changes nothing.
"""

import re
import sys
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

UTM_SOURCE = "proposal"
UTM_MEDIUM = "deck"
DOMAIN = "aipeekaboo.com"

HREF_RE = re.compile(r"""href=(["'])(https?://[^"']+)\1""")


def is_peekaboo_host(hostname: str) -> bool:
    return hostname == DOMAIN or hostname.endswith("." + DOMAIN)


def tag_url(url: str, campaign: str) -> str:
    parts = urlsplit(url)
    if parts.scheme not in ("http", "https") or not is_peekaboo_host(parts.hostname or ""):
        return url

    query = parse_qsl(parts.query, keep_blank_values=True)
    if any(key == "utm_source" for key, _ in query):
        return url

    query.append(("utm_source", UTM_SOURCE))
    query.append(("utm_medium", UTM_MEDIUM))
    query.append(("utm_campaign", campaign))
    path = parts.path or "/"
    return urlunsplit((parts.scheme, parts.netloc, path, urlencode(query), parts.fragment))


def tag_html(html: str, campaign: str) -> str:
    def replace(match: re.Match) -> str:
        quote, url = match.group(1), match.group(2)
        return f"href={quote}{tag_url(url, campaign)}{quote}"

    return HREF_RE.sub(replace, html)


def campaign_for(path: Path) -> str:
    return path.stem


def untagged_links(html: str) -> list:
    """Every aipeekaboo.com href that tag_html would still change."""
    return [m.group(2) for m in HREF_RE.finditer(html) if tag_url(m.group(2), "x") != m.group(2)]


def main(argv: list) -> int:
    repo = Path(__file__).resolve().parents[1]
    check_only = "--check" in argv
    changed, untagged = [], []
    for path in sorted(repo.glob("*.html")):
        html = path.read_text(encoding="utf-8")
        if check_only:
            untagged.extend(f"{path.name}: {u}" for u in untagged_links(html))
            continue
        tagged = tag_html(html, campaign_for(path))
        if tagged != html:
            path.write_text(tagged, encoding="utf-8")
            changed.append(path.name)
    if check_only:
        for line in untagged:
            print(line)
        print(f"{len(untagged)} untagged aipeekaboo.com link(s)")
        return 1 if untagged else 0
    print(f"tagged links in {len(changed)} file(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
