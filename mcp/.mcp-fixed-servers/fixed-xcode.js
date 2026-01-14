#!/usr/bin/env node
const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.error('Initializing xcode server...');
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
          serverInfo: { name: "fixed-mcp-xcode", version: "1.0.0" }
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
              name: "build",
              description: "Build Xcode project/scheme",
              inputSchema: {
                type: "object",
                properties: {
                  workspace: { type: "string", description: "Workspace path" },
                  scheme: { type: "string", description: "Build scheme" },
                  config: { type: "string", description: "Build configuration (Debug/Release)" }
                },
                required: ["workspace", "scheme"]
              }
            },
            {
              name: "run_tests",
              description: "Run Xcode tests",
              inputSchema: {
                type: "object",
                properties: {
                  workspace: { type: "string", description: "Workspace path" },
                  scheme: { type: "string", description: "Test scheme" }
                },
                required: ["workspace", "scheme"]
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
        if (tool === 'build') {
          const config = args.config || 'Debug';
          const cmd = `xcodebuild -workspace "${args.workspace}" -scheme "${args.scheme}" -configuration ${config}`;
          const result = execSync(cmd, { encoding: 'utf8' });
          console.log(JSON.stringify({
            jsonrpc: "2.0",
            id: message.id,
            result: { content: [{ type: "text", text: result }] }
          }));
        } else if (tool === 'run_tests') {
          const cmd = `xcodebuild test -workspace "${args.workspace}" -scheme "${args.scheme}"`;
          const result = execSync(cmd, { encoding: 'utf8' });
          console.log(JSON.stringify({
            jsonrpc: "2.0",
            id: message.id,
            result: { content: [{ type: "text", text: result }] }
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
