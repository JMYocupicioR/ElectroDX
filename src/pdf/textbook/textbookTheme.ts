export type TextbookFontId =
  | 'georgia'
  | 'times'
  | 'garamond'
  | 'palatino'
  | 'cambria'
  | 'calibri'
  | 'inter'
  | 'arial';

export type TextbookPageSize = 'A4' | 'Letter';

export interface TextbookTheme {
  fontId: TextbookFontId;
  coverTitlePt: number;
  chapterTitlePt: number;
  lessonTitlePt: number;
  subtitlePt: number;
  bodyPt: number;
  lineHeight: number;
  paragraphGapEm: number;
  lessonGapEm: number;
  marginTopMm: number;
  marginSideMm: number;
  marginBottomMm: number;
  pageSize: TextbookPageSize;
}

export interface TextbookFontOption {
  id: TextbookFontId;
  label: string;
  css: string;
  word: string;
}

export const TEXTBOOK_FONTS: TextbookFontOption[] = [
  { id: 'georgia', label: 'Georgia (editorial)', css: "Georgia, 'Times New Roman', serif", word: 'Georgia' },
  { id: 'times', label: 'Times New Roman', css: "'Times New Roman', Times, serif", word: 'Times New Roman' },
  { id: 'garamond', label: 'Garamond', css: "Garamond, 'Palatino Linotype', serif", word: 'Garamond' },
  { id: 'palatino', label: 'Palatino', css: "Palatino, 'Palatino Linotype', 'Book Antiqua', serif", word: 'Palatino Linotype' },
  { id: 'cambria', label: 'Cambria', css: "Cambria, Georgia, serif", word: 'Cambria' },
  { id: 'calibri', label: 'Calibri', css: "Calibri, 'Segoe UI', sans-serif", word: 'Calibri' },
  { id: 'inter', label: 'Inter (pantalla)', css: 'Inter, system-ui, sans-serif', word: 'Calibri' },
  { id: 'arial', label: 'Arial', css: 'Arial, Helvetica, sans-serif', word: 'Arial' },
];

export const DEFAULT_TEXTBOOK_THEME: TextbookTheme = {
  fontId: 'georgia',
  coverTitlePt: 22,
  chapterTitlePt: 18,
  lessonTitlePt: 14,
  subtitlePt: 12,
  bodyPt: 11,
  lineHeight: 1.55,
  paragraphGapEm: 0.7,
  lessonGapEm: 1.4,
  marginTopMm: 18,
  marginSideMm: 16,
  marginBottomMm: 20,
  pageSize: 'A4',
};

const RANGE = {
  coverTitlePt: [16, 36],
  chapterTitlePt: [13, 28],
  lessonTitlePt: [11, 20],
  subtitlePt: [10, 16],
  bodyPt: [9, 14],
  lineHeight: [1.2, 2],
  paragraphGapEm: [0.3, 1.6],
  lessonGapEm: [0.6, 2.4],
  marginTopMm: [10, 30],
  marginSideMm: [10, 28],
  marginBottomMm: [12, 32],
} as const;

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function textbookFont(fontId: TextbookFontId): TextbookFontOption {
  return TEXTBOOK_FONTS.find((font) => font.id === fontId) ?? TEXTBOOK_FONTS[0];
}

export function resolveTextbookTheme(partial?: Partial<TextbookTheme>): TextbookTheme {
  const merged = { ...DEFAULT_TEXTBOOK_THEME, ...partial };
  const fontId = TEXTBOOK_FONTS.some((font) => font.id === merged.fontId) ? merged.fontId : DEFAULT_TEXTBOOK_THEME.fontId;
  return {
    fontId,
    coverTitlePt: clamp(merged.coverTitlePt, ...RANGE.coverTitlePt),
    chapterTitlePt: clamp(merged.chapterTitlePt, ...RANGE.chapterTitlePt),
    lessonTitlePt: clamp(merged.lessonTitlePt, ...RANGE.lessonTitlePt),
    subtitlePt: clamp(merged.subtitlePt, ...RANGE.subtitlePt),
    bodyPt: clamp(merged.bodyPt, ...RANGE.bodyPt),
    lineHeight: clamp(merged.lineHeight, ...RANGE.lineHeight),
    paragraphGapEm: clamp(merged.paragraphGapEm, ...RANGE.paragraphGapEm),
    lessonGapEm: clamp(merged.lessonGapEm, ...RANGE.lessonGapEm),
    marginTopMm: clamp(merged.marginTopMm, ...RANGE.marginTopMm),
    marginSideMm: clamp(merged.marginSideMm, ...RANGE.marginSideMm),
    marginBottomMm: clamp(merged.marginBottomMm, ...RANGE.marginBottomMm),
    pageSize: merged.pageSize === 'Letter' ? 'Letter' : 'A4',
  };
}

export function textbookPageWidthMm(pageSize: TextbookPageSize): number {
  return pageSize === 'Letter' ? 215.9 : 210;
}

export function textbookPageHeightMm(pageSize: TextbookPageSize): number {
  return pageSize === 'Letter' ? 279.4 : 297;
}

export function themeToCssVars(theme: TextbookTheme): Record<string, string> {
  const font = textbookFont(theme.fontId);
  return {
    '--book-font': font.css,
    '--book-cover-title': `${theme.coverTitlePt}pt`,
    '--book-chapter-title': `${theme.chapterTitlePt}pt`,
    '--book-lesson-title': `${theme.lessonTitlePt}pt`,
    '--book-subtitle': `${theme.subtitlePt}pt`,
    '--book-body': `${theme.bodyPt}pt`,
    '--book-line': String(theme.lineHeight),
    '--book-p-gap': `${theme.paragraphGapEm}em`,
    '--book-lesson-gap': `${theme.lessonGapEm}em`,
    '--book-margin-top': `${theme.marginTopMm}mm`,
    '--book-margin-side': `${theme.marginSideMm}mm`,
    '--book-margin-bottom': `${theme.marginBottomMm}mm`,
    '--book-page-width': `${textbookPageWidthMm(theme.pageSize)}mm`,
    '--book-page-height': `${textbookPageHeightMm(theme.pageSize)}mm`,
  };
}

export function themePageCss(theme: TextbookTheme): string {
  return `@page { size: ${theme.pageSize}; margin: ${theme.marginTopMm}mm ${theme.marginSideMm}mm ${theme.marginBottomMm}mm; }`;
}
