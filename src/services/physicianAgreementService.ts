import { supabase } from '../lib/supabase';
import type { PhysicianAgreement, PhysicianAgreementDocumentType } from '../types/database';
import type { PhysicianMarkedRole } from '../content/legal/physicianAgreements';

async function authHeader(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sesión no válida. Inicia sesión de nuevo.');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function listPhysicianAgreements(userId: string): Promise<PhysicianAgreement[]> {
  const { data, error } = await supabase
    .from('physician_agreements')
    .select('*')
    .eq('user_id', userId)
    .order('signed_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PhysicianAgreement[];
}

async function postAgreement<T extends { success: boolean; error?: string }>(body: unknown): Promise<T> {
  const response = await fetch('/api/sign-physician-agreement', {
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

export async function submitPhysicianAgreement(input: {
  documentType: PhysicianAgreementDocumentType;
  fullNameTyped: string;
  professionalLicense?: string | null;
  signatureBase64: string;
  rfc?: string | null;
  clabe?: string | null;
  bank?: string | null;
  markedRole?: PhysicianMarkedRole | null;
}): Promise<{ success: boolean; folio?: string; hasCompletedAll?: boolean; error?: string }> {
  return postAgreement({
    action: 'sign',
    documentType: input.documentType,
    fullNameTyped: input.fullNameTyped,
    professionalLicense: input.professionalLicense ?? null,
    signatureBase64: input.signatureBase64,
    rfc: input.rfc ?? null,
    clabe: input.clabe ?? null,
    bank: input.bank ?? null,
    markedRole: input.markedRole ?? null,
  });
}

export async function downloadSignedPhysicianAgreement(input: {
  documentType: PhysicianAgreementDocumentType;
  physicianId?: string;
}): Promise<{ success: boolean; downloadUrl?: string; fileName?: string; error?: string }> {
  return postAgreement({
    action: 'download',
    documentType: input.documentType,
    physicianId: input.physicianId,
  });
}

export async function verifyPhysicianAgreementFolio(folio: string): Promise<{
  valid: boolean;
  folio?: string;
  document_type?: PhysicianAgreementDocumentType;
  document_version?: string;
  full_name?: string;
  signed_at?: string;
}> {
  const { data, error } = await supabase.rpc('verify_physician_agreement', { p_folio: folio });
  if (error) throw error;
  return (data ?? { valid: false }) as { valid: boolean };
}
