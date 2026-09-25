import { describe, expect, it } from 'vitest';
import { DEFAULT_TEXTBOOK_THEME, resolveTextbookTheme, textbookFont, themeToCssVars } from './textbookTheme';

describe('resolveTextbookTheme', () => {
  it('fills defaults and clamps out-of-range sizes', () => {
    const theme = resolveTextbookTheme({
      bodyPt: 40,
      lineHeight: 0.2,
      fontId: 'not-a-font' as never,
    });
    expect(theme.bodyPt).toBe(14);
    expect(theme.lineHeight).toBe(1.2);
    expect(theme.fontId).toBe(DEFAULT_TEXTBOOK_THEME.fontId);
    expect(theme.coverTitlePt).toBe(DEFAULT_TEXTBOOK_THEME.coverTitlePt);
  });

  it('exposes CSS variables for the chosen typeface', () => {
    const vars = themeToCssVars(resolveTextbookTheme({ fontId: 'calibri', bodyPt: 12 }));
    expect(vars['--book-font']).toContain('Calibri');
    expect(vars['--book-body']).toBe('12pt');
    expect(textbookFont('times').word).toBe('Times New Roman');
  });
});
