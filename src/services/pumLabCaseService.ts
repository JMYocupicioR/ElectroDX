// src/services/pumLabCaseService.ts
// Ajustes docentes del laboratorio de morfología del PUM.
// Fuente de verdad: tabla `pum_lab_case_overrides` en Supabase (visible para todos los alumnos).
// Respaldo: localStorage, solo si la migración aún no está aplicada.

import type { SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, sb } from '../lib/supabase';
import {
  isMissingRelationError,
  isTableMissingInSupabase,
  markTableAsMissingInSupabase,
} from './tableAvailability';
import {
  getPumCaseOverrides,
  setPumCaseOverrides,
  type PumCaseOverride,
} from '../components/simulator/pumLab/cases';

const TABLE = 'pum_lab_case_overrides';
const LOCAL_KEY = 'electrodx_pum_case_overrides_v1';

interface OverrideRow {
  case_id: string;
  data: PumCaseOverride;
  updated_at?: string;
  updated_by?: string | null;
}

// La tabla no está en los tipos generados; usamos el cliente sin tipar para esta consulta.
const db = sb as unknown as SupabaseClient;

let loadPromise: Promise<Record<string, PumCaseOverride>> | null = null;

function readLocal(): Record<string, PumCaseOverride> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeLocal(map: Record<string, PumCaseOverride>): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
  } catch {
    // almacenamiento lleno o bloqueado: no es crítico
  }
}

export type PumOverrideStorage = 'supabase' | 'local';

export function pumOverrideStorage(): PumOverrideStorage {
  return !isSupabaseConfigured || isTableMissingInSupabase(TABLE) ? 'local' : 'supabase';
}

async function fetchOverrides(): Promise<Record<string, PumCaseOverride>> {
  if (pumOverrideStorage() === 'local') return readLocal();
  try {
    const { data, error, status } = await db.from(TABLE).select('case_id, data');
    if (isMissingRelationError(error, status)) {
      markTableAsMissingInSupabase(TABLE);
      return readLocal();
    }
    if (error) throw error;
    const map: Record<string, PumCaseOverride> = {};
    for (const row of (data ?? []) as OverrideRow[]) {
      if (row?.case_id && row.data && typeof row.data === 'object') map[row.case_id] = row.data;
    }
    return map;
  } catch (err) {
    console.warn('[pumLabCaseService] No se pudieron leer los ajustes del laboratorio PUM:', err);
    return readLocal();
  }
}

/** Carga (una vez por sesión) los ajustes docentes y los aplica al motor del laboratorio. */
export function ensurePumCaseOverridesLoaded(force = false): Promise<Record<string, PumCaseOverride>> {
  if (!loadPromise || force) {
    loadPromise = fetchOverrides().then((map) => {
      setPumCaseOverrides(map);
      return map;
    });
  }
  return loadPromise;
}

export async function savePumCaseOverride(caseId: string, override: PumCaseOverride): Promise<PumOverrideStorage> {
  const next = { ...getPumCaseOverrides(), [caseId]: override };
  let storage = pumOverrideStorage();

  if (storage === 'supabase') {
    const { error, status } = await db
      .from(TABLE)
      .upsert({ case_id: caseId, data: override, updated_at: new Date().toISOString() }, { onConflict: 'case_id' });
    if (isMissingRelationError(error, status)) {
      markTableAsMissingInSupabase(TABLE);
      storage = 'local';
    } else if (error) {
      throw new Error(error.message || 'No se pudo guardar el caso.');
    }
  }

  if (storage === 'local') writeLocal(next);
  setPumCaseOverrides(next);
  loadPromise = Promise.resolve(next);
  return storage;
}

export async function resetPumCaseOverride(caseId: string): Promise<void> {
  const next = { ...getPumCaseOverrides() };
  delete next[caseId];

  if (pumOverrideStorage() === 'supabase') {
    const { error, status } = await db.from(TABLE).delete().eq('case_id', caseId);
    if (isMissingRelationError(error, status)) {
      markTableAsMissingInSupabase(TABLE);
    } else if (error) {
      throw new Error(error.message || 'No se pudo restaurar el caso.');
    }
  }
  if (pumOverrideStorage() === 'local') writeLocal(next);
  setPumCaseOverrides(next);
  loadPromise = Promise.resolve(next);
}

