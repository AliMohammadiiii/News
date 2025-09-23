#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import time
import logging
import re
from datetime import datetime, timedelta, timezone
from html import unescape
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

import feedparser
from feedparser import CharacterEncodingOverride
import requests
from dateutil import parser as dtparse

# -----------------------
# CONFIG
# -----------------------
API_URL = "http://localhost:8000/api/news"
API_KEY = "super-secret-key"  # change if needed
REQUEST_TIMEOUT = 20
MAX_ITEMS_PER_FEED = 200

# Assume Iran local for naive datetimes, convert to UTC
TZ_TEHRAN = ZoneInfo("Asia/Tehran")

CACHE_FILE = Path("./posted_links.json")

# All your feeds
CATEGORIES: List[Dict[str, Any]] = [
    {
        "Category": "سیاسی و بین الملل",
        "category_id": 1,
        "links": [
            {"link": "https://www.entekhab.ir/fa/rss/3", "agent": "خبرگزاری انتخاب", "agent_id": 1},
            {"link": "https://www.entekhab.ir/fa/rss/2", "agent": "خبرگزاری انتخاب", "agent_id": 1},
            {"link": "https://www.tasnimnews.com/fa/rss/feed/0/7/1/%D8%B3%DB%8C%D8%A7%D8%B3%DB%8C", "agent": "خبرگزاری تسنیم", "agent_id": 2},
            {"link": "https://www.mehrnews.com/rss/tp/7", "agent": "خبرگزاری مهر", "agent_id": 3},
            {"link": "https://www.yjc.ir/fa/rss/3", "agent": "خبرگزاری خبرنگاران جوان", "agent_id": 4},
            {"link": "https://www.iribnews.ir/fa/rss/5", "agent": "خبرگزاری صدا و سیما", "agent_id": 5},
            {"link": "https://www.irna.ir/rss/tp/1003421", "agent": "خبرگزاری ایرنا", "agent_id": 6},
            {"link": "https://www.snn.ir/fa/rss/6", "agent": "خبرگزاری دانشجو", "agent_id": 7},
            {"link": "https://www.asriran.com/fa/rss/1/1", "agent": "عصر ایران", "agent_id": 8},
        ],
    },
    {
        "Category": "اقتصادی",
        "category_id": 2,
        "links": [
            {"link": "https://www.entekhab.ir/fa/rss/5", "agent": "خبرگزاری انتخاب", "agent_id": 1},
            {"link": "https://www.tasnimnews.com/fa/rss/feed/0/7/7/%D8%A7%D9%82%D8%AA%D8%B5%D8%A7%D8%AF%DB%8C", "agent": "خبرگزاری تسنیم", "agent_id": 2},
            {"link": "https://www.mehrnews.com/rss/tp/25", "agent": "خبرگزاری مهر", "agent_id": 3},
            {"link": "https://www.yjc.ir/fa/rss/6", "agent": "خبرگزاری خبرنگاران جوان", "agent_id": 4},
            {"link": "https://www.iribnews.ir/fa/rss/6", "agent": "خبرگزاری صدا و سیما", "agent_id": 5},
            {"link": "https://www.irna.ir/fa/rss/tp/20", "agent": "خبرگزاری ایرنا", "agent_id": 6},
            {"link": "https://www.asriran.com/fa/rss/1/4", "agent": "عصر ایران", "agent_id": 8},
            {"link": "https://www.snn.ir/fa/rss/7", "agent": "خبرگزاری دانشجو", "agent_id": 7},
        ],
    },
    {
        "Category": "جامعه",
        "category_id": 3,
        "links": [
            {"link": "https://www.entekhab.ir/fa/rss/4", "agent": "خبرگزاری انتخاب", "agent_id": 1},
            {"link": "https://www.tasnimnews.com/fa/rss/feed/0/7/2/%D8%A7%D8%AC%D8%AA%D9%85%D8%A7%D8%B9%DB%8C", "agent": "خبرگزاری تسنیم", "agent_id": 2},
            {"link": "https://www.mehrnews.com/rss/tp/6", "agent": "خبرگزاری مهر", "agent_id": 3},
            {"link": "https://www.yjc.ir/fa/rss/5", "agent": "خبرگزاری خبرنگاران جوان", "agent_id": 4},
            {"link": "https://www.iribnews.ir/fa/rss/7", "agent": "خبرگزاری صدا و سیما", "agent_id": 5},
            {"link": "https://www.irna.ir/rss/tp/32", "agent": "خبرگزاری ایرنا", "agent_id": 6},
            {"link": "https://www.asriran.com/fa/rss/1/5", "agent": "عصر ایران", "agent_id": 8},
            {"link": "https://www.snn.ir/fa/rss/9", "agent": "خبرگزاری دانشجو", "agent_id": 7},
        ],
    },
    {
        "Category": "ورزشی",
        "category_id": 4,
        "links": [
            {"link": "https://www.varzesh3.com/rss/all", "agent": "ورزش ۳", "agent_id": 9},
            {"link": "https://www.entekhab.ir/fa/rss/9", "agent": "خبرگزاری انتخاب", "agent_id": 1},
            {"link": "https://www.tasnimnews.com/fa/rss/feed/0/7/3/%D9%88%D8%B1%D8%B2%D8%B4%DB%8C", "agent": "خبرگزاری تسنیم", "agent_id": 2},
            {"link": "https://www.mehrnews.com/rss/tp/9", "agent": "خبرگزاری مهر", "agent_id": 3},
            {"link": "https://www.yjc.ir/fa/rss/8", "agent": "خبرگزاری خبرنگاران جوان", "agent_id": 4},
            {"link": "https://www.irna.ir/rss/tp/14", "agent": "خبرگزاری ایرنا", "agent_id": 6},
            {"link": "https://www.asriran.com/fa/rss/1/6", "agent": "عصر ایران", "agent_id": 8},
            {"link": "https://www.snn.ir/fa/rss/10", "agent": "خبرگزاری دانشجو", "agent_id": 7},
        ],
    },
    {
        "Category": "فرهنگ و هنر",
        "category_id": 5,
        "links": [
            {"link": "https://www.entekhab.ir/fa/rss/18", "agent": "خبرگزاری انتخاب", "agent_id": 1},
            {"link": "https://www.tasnimnews.com/fa/rss/feed/0/7/4/%D9%81%D8%B1%D9%87%D9%86%DA%AF%DB%8C", "agent": "خبرگزاری تسنیم", "agent_id": 2},
            {"link": "https://www.mehrnews.com/rss/tp/2", "agent": "خبرگزاری مهر", "agent_id": 3},
            {"link": "https://www.yjc.ir/fa/rss/4", "agent": "خبرگزاری خبرنگاران جوان", "agent_id": 4},
            {"link": "https://www.iribnews.ir/fa/rss/8", "agent": "خبرگزاری صدا و سیما", "agent_id": 5},
            {"link": "https://www.irna.ir/rss/tp/41", "agent": "خبرگزاری ایرنا", "agent_id": 6},
            {"link": "https://www.asriran.com/fa/rss/1/8", "agent": "عصر ایران", "agent_id": 8},
            {"link": "https://www.snn.ir/fa/rss/4", "agent": "خبرگزاری دانشجو", "agent_id": 7},
        ],
    },
    {
        "Category": "فناوری",
        "category_id": 6,
        "links": [
            {"link": "https://www.entekhab.ir/fa/rss/8", "agent": "خبرگزاری انتخاب", "agent_id": 1},
            {"link": "https://www.mehrnews.com/rss/tp/5", "agent": "خبرگزاری مهر", "agent_id": 3},
            {"link": "https://www.yjc.ir/fa/rss/7", "agent": "خبرگزاری خبرنگاران جوان", "agent_id": 4},
            {"link": "https://www.iribnews.ir/fa/rss/21", "agent": "خبرگزاری صدا و سیما", "agent_id": 5},
            {"link": "https://www.irna.ir/rss/tp/808", "agent": "خبرگزاری ایرنا", "agent_id": 6},
            {"link": "https://www.asriran.com/fa/rss/1/14", "agent": "عصر ایران", "agent_id": 8},
        ],
    },
]

# -----------------------
# LOGGING
# -----------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("news-pull")

# -----------------------
# UTILS
# -----------------------
def load_cache() -> set:
    if CACHE_FILE.exists():
        try:
            return set(json.loads(CACHE_FILE.read_text(encoding="utf-8")))
        except Exception:
            return set()
    return set()


def save_cache(cache: set) -> None:
    try:
        CACHE_FILE.write_text(json.dumps(sorted(list(cache)), ensure_ascii=False), encoding="utf-8")
    except Exception as e:
        log.warning("Failed to save cache: %s", e)


TAG_RE = re.compile(r"<[^>]+>")


def strip_html(html: str) -> str:
    text = TAG_RE.sub("", html or "")
    return unescape(text).strip()


def parse_date_to_utc(dt_raw: Optional[str]) -> Optional[datetime]:
    if not dt_raw:
        return None
    try:
        dt = dtparse.parse(dt_raw)
        if not dt.tzinfo:
            dt = dt.replace(tzinfo=TZ_TEHRAN)
        return dt.astimezone(timezone.utc)
    except Exception:
        return None


def best_image(entry: Any) -> Optional[str]:
    for enc in entry.get("enclosures", []):
        t = (enc.get("type") or "").lower()
        if t.startswith("image/") or "image" in t:
            return enc.get("href") or enc.get("url")
    for key in ("media_thumbnail", "media_content"):
        if key in entry and entry[key]:
            url = entry[key][0].get("url")
            if url:
                return url
    for l in entry.get("links", []):
        t = (l.get("type") or "").lower()
        if l.get("rel") == "enclosure" and ("image" in t or t.startswith("image/")):
            return l.get("href")
    return entry.get("image")


def best_content(entry: Any) -> str:
    def _clean(s: str) -> str:
        txt = strip_html(s or "")
        return re.sub(r"\s+", " ", txt).strip()

    if "content" in entry and entry.content:
        val = entry.content[0].get("value")
        if val:
            return _clean(val)
    if "summary" in entry and entry.summary:
        return _clean(entry.summary)
    if "description" in entry and entry.description:
        return _clean(entry.description)
    return ""


def post_item(payload: Dict[str, Any]) -> Tuple[bool, str]:
    headers = {"Content-Type": "application/json", "X-API-Key": API_KEY}
    try:
        resp = requests.post(API_URL, headers=headers, json=payload, timeout=REQUEST_TIMEOUT)
        if 200 <= resp.status_code < 300:
            return True, str(resp.status_code)
        else:
            try:
                detail = resp.json()
            except Exception:
                detail = resp.text
            return False, f"HTTP {resp.status_code}: {detail}"
    except requests.RequestException as e:
        return False, str(e)


# -----------------------
# MAIN LOGIC
# -----------------------
def process_feed(feed_url: str, category_id: int, agency_id: int, now_utc: datetime,
                 posted_cache: set) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    parsed = feedparser.parse(feed_url)
    if parsed.bozo and parsed.bozo_exception:
        # Silence harmless charset warnings like: document declared as us-ascii, but parsed as utf-8
        if isinstance(parsed.bozo_exception, CharacterEncodingOverride):
            log.debug("Ignored charset override warning for %s", feed_url)
        else:
            log.warning("Feed parse warning for %s: %s", feed_url, parsed.bozo_exception)

    entries = parsed.entries[:MAX_ITEMS_PER_FEED]
    one_hour_ago = now_utc - timedelta(hours=1)

    for e in entries:
        link = (getattr(e, "link", None) or "").strip()
        if not link:
            continue
        try:
            _ = urlparse(link)
        except Exception:
            continue

        if link in posted_cache:
            continue

        dt_utc = None
        for key in ("published", "updated", "pubDate", "dc_date"):
            if key in e:
                dt_utc = parse_date_to_utc(getattr(e, key))
                if dt_utc:
                    break
        if not dt_utc:
            continue

        if not (one_hour_ago <= dt_utc <= now_utc):
            continue

        title = strip_html(getattr(e, "title", "") or "").strip()
        content = best_content(e)
        image_url = best_image(e)

        payload = {
            "title": title[:512],
            "content": content[:4000],
            "image_url": image_url,
            "category_id": category_id,
            "agency_id": agency_id,
            # store as UNIX timestamp (seconds, UTC)
            "pubDate": int(dt_utc.timestamp()),
            "link": link,
        }
        out.append(payload)
    return out


def main() -> None:
    now_utc = datetime.now(timezone.utc)
    posted_cache = load_cache()
    to_post: List[Dict[str, Any]] = []

    for cat in CATEGORIES:
        cid = int(cat["category_id"])
        for src in cat["links"]:
            url = src["link"]
            aid = int(src["agent_id"])
            try:
                items = process_feed(url, cid, aid, now_utc, posted_cache)
                if items:
                    log.info("Feed %s -> %d new item(s)", url, len(items))
                to_post.extend(items)
            except Exception as e:
                log.error("Failed processing %s: %s", url, e)

    dedup_by_link: Dict[str, Dict[str, Any]] = {}
    for item in to_post:
        dedup_by_link[item["link"]] = item

    posted = 0
    for link, payload in dedup_by_link.items():
        ok, msg = post_item(payload)
        if ok:
            posted += 1
            posted_cache.add(link)
            log.info("Posted ✅ %s", link)
            time.sleep(0.2)
        else:
            log.warning("Post failed ❌ %s -> %s", link, msg)

    save_cache(posted_cache)
    log.info("Done. Posted %d/%d new items.", posted, len(dedup_by_link))


if __name__ == "__main__":
    main()


