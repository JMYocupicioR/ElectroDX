import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PullToRefresh, isPageAtTop, isExcludedElement } from './PullToRefresh';

describe('PullToRefresh Component and Helpers', () => {
  describe('isPageAtTop helper in SSR / node environment', () => {
    it('handles SSR safely when window is undefined', () => {
      // In node environment, window is undefined by default
      expect(isPageAtTop(null)).toBe(true);
    });

    it('returns true when simulated window scroll is at top (0)', () => {
      const originalWindow = global.window;
      try {
        (global as any).window = { scrollY: 0, pageYOffset: 0 };
        (global as any).document = {
          documentElement: { scrollTop: 0 },
          body: { scrollTop: 0 },
          getElementById: () => null,
        };
        expect(isPageAtTop(null)).toBe(true);
      } finally {
        (global as any).window = originalWindow;
        delete (global as any).document;
      }
    });

    it('returns false when window is scrolled down', () => {
      const originalWindow = global.window;
      try {
        (global as any).window = { scrollY: 150 };
        (global as any).document = {
          documentElement: { scrollTop: 150 },
          body: { scrollTop: 150 },
          getElementById: () => null,
        };
        expect(isPageAtTop(null)).toBe(false);
      } finally {
        (global as any).window = originalWindow;
        delete (global as any).document;
      }
    });

    it('returns false when simulated #root container is scrolled down in standalone mode', () => {
      const originalWindow = global.window;
      try {
        (global as any).window = { scrollY: 0 };
        (global as any).document = {
          documentElement: { scrollTop: 0 },
          body: { scrollTop: 0 },
          getElementById: (id: string) => (id === 'root' ? { scrollTop: 80 } : null),
        };
        expect(isPageAtTop(null)).toBe(false);
      } finally {
        (global as any).window = originalWindow;
        delete (global as any).document;
      }
    });
  });

  describe('isExcludedElement helper', () => {
    it('returns false for null or undefined target', () => {
      expect(isExcludedElement(null)).toBe(false);
      expect(isExcludedElement(undefined)).toBe(false);
    });

    it('detects canvas, inputs, dialogs and interactive elements as excluded', () => {
      const simulatedCanvas = {
        closest: (selector: string) => (selector.includes('canvas') ? {} : null),
      };
      // Mock instanceof HTMLElement check
      Object.setPrototypeOf(simulatedCanvas, { constructor: { name: 'HTMLElement' } });

      const simulatedInput = {
        closest: (selector: string) => (selector.includes('input') ? {} : null),
      };

      const simulatedDialog = {
        closest: (selector: string) => (selector.includes('dialog') ? {} : null),
      };

      expect(isExcludedElement(simulatedCanvas as any)).toBe(true);
      expect(isExcludedElement(simulatedInput as any)).toBe(true);
      expect(isExcludedElement(simulatedDialog as any)).toBe(true);
    });

    it('returns false when element does not match exclusion selectors', () => {
      const simulatedDiv = {
        closest: () => null,
      };
      expect(isExcludedElement(simulatedDiv as any)).toBe(false);
    });
  });

  describe('Rendering', () => {
    it('renders null initially on SSR when idle with 0 pull distance', () => {
      const html = renderToStaticMarkup(<PullToRefresh />);
      expect(html).toBe('');
    });

    it('renders with disabled prop without throwing', () => {
      const html = renderToStaticMarkup(<PullToRefresh disabled />);
      expect(html).toBe('');
    });
  });
});
