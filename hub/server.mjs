#!/usr/bin/env node
import http from "node:http";
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import os from "node:os";

const PORT = Number(process.env.HUB_PORT || 3030);
const HOME = os.homedir();
const DEFAULT_DATA_DIR = path.join(HOME, "brain", "hub", "logs");
const DATA_DIR = process.env.HUB_DATA_DIR
  ? path.resolve(process.env.HUB_DATA_DIR)
  : DEFAULT_DATA_DIR;
mkdirSync(DATA_DIR, { recursive: true });
const LOG_PATH = path.join(DATA_DIR, "history.jsonl");

function logEvent(event) {
  try {
    appendFileSync(LOG_PATH, JSON.stringify(event) + "\n", "utf8");
  } catch {
    // best-effort only
  }
}

function readHistory(limit = 100, traceId = null) {
  try {
    const txt = readFileSync(LOG_PATH, "utf8").trim();
    if (!txt) return [];
    let lines = txt.split("\n");
    if (traceId) {
      lines = lines.filter((l) => l.includes(`"id":"${traceId}"`));
    }
    const slice = lines.slice(-limit);
    return slice.map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    }).filter(Boolean);
  } catch {
    return [];
  }
}

function sendJson(res, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    ...headers,
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function chooseProvider(model = "") {
  const m = model.toLowerCase();
  if (m.startsWith("local-") || m.startsWith("ollama-") || m.includes("ollama"))
    return "local";
  if (m.startsWith("claude-") || m.includes("anthropic")) return "anthropic";
  if (m.startsWith("sonar") || m.startsWith("pplx") || m.includes("perplexity"))
    return "perplexity";
  if (m.startsWith("gemini-") || m.includes("google")) return "gemini";
  return "openai";
}

async function forwardStream(res, upstreamResp) {
  res.writeHead(upstreamResp.status, {
    "Content-Type": upstreamResp.headers.get("content-type") || "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  const reader = upstreamResp.body?.getReader();
  if (!reader) {
    res.end();
    return;
  }
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}

async function callOpenAI(body) {
  const apiKey = process.env.OPENAI_API_KEY;
  const base =
    process.env.OPENAI_API_BASE || "https://api.openai.com/v1/chat/completions";
  if (!apiKey) {
    return { status: 500, data: { error: "OPENAI_API_KEY not set" } };
  }
  const resp = await fetch(base, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  return resp;
}

async function callAnthropic(body) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const base =
    process.env.ANTHROPIC_API_BASE ||
    "https://api.anthropic.com/v1/chat/completions";
  if (!apiKey) {
    return { status: 500, data: { error: "ANTHROPIC_API_KEY not set" } };
  }
  const resp = await fetch(base, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "x-api-key": apiKey,
      "anthropic-version": process.env.ANTHROPIC_VERSION || "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  return resp;
}

async function callPerplexity(body) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  const base =
    process.env.PERPLEXITY_API_BASE ||
    "https://api.perplexity.ai/chat/completions";
  if (!apiKey) {
    return { status: 500, data: { error: "PERPLEXITY_API_KEY not set" } };
  }
  const resp = await fetch(base, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  return resp;
}

async function callLocal(body) {
  const base =
    process.env.LOCAL_API_BASE ||
    "http://localhost:11434/v1/chat/completions";
  const apiKey = process.env.LOCAL_API_KEY;
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  const resp = await fetch(base, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return resp;
}

function openaiMessagesToGemini(messages = []) {
  return messages.map((m) => {
    const role =
      m.role === "assistant" ? "model" : m.role === "system" ? "user" : m.role;
    const text =
      typeof m.content === "string"
        ? m.content
        : Array.isArray(m.content)
          ? m.content.map((p) => p.text || "").join("")
          : "";
    return { role, parts: [{ text }] };
  });
}

async function callGemini(body) {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { status: 500, data: { error: "GOOGLE_API_KEY/GEMINI_API_KEY not set" } };
  }
  const model = body.model || "gemini-1.5-pro";
  const url =
    (process.env.GEMINI_API_BASE ||
      "https://generativelanguage.googleapis.com/v1beta/models/") +
    `${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const payload = {
    contents: openaiMessagesToGemini(body.messages || []),
  };
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await resp.json().catch(() => ({}));
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  const out = {
    id: data?.responseId || `gemini-${randomUUID()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: text },
        finish_reason: "stop",
      },
    ],
    usage: data?.usageMetadata || null,
  };
  return { status: resp.status, data: out };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "GET" && url.pathname === "/v1/models") {
    return sendJson(res, 200, {
      object: "list",
      data: [
        { id: "gpt-5.2", object: "model", owned_by: "openai" },
        { id: "claude-3.5-sonnet", object: "model", owned_by: "anthropic" },
        { id: "sonar-pro", object: "model", owned_by: "perplexity" },
        { id: "gemini-1.5-pro", object: "model", owned_by: "google" },
        { id: "local-llama3", object: "model", owned_by: "local" },
      ],
    });
  }

  if (req.method === "GET" && url.pathname === "/v1/hub/history") {
    const limit = Math.min(
      Number(url.searchParams.get("limit") || 100),
      500
    );
    const traceId = url.searchParams.get("trace_id");
    const data = readHistory(limit, traceId);
    return sendJson(res, 200, { object: "list", data });
  }

  if (req.method === "POST" && url.pathname === "/v1/chat/completions") {
    let body;
    try {
      body = await readBody(req);
    } catch {
      return sendJson(res, 400, { error: "Invalid JSON body" });
    }

    const model = body.model || "";
    const provider = chooseProvider(model);
    const traceId = randomUUID();

    logEvent({
      id: traceId,
      ts: new Date().toISOString(),
      type: "request",
      provider,
      model,
      messages: body.messages || [],
      stream: !!body.stream,
      meta: {
        temperature: body.temperature,
        top_p: body.top_p,
        max_tokens: body.max_tokens,
      },
    });

    try {
      if (provider === "gemini") {
        const gem = await callGemini(body);
        logEvent({
          id: traceId,
          ts: new Date().toISOString(),
          type: "response",
          provider,
          status: gem.status,
          data: gem.data,
        });
        return sendJson(res, gem.status, gem.data, { "X-Trace-Id": traceId });
      }

      let upstreamResp;
      if (provider === "anthropic") upstreamResp = await callAnthropic(body);
      else if (provider === "perplexity")
        upstreamResp = await callPerplexity(body);
      else if (provider === "local") upstreamResp = await callLocal(body);
      else upstreamResp = await callOpenAI(body);

      if (body.stream) {
        res.setHeader("X-Trace-Id", traceId);
        return await forwardStream(res, upstreamResp);
      }

      const data = await upstreamResp.json().catch(() => ({}));
      logEvent({
        id: traceId,
        ts: new Date().toISOString(),
        type: "response",
        provider,
        status: upstreamResp.status,
        data,
      });
      return sendJson(res, upstreamResp.status, data, {
        "X-Trace-Id": traceId,
      });
    } catch (e) {
      logEvent({
        id: traceId,
        ts: new Date().toISOString(),
        type: "error",
        provider,
        error: String(e?.message || e),
      });
      return sendJson(res, 500, { error: "Upstream failure", traceId });
    }
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`vibe hub listening on http://localhost:${PORT}`);
  console.log(`logging to ${LOG_PATH}`);
});
