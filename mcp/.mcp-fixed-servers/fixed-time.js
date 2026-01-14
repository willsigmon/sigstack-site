#!/usr/bin/env node
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.error('Initializing time server...');
console.error('Server started and connected successfully');

rl.on('line', (line) => {
  try {
    const message = JSON.parse(line);
    
    if (message.method === 'initialize') {
      console.log(JSON.stringify({
        jsonrpc: "2.0",
        id: message.id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "fixed-mcp-time", version: "1.0.0" }
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
              name: "get_current_time",
              description: "Get current time and timezone",
              inputSchema: {
                type: "object",
                properties: {},
                required: []
              }
            }
          ]
        }
      }));
    }
    else if (message.method === 'tools/call') {
      const now = new Date();
      console.log(JSON.stringify({
        jsonrpc: "2.0",
        id: message.id,
        result: {
          content: [{ 
            type: "text", 
            text: `Current time: ${now.toISOString()}\nTimezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}\nUnix timestamp: ${now.getTime()}`
          }]
        }
      }));
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
