import { lookupSepCedula, normalizeCedula } from '../server/sepCedulaLookup';

type VercelReq = {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  body?: { cedula?: string } | string;
};

type VercelRes = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelRes;
  json: (body: unknown) => void;
  end: () => void;
};

function queryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export const config = {
  maxDuration: 20,
};

export default async function handler(req: VercelReq, res: VercelRes) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    let cedula = queryValue(req.query.cedula);
    if (!cedula && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
      cedula = body?.cedula;
    }

    if (!cedula || typeof cedula !== 'string') {
      res.status(400).json({ success: false, error: 'Número de cédula requerido' });
      return;
    }

    const cleanCedula = normalizeCedula(cedula);
    if (cleanCedula.length < 5 || cleanCedula.length > 10) {
      res.status(400).json({ success: false, error: 'Formato de cédula no válido' });
      return;
    }

    const items = await lookupSepCedula(cleanCedula);
    res.status(200).json({ success: true, items });
  } catch (err: unknown) {
    const status = typeof err === 'object' && err && 'status' in err ? Number((err as { status?: number }).status) : 500;
    const message = err instanceof Error ? err.message : 'Error interno al consultar SEP';
    res.status(Number.isFinite(status) && status >= 400 ? status : 500).json({
      success: false,
      error: message,
    });
  }
}
