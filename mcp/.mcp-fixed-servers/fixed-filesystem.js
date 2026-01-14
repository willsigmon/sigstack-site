#!/usr/bin/env node
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ROOT_DIR = process.env.MCP_FS_ROOT || '/Users/wsig';

console.error('Initializing filesystem server...');
console.error('Server started and connected successfully');

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
          serverInfo: { name: "fixed-mcp-filesystem", version: "1.0.0" }
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
              name: "read_file",
              description: "Read file contents",
              inputSchema: {
                type: "object",
                properties: {
                  path: { type: "string", description: "File path" }
                },
                required: ["path"]
              }
            },
            {
              name: "list_directory",
              description: "List directory contents",
              inputSchema: {
                type: "object",
                properties: {
                  path: { type: "string", description: "Directory path" }
                },
                required: ["path"]
              }
            }
          ]
        }
      }));
    }
    else if (message.method === 'tools/call') {
      const tool = message.params.name;
      const filePath = path.resolve(message.params.arguments.path || '');
      
      try {
        if (tool === 'read_file') {
          const content = fs.readFileSync(filePath, 'utf8');
          console.log(JSON.stringify({
            jsonrpc: "2.0",
            id: message.id,
            result: {
              content: [{ type: "text", text: content }]
            }
          }));
        } else if (tool === 'list_directory') {
          const files = fs.readdirSync(filePath);
          console.log(JSON.stringify({
            jsonrpc: "2.0",
            id: message.id,
            result: {
              content: [{ type: "text", text: files.join('\n') }]
            }
          }));
        }
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
