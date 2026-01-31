#!/usr/bin/env python3
"""
X/Twitter Bookmark Scraper using Playwright

Scrapes bookmarks from X, filters to last 24 hours, extracts keywords,
and generates category boosts for newsletter personalization.
"""

import asyncio
import json
import logging
import os
import re
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, List, Optional

from playwright.async_api import async_playwright, Page, TimeoutError as PlaywrightTimeout

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Category hints for keyword mapping
CATEGORY_HINTS = {
    "ai_tech": ["claude", "anthropic", "openai", "gpt", "llm", "ai", "cursor", "copilot", "gemini"],
    "tech_apple": ["swift", "swiftui", "ios", "apple", "xcode", "iphone", "mac", "wwdc"],
    "dev_tools": ["github", "vscode", "terminal", "cli", "api", "docker", "git"],
    "news": ["breaking", "just in", "update"],
}

# Configuration
BOOKMARKS_URL = "https://x.com/i/bookmarks"
SCROLL_PAUSE_TIME = 2  # seconds between scrolls
MAX_SCROLLS = 20  # maximum number of scroll attempts
WINDOW_HOURS = 24  # filter tweets from last N hours


class BookmarkScraper:
    """Scrapes and processes X/Twitter bookmarks."""

    def __init__(self, username: Optional[str] = None, password: Optional[str] = None):
        """
        Initialize scraper with credentials.

        Args:
            username: X username (defaults to X_USERNAME env var)
            password: X password (defaults to X_PASSWORD env var)
        """
        self.username = username or os.getenv("X_USERNAME")
        self.password = password or os.getenv("X_PASSWORD")

        if not self.username or not self.password:
            raise ValueError(
                "X credentials required. Set X_USERNAME and X_PASSWORD environment variables "
                "or pass them to the constructor."
            )

    async def login(self, page: Page) -> bool:
        """
        Handle X login flow.

        Args:
            page: Playwright page object

        Returns:
            True if login successful, False otherwise
        """
        try:
            logger.info("Navigating to X login page...")
            await page.goto("https://x.com/i/flow/login", wait_until="networkidle")
            await page.wait_for_timeout(2000)

            # Enter username
            logger.info("Entering username...")
            username_input = await page.wait_for_selector(
                'input[autocomplete="username"]',
                timeout=10000
            )
            await username_input.fill(self.username)
            await page.keyboard.press("Enter")
            await page.wait_for_timeout(2000)

            # Check for unusual activity prompt (phone/username verification)
            try:
                unusual_activity = await page.wait_for_selector(
                    'input[data-testid="ocfEnterTextTextInput"]',
                    timeout=3000
                )
                if unusual_activity:
                    logger.warning(
                        "X is requesting additional verification (phone/username). "
                        "You may need to complete this manually or use session cookies."
                    )
                    # Try entering username again as verification
                    await unusual_activity.fill(self.username)
                    await page.keyboard.press("Enter")
                    await page.wait_for_timeout(2000)
            except PlaywrightTimeout:
                # No unusual activity prompt, continue
                pass

            # Enter password
            logger.info("Entering password...")
            password_input = await page.wait_for_selector(
                'input[type="password"]',
                timeout=10000
            )
            await password_input.fill(self.password)
            await page.keyboard.press("Enter")

            # Wait for navigation to complete
            await page.wait_for_timeout(3000)

            # Verify login success by checking for home timeline or bookmarks access
            try:
                await page.wait_for_selector(
                    '[data-testid="primaryColumn"]',
                    timeout=10000
                )
                logger.info("Login successful!")
                return True
            except PlaywrightTimeout:
                logger.error("Login verification failed - could not find main content area")
                return False

        except Exception as e:
            logger.error(f"Login failed: {e}")
            return False

    async def scroll_and_load_bookmarks(self, page: Page) -> None:
        """
        Scroll the bookmarks page to load more tweets.

        Args:
            page: Playwright page object
        """
        logger.info("Scrolling to load bookmarks...")

        previous_height = 0
        scroll_count = 0

        while scroll_count < MAX_SCROLLS:
            # Scroll to bottom
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(SCROLL_PAUSE_TIME * 1000)

            # Check if we've reached the end
            current_height = await page.evaluate("document.body.scrollHeight")

            if current_height == previous_height:
                logger.info("Reached end of bookmarks or no more content to load")
                break

            previous_height = current_height
            scroll_count += 1

            if scroll_count % 5 == 0:
                logger.info(f"Scrolled {scroll_count} times...")

    def parse_relative_time(self, time_text: str) -> Optional[datetime]:
        """
        Parse relative time strings from X (e.g., "2h", "3m", "1d") to datetime.

        Args:
            time_text: Relative time string

        Returns:
            datetime object or None if parsing fails
        """
        now = datetime.now(timezone.utc)
        time_text = time_text.lower().strip()

        try:
            # Match patterns like "2h", "30m", "1d", "3s"
            match = re.match(r'(\d+)([smhd])', time_text)
            if match:
                value = int(match.group(1))
                unit = match.group(2)

                if unit == 's':
                    return now - timedelta(seconds=value)
                elif unit == 'm':
                    return now - timedelta(minutes=value)
                elif unit == 'h':
                    return now - timedelta(hours=value)
                elif unit == 'd':
                    return now - timedelta(days=value)

            # Check for "just now" or similar
            if 'now' in time_text or 'just' in time_text:
                return now

        except Exception as e:
            logger.warning(f"Failed to parse time '{time_text}': {e}")

        return None

    async def extract_bookmarks(self, page: Page, window_hours: int = WINDOW_HOURS) -> List[Dict]:
        """
        Extract bookmark data from the page.

        Args:
            page: Playwright page object
            window_hours: Only include bookmarks from last N hours

        Returns:
            List of bookmark dictionaries
        """
        logger.info("Extracting bookmark data...")

        bookmarks = []
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=window_hours)

        # Get all tweet articles
        tweets = await page.query_selector_all('article[data-testid="tweet"]')
        logger.info(f"Found {len(tweets)} tweet elements")

        for idx, tweet in enumerate(tweets):
            try:
                # Extract tweet text
                text_element = await tweet.query_selector('[data-testid="tweetText"]')
                text = await text_element.inner_text() if text_element else ""

                # Extract author username
                author_element = await tweet.query_selector('[data-testid="User-Name"] a[href^="/"]')
                author = ""
                if author_element:
                    author_href = await author_element.get_attribute("href")
                    author = author_href.split("/")[-1] if author_href else ""
                    if author and not author.startswith("@"):
                        author = f"@{author}"

                # Extract timestamp
                time_element = await tweet.query_selector('time')
                timestamp = None
                if time_element:
                    datetime_attr = await time_element.get_attribute("datetime")
                    if datetime_attr:
                        # Parse ISO format timestamp
                        timestamp = datetime.fromisoformat(datetime_attr.replace('Z', '+00:00'))
                    else:
                        # Fallback to relative time
                        time_text = await time_element.inner_text()
                        timestamp = self.parse_relative_time(time_text)

                # Extract tweet URL
                url = ""
                link_element = await tweet.query_selector('a[href*="/status/"]')
                if link_element:
                    link_href = await link_element.get_attribute("href")
                    if link_href:
                        url = f"https://x.com{link_href}" if link_href.startswith("/") else link_href

                # Filter by time window
                if timestamp and timestamp < cutoff_time:
                    logger.debug(f"Skipping old bookmark from {timestamp}")
                    continue

                # Only add if we have essential data
                if text and author:
                    bookmark = {
                        "text": text.strip(),
                        "author": author,
                        "url": url,
                        "timestamp": timestamp.isoformat() if timestamp else None
                    }
                    bookmarks.append(bookmark)
                    logger.debug(f"Extracted bookmark {idx + 1}: {author}")

            except Exception as e:
                logger.warning(f"Failed to extract bookmark {idx + 1}: {e}")
                continue

        logger.info(f"Successfully extracted {len(bookmarks)} bookmarks from last {window_hours} hours")
        return bookmarks

    def extract_keywords(self, bookmarks: List[Dict]) -> List[Dict[str, any]]:
        """
        Extract keywords from bookmarks: hashtags and frequent words.

        Args:
            bookmarks: List of bookmark dictionaries

        Returns:
            List of keyword dictionaries with word, count, and category
        """
        logger.info("Extracting keywords from bookmarks...")

        # Collect all text
        all_text = " ".join([b["text"] for b in bookmarks])
        all_text_lower = all_text.lower()

        # Extract hashtags
        hashtags = re.findall(r'#(\w+)', all_text)

        # Extract words (4+ chars, alphanumeric)
        words = re.findall(r'\b[a-z]{4,}\b', all_text_lower)

        # Combine and count
        all_tokens = hashtags + words
        word_counts = Counter(all_tokens)

        # Filter to 2+ occurrences and map to categories
        keywords = []
        for word, count in word_counts.items():
            if count >= 2:
                category = self.categorize_keyword(word)
                keywords.append({
                    "word": word,
                    "count": count,
                    "category": category
                })

        # Sort by count descending
        keywords.sort(key=lambda x: x["count"], reverse=True)

        logger.info(f"Extracted {len(keywords)} keywords")
        return keywords

    def categorize_keyword(self, word: str) -> Optional[str]:
        """
        Map a keyword to a category based on CATEGORY_HINTS.

        Args:
            word: Keyword to categorize

        Returns:
            Category name or None
        """
        word_lower = word.lower()

        for category, hints in CATEGORY_HINTS.items():
            if word_lower in hints or any(hint in word_lower for hint in hints):
                return category

        return None

    def calculate_category_boosts(self, keywords: List[Dict]) -> Dict[str, float]:
        """
        Calculate category boost scores based on keyword frequency.

        Args:
            keywords: List of keyword dictionaries

        Returns:
            Dictionary mapping category to boost score
        """
        logger.info("Calculating category boosts...")

        category_scores = Counter()

        for kw in keywords:
            if kw["category"]:
                category_scores[kw["category"]] += kw["count"]

        # Normalize to 1.0 - 2.0 range
        if not category_scores:
            return {}

        max_score = max(category_scores.values())
        boosts = {
            cat: round(1.0 + (score / max_score), 1)
            for cat, score in category_scores.items()
        }

        logger.info(f"Category boosts: {boosts}")
        return boosts

    async def scrape(self, output_path: Optional[Path] = None) -> Dict:
        """
        Main scraping workflow.

        Args:
            output_path: Path to write JSON output (defaults to bookmark_context.json)

        Returns:
            Dictionary with scraped data
        """
        if output_path is None:
            output_path = Path(__file__).parent / "bookmark_context.json"

        async with async_playwright() as p:
            logger.info("Launching browser...")
            browser = await p.chromium.launch(headless=False)  # Set to True for production

            try:
                context = await browser.new_context(
                    viewport={"width": 1280, "height": 1024},
                    user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
                )
                page = await context.new_page()

                # Login
                if not await self.login(page):
                    raise Exception("Login failed")

                # Navigate to bookmarks
                logger.info(f"Navigating to bookmarks: {BOOKMARKS_URL}")
                await page.goto(BOOKMARKS_URL, wait_until="networkidle")
                await page.wait_for_timeout(3000)

                # Scroll to load more bookmarks
                await self.scroll_and_load_bookmarks(page)

                # Extract bookmarks
                bookmarks = await self.extract_bookmarks(page, WINDOW_HOURS)

                if not bookmarks:
                    logger.warning("No bookmarks found in the specified time window")

                # Extract keywords and calculate boosts
                keywords = self.extract_keywords(bookmarks)
                category_boosts = self.calculate_category_boosts(keywords)

                # Build output
                output_data = {
                    "synced_at": datetime.now(timezone.utc).isoformat(),
                    "window_hours": WINDOW_HOURS,
                    "bookmark_count": len(bookmarks),
                    "keywords": keywords,
                    "category_boosts": category_boosts,
                    "recent_bookmarks": bookmarks
                }

                # Write to file
                logger.info(f"Writing results to {output_path}")
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(output_data, f, indent=2, ensure_ascii=False)

                logger.info(f"Scraping complete! Found {len(bookmarks)} bookmarks with {len(keywords)} keywords")
                return output_data

            except Exception as e:
                logger.error(f"Scraping failed: {e}", exc_info=True)
                raise
            finally:
                await browser.close()


async def main():
    """CLI entry point."""
    try:
        scraper = BookmarkScraper()
        result = await scraper.scrape()

        print("\n=== Scraping Results ===")
        print(f"Bookmarks found: {result['bookmark_count']}")
        print(f"Keywords extracted: {len(result['keywords'])}")
        print(f"Category boosts: {result['category_boosts']}")
        print(f"\nTop keywords:")
        for kw in result['keywords'][:10]:
            category = kw['category'] or 'uncategorized'
            print(f"  - {kw['word']} ({kw['count']}x) -> {category}")

    except Exception as e:
        logger.error(f"Error: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
