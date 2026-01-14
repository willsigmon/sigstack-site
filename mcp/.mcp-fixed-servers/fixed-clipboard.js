#!/usr/bin/env node
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.error('Initializing clipboard server...');
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
          serverInfo: { name: "fixed-mcp-clipboard", version: "1.0.0" }
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
              name: "read",
              description: "Read clipboard contents",
              inputSchema: { type: "object", properties: {}, required: [] }
            },
            {
              name: "write",
              description: "Write to clipboard",
              inputSchema: {
                type: "object",
                properties: {
                  text: { type: "string", description: "Text to write" }
                },
                required: ["text"]
              }
            }
          ]
        }
      }));
    }
    else if (message.method === 'tools/call') {
      const tool = message.params.name;
      
      try {
        if (tool === 'read') {
          const text = execSync('pbpaste', { encoding: 'utf8' });
          console.log(JSON.stringify({
            jsonrpc: "2.0",
            id: message.id,
            result: { content: [{ type: "text", text }] }
          }));
        } else if (tool === 'write') {
          execSync(`echo '${message.params.arguments.text.replace(/'/g, "'\\''")}'| pbcopy`);
          console.log(JSON.stringify({
            jsonrpc: "2.0",
            id: message.id,
            result: { content: [{ type: "text", text: "Copied to clipboard" }] }
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
