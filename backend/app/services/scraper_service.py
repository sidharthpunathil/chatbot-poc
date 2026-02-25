import logging
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT = 15
MAX_CONTENT_LENGTH = 5000  # cap extracted text to avoid token blowout
ALLOWED_DOMAIN = "vimalacollege.edu.in"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
}


def scrape_url(url: str) -> dict:
    """Fetch a URL and extract its text content.

    Only allows URLs under the college domain to prevent SSRF.
    Returns {"title": ..., "url": ..., "content": ...}.
    """
    parsed = urlparse(url)
    if not parsed.hostname or not parsed.hostname.endswith(ALLOWED_DOMAIN):
        raise ValueError(
            f"Only URLs under {ALLOWED_DOMAIN} are allowed, got {parsed.hostname}"
        )

    resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "lxml")

    # Remove noise
    for tag in soup.find_all(["script", "style", "nav", "footer", "noscript", "iframe", "header"]):
        tag.decompose()

    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else "Untitled"

    # Try to find main content area
    main = (
        soup.find(id="contentPanell")
        or soup.find("main")
        or soup.find("article")
        or soup.body
    )

    text = main.get_text(separator="\n", strip=True) if main else ""
    text = text[:MAX_CONTENT_LENGTH]

    return {"title": title, "url": url, "content": text}
