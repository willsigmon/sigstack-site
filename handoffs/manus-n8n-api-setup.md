# Manus.im + n8n API Integration Setup

Resume this session by pasting everything below into Claude Code:

---

## Context
I set up Manus.im and n8n integrations for Claude Code on my main machine.

### Manus.im Integration
- **Repo**: `~/manusaisetup` (github.com/willsigmon/manusaisetup)
- **API**: `https://api.manus.im` with `API_KEY` header auth
- **MCP**: manus-mcp configured in ~/.claude.json
- **Projects**: 25 tasks organized in external drive

### n8n Integration  
- **Instance**: https://n8n.wsig.me
- **API**: `X-N8N-API-KEY` header auth
- **MCP**: n8n-mcp configured in ~/.claude.json
- **Workflows**: Dotfiles Sync, Build Monitor, GitHub→Discord, AI Content, SSH Orchestrator, Daily Backup, Supabase→Push

### API Keys (in ~/manusaisetup/.env)
```
MANUS_API_KEY=sk-sjnToe03895FAR7VqSCsuMgtra8kNjncUg48eVO5H9gvXndQ5p7I0myTA0TJGHT_xfCvYGbGVM536oo
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MDc4ZmE1Ni1hZGRhLTQwMzktYTgwMy03NzA1MjVlZTExMzkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY0NzIxNzQ4fQ.TIb3qYRZfjW6zkISTRxMu8VVIeWwGaU_FzxbFQjl28U
N8N_URL=https://n8n.wsig.me
```

### Setup on this machine
```bash
[ ! -d ~/manusaisetup ] && git clone https://github.com/willsigmon/manusaisetup.git ~/manusaisetup
[ ! -f ~/manusaisetup/.env ] && cp ~/manusaisetup/.env.example ~/manusaisetup/.env
# Add API keys above to .env, then:
cd ~/manusaisetup && uv sync
~/.dotfiles-hub/sync.sh link
```

### MCP config reference
See `~/.dotfiles-hub/mcp/claude-mcp-servers.json`

### What's next
- Test manus-mcp and n8n-mcp tools
- Build Claude → n8n → Manus pipeline
- Explore htihub.manus.space
