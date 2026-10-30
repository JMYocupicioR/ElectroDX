export interface NodeApiRequest {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  [Symbol.asyncIterator](): AsyncIterator<Uint8Array | string>;
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
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  if (req.body != null && typeof req.body === 'object') return JSON.stringify(req.body);

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return undefined;
  return Buffer.concat(chunks).toString('utf8');
}

export async function invokeWebHandler(
  req: NodeApiRequest,
  res: NodeApiResponse,
  handle: (request: Request) => Promise<Response>
): Promise<void> {
  const host = headerValue(req.headers['x-forwarded-host']) || headerValue(req.headers.host) || 'localhost';
  const proto = headerValue(req.headers['x-forwarded-proto']) || (host.includes('localhost') ? 'http' : 'https');
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    const normalized = headerValue(value);
    if (normalized) headers.set(key, normalized);
  }
  headers.delete('content-length');
  headers.delete('transfer-encoding');

  const body = await readBody(req);
  const request = new Request(new URL(req.url || '/', `${proto}://${host}`), {
    method: req.method || 'GET',
    headers,
    body,
  });
  const response = await handle(request);
  if (typeof res.status === 'function') res.status(response.status);
  else res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}
