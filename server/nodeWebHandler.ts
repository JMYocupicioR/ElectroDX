export interface NodeApiRequest {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  [Symbol.asyncIterator]?: () => AsyncIterator<Uint8Array | string>;
}

export interface NodeApiResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: Buffer | string): void;
  status?: (code: number) => NodeApiResponse;
}

function headerValue(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(', ');
  return undefined;
}

async function readBody(req: NodeApiRequest): Promise<string | undefined> {
  const method = (req.method || 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return undefined;
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  if (req.body != null && typeof req.body === 'object') return JSON.stringify(req.body);

  if (typeof req[Symbol.asyncIterator] !== 'function') return undefined;

  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req as AsyncIterable<Uint8Array | string>) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    if (chunks.length === 0) return undefined;
    return Buffer.concat(chunks).toString('utf8');
  } catch {
    return undefined;
  }
}

export async function invokeWebHandler(
  req: NodeApiRequest,
  res: NodeApiResponse,
  handle: (request: Request) => Promise<Response>
): Promise<void> {
  try {
    const method = (req.method || 'GET').toUpperCase();
    const host = headerValue(req.headers['x-forwarded-host']) || headerValue(req.headers.host) || 'localhost';
    const proto = headerValue(req.headers['x-forwarded-proto']) || (host.includes('localhost') ? 'http' : 'https');
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers || {})) {
      const normalized = headerValue(value);
      if (normalized) {
        try {
          headers.set(key, normalized);
        } catch {
          // Ignorar encabezados con caracteres inválidos
        }
      }
    }
    headers.delete('content-length');
    headers.delete('transfer-encoding');

    const body = await readBody(req);
    const request = new Request(new URL(req.url || '/', `${proto}://${host}`), {
      method,
      headers,
      body: method === 'GET' || method === 'HEAD' ? undefined : body,
    });
    const response = await handle(request);
    if (typeof res.status === 'function') res.status(response.status);
    else res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      try {
        res.setHeader(key, value);
      } catch {
        // Ignorar fallo al setear header
      }
    });
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (err: unknown) {
    console.error('[nodeWebHandler] Error no controlado en función de acuerdos:', err);
    const message = err instanceof Error ? err.message : 'Error interno al procesar el acuerdo.';
    if (typeof res.status === 'function') res.status(500);
    else res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.end(JSON.stringify({ success: false, error: message }));
  }
}
