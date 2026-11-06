/**
 * Direct CLI runner for NeuroSAFE Quiz MCP tools.
 * Supports JSON arguments, key=value pairs (npm-safe), and --key value flags:
 *   npm run quiz:tool -- list_quiz_coverage moduleId=nerve-conduction limit=5
 *   npm run quiz:tool -- get_topic_authoring_pack topicId=martin-gruber
 */

import { dispatchToolCall, MCP_TOOL_DEFINITIONS } from './tools';

function coerceValue(val: string): unknown {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
  return val;
}

function parseCliArgs(argv: string[]): Record<string, unknown> {
  if (argv.length === 0) return {};

  // 1. Check if first arg looks like JSON (or PowerShell-stripped JSON like {moduleId:nerve-conduction})
  const first = argv[0].trim();
  if (first.startsWith('{') && first.endsWith('}')) {
    try {
      return JSON.parse(first);
    } catch {
      const repaired = first.replace(
        /([{,])\s*([a-zA-Z0-9_]+)\s*:\s*([^,}]+)/g,
        (_m, sep, key, rawVal) => {
          const v = rawVal.trim();
          const coerced = coerceValue(v);
          return `${sep}"${key}":${JSON.stringify(coerced)}`;
        }
      );
      return JSON.parse(repaired);
    }
  }

  // 2. Parse key=value or --key value or --key=value
  const out: Record<string, unknown> = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const withoutDashes = token.slice(2);
      const eqIdx = withoutDashes.indexOf('=');
      if (eqIdx > 0) {
        out[withoutDashes.slice(0, eqIdx)] = coerceValue(withoutDashes.slice(eqIdx + 1));
      } else {
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith('--') && !next.includes('=')) {
          out[withoutDashes] = coerceValue(next);
          i += 1;
        } else {
          out[withoutDashes] = true;
        }
      }
    } else if (token.includes('=')) {
      const eqIdx = token.indexOf('=');
      out[token.slice(0, eqIdx)] = coerceValue(token.slice(eqIdx + 1));
    }
  }
  return out;
}

async function main() {
  const [, , toolName, ...restArgs] = process.argv;

  if (!toolName || toolName === '--help' || toolName === '-h' || toolName === 'list') {
    console.log(
      JSON.stringify(
        {
          server: 'neurosafe-quiz',
          availableTools: MCP_TOOL_DEFINITIONS.map((t) => ({
            name: t.name,
            description: t.description,
          })),
        },
        null,
        2
      )
    );
    return;
  }

  const parsedArgs = parseCliArgs(restArgs);
  const result = await dispatchToolCall(toolName, parsedArgs);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }, null, 2));
  process.exit(1);
});
