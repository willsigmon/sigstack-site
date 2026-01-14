#!/bin/bash
# BRAIN Setup Script
# Symlinks all configurations to their proper locations

set -e

BRAIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Setting up BRAIN from: $BRAIN_DIR"

# Create directories
mkdir -p ~/.claude/{skills,commands,rules,logs,handoffs}
mkdir -p ~/.config/ghostty
mkdir -p ~/.gemini

# Symlink Claude config
echo "Linking Claude configuration..."
if [ -d "$BRAIN_DIR/claude/skills" ]; then
    for skill in "$BRAIN_DIR/claude/skills"/*.md; do
        [ -f "$skill" ] && ln -sf "$skill" ~/.claude/skills/
    done
    echo "  - Linked $(ls -1 "$BRAIN_DIR/claude/skills"/*.md 2>/dev/null | wc -l | tr -d ' ') skills"
fi

if [ -d "$BRAIN_DIR/claude/commands" ]; then
    for cmd in "$BRAIN_DIR/claude/commands"/*.md; do
        [ -f "$cmd" ] && ln -sf "$cmd" ~/.claude/commands/
    done
    echo "  - Linked $(ls -1 "$BRAIN_DIR/claude/commands"/*.md 2>/dev/null | wc -l | tr -d ' ') commands"
fi

if [ -f "$BRAIN_DIR/claude/settings.json" ]; then
    ln -sf "$BRAIN_DIR/claude/settings.json" ~/.claude/settings.json
    echo "  - Linked settings.json"
fi

# Symlink Ghostty config
if [ -f "$BRAIN_DIR/ghostty/config" ]; then
    echo "Linking Ghostty configuration..."
    ln -sf "$BRAIN_DIR/ghostty/config" ~/.config/ghostty/config
    echo "  - Linked ghostty/config"
fi

# Symlink Gemini config
if [ -f "$BRAIN_DIR/gemini/settings.json" ]; then
    echo "Linking Gemini configuration..."
    ln -sf "$BRAIN_DIR/gemini/settings.json" ~/.gemini/settings.json
    echo "  - Linked gemini/settings.json"
fi

echo ""
echo "BRAIN setup complete!"
echo ""
echo "Next steps:"
echo "  1. Install Claude Code: npm install -g @anthropic-ai/claude-code"
echo "  2. Install Ghostty: brew install ghostty"
echo "  3. Configure MCP servers in ~/.claude.json"
echo "  4. (Optional) Set up Tailscale for multi-device sync"
echo ""
echo "Run 'claude' to start your AI-assisted development session."
