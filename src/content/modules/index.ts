// src/content/modules/index.ts
// Central registry of all 13 learning modules

import { Module } from '../../types/content';
import { module01 } from './module-01-fundamentals';
import { module02 } from './module-02-nerve-conduction';
import { module03 } from './module-03-emg-needle';
import { module04 } from './module-04-late-responses';
import { module05 } from './module-05-repetitive-stimulation';
import { module06 } from './module-06-evoked-potentials';
import { module07 } from './module-07-special-studies';
import { module08 } from './module-08-topographic-anatomy';
import { module09 } from './module-09-pathologies';
import { module10 } from './module-10-diagnostic-criteria';
import { module11 } from './module-11-quick-reference';
import { module12 } from './module-12-bibliography';
import { module13 } from './module-13-safety-qc';

export const allModules: Module[] = [
  module01,
  module02,
  module03,
  module04,
  module05,
  module06,
  module07,
  module08,
  module09,
  module10,
  module11,
  module12,
  module13,
];

export const MODULE_ALIASES: Record<string, string> = {
  // Module 1: fundamentals
  '1': 'fundamentals',
  '01': 'fundamentals',
  'modulo-1': 'fundamentals',
  'modulo-01': 'fundamentals',
  'module-1': 'fundamentals',
  'module-01': 'fundamentals',
  'modulo-01-fundamentals': 'fundamentals',
  'module-01-fundamentals': 'fundamentals',
  '01-fundamentos': 'fundamentals',
  'fundamentos': 'fundamentals',
  'fundamentos-biofisicos': 'fundamentals',

  // Module 2: nerve-conduction
  '2': 'nerve-conduction',
  '02': 'nerve-conduction',
  'modulo-2': 'nerve-conduction',
  'modulo-02': 'nerve-conduction',
  'module-2': 'nerve-conduction',
  'module-02': 'nerve-conduction',
  'modulo-02-nerve-conduction': 'nerve-conduction',
  'module-02-nerve-conduction': 'nerve-conduction',
  'conduccion-nerviosa': 'nerve-conduction',
  'neuroconduccion': 'nerve-conduction',

  // Module 3: emg-needle
  '3': 'emg-needle',
  '03': 'emg-needle',
  'modulo-3': 'emg-needle',
  'modulo-03': 'emg-needle',
  'module-3': 'emg-needle',
  'module-03': 'emg-needle',
  'modulo-03-emg-needle': 'emg-needle',
  'module-03-emg-needle': 'emg-needle',
  'emg-aguja': 'emg-needle',
  'electromiografia-aguja': 'emg-needle',

  // Module 4: late-responses
  '4': 'late-responses',
  '04': 'late-responses',
  'modulo-4': 'late-responses',
  'modulo-04': 'late-responses',
  'module-4': 'late-responses',
  'module-04': 'late-responses',
  'modulo-04-late-responses': 'late-responses',
  'module-04-late-responses': 'late-responses',
  'respuestas-tardias': 'late-responses',

  // Module 5: repetitive-stimulation
  '5': 'repetitive-stimulation',
  '05': 'repetitive-stimulation',
  'modulo-5': 'repetitive-stimulation',
  'modulo-05': 'repetitive-stimulation',
  'module-5': 'repetitive-stimulation',
  'module-05': 'repetitive-stimulation',
  'modulo-05-repetitive-stimulation': 'repetitive-stimulation',
  'module-05-repetitive-stimulation': 'repetitive-stimulation',
  'estimulacion-repetitiva': 'repetitive-stimulation',

  // Module 6: evoked-potentials
  '6': 'evoked-potentials',
  '06': 'evoked-potentials',
  'modulo-6': 'evoked-potentials',
  'modulo-06': 'evoked-potentials',
  'module-6': 'evoked-potentials',
  'module-06': 'evoked-potentials',
  'modulo-06-evoked-potentials': 'evoked-potentials',
  'module-06-evoked-potentials': 'evoked-potentials',
  'potenciales-evocados': 'evoked-potentials',

  // Module 7: special-studies
  '7': 'special-studies',
  '07': 'special-studies',
  'modulo-7': 'special-studies',
  'modulo-07': 'special-studies',
  'module-7': 'special-studies',
  'module-07': 'special-studies',
  'modulo-07-special-studies': 'special-studies',
  'module-07-special-studies': 'special-studies',
  'estudios-especiales': 'special-studies',

  // Module 8: topographic-anatomy
  '8': 'topographic-anatomy',
  '08': 'topographic-anatomy',
  'modulo-8': 'topographic-anatomy',
  'modulo-08': 'topographic-anatomy',
  'module-8': 'topographic-anatomy',
  'module-08': 'topographic-anatomy',
  'modulo-08-topographic-anatomy': 'topographic-anatomy',
  'module-08-topographic-anatomy': 'topographic-anatomy',
  'anatomia-topografica': 'topographic-anatomy',
  'modulo-07-brachial-plexus': 'topographic-anatomy',
  'brachial-plexus': 'topographic-anatomy',

  // Module 9: pathologies
  '9': 'pathologies',
  '09': 'pathologies',
  'modulo-9': 'pathologies',
  'modulo-09': 'pathologies',
  'module-9': 'pathologies',
  'module-09': 'pathologies',
  'modulo-09-pathologies': 'pathologies',
  'module-09-pathologies': 'pathologies',
  'patologias': 'pathologies',

  // Module 10: diagnostic-criteria
  '10': 'diagnostic-criteria',
  'modulo-10': 'diagnostic-criteria',
  'module-10': 'diagnostic-criteria',
  'modulo-10-diagnostic-criteria': 'diagnostic-criteria',
  'module-10-diagnostic-criteria': 'diagnostic-criteria',
  'criterios-diagnosticos': 'diagnostic-criteria',

  // Module 11: quick-reference
  '11': 'quick-reference',
  'modulo-11': 'quick-reference',
  'module-11': 'quick-reference',
  'modulo-11-quick-reference': 'quick-reference',
  'module-11-quick-reference': 'quick-reference',
  'referencia-rapida': 'quick-reference',

  // Module 12: bibliography
  '12': 'bibliography',
  'modulo-12': 'bibliography',
  'module-12': 'bibliography',
  'modulo-12-bibliography': 'bibliography',
  'module-12-bibliography': 'bibliography',
  'bibliografia': 'bibliography',

  // Module 13: safety-qc
  '13': 'safety-qc',
  'modulo-13': 'safety-qc',
  'module-13': 'safety-qc',
  'modulo-13-safety-qc': 'safety-qc',
  'module-13-safety-qc': 'safety-qc',
  'seguridad-control-calidad': 'safety-qc',
  'seguridad': 'safety-qc',
};

export function resolveModuleId(input: string | undefined | null): string | undefined {
  if (!input) return undefined;
  const raw = input.trim().toLowerCase();

  // 1. Direct match with static module ID
  const direct = allModules.find((m) => m.id.toLowerCase() === raw);
  if (direct) return direct.id;

  // 2. Explicit alias dictionary
  if (MODULE_ALIASES[raw]) {
    return MODULE_ALIASES[raw];
  }

  // 3. Exact number match ("1", "01", 13)
  const numOnly = parseInt(raw, 10);
  if (!isNaN(numOnly) && (String(numOnly) === raw.replace(/^0+/, '') || /^\d+$/.test(raw))) {
    const byNum = allModules.find((m) => m.number === numOnly);
    if (byNum) return byNum.id;
  }

  // 4. Strip standard prefixes: modulo-, module-, mod-
  const clean = raw.replace(/^(modulo|module|mod)[-_]/, '');
  if (MODULE_ALIASES[clean]) {
    return MODULE_ALIASES[clean];
  }

  const directClean = allModules.find((m) => m.id.toLowerCase() === clean);
  if (directClean) return directClean.id;

  // 5. Extract numeric prefix if present (e.g. "01-fundamentals", "01-algo", "1-fundamentos")
  const numPrefixMatch = clean.match(/^0*(\d+)([-_](.*))?$/);
  if (numPrefixMatch) {
    const modNum = parseInt(numPrefixMatch[1], 10);
    const suffix = numPrefixMatch[3]?.trim();

    if (suffix) {
      const bySuffix = allModules.find((m) => m.id.toLowerCase() === suffix);
      if (bySuffix) return bySuffix.id;
    }

    const byNum = allModules.find((m) => m.number === modNum);
    if (byNum) return byNum.id;
  }

  // 6. Substring / keyword heuristic match against static modules
  const byKeyword = allModules.find((m) =>
    clean.includes(m.id.toLowerCase()) ||
    m.id.toLowerCase().includes(clean) ||
    m.title.toLowerCase().includes(clean)
  );
  if (byKeyword) return byKeyword.id;

  return undefined;
}

export const getModuleById = (id: string | undefined | null): Module | undefined => {
  if (!id) return undefined;
  const canonicalId = resolveModuleId(id);
  if (canonicalId) {
    const found = allModules.find((m) => m.id === canonicalId);
    if (found) return found;
  }
  return allModules.find((m) => m.id.toLowerCase() === id.trim().toLowerCase());
};

// Flatten all topics recursively for search
import { Topic, SearchResult } from '../../types/content';

function flattenTopics(
  topics: Topic[],
  moduleId: string,
  moduleTitle: string,
  parentPath: string[] = [],
  parentTitlePath: string[] = []
): SearchResult[] {
  const results: SearchResult[] = [];
  for (const topic of topics) {
    const currentPath = [...parentPath, topic.id];
    const currentTitlePath = [...parentTitlePath, topic.title];
    results.push({
      moduleId,
      moduleTitle,
      topicPath: currentPath,
      titlePath: currentTitlePath,
      title: topic.title,
      description: topic.description,
      matchType: 'title',
    });
    if (topic.children) {
      results.push(
        ...flattenTopics(topic.children, moduleId, moduleTitle, currentPath, currentTitlePath)
      );
    }
  }
  return results;
}

export const getAllSearchableTopics = (): SearchResult[] => {
  const results: SearchResult[] = [];
  for (const mod of allModules) {
    results.push(...flattenTopics(mod.topics, mod.id, mod.title));
  }
  return results;
};
