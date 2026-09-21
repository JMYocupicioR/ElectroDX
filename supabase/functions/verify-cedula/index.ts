// Supabase Edge Function: verify-cedula
// Secrets opcionales: SEP_API_KEY, SEP_CLIENT_ID (si faltan usa el cliente público del portal SEP)

const SEP_ORIGIN = 'https://cedulaprofesional.sep.gob.mx';
const SEP_PUBLIC_CLIENT_ID = 'rnp-angular-app-prod';
const SEP_PUBLIC_API_KEY = '65da8s675f8s75fda675s8d76as87d5as675da';

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': origin && origin !== 'null' ? origin : '*',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, x-supabase-api-version',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function sepBrowserHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    Origin: SEP_ORIGIN,
    Referer: `${SEP_ORIGIN}/`,
    ...extra,
  };
}

async function getSepToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }
  const clientId = Deno.env.get('SEP_CLIENT_ID') || SEP_PUBLIC_CLIENT_ID;
  const apiKey = Deno.env.get('SEP_API_KEY') || SEP_PUBLIC_API_KEY;
  const tokenRes = await fetch(`${SEP_ORIGIN}/api/auth/token`, {
    method: 'GET',
    headers: sepBrowserHeaders({
      'X-Client-Id': clientId,
      'X-API-Key': apiKey,
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`Error al autenticar con SEP: ${tokenRes.statusText}`);
  }
  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    throw new Error('No se recibió access_token de la SEP');
  }
  cachedToken = tokenData.access_token;
  tokenExpiresAt = Date.now() + 50 * 60 * 1000;
  return cachedToken;
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: cors });
  }

  try {
    const url = new URL(req.url);
    let cedula = url.searchParams.get('cedula');

    if (!cedula && req.method === 'POST') {
      try {
        const body = await req.json();
        cedula = body.cedula;
      } catch {
        // ignore
      }
    }

    if (!cedula || typeof cedula !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Número de cédula requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }

    const cleanCedula = cedula.replace(/\D/g, '');
    if (cleanCedula.length < 5 || cleanCedula.length > 10) {
      return new Response(JSON.stringify({ success: false, error: 'Formato de cédula no válido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }

    const token = await getSepToken();
    const queryRes = await fetch(`${SEP_ORIGIN}/api/rnp/solr/profesionista/consultar/byDetalle`, {
      method: 'POST',
      headers: sepBrowserHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ numCedula: cleanCedula }),
    });

    if (!queryRes.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Error en servicio SEP: ${queryRes.status}` }),
        {
          status: queryRes.status,
          headers: { 'Content-Type': 'application/json', ...cors },
        }
      );
    }

    const items = await queryRes.json();
    return new Response(JSON.stringify({ success: true, items }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || 'Error interno al consultar SEP' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...cors },
      }
    );
  }
});
