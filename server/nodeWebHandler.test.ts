import { Readable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { invokeWebHandler, type NodeApiRequest, type NodeApiResponse } from './nodeWebHandler';

function captureResponse() {
  const headers = new Map<string, string>();
  let statusCode = 0;
  let body = '';
  const res: NodeApiResponse = {
    statusCode: 200,
    status(code: number) {
      statusCode = code;
      this.statusCode = code;
      return this;
    },
    setHeader(name: string, value: string) {
      headers.set(name, value);
    },
    end(payload?: Buffer | string) {
      body = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload || '';
    },
  };
  return { res, headers, body: () => body, status: () => statusCode };
}

describe('invokeWebHandler', () => {
  it('forwards a parsed JSON body to the web handler', async () => {
    const req: NodeApiRequest = {
      method: 'POST',
      url: '/api/sign-agreement',
      headers: {
        host: 'electro-dx.vercel.app',
        'x-forwarded-proto': 'https',
        authorization: 'Bearer token',
        'content-type': 'application/json',
        'content-length': '99',
      },
      body: { action: 'download', documentType: 'contrato' },
      [Symbol.asyncIterator]() {
        throw new Error('the parsed body should be used');
      },
    };
    const captured = captureResponse();

    await invokeWebHandler(req, captured.res, async (request) => {
      const payload = (await request.json()) as { action?: string };
      return new Response(JSON.stringify({ success: true, action: payload.action }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });

    expect(captured.status()).toBe(200);
    expect(JSON.parse(captured.body())).toEqual({ success: true, action: 'download' });
    expect(captured.headers.get('content-type')).toContain('application/json');
  });

  it('reads a raw request stream when the platform did not parse JSON', async () => {
    const stream = Readable.from([Buffer.from('{"action":"download"}')]);
    const req = Object.assign(stream, {
      method: 'POST',
      url: '/api/sign-agreement',
      headers: { host: 'localhost:5173', 'content-type': 'application/json' },
    }) as NodeApiRequest;
    const captured = captureResponse();

    await invokeWebHandler(req, captured.res, async (request) => {
      const payload = (await request.json()) as { action?: string };
      return new Response(JSON.stringify({ ok: payload.action }), { status: 201 });
    });

    expect(captured.status()).toBe(201);
    expect(JSON.parse(captured.body())).toEqual({ ok: 'download' });
  });
});
