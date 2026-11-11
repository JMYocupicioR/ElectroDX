import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': origin && origin !== 'null' ? origin : '*',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, x-supabase-api-version',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  const auth = req.headers.get('Authorization') ?? '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return new Response(JSON.stringify({ error: 'No autorizado: falta token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: 'No autorizado: sesión inválida' }), {
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
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:contacto@electrodxdiplomado.com';
  if (!vapidPublic || !vapidPrivate) {
    return new Response(JSON.stringify({ error: 'Faltan secretos VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY en Supabase' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : 'ElectroDx';
  const message =
    typeof body.body === 'string' && body.body.trim()
      ? body.body.trim()
      : 'Tienes una actualización académica';
  const userId = typeof body.userId === 'string' && body.userId.trim() ? body.userId.trim() : undefined;
  const userIds = Array.isArray(body.userIds)
    ? body.userIds.filter((id: unknown): id is string => typeof id === 'string' && id.trim().length > 0)
    : undefined;
  const announcementId =
    typeof body.announcementId === 'string' && body.announcementId.trim()
      ? body.announcementId.trim()
      : undefined;
  const url = typeof body.url === 'string' && body.url.trim() ? body.url.trim() : '/portal?tab=notifications';
  const tag =
    typeof body.tag === 'string' && body.tag.trim()
      ? body.tag.trim()
      : announcementId
      ? `announcement-${announcementId}`
      : `electrodx-${Date.now()}`;

  let query = supabase.from('push_subscriptions').select('*');
  if (userId) {
    query = query.eq('user_id', userId);
  } else if (userIds && userIds.length > 0) {
    query = query.in('user_id', userIds);
  }

  const { data: subs, error } = await query;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  const payload = JSON.stringify({
    title,
    body: message,
    url,
    tag,
    data: { url, announcementId },
  });
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

  if (announcementId) {
    await supabase
      .from('platform_announcements')
      .update({
        push_sent_count: sent,
        push_failed_count: failed,
      })
      .eq('id', announcementId);
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
