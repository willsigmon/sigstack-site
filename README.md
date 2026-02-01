# Sigstack 2.0 — The Vibe Coder's Operating System

> **127 skills across 12 plugins for Claude Code**
>
> *February 1, 2026*

Sigstack is for builders who think in outcomes, not syntax. You have 5000+ hours of Claude Code experience but no traditional coding background. You don't need to learn programming—you need Claude to understand your vision and execute it.

---

## The Default Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    THE SIGSTACK LOOP                        │
├─────────────────────────────────────────────────────────────┤
│   1. DESCRIBE  ──→  What do you want?                      │
│   2. BUILD     ──→  Claude writes the code                 │
│   3. SCREENSHOT ──→  Capture the result                    │
│   4. VISION QA  ──→  Claude reviews visually               │
│   5. FIX       ──→  Claude fixes issues found              │
│   └──────────────→  Repeat until perfect                   │
└─────────────────────────────────────────────────────────────┘
```

**This is THE workflow.** Every feature. Every bug fix. Every change. Screenshots are worth 10,000 tokens.

---

## Quick Start

```bash
# Clone sigstack
git clone https://github.com/willsigmon/sigstack.git ~/.sigstack

# Run setup
cd ~/.sigstack && ./setup.sh

# Start Claude Code
claude
```

---

## Stack Architecture

### Core Operations
| Plugin | Skills | Purpose |
|--------|--------|---------|
| **sigstack-core** | 16 | Meta-skills: efficiency, productivity, the default workflow |
| **superclaude** | 4 | Agent swarms, orchestration, meta-prompts |

### Build Domains
| Plugin | Skills | Purpose |
|--------|--------|---------|
| **ios-dev** | 17 | Swift, SwiftUI, Xcode, CloudKit, SwiftData |
| **app-dev** | 21 | Features, architecture, services, preferences |

### Create
| Plugin | Skills | Purpose |
|--------|--------|---------|
| **design-tools** | 27 | AI image, video, audio, UI generation |
| **media** | 6 | Podcasts, transcription, streaming, analytics |

### Quality
| Plugin | Skills | Purpose |
|--------|--------|---------|
| **testing** | 12 | AI Vision QA, Playwright, coverage, security |

### Intelligence
| Plugin | Skills | Purpose |
|--------|--------|---------|
| **memory-ai** | 6 | Vector DBs, knowledge graphs, context management |
| **voice-input** | 5 | Speech-to-code, Sled, transcription APIs |

### Automation
| Plugin | Skills | Purpose |
|--------|--------|---------|
| **automation** | 7 | CI/CD, webhooks, Home Assistant, workflows |

### Work
| Plugin | Skills | Purpose |
|--------|--------|---------|
| **work** | 2 | Enterprise apps, Knack, HTI integrations |
| **dev-essentials** | 4 | Multi-agent coordination, email, performance |

**Total: 127 skills across 12 plugins**

---

## Model Strategy

```
┌──────────────┬─────────────────────────────────────────────┐
│ Model        │ Use For                                     │
├──────────────┼─────────────────────────────────────────────┤
│ Haiku 3.5    │ File search, formatting, simple tasks       │
│ Sonnet 4     │ Code writing, reviews, most work            │
│ Opus 4.5     │ Architecture, complex reasoning, debugging  │
└──────────────┴─────────────────────────────────────────────┘

Default: Sonnet for quality-speed balance
```

---

## Interface Strategy

```
┌──────────────┬─────────────────────────────────────────────┐
│ Interface    │ Use For                                     │
├──────────────┼─────────────────────────────────────────────┤
│ Claude Code  │ All codebase work (primary)                 │
│ Claude Desktop│ PDFs, images, research                     │
│ API Batch    │ 100+ items, 50% cost savings               │
│ CLI          │ Quick queries, scripting                    │
│ MCP          │ External data (Supabase, GitHub, etc.)     │
└──────────────┴─────────────────────────────────────────────┘
```

---

## Agent Swarm Patterns

### Exploration (5-10 agents)
```
"Find bugs in the codebase"
→ One agent per major module
→ Parallel search
→ Collected findings
```

### Review (3-4 agents)
```
"Review this PR"
→ security-agent
→ performance-agent
→ style-agent
→ test-coverage-agent
```

### Build (4 agents)
```
"Implement new feature"
→ ui-agent
→ logic-agent
→ test-agent
→ docs-agent
```

---

## Superpowers Mode Protocol

**Decision Phase** → **Execution Phase**

### Decision Phase (Expert Partner)
- Clarify vague requirements before acting
- Surface footguns and tradeoffs
- Confirm direction: "So we're doing X to solve Y?"

### Execution Phase (Autonomous Swarm)
- Spawn 5-20 parallel agents, ship to 100%
- No check-ins. Fix forward. Only surface true blockers.

### Break to Ask
- Architectural decisions with major tradeoffs
- Security implications / destructive operations
- Requirements contradicting established patterns

---

## Token Economy

```
Save tokens:
- Screenshots over text descriptions (80% savings)
- MCP over copy-paste (90% savings)
- Skills over repeated prompts (95% savings)
- Haiku over Sonnet when possible (75% savings)
- Batch API over real-time (50% savings)

Spend tokens:
- Complex reasoning (use Opus)
- Exploration (use agents)
- Quality code (use Sonnet)
```

---

## MCP Priority

```
1. Supabase    → Database queries, no copy-paste
2. GitHub      → PRs, issues, repos directly
3. Memory      → Persistent knowledge graph
4. Playwright  → Browser automation, screenshots
5. Context7    → Library documentation
6. Sosumi      → Apple developer docs
```

---

## Voice Stack

```
Input:   Typeless (daily dictation)
Bridge:  Sled (mobile → Claude Code over Tailscale)
Output:  Code changes, commits, deploys
```

---

## Memory Architecture

```
┌─────────────────┐
│ Session Memory  │ ← Current conversation
├─────────────────┤
│ Memory MCP      │ ← Facts, preferences, decisions
├─────────────────┤
│ CLAUDE.md       │ ← Project rules (auto-loaded)
├─────────────────┤
│ Skills          │ ← Reusable prompts
├─────────────────┤
│ Checkpoints     │ ← Session handoffs
└─────────────────┘

Never repeat context. Store once, recall forever.
```

---

## Daily Rhythm

### Morning (2 min)
```
"Status" → Load context
"Today's focus: [area]" → Set priority
```

### During Work
```
Build → Screenshot → Vision QA → Fix → Repeat
```

### Evening (1 min)
```
"Checkpoint" → Save state for tomorrow
```

---

## Featured Skills by Domain

### sigstack-core (16 skills)
| Skill | Purpose |
|-------|---------|
| `vision-qa-workflow` | THE default workflow |
| `sigstack-quickstart` | Get started in 5 minutes |
| `token-optimizer` | Reduce tokens, same quality |
| `interface-picker` | Code vs Desktop vs API vs MCP |
| `agent-patterns` | When to spawn agents |
| `prompt-compression` | Shorter prompts, better results |
| `daily-driver` | Start each day fast |
| `session-handoff` | End well, start fast |

### ios-dev (17 skills)
| Skill | Purpose |
|-------|---------|
| `swift-expert` | Swift language patterns |
| `ios-build-expert` | Xcode build configuration |
| `cloudkit-expert` | CloudKit integration |
| `performance-expert` | iOS performance optimization |
| `tca-migration` | The Composable Architecture |
| `swiftui-codegen-expert` | AI SwiftUI generation |
| `testflight-expert` | Beta distribution |
| `app-store-connect-expert` | App Store API |

### design-tools (27 skills)
| Skill | Purpose |
|-------|---------|
| `glif-expert` | Glif workflows |
| `stitch-expert` | Stitch designs |
| `image-gen-expert` | AI images |
| `elevenlabs-expert` | Voice synthesis |
| `kling-video-expert` | Kling video |
| `runway-video-expert` | Runway video |
| `midjourney-expert` | Midjourney |
| `recraft-expert` | Recraft AI |

### superclaude (4 skills)
| Skill | Purpose |
|-------|---------|
| `spawn-swarm` | Parallel agent execution |
| `analyze-codebase` | Deep codebase analysis |
| `orchestrate-agents` | Multi-agent workflows |
| `meta-prompt` | Optimal prompt generation |

---

## Installation Checklist

- [ ] Clone sigstack to `~/.sigstack`
- [ ] Run `./setup.sh`
- [ ] Install Claude Code CLI
- [ ] Configure MCP servers
- [ ] Set up Typeless (optional)
- [ ] Configure Sled for voice (optional)

---

## The Sigstack Promise

You describe the outcome.
Claude handles the implementation.
Screenshots verify the result.
Agents parallelize the work.
Memory preserves the knowledge.
Voice captures your ideas.

**Build faster. Ship more. Learn always.**

---

## Resources

- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [Ghostty Terminal](https://ghostty.org)
- [Typeless Voice Input](https://typeless.ai)

---

**Built with vibes by [@willsigmon](https://github.com/willsigmon)**

*February 1, 2026 — Sigstack 2.0*
