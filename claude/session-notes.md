
## 2025-12-14: OMI MCP Server Setup

### What I Did
- Added `omi-brain` MCP server to Claude Desktop config
- Location: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Uses `uvx mcp-server-omi` with `OMI_API_KEY` env var

### b-r-a-i-n Server Details
- **Concept**: "Base Repository for Artificial Intelligence and Nuance"
- **Location**: Custom OMI app running on unraid-docker
- **Tailscale IPs**:
  - tower.local → 100.119.19.61
  - unraid-docker → 100.111.139.106
- **Open ports**: 3000, 3001, 8000, 8080, 8081
- **API candidate**: Port 8000 (returns JSON 404s)
- **Endpoint TBD**: Need to find exact path for self-hosted OMI backend

### OMI MCP Tools Available
- `get_memories` - Retrieve memories with limit/category filtering
- `create_memory` - Create new memories
- `edit_memory` - Modify existing memory by ID
- `delete_memory` - Remove memories by ID  
- `get_conversations` - Get conversation transcripts

### Next Steps for User
1. Restart Claude Desktop to load new MCP server
2. Find exact b-r-a-i-n API endpoint on unraid-docker
3. Add `OMI_API_BASE_URL` to config if using self-hosted backend
4. Regenerate API key (was exposed in chat)

