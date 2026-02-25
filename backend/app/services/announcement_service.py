import logging
import time
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

VIMALA_URL = "https://www.vimalacollege.edu.in"
REQUEST_TIMEOUT = 15
CACHE_TTL = 3600  # 1 hour
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
}

_cache: dict = {"announcements": [], "fetched_at": 0}


def scrape_announcements(url: str = VIMALA_URL) -> list[dict]:
    """Scrape announcements from the homepage modal (div.dia-pp marquee list)."""
    resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "lxml")
    modal = soup.find("div", class_="dia-pp")
    if not modal:
        logger.warning("No announcements modal (div.dia-pp) found on %s", url)
        return []

    announcements = []
    for li in modal.select("ul.marquee li"):
        link = li.find("a")
        if not link:
            continue
        title = link.get_text(strip=True)
        href = link.get("href", "")
        if href and not href.startswith("http"):
            href = urljoin(url, href)
        if title:
            announcements.append({"title": title, "url": href})

    return announcements


def get_cached_announcements() -> list[dict]:
    """Return announcements, refreshing from the website at most once per CACHE_TTL."""
    now = time.time()
    if now - _cache["fetched_at"] < CACHE_TTL and _cache["announcements"]:
        return _cache["announcements"]

    try:
        announcements = scrape_announcements()
        _cache["announcements"] = announcements
        _cache["fetched_at"] = now
    except Exception:
        logger.exception("Failed to refresh announcements, using stale cache")

    return _cache["announcements"]


def format_announcements_as_context(announcements: list[dict]) -> str:
    """Format announcements into a text block for LLM context injection."""
    if not announcements:
        return ""

    lines = [
        "Latest College Announcements (always include the markdown links when sharing these):"
    ]
    for i, item in enumerate(announcements, 1):
        lines.append(f"{i}. [{item['title']}]({item['url']})")

    return "\n".join(lines)
