#!/usr/bin/env python3
"""
SigStack News Aggregator
Fetches RSS feeds and sends curated news@sigstack.dev newsletter
Premium table-based design with images and contextual insights
"""

import json
import re
import requests
import feedparser
from datetime import datetime, timedelta, timezone
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from email.utils import parsedate_to_datetime
import time

# Bookmark context integration
from bookmark_context import load_bookmark_context, score_item_with_bookmarks, get_bookmark_reminders

# Resend API config
RESEND_API_KEY = "re_Czsz1gQW_Dz4H2a9dH8tTjgteeDCjVujF"
RESEND_API_URL = "https://api.resend.com/emails"

# Load feeds config
FEEDS_PATH = Path(__file__).parent / "feeds.json"

# Section configuration with emojis and colors
SECTION_CONFIG = {
    "ai_tech": {"title": "AI & Tech", "emoji": "&#x1F916;", "color": "#a78bfa"},
    "tech_apple": {"title": "Apple", "emoji": "&#x1F4F1;", "color": "#60a5fa"},
    "news": {"title": "Breaking News", "emoji": "&#x1F4E2;", "color": "#ef4444"},
    "dev_tools": {"title": "Dev Tools", "emoji": "&#x1F6E0;", "color": "#4ade80"},
    "podcasts": {"title": "Podcasts", "emoji": "&#x1F3A7;", "color": "#f472b6"},
    "local_nc": {"title": "Local NC", "emoji": "&#x1F3D8;", "color": "#fbbf24"},
    "food": {"title": "Food & Dining", "emoji": "&#x1F37D;", "color": "#fb7185"},
    "disney": {"title": "Disney & Parks", "emoji": "&#x1F3F0;", "color": "#818cf8"},
    "bookmarks": {"title": "From Your Bookmarks", "emoji": "&#x1F516;", "color": "#38bdf8"},
}

# Newsletter type configurations
NEWSLETTER_TYPES = {
    "ai": {
        "categories": ["ai_tech", "dev_tools"],
        "subject_prefix": "AI News Digest",
        "intro": "The latest in AI, machine learning, and developer tools — only stories from the last 24 hours."
    },
    "personal": {
        "categories": ["tech_apple", "news", "podcasts", "food", "local_nc", "disney"],
        "subject_prefix": "The SigStack",
        "intro": "Here's what caught our attention today — the stories shaping tech, entertainment, and life."
    },
    "all": {
        "categories": None,  # All categories
        "subject_prefix": "The SigStack",
        "intro": "Here's what caught our attention today — the stories shaping tech, AI, and the tools we use to build."
    }
}

# Freshness threshold (hours)
FRESHNESS_HOURS = 24


def parse_date(date_str):
    """Parse various date formats from RSS feeds into datetime"""
    if not date_str:
        return None

    # Try RFC 2822 format (most common in RSS)
    try:
        return parsedate_to_datetime(date_str)
    except:
        pass

    # Try ISO 8601 formats
    iso_formats = [
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S.%f%z",
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
    ]

    for fmt in iso_formats:
        try:
            dt = datetime.strptime(date_str.strip(), fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except:
            continue

    # Try feedparser's parsed time tuple if available
    return None


def is_fresh(date_str, hours=FRESHNESS_HOURS):
    """Check if a story is within the freshness window"""
    if not date_str:
        return False  # No date = not fresh (skip it)

    parsed = parse_date(date_str)
    if not parsed:
        return False

    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=hours)

    return parsed >= cutoff


def get_age_label(date_str):
    """Get a human-readable age label for a story"""
    if not date_str:
        return ""

    parsed = parse_date(date_str)
    if not parsed:
        return ""

    now = datetime.now(timezone.utc)
    delta = now - parsed

    hours = delta.total_seconds() / 3600

    if hours < 1:
        minutes = int(delta.total_seconds() / 60)
        return f"{minutes}m ago"
    elif hours < 24:
        return f"{int(hours)}h ago"
    else:
        days = int(hours / 24)
        return f"{days}d ago"


def load_feeds():
    """Load feeds from config file"""
    with open(FEEDS_PATH, 'r') as f:
        return json.load(f)


def extract_image_from_entry(entry):
    """Try to extract an image URL from an RSS entry"""
    # Check media:content
    if hasattr(entry, 'media_content') and entry.media_content:
        for media in entry.media_content:
            if media.get('medium') == 'image' or media.get('type', '').startswith('image'):
                return media.get('url', '')

    # Check media:thumbnail
    if hasattr(entry, 'media_thumbnail') and entry.media_thumbnail:
        return entry.media_thumbnail[0].get('url', '')

    # Check enclosures
    if hasattr(entry, 'enclosures') and entry.enclosures:
        for enc in entry.enclosures:
            if enc.get('type', '').startswith('image'):
                return enc.get('href', enc.get('url', ''))

    # Check for image in content
    if hasattr(entry, 'content') and entry.content:
        content = entry.content[0].get('value', '')
        img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content)
        if img_match:
            return img_match.group(1)

    # Check summary for images
    if hasattr(entry, 'summary'):
        img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', entry.summary)
        if img_match:
            return img_match.group(1)

    return ""


def fetch_feed(feed_info):
    """Fetch and parse a single RSS feed, filtering for freshness"""
    try:
        response = requests.get(feed_info["url"], timeout=10, headers={
            "User-Agent": "SigStack News Aggregator/1.0"
        })
        parsed = feedparser.parse(response.content)

        items = []
        for entry in parsed.entries[:10]:  # Check more entries to find fresh ones
            # Get published date
            pub_date = entry.get("published", entry.get("updated", ""))

            # Skip stale content
            if not is_fresh(pub_date):
                continue

            # Clean summary
            summary = entry.get("summary", entry.get("description", ""))
            summary = re.sub('<[^<]+?>', '', summary)[:180]
            if len(summary) == 180:
                summary = summary.rsplit(' ', 1)[0] + "..."

            # Get age label
            age = get_age_label(pub_date)

            items.append({
                "title": entry.get("title", "No title"),
                "link": entry.get("link", "#"),
                "summary": summary,
                "published": pub_date,
                "published_parsed": parse_date(pub_date),
                "age": age,
                "source": feed_info["title"],
                "image": extract_image_from_entry(entry)
            })

        return items
    except Exception as e:
        print(f"Error fetching {feed_info['title']}: {e}")
        return []


def fetch_category(category_name, feeds, bookmark_context=None):
    """Fetch all feeds in a category in parallel, with optional bookmark scoring"""
    all_items = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(fetch_feed, feed): feed for feed in feeds}
        for future in as_completed(futures):
            items = future.result()
            all_items.extend(items)

    # Dedupe by title
    seen_titles = set()
    unique_items = []
    for item in all_items:
        if item["title"] not in seen_titles:
            seen_titles.add(item["title"])
            unique_items.append(item)

    # Apply bookmark scoring if context available
    if bookmark_context:
        for item in unique_items:
            item["bookmark_boost"] = score_item_with_bookmarks(item, bookmark_context)
        # Sort by boost (desc), then by date (desc)
        unique_items.sort(
            key=lambda x: (
                x.get("bookmark_boost", 1.0),
                x.get("published_parsed") or datetime.min.replace(tzinfo=timezone.utc)
            ),
            reverse=True
        )
    else:
        # Sort by published date (newest first)
        unique_items.sort(
            key=lambda x: x.get("published_parsed") or datetime.min.replace(tzinfo=timezone.utc),
            reverse=True
        )

    return unique_items[:10]


def build_story_html(item, accent_color):
    """Build HTML for a single story item with age label"""
    age_label = item.get("age", "")
    age_html = f' &middot; <span style="color: {accent_color};">{age_label}</span>' if age_label else ""

    return f'''
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px; border-bottom: 1px solid #1f1f1f; padding-bottom: 16px;">
      <tr>
        <td>
          <a href="{item["link"]}" style="text-decoration: none;">
            <p style="margin: 0 0 6px 0; font-size: 17px; color: #ffffff; font-weight: 400; line-height: 1.35; font-family: Georgia, serif;">{item["title"]}</p>
          </a>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #a3a3a3; line-height: 1.55; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">{item["summary"]}</p>
          <p style="margin: 0; font-size: 12px; color: #525252; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">{item["source"]}{age_html}</p>
        </td>
      </tr>
    </table>
    '''


def build_section_html(key, items):
    """Build HTML for a news section"""
    if not items:
        return ""

    config = SECTION_CONFIG.get(key, {"title": key, "emoji": "&#x1F4F0;", "color": "#737373"})

    stories_html = ""
    for item in items[:4]:
        stories_html += build_story_html(item, config["color"])

    return f'''
    <tr>
      <td style="padding-bottom: 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding-bottom: 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 20px; padding-right: 12px;">{config["emoji"]}</td>
                  <td>
                    <h3 style="margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: {config["color"]}; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
                      {config["title"]}
                    </h3>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              {stories_html}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    '''


def build_bookmarks_section_html(bookmarks):
    """Build HTML for the 'From Your Bookmarks' section"""
    if not bookmarks:
        return ""

    config = SECTION_CONFIG["bookmarks"]
    items_html = ""

    for bookmark in bookmarks[:3]:
        # Truncate text to ~120 chars
        text = bookmark.get("text", "")[:120]
        if len(bookmark.get("text", "")) > 120:
            text = text.rsplit(' ', 1)[0] + "..."

        author = bookmark.get("author", "")
        url = bookmark.get("url", "#")

        items_html += f'''
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px; border-bottom: 1px solid #1f1f1f; padding-bottom: 16px;">
          <tr>
            <td>
              <a href="{url}" style="text-decoration: none;">
                <p style="margin: 0 0 8px 0; font-size: 15px; color: #ffffff; line-height: 1.45; font-family: Georgia, serif;">{text}</p>
              </a>
              <p style="margin: 0; font-size: 12px; color: #525252; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
                {author} &middot; <span style="color: {config["color"]};">Bookmarked</span>
              </p>
            </td>
          </tr>
        </table>
        '''

    return f'''
    <tr>
      <td style="padding-bottom: 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#0f172a" style="background-color: #0f172a; border-radius: 8px; border: 1px solid #1e3a5f;">
          <tr>
            <td style="padding: 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="font-size: 20px; padding-right: 12px;">{config["emoji"]}</td>
                  <td>
                    <h3 style="margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: {config["color"]}; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
                      {config["title"]}
                    </h3>
                  </td>
                </tr>
              </table>
              {items_html}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    '''


def build_newsletter_html(sections_data, bookmark_reminders=None):
    """Build the full newsletter HTML with premium design"""
    date_str = datetime.now().strftime("%A, %B %d, %Y")
    bookmark_reminders = bookmark_reminders or []

    # Find top story (first item from tech feeds with image preferred)
    top_story = None
    for category in ["ai_tech", "tech_apple", "news"]:
        if category in sections_data and sections_data[category]:
            # Prefer stories with images
            for item in sections_data[category]:
                if item.get("image"):
                    top_story = item
                    break
            if not top_story:
                top_story = sections_data[category][0]
            break

    if not top_story:
        top_story = {"title": "No top story", "summary": "", "link": "#", "image": ""}

    # Build top story image HTML
    top_image_html = ""
    if top_story.get("image"):
        top_image_html = f'''
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td>
              <img src="{top_story["image"]}" alt="{top_story["title"]}" width="580" style="width: 100%; max-width: 580px; height: auto; display: block; border-radius: 8px; border: 1px solid #262626;" />
            </td>
          </tr>
        </table>
        '''

    # Build bookmarks section (shows first if available)
    bookmarks_section_html = build_bookmarks_section_html(bookmark_reminders)

    # Build sections HTML
    sections_html = ""
    section_order = ["ai_tech", "tech_apple", "dev_tools", "news", "podcasts", "food", "local_nc", "disney"]
    for key in section_order:
        if key in sections_data and sections_data[key]:
            # Skip the top story item if it's in this section
            filtered_items = [i for i in sections_data[key] if i["title"] != top_story.get("title")]
            if filtered_items:
                sections_html += build_section_html(key, filtered_items)

    html = f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>SigStack News</title>
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', Times, serif; background-color: #0a0a0a; color: #e5e5e5; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">

  <!-- Preheader -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    {top_story["title"][:100]} &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#0a0a0a" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 48px 20px;">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="580" style="max-width: 580px; width: 100%;">

          <!-- Masthead -->
          <tr>
            <td align="center" style="padding-bottom: 48px; border-bottom: 1px solid #262626;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #525252; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">The</p>
                    <h1 style="margin: 4px 0 0 0; font-size: 42px; font-weight: 400; color: #ffffff; letter-spacing: -1px;">
                      SigStack<span style="color: #ff6b35;">.</span>
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #737373; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; letter-spacing: 0.5px;">
                      {date_str}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding: 40px 0;">
              <p style="margin: 0; font-size: 18px; line-height: 1.7; color: #d4d4d4; font-style: italic;">
                Here's what caught our attention today — the stories shaping tech, AI, and the tools we use to build.
              </p>
            </td>
          </tr>

          <!-- Top Story -->
          <tr>
            <td style="padding-bottom: 48px;">
              {top_image_html}
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding-top: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td bgcolor="#ff6b35" style="background-color: #ff6b35; padding: 4px 12px; border-radius: 2px;">
                          <span style="color: #000000; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">Lead Story</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <a href="{top_story["link"]}" style="text-decoration: none;">
                      <h2 style="margin: 0; font-size: 28px; font-weight: 400; color: #ffffff; line-height: 1.25; letter-spacing: -0.5px;">
                        {top_story["title"]}
                      </h2>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <p style="margin: 0; font-size: 17px; line-height: 1.65; color: #a3a3a3;">
                      {top_story.get("summary", "")}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px;">
                    <p style="margin: 0; font-size: 12px; color: #525252; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
                      {top_story.get("source", "")}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 20px;">
                    <a href="{top_story["link"]}" style="color: #ff6b35; text-decoration: none; font-size: 14px; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; letter-spacing: 0.3px;">
                      Continue reading &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom: 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td bgcolor="#262626" height="1" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- From Your Bookmarks -->
          {bookmarks_section_html}

          <!-- Sections -->
          {sections_html}

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #262626; padding-top: 32px;" align="center">
              <p style="margin: 0 0 4px 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #525252; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
                Curated by
              </p>
              <p style="margin: 0 0 16px 0; font-size: 18px; color: #737373;">
                SigStack<span style="color: #ff6b35;">.</span>
              </p>
              <p style="margin: 0 0 20px 0; font-size: 12px; color: #525252; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
                Aggregated from your RSS feeds &middot; Delivered via Resend
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>'''

    return html


def send_newsletter(to, html, subject):
    """Send newsletter via Resend"""
    payload = {
        "from": "SigStack News <news@sigstack.dev>",
        "to": to if isinstance(to, list) else [to],
        "subject": subject,
        "html": html
    }

    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(RESEND_API_URL, json=payload, headers=headers)
    return response.json()


def run_aggregator(recipients=None, newsletter_type="all"):
    """Main aggregator function

    Args:
        recipients: List of email addresses
        newsletter_type: "ai", "personal", or "all"
    """
    if recipients is None:
        recipients = ["wjsigmon@gmail.com"]

    feeds = load_feeds()

    # Load bookmark context for personalization
    bookmark_context = load_bookmark_context()
    if bookmark_context:
        print(f"📚 Loaded bookmark context ({bookmark_context.get('bookmark_count', 0)} bookmarks)")
        if bookmark_context.get("category_boosts"):
            print(f"   Category boosts: {bookmark_context['category_boosts']}")
    else:
        print("📚 No bookmark context available (will use default sorting)")

    # Get newsletter config
    nl_config = NEWSLETTER_TYPES.get(newsletter_type, NEWSLETTER_TYPES["all"])
    categories = nl_config["categories"] or list(feeds.keys())

    print(f"Newsletter type: {newsletter_type}")
    print(f"Fetching {len(categories)} categories...")

    sections_data = {}
    total_fresh = 0
    for category in categories:
        if category in feeds:
            print(f"  Fetching {category}...")
            items = fetch_category(category, feeds[category], bookmark_context)
            sections_data[category] = items
            total_fresh += len(items)
            # Log boost info if available
            boosted = [i for i in items if i.get("bookmark_boost", 1.0) > 1.0]
            boost_note = f" ({len(boosted)} boosted)" if boosted else ""
            print(f"    Got {len(items)} fresh items (last {FRESHNESS_HOURS}h){boost_note}")

    if total_fresh == 0:
        print("\nNo fresh content found. Skipping send.")
        return {"skipped": True, "reason": "no_fresh_content"}

    # Get bookmark reminders for the newsletter
    bookmark_reminders = get_bookmark_reminders(bookmark_context, max_items=3)
    if bookmark_reminders:
        print(f"🔖 Including {len(bookmark_reminders)} bookmarks in newsletter")

    # Build and send newsletter
    html = build_newsletter_html(sections_data, bookmark_reminders)

    # Get top story title for subject
    top_title = "Daily Digest"
    for cat in ["ai_tech", "tech_apple", "news"]:
        if cat in sections_data and sections_data[cat]:
            top_title = sections_data[cat][0]["title"][:60]
            break

    subject = f"{nl_config['subject_prefix']}: {top_title}"

    print(f"\nSending to {recipients}...")
    result = send_newsletter(recipients, html, subject)
    print(f"Result: {result}")

    return result


if __name__ == "__main__":
    import sys

    # Parse arguments: python news_aggregator.py [type] [email]
    # type: ai, personal, all (default: all)
    # email: recipient email (default: wjsigmon@gmail.com)

    newsletter_type = "all"
    recipients = ["wjsigmon@gmail.com"]

    if len(sys.argv) > 1:
        if sys.argv[1] in ["ai", "personal", "all"]:
            newsletter_type = sys.argv[1]
            if len(sys.argv) > 2:
                recipients = [sys.argv[2]]
        else:
            # Assume it's an email
            recipients = [sys.argv[1]]

    run_aggregator(recipients, newsletter_type)
