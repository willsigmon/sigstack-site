# n8n Dotfiles Automation

Resume by pasting below the line into Claude Code:

---

## Context

Built n8n automation system integrated with dotfiles hub across Studio/MBA/Tower.

**Done:**
- Dotfiles hub: `~/.dotfiles-hub/` synced via git (private repo)
- 84 Claude skills synced across all machines
- 7 n8n workflows deployed to https://n8n.wsig.me

**Workflows:**
1. Dotfiles Auto-Sync (hourly) ✅ ACTIVE
2. GitHub → Discord (webhook) - needs Discord creds
3. Supabase → Push (webhook) - needs OneSignal creds
4. SSH Orchestrator (webhook) - needs SSH creds
5. AI Content Pipeline (webhook) - needs Anthropic creds
6. Daily Backup (3AM) - needs SSH creds
7. Build Monitor (webhook) - needs Supabase creds

**Webhook URLs:**
```
https://n8n.wsig.me/webhook/github-webhook
https://n8n.wsig.me/webhook/supabase-webhook
https://n8n.wsig.me/webhook/ssh-command
https://n8n.wsig.me/webhook/ai-generate
https://n8n.wsig.me/webhook/build-status
```

**Credentials:**
- n8n API Key: Memory MCP
- Tower: root@tower.local / Re@dalot22
- n8n: https://n8n.wsig.me

**Next:** Configure n8n credentials in UI, then activate remaining workflows.
