import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

function corsHeaders(req: Request): Record<string, string> {
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const origin = req.headers.get('Origin') ?? '';
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0] ?? 'http://localhost:5173';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  const auth = req.headers.get('Authorization') ?? '';
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { global: { headers: { Authorization: auth } } }
  );

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id);
  const isStaff = (roles ?? []).some((r: { role: string }) => r.role === 'admin' || r.role === 'editor');
  if (!isStaff) {
    return new Response(JSON.stringify({ error: 'Solo el personal académico puede enviar avisos' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY');
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.com';
  if (!vapidPublic || !vapidPrivate) {
    return new Response(JSON.stringify({ error: 'Faltan secretos VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : 'ElectoDX';
  const message =
    typeof body.body === 'string' && body.body.trim()
      ? body.body.trim()
      : 'Tienes una actualización académica';
  const userId = typeof body.userId === 'string' ? body.userId : undefined;
  const url = typeof body.url === 'string' ? body.url : '/portal?tab=notifications';

  let query = supabase.from('push_subscriptions').select('*');
  if (userId) query = query.eq('user_id', userId);
  const { data: subs, error } = await query;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  const payload = JSON.stringify({ title, body: message, url });
  let sent = 0;
  let failed = 0;
  const dead: string[] = [];

  for (const sub of subs ?? []) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
      sent += 1;
    } catch (err) {
      failed += 1;
      const statusCode = Number((err as { statusCode?: number }).statusCode ?? 0);
      if (statusCode === 404 || statusCode === 410) dead.push(sub.endpoint);
    }
  }

  if (dead.length > 0) {
    await supabase.from('push_subscriptions').delete().in('endpoint', dead);
  }

  return new Response(
    JSON.stringify({
      queued: (subs ?? []).length,
      sent,
      failed,
      cleaned: dead.length,
      title,
      message,
    }),
    { headers: { 'Content-Type': 'application/json', ...cors } }
  );
});
