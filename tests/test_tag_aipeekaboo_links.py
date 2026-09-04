"""Every aipeekaboo.com link inside a deployed proposal carries UTM tags, so a
prospect clicking through from a deck shows up in GA4 as
proposal / deck / <deck-name> instead of an anonymous github.io referral."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))

from tag_aipeekaboo_links import tag_html, tag_url  # noqa: E402


def test_bare_homepage_link_gets_the_three_params():
    assert (
        tag_url("https://www.aipeekaboo.com", "flexzo-proposal-short")
        == "https://www.aipeekaboo.com/?utm_source=proposal&utm_medium=deck&utm_campaign=flexzo-proposal-short"
    )


def test_existing_query_and_fragment_are_preserved():
    assert (
        tag_url("https://aipeekaboo.com/pricing?ref=abc#plans", "ozari")
        == "https://aipeekaboo.com/pricing?ref=abc&utm_source=proposal&utm_medium=deck&utm_campaign=ozari#plans"
    )


def test_already_tagged_link_is_left_alone():
    url = "https://www.aipeekaboo.com/?utm_source=newsletter&utm_medium=email"
    assert tag_url(url, "flexzo") == url


def test_other_hosts_are_untouched():
    for url in [
        "https://calendly.com/filipe-aipeekaboo/30min",
        "mailto:filipe@aipeekaboo.com",
        "https://notaipeekaboo.com/",
        "https://www.flexzo.ai/",
        "#slide-3",
    ]:
        assert tag_url(url, "flexzo") == url


def test_tag_html_rewrites_hrefs_only_and_is_idempotent():
    html = (
        '<a href="https://www.aipeekaboo.com">Peekaboo</a>'
        '<img src="https://www.aipeekaboo.com/icon.jpg">'
        "<a href='https://www.aipeekaboo.com/pricing'>Pricing</a>"
        '<a href="https://calendly.com/filipe-aipeekaboo/30min">Book</a>'
    )
    once = tag_html(html, "bond-proposal")
    assert (
        'href="https://www.aipeekaboo.com/?utm_source=proposal&utm_medium=deck&utm_campaign=bond-proposal"'
        in once
    )
    assert (
        "href='https://www.aipeekaboo.com/pricing?utm_source=proposal&utm_medium=deck&utm_campaign=bond-proposal'"
        in once
    )
    assert '<img src="https://www.aipeekaboo.com/icon.jpg">' in once
    assert 'href="https://calendly.com/filipe-aipeekaboo/30min"' in once
    assert tag_html(once, "bond-proposal") == once


def test_campaign_slug_comes_from_the_file_stem():
    from tag_aipeekaboo_links import campaign_for

    assert campaign_for(Path("flexzo-proposal-short.html")) == "flexzo-proposal-short"
    assert campaign_for(Path("/tmp/proposals-repo/index-lite.html")) == "index-lite"
