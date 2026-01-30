#!/usr/bin/env python3
"""
SigStack News Aggregator
Fetches RSS feeds and sends curated news@sigstack.dev newsletter
"""

import json
import requests
import feedparser
from datetime import datetime, timedelta
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Resend API config
RESEND_API_KEY = "re_Czsz1gQW_Dz4H2a9dH8tTjgteeDCjVujF"
RESEND_API_URL = "https://api.resend.com/emails"

# Load feeds config
FEEDS_PATH = Path(__file__).parent / "feeds.json"

def load_feeds():
    """Load feeds from config file"""
    with open(FEEDS_PATH, 'r') as f:
        return json.load(f)

def fetch_feed(feed_info):
    """Fetch and parse a single RSS feed"""
    try:
        response = requests.get(feed_info["url"], timeout=10, headers={
            "User-Agent": "SigStack News Aggregator/1.0"
        })
        parsed = feedparser.parse(response.content)

        items = []
        for entry in parsed.entries[:5]:  # Get latest 5 items per feed
            items.append({
                "title": entry.get("title", "No title"),
                "link": entry.get("link", "#"),
                "summary": entry.get("summary", entry.get("description", ""))[:200],
                "published": entry.get("published", entry.get("updated", "")),
                "source": feed_info["title"]
            })
        return items
    except Exception as e:
        print(f"Error fetching {feed_info['title']}: {e}")
        return []

def fetch_category(category_name, feeds):
    """Fetch all feeds in a category in parallel"""
    all_items = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(fetch_feed, feed): feed for feed in feeds}
        for future in as_completed(futures):
            items = future.result()
            all_items.extend(items)

    # Sort by published date (newest first) and dedupe by title
    seen_titles = set()
    unique_items = []
    for item in all_items:
        if item["title"] not in seen_titles:
            seen_titles.add(item["title"])
            unique_items.append(item)

    return unique_items[:10]  # Top 10 per category

def build_section_html(title, items, color):
    """Build HTML for a news section"""
    if not items:
        return ""

    html = f'''
    <div style="margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: {color};">
            {title}
        </h3>
    '''

    for item in items[:5]:
        summary = item["summary"][:150] + "..." if len(item["summary"]) > 150 else item["summary"]
        # Strip HTML tags from summary
        import re
        summary = re.sub('<[^<]+?>', '', summary)

        html += f'''
        <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px; margin-bottom: 12px; border-left: 3px solid {color};">
            <h4 style="margin: 0 0 8px 0; font-size: 15px; color: #f4f4f5;">
                <a href="{item["link"]}" style="color: #f4f4f5; text-decoration: none;">{item["title"]}</a>
            </h4>
            <p style="margin: 0 0 8px 0; color: #a1a1aa; font-size: 13px; line-height: 1.5;">{summary}</p>
            <span style="color: #71717a; font-size: 12px;">{item["source"]}</span>
        </div>
        '''

    html += '</div>'
    return html

def build_newsletter_html(sections_data):
    """Build the full newsletter HTML"""
    date_str = datetime.now().strftime("%B %d, %Y")

    # Find top story (first item from tech feeds)
    top_story = None
    for category in ["tech_apple", "news"]:
        if category in sections_data and sections_data[category]:
            top_story = sections_data[category][0]
            break

    if not top_story:
        top_story = {"title": "No top story", "summary": "", "link": "#"}

    html = f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SigStack News</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #e4e4e7;">
    <div style="max-width: 680px; margin: 0 auto; padding: 40px 20px;">

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 32px; margin: 0; background: linear-gradient(135deg, #f97316 0%, #ef4444 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                SigStack News
            </h1>
            <p style="color: #a1a1aa; margin: 8px 0 0 0; font-size: 14px;">
                {date_str} | AI & Tech Digest
            </p>
        </div>

        <!-- Top Story -->
        <div style="background: rgba(249, 115, 22, 0.1); border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 1px solid rgba(249, 115, 22, 0.3);">
            <span style="background: #f97316; color: #0f172a; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">
                Top Story
            </span>
            <h2 style="margin: 12px 0 8px 0; font-size: 20px; color: #f4f4f5;">
                <a href="{top_story["link"]}" style="color: #f4f4f5; text-decoration: none;">{top_story["title"]}</a>
            </h2>
            <p style="margin: 0; color: #d4d4d8; font-size: 14px;">
                {top_story.get("summary", "")[:200]}
            </p>
        </div>
'''

    # Add sections
    section_config = [
        ("tech_apple", "Tech & Apple", "#818cf8"),
        ("news", "Breaking News", "#ef4444"),
        ("dev_tools", "Dev Tools", "#34d399"),
        ("podcasts", "Podcasts", "#a78bfa"),
        ("local_nc", "Local NC", "#fbbf24"),
        ("food", "Food & Dining", "#fb7185"),
    ]

    for key, title, color in section_config:
        if key in sections_data and sections_data[key]:
            html += build_section_html(title, sections_data[key], color)

    html += '''
        <!-- Footer -->
        <div style="text-align: center; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="color: #71717a; font-size: 12px; margin: 0 0 8px 0;">
                Curated by SigStack | Aggregated from your RSS feeds
            </p>
            <p style="color: #52525b; font-size: 11px; margin: 0;">
                Powered by Resend
            </p>
        </div>

    </div>
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

def run_aggregator(recipients=None, categories=None):
    """Main aggregator function"""
    if recipients is None:
        recipients = ["wjsigmon@gmail.com"]

    feeds = load_feeds()

    # Default to all categories if none specified
    if categories is None:
        categories = list(feeds.keys())

    print(f"Fetching {len(categories)} categories...")

    sections_data = {}
    for category in categories:
        if category in feeds:
            print(f"  Fetching {category}...")
            sections_data[category] = fetch_category(category, feeds[category])
            print(f"    Got {len(sections_data[category])} items")

    # Build and send newsletter
    html = build_newsletter_html(sections_data)

    # Get top story title for subject
    top_title = "Daily Digest"
    for cat in ["tech_apple", "news"]:
        if cat in sections_data and sections_data[cat]:
            top_title = sections_data[cat][0]["title"][:50]
            break

    subject = f"SigStack News: {top_title}"

    print(f"\nSending to {recipients}...")
    result = send_newsletter(recipients, html, subject)
    print(f"Result: {result}")

    return result


if __name__ == "__main__":
    import sys

    recipients = sys.argv[1:] if len(sys.argv) > 1 else ["wjsigmon@gmail.com"]
    run_aggregator(recipients)
