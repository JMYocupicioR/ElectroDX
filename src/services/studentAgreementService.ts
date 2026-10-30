import { supabase } from '../lib/supabase';
import type { StudentAgreement, StudentAgreementDocumentType } from '../types/database';

async function authHeader(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sesión no válida. Inicia sesión de nuevo.');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function listStudentAgreements(userId: string): Promise<StudentAgreement[]> {
  const { data, error } = await supabase
    .from('student_agreements')
    .select('*')
    .eq('user_id', userId)
    .order('signed_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as StudentAgreement[];
}

async function postAgreement<T extends { success: boolean; error?: string }>(body: unknown): Promise<T> {
  const response = await fetch('/api/sign-agreement', {
    method: 'POST',
    headers: await authHeader(),
    body: JSON.stringify(body),
  });
  const text = await response.text();
  try {
    const parsed = JSON.parse(text) as T;
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    return { success: false, error: 'No se pudo preparar el PDF firmado.' } as T;
  }
  return { success: false, error: 'No se pudo preparar el PDF firmado.' } as T;
}

export async function submitStudentAgreement(input: {
  documentType: StudentAgreementDocumentType;
  fullNameTyped: string;
  professionalLicense?: string | null;
  signatureBase64: string;
}): Promise<{ success: boolean; folio?: string; hasCompletedAll?: boolean; error?: string }> {
  return postAgreement({
    action: 'sign',
    documentType: input.documentType,
    fullNameTyped: input.fullNameTyped,
    professionalLicense: input.professionalLicense ?? null,
    signatureBase64: input.signatureBase64,
  });
}

export async function downloadSignedAgreement(input: {
  documentType: StudentAgreementDocumentType;
  studentId?: string;
}): Promise<{ success: boolean; downloadUrl?: string; fileName?: string; error?: string }> {
  return postAgreement({
    action: 'download',
    documentType: input.documentType,
    studentId: input.studentId,
  });
}

export async function verifyStudentAgreementFolio(folio: string): Promise<{
  valid: boolean;
  folio?: string;
  document_type?: StudentAgreementDocumentType;
  document_version?: string;
  full_name?: string;
  signed_at?: string;
}> {
  const { data, error } = await supabase.rpc('verify_student_agreement', { p_folio: folio });
  if (error) throw error;
  return (data ?? { valid: false }) as { valid: boolean };
}

export async function startBrowserDownload(url: string, fileName: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('No se pudo descargar el PDF.');
  const blob = await response.blob();
  const header = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
  const magic = String.fromCharCode(...header);
  if (!magic.startsWith('%PDF')) throw new Error('El archivo firmado no es un PDF.');
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}
