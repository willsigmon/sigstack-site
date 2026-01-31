---
description: Execute code in ephemeral Vercel Sandboxes for safe testing
argument-hint: <action> [options]
allowed-tools: [Bash, Read, Write]
---

# Sandbox Command

Execute code in isolated Vercel Sandbox microVMs.

## Actions

### Create Sandbox
`/sandbox create [--runtime node24|node22|python3.13] [--timeout 5m]`
- Spawns new sandbox with specified runtime
- Returns sandbox ID for subsequent commands

### Execute Command
`/sandbox exec <sandbox-id> <command>`
- Runs command in existing sandbox
- Streams stdout/stderr

### Run (Create + Execute + Cleanup)
`/sandbox run <command> [--runtime node24]`
- One-shot execution: creates sandbox, runs command, terminates
- Use for isolated test runs

### Snapshot
`/sandbox snapshot <sandbox-id>`
- Captures current state for later restoration
- Snapshots expire after 7 days

### List Sandboxes
`/sandbox list [--all]`
- Shows active sandboxes
- Use --all to include stopped

### Stop Sandbox
`/sandbox stop <sandbox-id>`
- Terminates sandbox and releases resources

## Examples

```bash
# Quick test in isolation
/sandbox run "npm test" --runtime node24

# Interactive development
/sandbox create --runtime python3.13 --timeout 1h
/sandbox exec sb-xxx "pip install -r requirements.txt"
/sandbox exec sb-xxx "python main.py"
/sandbox snapshot sb-xxx
/sandbox stop sb-xxx

# Parallel agent execution
/sandbox create --runtime node24 --timeout 30m  # Agent 1
/sandbox create --runtime node24 --timeout 30m  # Agent 2
```

## Implementation

Uses Vercel Sandbox CLI (`npx sandbox`). Requires VERCEL_TOKEN.

## When to Use
- Testing untrusted code safely
- Parallel agent execution in isolation
- Backend validation before deploy
- Reproducible test environments

## When NOT to Use
- iOS/Xcode builds (use local)
- Simple file operations
- MCP server interactions
