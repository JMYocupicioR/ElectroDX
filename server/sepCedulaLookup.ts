const SEP_TOKEN_URL = 'https://cedulaprofesional.sep.gob.mx/api/auth/token';
const SEP_QUERY_URL =
  'https://cedulaprofesional.sep.gob.mx/api/rnp/solr/profesionista/consultar/byDetalle';
const SEP_ORIGIN = 'https://cedulaprofesional.sep.gob.mx';

/** Cliente público del portal SEP. Preferir SEP_CLIENT_ID / SEP_API_KEY en el entorno. */
const SEP_PUBLIC_CLIENT_ID = 'rnp-angular-app-prod';
const SEP_PUBLIC_API_KEY = '65da8s675f8s75fda675s8d76as87d5as675da';

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

function sepBrowserHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    Origin: SEP_ORIGIN,
    Referer: `${SEP_ORIGIN}/`,
    ...extra,
  };
}

function sepCredentials(): { clientId: string; apiKey: string } {
  return {
    clientId: process.env.SEP_CLIENT_ID || SEP_PUBLIC_CLIENT_ID,
    apiKey: process.env.SEP_API_KEY || SEP_PUBLIC_API_KEY,
  };
}

async function getSepToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }
  const { clientId, apiKey } = sepCredentials();
  const tokenRes = await fetch(SEP_TOKEN_URL, {
    method: 'GET',
    headers: sepBrowserHeaders({
      'X-Client-Id': clientId,
      'X-API-Key': apiKey,
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`Error al autenticar con SEP: ${tokenRes.status} ${tokenRes.statusText}`);
  }
  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    throw new Error('No se recibió access_token de la SEP');
  }
  cachedToken = tokenData.access_token;
  tokenExpiresAt = Date.now() + 50 * 60 * 1000;
  return cachedToken;
}

export function normalizeCedula(cedula: unknown): string {
  return typeof cedula === 'string' ? cedula.replace(/\D/g, '') : '';
}

export async function lookupSepCedula(cleanCedula: string): Promise<unknown[]> {
  const token = await getSepToken();
  const queryRes = await fetch(SEP_QUERY_URL, {
    method: 'POST',
    headers: sepBrowserHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ numCedula: cleanCedula }),
  });

  if (!queryRes.ok) {
    const err = new Error(`Error en servicio SEP: ${queryRes.status}`) as Error & { status?: number };
    err.status = queryRes.status;
    throw err;
  }

  return (await queryRes.json()) as unknown[];
}
