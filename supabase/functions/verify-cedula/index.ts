// Supabase Edge Function: verify-cedula
// Follows Deno runtime standards for Supabase Functions

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getSepToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }
  const tokenRes = await fetch('https://cedulaprofesional.sep.gob.mx/api/auth/token', {
    method: 'GET',
    headers: {
      'X-Client-Id': 'rnp-angular-app-prod',
      'X-API-Key': '65da8s675f8s75fda675s8d76as87d5as675da',
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
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    });
  }

  try {
    const url = new URL(req.url);
    let cedula = url.searchParams.get('cedula');

    if (!cedula && req.method === 'POST') {
      try {
        const body = await req.json();
        cedula = body.cedula;
      } catch {}
    }

    if (!cedula || typeof cedula !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Número de cédula requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const cleanCedula = cedula.replace(/\D/g, '');
    if (cleanCedula.length < 5 || cleanCedula.length > 10) {
      return new Response(JSON.stringify({ success: false, error: 'Formato de cédula no válido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
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
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    const items = await queryRes.json();
    return new Response(JSON.stringify({ success: true, items }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || 'Error interno al consultar SEP' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
});
