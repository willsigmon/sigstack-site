# Tower Central Hub

Tower (Unraid server) is the central data store for all Claude/AI context.

## Architecture

```
Tower (/mnt/user/data/claude/)
├── memory/          # MCP memory graph
├── configs/         # IDE/Claude configs  
├── mcp-servers/     # Self-hosted MCP servers
├── context/         # Project summaries
└── ide-prototype/   # Future IDE development

     ↕ rsync every 5 min

Local (~/.claude/tower-sync/)
     ↕ symlinks
     
MCP Memory Server → reads/writes memory.json
```

## Access
- SSH: `ssh root@tower.local`
- Path: `/mnt/user/data/claude/`
- Tailscale: `100.119.19.61`

## Sync Commands
```bash
~/.claude/sync-tower.sh pull   # Get latest from Tower
~/.claude/sync-tower.sh push   # Push to Tower
~/.claude/sync-tower.sh both   # Bi-directional (default)
```

## LaunchAgent
Auto-syncs every 5 minutes via `com.wsig.tower-sync`
