/** Ids de lección que quedaron en cortes antiguos tras reescribir el temario. */
export const LEGACY_TOPIC_IDS: Record<string, string> = {
  'ethical-aspects': 'ethics',
  'safety-patient': 'laboratory',
  'resting-potential': 'axonal-membrane',
  'action-potential': 'action-potential-generation',
  'nerve-structure': 'peripheral-nerve-anatomy',
  'mixed-nerve': 'mixed-conduction',
  'temperature-effects': 'temperature-effect',
  'f-waves': 'f-wave',
  'emg-electrodes': 'electrode-types',
  'insertional-activity': 'insertion-activity',
  'fibrillations-psws': 'fibrillations',
  fasciculations: 'fasciculaciones',
  'mup-parameters': 'mup-amplitude-duration',
  'repetitive-stimulation-basics': 'repetitive-stimulation',
  'myasthenia-protocol': 'myasthenia',
  'lambert-eaton-protocol': 'lems',
  'cervical-radiculopathy': 'cervical-radic',
  'lumbosacral-radiculopathy': 'lumbosacral-radic',
  'brachial-plexus-anatomy': 'brachial-plexus',
  'als-gold-coast-criteria': 'gold-coast',
  'cidp-criteria-2021': 'cidp-criteria',
  dystrophies: 'muscular-dystrophies',
  'safety-electrical': 'patient-safety',
  'qc-standards': 'aanem-ndtf',
  'report-writing-standards': 'aanem-ndtf',
};

export function canonicalTopicId(topicId: string): string {
  const id = topicId.trim();
  return LEGACY_TOPIC_IDS[id] ?? id;
}

export function canonicalTopicIds(topicIds: string[] | null | undefined): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of topicIds ?? []) {
    const id = canonicalTopicId(raw);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}
