#!/bin/bash
# BRAIN Vibe Coder Stack - One-Line Installer
# Run: curl -fsSL https://raw.githubusercontent.com/willsigmon/brain/main/install.sh | bash

set -e

echo "🧠 BRAIN Vibe Coder Stack Installer"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() { echo -e "${BLUE}▶${NC} $1"; }
print_done() { echo -e "${GREEN}✓${NC} $1"; }
print_warn() { echo -e "${YELLOW}⚠${NC} $1"; }

# Check for Homebrew (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v brew &> /dev/null; then
        print_step "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        print_done "Homebrew installed"
    else
        print_done "Homebrew already installed"
    fi
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    print_step "Installing Node.js..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install node
    else
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    print_done "Node.js installed"
else
    print_done "Node.js already installed ($(node --version))"
fi

# Install Ghostty (macOS only for now)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v ghostty &> /dev/null; then
        print_step "Installing Ghostty terminal..."
        brew install ghostty
        print_done "Ghostty installed"
    else
        print_done "Ghostty already installed"
    fi
fi

# Install Claude Code CLI
if ! command -v claude &> /dev/null; then
    print_step "Installing Claude Code CLI..."
    npm install -g @anthropic-ai/claude-code
    print_done "Claude Code installed"
else
    print_done "Claude Code already installed ($(claude --version 2>/dev/null || echo 'installed'))"
fi

# Clone BRAIN repo
BRAIN_DIR="$HOME/.brain"
if [ -d "$BRAIN_DIR" ]; then
    print_step "Updating BRAIN repo..."
    cd "$BRAIN_DIR" && git pull
    print_done "BRAIN updated"
else
    print_step "Cloning BRAIN repo..."
    git clone https://github.com/willsigmon/brain.git "$BRAIN_DIR"
    print_done "BRAIN cloned to ~/.brain"
fi

# Run setup script
print_step "Running BRAIN setup..."
cd "$BRAIN_DIR" && chmod +x setup.sh && ./setup.sh

echo ""
echo "===================================="
echo -e "${GREEN}🎉 BRAIN Vibe Coder Stack Installed!${NC}"
echo "===================================="
echo ""
echo "What's installed:"
echo "  • Claude Code CLI (primary AI tool)"
echo "  • Ghostty terminal (fast, GPU-accelerated)"
echo "  • 89 AI skills"
echo "  • 24 slash commands"
echo "  • Token-saving hooks"
echo "  • MCP server configs"
echo ""
echo "Quick start:"
echo "  ${BLUE}claude${NC}              # Start Claude Code"
echo "  ${BLUE}claude --thinking${NC}   # With extended thinking"
echo "  ${BLUE}/spawn${NC}              # Spawn agent swarm"
echo ""
echo "Optional next steps:"
echo "  1. Install Wispr Flow for voice-to-text: https://wispr.flow"
echo "  2. Install Omi for AI memory: https://omi.me"
echo "  3. Set up Tailscale for multi-device sync: https://tailscale.com"
echo ""
echo "Docs: https://github.com/willsigmon/brain"
echo ""
echo "🤖 Now go vibe code something awesome!"
