/**
 * NeuroSAFE Quiz & Exam Bank MCP Server (Stdio JSON-RPC 2.0)
 * Run via: npx --yes tsx --import ./scripts/register-assets.mjs mcp/neurosafe-quiz/server.ts
 */

// Redirect accidental console.log to stderr so stdout remains pure JSON-RPC
const rawStdoutWrite = process.stdout.write.bind(process.stdout);
console.log = (...args: unknown[]) => {
  process.stderr.write(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ') + '\n');
};

import { dispatchToolCall, MCP_TOOL_DEFINITIONS } from './tools';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

let useContentLengthFraming = false;

function sendJsonRpc(message: Record<string, unknown>) {
  const json = JSON.stringify(message);
  if (useContentLengthFraming) {
    const byteLen = Buffer.byteLength(json, 'utf8');
    rawStdoutWrite(`Content-Length: ${byteLen}\r\n\r\n${json}`);
  } else {
    rawStdoutWrite(`${json}\n`);
  }
}

async function handleRequest(req: JsonRpcRequest) {
  const { id, method, params } = req;

  try {
    if (method === 'initialize') {
      const requestedProtocol =
        (params?.protocolVersion as string | undefined) || '2024-11-05';
      sendJsonRpc({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: requestedProtocol,
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'neurosafe-quiz',
            version: '1.0.0',
          },
        },
      });
      return;
    }

    if (method === 'notifications/initialized' || method === 'initialized') {
      return;
    }

    if (method === 'ping') {
      sendJsonRpc({ jsonrpc: '2.0', id, result: {} });
      return;
    }

    if (method === 'tools/list') {
      sendJsonRpc({
        jsonrpc: '2.0',
        id,
        result: {
          tools: MCP_TOOL_DEFINITIONS,
        },
      });
      return;
    }

    if (method === 'tools/call') {
      const toolName = String(params?.name ?? '');
      const toolArgs = (params?.arguments as Record<string, unknown>) ?? {};
      try {
        const output = await dispatchToolCall(toolName, toolArgs);
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(output, null, 2),
              },
            ],
            isError: false,
          },
        });
      } catch (toolErr) {
        const message = toolErr instanceof Error ? toolErr.message : String(toolErr);
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: message }, null, 2),
              },
            ],
            isError: true,
          },
        });
      }
      return;
    }

    if (id !== undefined) {
      sendJsonRpc({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method not found: ${method}`,
        },
      });
    }
  } catch (err) {
    if (id !== undefined) {
      sendJsonRpc({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: err instanceof Error ? err.message : 'Internal MCP error',
        },
      });
    }
  }
}

let buffer = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk: string) => {
  buffer += chunk;

  while (true) {
    if (buffer.startsWith('Content-Length:')) {
      useContentLengthFraming = true;
      const headerEnd = buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) break;
      const header = buffer.slice(0, headerEnd);
      const match = header.match(/Content-Length:\s*(\d+)/i);
      if (!match) {
        buffer = buffer.slice(headerEnd + 4);
        continue;
      }
      const len = Number(match[1]);
      const bodyStart = headerEnd + 4;
      const remainingBytes = Buffer.byteLength(buffer.slice(bodyStart), 'utf8');
      if (remainingBytes < len) break;

      const bodyBuf = Buffer.from(buffer.slice(bodyStart), 'utf8');
      const jsonText = bodyBuf.subarray(0, len).toString('utf8');
      buffer = bodyBuf.subarray(len).toString('utf8');

      try {
        const parsed = JSON.parse(jsonText) as JsonRpcRequest;
        void handleRequest(parsed);
      } catch {
        // ignore invalid frame
      }
    } else {
      const nlIndex = buffer.indexOf('\n');
      if (nlIndex === -1) break;
      const line = buffer.slice(0, nlIndex).trim();
      buffer = buffer.slice(nlIndex + 1);
      if (!line) continue;
      try {
        const parsed = JSON.parse(line) as JsonRpcRequest;
        void handleRequest(parsed);
      } catch {
        // ignore non-json line
      }
    }
  }
});

