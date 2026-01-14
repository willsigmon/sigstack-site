# Gemini CLI Configuration

Configuration files for Google's Gemini CLI (secondary AI tool).

## Installation

```bash
# Install Gemini CLI
pip install gemini-cli

# Or via npm
npm install -g @google/gemini-cli
```

## Configuration

The `settings.json` file configures:

| Setting | Value | Purpose |
|---------|-------|---------|
| `model` | `gemini-3-pro-preview` | Use latest Gemini model |
| `autoAccept` | `true` | Auto-accept tool calls |
| `theme` | `Atom One` | UI theme |
| `sessionRetention` | `true` | Keep session history |
| `hideFooter` | `true` | Cleaner UI |

## Setup

```bash
# Copy to Gemini config directory
cp settings.json ~/.gemini/settings.json
```

## Usage

```bash
# Start Gemini CLI
gemini

# Or specify project
gemini --project ~/my-project
```

## User Preferences

Gemini has been configured with these preferences (via GEMINI.md):

1. **Role**: Senior Engineer pairing with Vibecoder
2. **Style**: Intuitive building, clear explanations
3. **iOS/Swift**: Target iOS 18+, Swift 6.0, SwiftUI-first
4. **Agents**: Spawn parallel agents for complex tasks
5. **Safety**: Warn on broken previews, actor isolation issues

## Notes

- Gemini is a secondary tool; Claude Code is primary
- Use for variety or when Claude is unavailable
- Same vibe coding principles apply
