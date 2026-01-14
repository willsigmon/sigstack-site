#!/usr/bin/env node
const readline = require('readline');
const https = require('https');
const http = require('http');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.error('Initializing fetch server...');
console.error('Server started and connected successfully');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', reject);
  });
}

rl.on('line', async (line) => {
  try {
    const message = JSON.parse(line);
    
    if (message.method === 'initialize') {
      console.log(JSON.stringify({
        jsonrpc: "2.0",
        id: message.id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "fixed-mcp-fetch", version: "1.0.0" }
        }
      }));
    } 
    else if (message.method === 'notifications/initialized') {
      // acknowledge
    }
    else if (message.method === 'tools/list') {
      console.log(JSON.stringify({
        jsonrpc: "2.0",
        id: message.id,
        result: { 
          tools: [
            {
              name: "fetch",
              description: "Fetch content from a URL",
              inputSchema: {
                type: "object",
                properties: {
                  url: { type: "string", description: "URL to fetch" }
                },
                required: ["url"]
              }
            }
          ]
        }
      }));
    }
    else if (message.method === 'tools/call') {
      const url = message.params.arguments.url;
      try {
        const content = await fetchUrl(url);
        console.log(JSON.stringify({
          jsonrpc: "2.0",
          id: message.id,
          result: {
            content: [{ type: "text", text: content.substring(0, 10000) }]
          }
        }));
      } catch (e) {
        console.log(JSON.stringify({
          jsonrpc: "2.0",
          id: message.id,
          result: {
            content: [{ type: "text", text: "Error: " + e.message }]
          }
        }));
      }
    }
    else {
      console.log(JSON.stringify({
        jsonrpc: "2.0",
        id: message.id,
        error: { code: -32601, message: "Method not implemented" }
      }));
    }
  } catch (e) {
    console.error('Error:', e);
  }
});

process.on('SIGTERM', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
});
