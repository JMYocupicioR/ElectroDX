// src/components/simulator/traceEngine/customTraceStore.ts
// Almacén y persistencia de trazos personalizados modelados por docentes y galería de imágenes

import { CLINICAL_PRESETS } from './defaultPresets';
import type { TraceCaseDefinition, TraceComplementaryImage, PatternScope } from './types';

const STORAGE_KEY = 'electrodx_custom_traces_v1';

export function loadCustomTraces(): TraceCaseDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error al cargar trazos personalizados:', e);
    return [];
  }
}

export function saveCustomTrace(traceDef: TraceCaseDefinition): TraceCaseDefinition {
  try {
    const current = loadCustomTraces();
    const existingIndex = current.findIndex((c) => c.id === traceDef.id);
    const updated: TraceCaseDefinition = {
      ...traceDef,
      isCustomUserCreated: true,
      createdAt: traceDef.createdAt || new Date().toISOString(),
    };

    let nextList: TraceCaseDefinition[];
    if (existingIndex >= 0) {
      nextList = [...current];
      nextList[existingIndex] = updated;
    } else {
      nextList = [updated, ...current];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    return updated;
  } catch (e) {
    console.error('Error al guardar trazo personalizado:', e);
    return traceDef;
  }
}

export function addImageToTraceCase(
  caseId: string,
  newImage: TraceComplementaryImage,
  scope: PatternScope = 'both'
): TraceCaseDefinition | null {
  const all = getAllTracesMerged();
  const target = all.find((c) => c.id === caseId);
  if (!target) return null;

  const imageWithScope: TraceComplementaryImage = {
    ...newImage,
    patternScope: newImage.patternScope || scope,
  };

  const updatedImages = [...(target.images || []), imageWithScope];

  let updatedNormal = target.normal;
  let updatedPathologic = target.pathologic;

  if (imageWithScope.patternScope === 'normal' || imageWithScope.patternScope === 'both') {
    updatedNormal = {
      ...target.normal,
      images: [...(target.normal.images || []), imageWithScope],
    };
  }

  if (target.pathologic && (imageWithScope.patternScope === 'pathologic' || imageWithScope.patternScope === 'both')) {
    updatedPathologic = {
      ...target.pathologic,
      images: [...(target.pathologic.images || []), imageWithScope],
    };
  }

  const updatedCase: TraceCaseDefinition = {
    ...target,
    normal: updatedNormal,
    pathologic: updatedPathologic,
    images: updatedImages,
  };

  return saveCustomTrace(updatedCase);
}

export function addMultipleImagesToTraceCase(
  caseId: string,
  newImages: TraceComplementaryImage[],
  scope: PatternScope = 'both'
): TraceCaseDefinition | null {
  const all = getAllTracesMerged();
  const target = all.find((c) => c.id === caseId);
  if (!target) return null;

  const imagesWithScope = newImages.map((img) => ({
    ...img,
    patternScope: img.patternScope || scope,
  }));

  const updatedImages = [...(target.images || []), ...imagesWithScope];

  let updatedNormal = target.normal;
  let updatedPathologic = target.pathologic;

  const normalFiltered = imagesWithScope.filter((img) => img.patternScope === 'normal' || img.patternScope === 'both');
  if (normalFiltered.length > 0) {
    updatedNormal = {
      ...target.normal,
      images: [...(target.normal.images || []), ...normalFiltered],
    };
  }

  const pathFiltered = imagesWithScope.filter((img) => img.patternScope === 'pathologic' || img.patternScope === 'both');
  if (target.pathologic && pathFiltered.length > 0) {
    updatedPathologic = {
      ...target.pathologic,
      images: [...(target.pathologic.images || []), ...pathFiltered],
    };
  }

  const updatedCase: TraceCaseDefinition = {
    ...target,
    normal: updatedNormal,
    pathologic: updatedPathologic,
    images: updatedImages,
  };

  return saveCustomTrace(updatedCase);
}

export function removeImageFromTraceCase(
  caseId: string,
  imageId: string
): TraceCaseDefinition | null {
  const all = getAllTracesMerged();
  const target = all.find((c) => c.id === caseId);
  if (!target) return null;

  const updatedImages = (target.images || []).filter((img) => img.id !== imageId);
  const updatedNormal = {
    ...target.normal,
    images: (target.normal.images || []).filter((img) => img.id !== imageId),
  };
  const updatedPathologic = target.pathologic
    ? {
        ...target.pathologic,
        images: (target.pathologic.images || []).filter((img) => img.id !== imageId),
      }
    : undefined;

  const updatedCase: TraceCaseDefinition = {
    ...target,
    normal: updatedNormal,
    pathologic: updatedPathologic,
    images: updatedImages,
  };

  return saveCustomTrace(updatedCase);
}

export function deleteCustomTrace(id: string): void {
  try {
    const current = loadCustomTraces();
    const filtered = current.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error al eliminar trazo personalizado:', e);
  }
}

export function getAllTracesMerged(): TraceCaseDefinition[] {
  const custom = loadCustomTraces();
  const customMap = new Map(custom.map((c) => [c.id, c]));
  const merged = CLINICAL_PRESETS.map((p) => customMap.get(p.id) || p);
  for (const c of custom) {
    if (!CLINICAL_PRESETS.some((p) => p.id === c.id)) {
      merged.push(c);
    }
  }
  return merged;
}

export function findTraceById(id: string): TraceCaseDefinition | undefined {
  const all = getAllTracesMerged();
  return all.find((t) => t.id === id);
}
