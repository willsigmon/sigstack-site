# n8n Integration

## Instance
- **URL**: https://n8n.wsig.me
- **Type**: Self-hosted

## API Authentication
```bash
curl -H "X-N8N-API-KEY: $N8N_API_KEY" https://n8n.wsig.me/api/v1/workflows
```

## Active Workflows (7)
1. **Dotfiles Hub Auto-Sync** - ACTIVE
2. Build & Deploy Monitor
3. GitHub → Discord Notifications
4. AI Content Generation Pipeline
5. Cross-Machine SSH Orchestrator
6. Daily Backup Automation
7. Supabase → Push Notifications

## Claude Code Integration
MCP server configured in `~/.claude.json`:
```json
"n8n": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "n8n-mcp"],
  "env": {
    "N8N_API_KEY": "...",
    "N8N_URL": "https://n8n.wsig.me"
  }
}
```

## Environment Variables
Stored in `/Users/wsig/manusaisetup/.env`:
- `N8N_API_KEY`
- `N8N_URL`
