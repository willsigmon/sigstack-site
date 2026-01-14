#!/usr/bin/env node
/**
 * Fixed GitHub MCP Server Wrapper
 * Wraps the official @modelcontextprotocol/server-github and fixes
 * anyOf/oneOf/allOf schema issues that cause API 400 errors
 */

const { spawn } = require('child_process');
const readline = require('readline');

// Spawn the real GitHub MCP server
const npxPath = process.env.NPX_PATH || '/Users/wsig/.nvm/versions/node/v22.17.1/bin/npx';
const child = spawn(npxPath, ['-y', '@modelcontextprotocol/server-github'], {
  env: { ...process.env },
  stdio: ['pipe', 'pipe', 'inherit']
});

// Create readline interface for stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Create readline interface for child stdout
const childRl = readline.createInterface({
  input: child.stdout,
  terminal: false
});

/**
 * Recursively fix JSON Schema to remove top-level anyOf/oneOf/allOf
 * and flatten nested structures that cause API errors
 */
function fixSchema(schema, depth = 0) {
  if (!schema || typeof schema !== 'object') return schema;

  // Handle arrays
  if (Array.isArray(schema)) {
    return schema.map(item => fixSchema(item, depth));
  }

  const fixed = { ...schema };

  // Fix anyOf at any level in items
  if (fixed.items && fixed.items.anyOf) {
    // Replace anyOf with the first valid option (usually the more complete one)
    const options = fixed.items.anyOf;
    if (options.length > 0) {
      // Merge all options into a single schema
      const merged = { type: 'object', properties: {}, required: [] };
      for (const opt of options) {
        if (opt.properties) {
          Object.assign(merged.properties, opt.properties);
        }
        if (opt.required) {
          merged.required.push(...opt.required.filter(r => !merged.required.includes(r)));
        }
      }
      fixed.items = merged;
    }
  }

  // Fix oneOf/anyOf/allOf at top level of properties
  if (fixed.oneOf || fixed.anyOf || fixed.allOf) {
    const options = fixed.oneOf || fixed.anyOf || fixed.allOf || [];
    delete fixed.oneOf;
    delete fixed.anyOf;
    delete fixed.allOf;

    // Merge all options into this schema
    if (options.length > 0) {
      const merged = { type: 'object', properties: {} };
      for (const opt of options) {
        if (opt && opt.properties) {
          Object.assign(merged.properties, opt.properties);
        }
        if (opt && opt.required && !merged.required) {
          merged.required = opt.required;
        }
      }
      Object.assign(fixed, merged);
    }
  }

  // Recursively fix nested objects
  if (fixed.properties) {
    const newProps = {};
    for (const [key, value] of Object.entries(fixed.properties)) {
      newProps[key] = fixSchema(value, depth + 1);
    }
    fixed.properties = newProps;
  }

  if (fixed.items && !Array.isArray(fixed.items)) {
    fixed.items = fixSchema(fixed.items, depth + 1);
  }

  return fixed;
}

/**
 * Fix tool definitions to ensure schema compliance
 */
function fixTools(tools) {
  if (!Array.isArray(tools)) return tools;

  return tools.map(tool => {
    if (!tool.inputSchema) return tool;

    const fixed = { ...tool };
    fixed.inputSchema = fixSchema(tool.inputSchema);

    // Ensure required fields exist
    if (!fixed.inputSchema.type) {
      fixed.inputSchema.type = 'object';
    }
    if (!fixed.inputSchema.properties) {
      fixed.inputSchema.properties = {};
    }

    return fixed;
  });
}

// Forward stdin to child
rl.on('line', (line) => {
  child.stdin.write(line + '\n');
});

// Intercept and fix child stdout before forwarding
childRl.on('line', (line) => {
  try {
    const message = JSON.parse(line);

    // Intercept tools/list response
    if (message.result && message.result.tools) {
      message.result.tools = fixTools(message.result.tools);
      console.log(JSON.stringify(message));
    } else {
      // Pass through unchanged
      console.log(line);
    }
  } catch (e) {
    // If not valid JSON, pass through unchanged
    console.log(line);
  }
});

// Handle process cleanup
child.on('close', (code) => {
  process.exit(code || 0);
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
});

rl.on('close', () => {
  child.stdin.end();
});
