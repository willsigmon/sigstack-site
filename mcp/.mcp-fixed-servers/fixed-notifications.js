#!/usr/bin/env node
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.error('Initializing notifications server...');
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
          serverInfo: { name: "fixed-mcp-notifications", version: "1.0.0" }
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
              name: "send",
              description: "Send macOS notification",
              inputSchema: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Notification title" },
                  message: { type: "string", description: "Notification message" },
                  subtitle: { type: "string", description: "Optional subtitle" }
                },
                required: ["title", "message"]
              }
            }
          ]
        }
      }));
    }
    else if (message.method === 'tools/call') {
      const tool = message.params.name;
      const args = message.params.arguments;
      
      try {
        if (tool === 'send') {
          const subtitle = args.subtitle ? `, subtitle:"${args.subtitle}"` : '';
          const script = `display notification "${args.message}" with title "${args.title}"${subtitle}`;
          execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
          console.log(JSON.stringify({
            jsonrpc: "2.0",
            id: message.id,
            result: { content: [{ type: "text", text: "Notification sent" }] }
          }));
        }
      } catch (e) {
        console.log(JSON.stringify({
          jsonrpc: "2.0",
          id: message.id,
          result: { content: [{ type: "text", text: "Error: " + e.message }] }
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

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
