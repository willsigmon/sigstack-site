# Vibe Conversation Hub

Single OpenAI‑compatible endpoint that logs every turn and fans out to providers.

**Canonical holder**: run this on tower; config lives in BRAIN (`~/brain/hub`).

## Run

```sh
cd ~/brain/hub
chmod +x run.sh

# Required (set whichever providers you use):
export OPENAI_API_KEY="..."
export ANTHROPIC_API_KEY="..."
export GOOGLE_API_KEY="..."
export PERPLEXITY_API_KEY="..."

./run.sh
```

Default URL: `http://localhost:3030/v1/chat/completions`

Logs: `~/brain/hub/logs/history.jsonl` (ignored by git).
History API: `GET /v1/hub/history?limit=200` (add `trace_id=` to filter).

## Provider routing

Hub chooses provider by model prefix:
- `claude-*` → Anthropic OpenAI‑compatible endpoint. citeturn3search0turn3search1
- `sonar-*` / `pplx-*` → Perplexity OpenAI‑compatible endpoint. citeturn3search2
- `gemini-*` → Gemini generateContent. citeturn3search3
- `local-*` / `ollama-*` → local OpenAI‑compatible base (default Ollama).
- anything else → OpenAI chat completions. citeturn2search0turn2search1

Override bases with:
- `OPENAI_API_BASE`
- `ANTHROPIC_API_BASE`
- `PERPLEXITY_API_BASE`
- `GEMINI_API_BASE`
- `LOCAL_API_BASE` (default `http://localhost:11434/v1/chat/completions`)

## Clients

Point tools at the hub as an OpenAI‑compatible base URL:
- Codex CLI / Cursor / Open WebUI / LM Studio web: set base URL to `http://<tower-ip>:3030/v1`.
- Model name chooses provider (see routing above).

Streaming:
- For OpenAI/Anthropic/Perplexity, `stream: true` is pass‑through.
- Gemini streaming not wired yet; use non‑stream for gemini models.
