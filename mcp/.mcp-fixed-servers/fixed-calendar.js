#!/usr/bin/env node
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.error('Initializing calendar server...');
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
          serverInfo: { name: "fixed-mcp-calendar", version: "1.0.0" }
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
              name: "list_events",
              description: "List upcoming calendar events",
              inputSchema: {
                type: "object",
                properties: {
                  days: { type: "number", description: "Days ahead to check (default 7)" }
                },
                required: []
              }
            },
            {
              name: "create_event",
              description: "Create a calendar event",
              inputSchema: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Event title" },
                  date: { type: "string", description: "Date (YYYY-MM-DD)" },
                  time: { type: "string", description: "Time (HH:MM)" }
                },
                required: ["title", "date"]
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
        if (tool === 'list_events') {
          const days = args.days || 7;
          const script = `tell application "Calendar"
            tell calendar 1
              set eventList to {}
              set today to current date
              repeat with i from 0 to ${days}
                set checkDate to (today + (i * days * 1))
                set relevantEvents to events whose start date contains checkDate
                set eventList to eventList & relevantEvents
              end repeat
              return eventList
            end tell
          end tell`;
          const result = execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`, { encoding: 'utf8' });
          console.log(JSON.stringify({
            jsonrpc: "2.0",
            id: message.id,
            result: { content: [{ type: "text", text: result || "No events" }] }
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
