#!/usr/bin/env python3
"""
SigStack Newsletter Sender
Sends tips@ and news@ newsletters via Resend API
"""

import os
import json
import requests
from datetime import datetime
from pathlib import Path

# Resend API config
RESEND_API_KEY = "re_Czsz1gQW_Dz4H2a9dH8tTjgteeDCjVujF"
RESEND_API_URL = "https://api.resend.com/emails"

# Newsletter configs
NEWSLETTERS = {
    "tips": {
        "from": "SigStack Tips <tips@sigstack.dev>",
        "subject_prefix": "SigStack Tip",
        "template": "tips-template.html"
    },
    "news": {
        "from": "SigStack News <news@sigstack.dev>",
        "subject_prefix": "AI News Digest",
        "template": "news-template.html"
    }
}

def load_template(template_name: str) -> str:
    """Load HTML template from file"""
    template_path = Path(__file__).parent / template_name
    with open(template_path, 'r') as f:
        return f.read()

def render_template(template: str, variables: dict) -> str:
    """Replace template variables with values"""
    html = template
    for key, value in variables.items():
        placeholder = "{{" + key + "}}"
        html = html.replace(placeholder, str(value))
    return html

def send_email(to: list, newsletter_type: str, subject: str, variables: dict) -> dict:
    """Send newsletter via Resend API"""
    config = NEWSLETTERS[newsletter_type]
    template = load_template(config["template"])
    html = render_template(template, variables)

    payload = {
        "from": config["from"],
        "to": to,
        "subject": f"{config['subject_prefix']}: {subject}",
        "html": html
    }

    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(RESEND_API_URL, json=payload, headers=headers)
    return response.json()

def send_tips_newsletter(to: list, tip_data: dict) -> dict:
    """Send a tips newsletter"""
    variables = {
        "DATE": datetime.now().strftime("%B %d, %Y"),
        "ISSUE_NUMBER": tip_data.get("issue_number", "001"),
        "TIP_EMOJI": tip_data.get("emoji", ""),
        "TIP_TITLE": tip_data.get("title", ""),
        "TIP_DESCRIPTION": tip_data.get("description", ""),
        "CODE_EXAMPLE": tip_data.get("code", ""),
        "QUICK_TIPS": "\n".join([f"<li>{tip}</li>" for tip in tip_data.get("quick_tips", [])]),
        "TOOL_NAME": tip_data.get("tool_name", ""),
        "TOOL_DESCRIPTION": tip_data.get("tool_description", ""),
        "TOOL_LINK": tip_data.get("tool_link", "#"),
        "UNSUBSCRIBE_LINK": tip_data.get("unsubscribe_link", "#")
    }

    return send_email(to, "tips", tip_data.get("title", "Weekly Tip"), variables)

def send_news_newsletter(to: list, news_data: dict) -> dict:
    """Send a news newsletter"""

    # Build AI updates HTML
    ai_updates_html = ""
    for item in news_data.get("ai_updates", []):
        ai_updates_html += f'''
        <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px; margin-bottom: 12px; border-left: 3px solid #818cf8;">
            <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #f4f4f5;">{item["title"]}</h4>
            <p style="margin: 0; color: #a1a1aa; font-size: 14px; line-height: 1.5;">{item["summary"]}</p>
            <a href="{item["link"]}" style="color: #818cf8; font-size: 13px; text-decoration: none;">Read more</a>
        </div>
        '''

    # Build dev tools HTML
    dev_tools_html = ""
    for item in news_data.get("dev_tools", []):
        dev_tools_html += f'''
        <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px; margin-bottom: 12px; border-left: 3px solid #34d399;">
            <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #f4f4f5;">{item["title"]}</h4>
            <p style="margin: 0; color: #a1a1aa; font-size: 14px; line-height: 1.5;">{item["summary"]}</p>
            <a href="{item["link"]}" style="color: #34d399; font-size: 13px; text-decoration: none;">Check it out</a>
        </div>
        '''

    # Build quick links HTML
    quick_links_html = ""
    for item in news_data.get("quick_links", []):
        quick_links_html += f'''
        <li style="margin-bottom: 12px;">
            <a href="{item["link"]}" style="color: #f4f4f5; text-decoration: none; font-weight: 500;">{item["title"]}</a>
            <span style="color: #71717a; font-size: 13px;"> - {item["source"]}</span>
        </li>
        '''

    variables = {
        "DATE": datetime.now().strftime("%B %d, %Y"),
        "TOP_STORY_TITLE": news_data.get("top_story", {}).get("title", ""),
        "TOP_STORY_SUMMARY": news_data.get("top_story", {}).get("summary", ""),
        "TOP_STORY_LINK": news_data.get("top_story", {}).get("link", "#"),
        "AI_UPDATES": ai_updates_html,
        "DEV_TOOLS": dev_tools_html,
        "QUICK_LINKS": quick_links_html,
        "UNSUBSCRIBE_LINK": news_data.get("unsubscribe_link", "#")
    }

    return send_email(to, "news", news_data.get("top_story", {}).get("title", "Weekly Digest"), variables)


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python send_newsletter.py [tips|news] [email]")
        sys.exit(1)

    newsletter_type = sys.argv[1]
    recipient = sys.argv[2] if len(sys.argv) > 2 else "wjsigmon@gmail.com"

    if newsletter_type == "tips":
        # Example tips content
        result = send_tips_newsletter(
            to=[recipient],
            tip_data={
                "issue_number": "001",
                "emoji": "🚀",
                "title": "Parallel Agent Swarms in Claude Code",
                "description": "Stop waiting for sequential tasks. Spawn 5-20 agents in parallel to search, analyze, and transform your codebase simultaneously.",
                "code": "# Spawn parallel agents in one message\nTask(subagent_type='Explore', prompt='Find auth')\nTask(subagent_type='Explore', prompt='Find API')",
                "quick_tips": [
                    "Use Haiku for quick searches, Sonnet for complex tasks",
                    "PreToolUse hooks can block wasteful operations",
                    "Skills take priority over manual code"
                ],
                "tool_name": "Resend",
                "tool_description": "Modern email API for developers. Simple REST API, React Email support, and great deliverability.",
                "tool_link": "https://resend.com"
            }
        )
        print(f"Tips newsletter sent: {result}")

    elif newsletter_type == "news":
        # Example news content
        result = send_news_newsletter(
            to=[recipient],
            news_data={
                "top_story": {
                    "title": "Claude Opus 4.5 Released",
                    "summary": "Anthropic releases their most capable model yet, with improved reasoning and agentic capabilities.",
                    "link": "https://anthropic.com"
                },
                "ai_updates": [
                    {"title": "GPT-5 Rumors", "summary": "OpenAI reportedly training next-gen model", "link": "#"},
                    {"title": "Google Gemini 2.0", "summary": "New multimodal capabilities announced", "link": "#"}
                ],
                "dev_tools": [
                    {"title": "Cursor AI Updates", "summary": "New agent mode for autonomous coding", "link": "#"}
                ],
                "quick_links": [
                    {"title": "The State of AI 2025", "source": "Pragmatic Engineer", "link": "#"},
                    {"title": "Building AI Agents", "source": "Lenny's Newsletter", "link": "#"}
                ]
            }
        )
        print(f"News newsletter sent: {result}")

    else:
        print(f"Unknown newsletter type: {newsletter_type}")
