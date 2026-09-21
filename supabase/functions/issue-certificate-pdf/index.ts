import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';
import QRCode from 'npm:qrcode@1.5.4';

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

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] ?? '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
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

  try {
    const auth = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: auth } } }
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }

    const body = await req.json().catch(() => ({}));
    const folio = typeof body.folio === 'string' ? body.folio.trim() : '';
    if (!folio) {
      return new Response(JSON.stringify({ error: 'Folio requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }

    const { data: cert, error: certError } = await supabase
      .from('academic_certificates')
      .select('folio, issued_at, verification_code, overall_progress_pct, average_score, revoked_at, user_id, course_id')
      .eq('folio', folio)
      .maybeSingle();

    if (certError || !cert) {
      return new Response(JSON.stringify({ error: 'Constancia no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id);
    const isStaff = (roles ?? []).some((r: { role: string }) => r.role === 'admin' || r.role === 'editor');
    if (cert.user_id !== userData.user.id && !isStaff) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }
    if (cert.revoked_at) {
      return new Response(JSON.stringify({ error: 'Constancia revocada' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, credentials')
      .eq('id', cert.user_id)
      .maybeSingle();

    let courseTitle = 'Programa de posgrado en electrodiagnóstico';
    if (cert.course_id) {
      const { data: course } = await supabase
        .from('courses')
        .select('title')
        .eq('id', cert.course_id)
        .maybeSingle();
      if (course?.title) courseTitle = course.title;
    }

    const site = (Deno.env.get('PUBLIC_SITE_URL') ?? allowedSite()).replace(/\/$/, '');
    const verifyUrl = `${site}/verificar/${encodeURIComponent(cert.folio)}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 280, errorCorrectionLevel: 'M' });

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([792, 612]);
    const font = await pdf.embedFont(StandardFonts.TimesRoman);
    const fontBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
    const { width, height } = page.getSize();

    page.drawRectangle({
      x: 28,
      y: 28,
      width: width - 56,
      height: height - 56,
      borderColor: rgb(0.11, 0.3, 0.61),
      borderWidth: 2,
    });
    page.drawRectangle({
      x: 36,
      y: 36,
      width: width - 72,
      height: height - 72,
      borderColor: rgb(0.75, 0.8, 0.88),
      borderWidth: 1,
    });

    page.drawText('ElectroDx Diplomado', {
      x: 60,
      y: height - 90,
      size: 14,
      font: fontBold,
      color: rgb(0.11, 0.3, 0.61),
    });
    page.drawText('Constancia académica', {
      x: 60,
      y: height - 128,
      size: 28,
      font: fontBold,
      color: rgb(0.07, 0.09, 0.15),
    });
    page.drawText(courseTitle, {
      x: 60,
      y: height - 154,
      size: 11,
      font,
      color: rgb(0.35, 0.4, 0.48),
    });

    const displayName = profile?.display_name || 'Médico participante';
    page.drawText('Se otorga a', {
      x: 60,
      y: height - 210,
      size: 12,
      font,
      color: rgb(0.35, 0.4, 0.48),
    });
    page.drawText(displayName, {
      x: 60,
      y: height - 238,
      size: 22,
      font: fontBold,
      color: rgb(0.07, 0.09, 0.15),
    });
    if (profile?.credentials) {
      page.drawText(String(profile.credentials), {
        x: 60,
        y: height - 260,
        size: 11,
        font,
        color: rgb(0.35, 0.4, 0.48),
      });
    }

    const issued = cert.issued_at
      ? new Date(cert.issued_at).toLocaleDateString('es-MX', { dateStyle: 'long' })
      : '';
    const lines = [
      `Folio: ${cert.folio}`,
      `Emitida: ${issued}`,
      `Progreso registrado: ${cert.overall_progress_pct}%`,
      `Promedio de evaluaciones: ${cert.average_score}%`,
      `Código de verificación: ${cert.verification_code}`,
    ];
    lines.forEach((line, i) => {
      page.drawText(line, {
        x: 60,
        y: height - 310 - i * 20,
        size: 11,
        font,
        color: rgb(0.15, 0.18, 0.22),
      });
    });

    page.drawText('Verifique la autenticidad de este documento en el portal institucional.', {
      x: 60,
      y: 72,
      size: 9,
      font,
      color: rgb(0.4, 0.45, 0.5),
    });

    const qrImage = await pdf.embedPng(dataUrlToBytes(qrDataUrl));
    page.drawImage(qrImage, {
      x: width - 200,
      y: 80,
      width: 120,
      height: 120,
    });
    page.drawText('Escanear para verificar', {
      x: width - 200,
      y: 64,
      size: 8,
      font,
      color: rgb(0.4, 0.45, 0.5),
    });

    const bytes = await pdf.save();
    return new Response(bytes, {
      status: 200,
      headers: {
        ...cors,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="constancia-${cert.folio}.pdf"`,
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(req) },
    });
  }
});

function allowedSite(): string {
  const first = (Deno.env.get('ALLOWED_ORIGINS') ?? '').split(',')[0]?.trim();
  return first || 'http://localhost:5173';
}
