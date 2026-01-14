#!/usr/bin/env node
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.error('Initializing osascript server...');
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
          serverInfo: { name: "fixed-mcp-osascript", version: "1.0.0" }
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
              name: "run_script",
              description: "Run AppleScript/osascript commands",
              inputSchema: {
                type: "object",
                properties: {
                  script: { type: "string", description: "AppleScript code to run" }
                },
                required: ["script"]
              }
            },
            {
              name: "tell_app",
              description: "Send commands to macOS applications",
              inputSchema: {
                type: "object",
                properties: {
                  app: { type: "string", description: "Application name" },
                  command: { type: "string", description: "Command to send" }
                },
                required: ["app", "command"]
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
        let result;
        if (tool === 'run_script') {
          result = execSync(`osascript -e '${args.script.replace(/'/g, "'\\''")}'`, { encoding: 'utf8' });
        } else if (tool === 'tell_app') {
          const script = `tell application "${args.app}" to ${args.command}`;
          result = execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`, { encoding: 'utf8' });
        }
        
        console.log(JSON.stringify({
          jsonrpc: "2.0",
          id: message.id,
          result: {
            content: [{ type: "text", text: result || "Success" }]
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

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
