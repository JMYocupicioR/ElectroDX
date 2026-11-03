import { handleSignAgreementRequest } from './signAgreementHandler';
import { invokeWebHandler, type NodeApiRequest, type NodeApiResponse } from './nodeWebHandler';

export const config = {
  maxDuration: 20,
};

export default async function handler(req: NodeApiRequest, res: NodeApiResponse) {
  try {
    return await invokeWebHandler(req, res, handleSignAgreementRequest);
  } catch (err: unknown) {
    console.error('[api/sign-agreement] Unhandled error:', err);
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

