// Supabase Edge Function: verify-cedula
// Follows Deno runtime standards for Supabase Functions
// Secrets: SEP_API_KEY, SEP_CLIENT_ID, ALLOWED_ORIGINS (comma-separated)

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

function corsHeaders(req: Request): Record<string, string> {
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const origin = req.headers.get('Origin') ?? '';
  const allowOrigin = allowed.includes(origin)
    ? origin
    : allowed[0] ?? 'http://localhost:5173';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    Vary: 'Origin',
  };
}

async function getSepToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }
  const clientId = Deno.env.get('SEP_CLIENT_ID');
  const apiKey = Deno.env.get('SEP_API_KEY');
  if (!clientId || !apiKey) {
    throw new Error('SEP_CLIENT_ID y SEP_API_KEY no están configurados en secrets de la función');
  }
  const tokenRes = await fetch('https://cedulaprofesional.sep.gob.mx/api/auth/token', {
    method: 'GET',
    headers: {
      'X-Client-Id': clientId,
      'X-API-Key': apiKey,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
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
    return new Response(null, { status: 204, headers: cors });
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
    const queryRes = await fetch(
      'https://cedulaprofesional.sep.gob.mx/api/rnp/solr/profesionista/consultar/byDetalle',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        body: JSON.stringify({ numCedula: cleanCedula }),
      }
    );

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
