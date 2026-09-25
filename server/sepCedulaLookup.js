import { setDefaultResultOrder } from 'node:dns';

setDefaultResultOrder('ipv4first');

const SEP_TOKEN_URL = 'https://cedulaprofesional.sep.gob.mx/api/auth/token';
const SEP_QUERY_URL =
  'https://cedulaprofesional.sep.gob.mx/api/rnp/solr/profesionista/consultar/byDetalle';
const SEP_ORIGIN = 'https://cedulaprofesional.sep.gob.mx';

/** Cliente público del portal SEP. Preferir SEP_CLIENT_ID / SEP_API_KEY en el entorno. */
const SEP_PUBLIC_CLIENT_ID = 'rnp-angular-app-prod';
const SEP_PUBLIC_API_KEY = '65da8s675f8s75fda675s8d76as87d5as675da';

let cachedToken = null;
let tokenExpiresAt = 0;

function sepBrowserHeaders(extra = {}) {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    Origin: SEP_ORIGIN,
    Referer: `${SEP_ORIGIN}/`,
    ...extra,
  };
}

function describeFetchError(err) {
  const cause = err?.cause;
  const code = cause?.code || cause?.name;
  const detail = cause?.message || err?.message || 'error de red';
  return code ? `${code}: ${detail}` : detail;
}

function sepCredentials() {
  return {
    clientId: process.env.SEP_CLIENT_ID || SEP_PUBLIC_CLIENT_ID,
    apiKey: process.env.SEP_API_KEY || SEP_PUBLIC_API_KEY,
  };
}

async function getSepToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }
  const { clientId, apiKey } = sepCredentials();
  let tokenRes;
  try {
    tokenRes = await fetch(SEP_TOKEN_URL, {
      method: 'GET',
      headers: sepBrowserHeaders({
        'X-Client-Id': clientId,
        'X-API-Key': apiKey,
      }),
      signal: AbortSignal.timeout(12000),
    });
  } catch (err) {
    throw new Error(`No se pudo contactar a la SEP: ${describeFetchError(err)}`);
  }
  if (!tokenRes.ok) {
    throw new Error(`Error al autenticar con SEP: ${tokenRes.status} ${tokenRes.statusText}`);
  }
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error('No se recibió access_token de la SEP');
  }
  cachedToken = tokenData.access_token;
  tokenExpiresAt = Date.now() + 50 * 60 * 1000;
  return cachedToken;
}

export function normalizeCedula(cedula) {
  return typeof cedula === 'string' ? cedula.replace(/\D/g, '') : '';
}

export async function lookupSepCedula(cleanCedula) {
  const token = await getSepToken();
  let queryRes;
  try {
    queryRes = await fetch(SEP_QUERY_URL, {
      method: 'POST',
      headers: sepBrowserHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ numCedula: cleanCedula }),
      signal: AbortSignal.timeout(12000),
    });
  } catch (err) {
    throw new Error(`No se pudo consultar la SEP: ${describeFetchError(err)}`);
  }

  if (!queryRes.ok) {
    const err = new Error(`Error en servicio SEP: ${queryRes.status}`);
    err.status = queryRes.status;
    throw err;
  }

  return await queryRes.json();
}
