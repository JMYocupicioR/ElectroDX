import { createElement, type ReactElement } from 'react';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Font, pdf, type DocumentProps } from '@react-pdf/renderer';
import {
  DEFAULT_COURSE_MODULES,
  DEFAULT_COURSES,
  groupModulesByCourse,
} from '../../content/courseCatalog';
import { allModules } from '../../content/modules';
import { DEFAULT_ACADEMIC_MILESTONES } from '../../services/academicScheduleService';
import { buildSyllabusBrochureModel } from './buildSyllabusBrochureModel';
import { SyllabusBrochureDocument } from './SyllabusBrochureDocument';

function registerTestFonts() {
  const file = (weight: string) =>
    resolve(process.cwd(), `node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff`);
  Font.register({
    family: 'Inter',
    fonts: [
      { src: file('400'), fontWeight: 400 },
      { src: file('600'), fontWeight: 600 },
      { src: file('700'), fontWeight: 700 },
      { src: file('800'), fontWeight: 800 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
}

describe('SyllabusBrochureDocument', () => {
  it('renders a valid multi-page PDF from the live catalog', async () => {
    const { grouped, unassigned } = groupModulesByCourse(allModules, DEFAULT_COURSES, DEFAULT_COURSE_MODULES);
    const model = buildSyllabusBrochureModel({
      grouped,
      unassigned,
      siteUrl: 'https://electro-dx.vercel.app',
      milestones: DEFAULT_ACADEMIC_MILESTONES,
    });
    registerTestFonts();
    const document = createElement(SyllabusBrochureDocument, { model }) as unknown as ReactElement<DocumentProps>;
    const blob = await pdf(document).toBlob();
    const bytes = Buffer.from(await blob.arrayBuffer());
    expect(bytes.subarray(0, 4).toString()).toBe('%PDF');
    expect(bytes.byteLength).toBeGreaterThan(20_000);

    const outDir = mkdtempSync(join(tmpdir(), 'electrodx-brochure-'));
    const outPath = join(outDir, 'ElectroDx-Temario-Diplomado.pdf');
    writeFileSync(outPath, bytes);
    const latin = bytes.toString('latin1');
    const pageCount = (latin.match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
    expect(pageCount).toBeGreaterThanOrEqual(8);
    expect(outPath.endsWith('.pdf')).toBe(true);
  }, 60_000);
});
