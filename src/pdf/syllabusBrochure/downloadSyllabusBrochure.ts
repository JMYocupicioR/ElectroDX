import { createElement, type ReactElement } from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import type { GroupedSyllabusCourse } from '../../content/courseCatalog';
import type { AcademicMilestone } from '../../types/academicGradebook';
import type { Module } from '../../types/content';
import { buildSyllabusBrochureModel } from './buildSyllabusBrochureModel';

const FALLBACK_SITE = 'https://electro-dx.vercel.app';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function downloadSyllabusBrochure(input: {
  grouped: GroupedSyllabusCourse[];
  unassigned: Module[];
  milestones?: AcademicMilestone[];
}): Promise<void> {
  const siteUrl = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : FALLBACK_SITE;

  let qrDataUrl: string | undefined;
  try {
    const QRCode = (await import('qrcode')).default;
    qrDataUrl = await QRCode.toDataURL(`${siteUrl.replace(/\/+$/, '')}/auth/registro`, {
      margin: 1,
      width: 280,
      color: { dark: '#0b1329', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });
  } catch {
    qrDataUrl = undefined;
  }

  const {
    getAcademicMilestones,
    pickAuthoritativeMilestones,
    readStoredCustomMilestones,
    usableAdminSchedule,
  } = await import('../../services/academicScheduleService');

  let milestones = usableAdminSchedule(input.milestones ?? []);
  const stored = readStoredCustomMilestones();
  milestones = pickAuthoritativeMilestones(milestones, stored);

  try {
    const fetched = usableAdminSchedule(await getAcademicMilestones());
    milestones = pickAuthoritativeMilestones(fetched, milestones);
  } catch (error) {
    console.warn('[downloadSyllabusBrochure] No se pudieron leer los cortes del calendario:', error);
  }

  const model = buildSyllabusBrochureModel({
    grouped: input.grouped,
    unassigned: input.unassigned,
    siteUrl,
    qrDataUrl,
    milestones,
  });

  const [{ pdf }, { SyllabusBrochureDocument }, { registerBrochureFonts }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./SyllabusBrochureDocument'),
    import('./fonts'),
  ]);

  registerBrochureFonts();
  const document = createElement(SyllabusBrochureDocument, { model }) as unknown as ReactElement<DocumentProps>;
  const blob = await pdf(document).toBlob();
  triggerDownload(blob, 'ElectroDx-Temario-Diplomado.pdf');
}
