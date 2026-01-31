"""
Bookmark context for newsletter scoring and reminders.
Integrates X bookmarks with RSS feed prioritization.
"""

from pathlib import Path
from datetime import datetime, timezone, timedelta
import json
import re

CONTEXT_PATH = Path(__file__).parent / "bookmark_context.json"
MAX_AGE_HOURS = 24

def load_bookmark_context():
    """Load bookmark context if fresh (< 24h old)."""
    if not CONTEXT_PATH.exists():
        return None

    try:
        with open(CONTEXT_PATH) as f:
            context = json.load(f)

        synced_at = datetime.fromisoformat(context["synced_at"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) - synced_at > timedelta(hours=MAX_AGE_HOURS):
            return None  # Stale context

        return context
    except Exception as e:
        print(f"[bookmark_context] Error loading: {e}")
        return None


def score_item_with_bookmarks(item, context):
    """
    Score an RSS item based on bookmark context.
    Returns a multiplier (1.0 = no boost, up to 2.0 = max boost).
    """
    if not context:
        return 1.0

    boost = 1.0
    title_lower = item.get("title", "").lower()
    summary_lower = item.get("summary", "").lower()
    text = f"{title_lower} {summary_lower}"

    # Check keywords
    for kw in context.get("keywords", []):
        word = kw["word"].lower()
        if word in text:
            # Higher count = higher boost
            boost += min(0.2 * kw.get("count", 1), 0.5)

    # Cap at 2.0x
    return min(boost, 2.0)


def get_bookmark_reminders(context, max_items=3):
    """
    Get recent bookmarks for the "From Your Bookmarks" section.
    Returns list of bookmark dicts with text, author, url.
    """
    if not context:
        return []

    bookmarks = context.get("recent_bookmarks", [])
    return bookmarks[:max_items]
