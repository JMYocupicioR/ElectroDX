import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { TextbookDocument } from './TextbookDocument';
import type { TextbookModel } from './buildTextbookModel';
import type { TextbookTheme } from './textbookTheme';
import { DEFAULT_TEXTBOOK_THEME } from './textbookTheme';
import { inlineImagesInElement, type FailedBookImage } from './inlineBookImages';
import './textbookPrint.css';

export const TEXTBOOK_PRINT_ROOT_ID = 'textbook-print-root';

export interface TextbookPrintResult {
  paginated: boolean;
  pages?: number;
  images: { inlined: number; failed: FailedBookImage[] };
  fallbackReason?: string;
}

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function collectStylesheets(): Array<string | Record<string, string>> {
  const sheets: Array<string | Record<string, string>> = [];
  for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
    const href = (link as HTMLLinkElement).href;
    if (href) sheets.push(href);
  }
  for (const style of document.querySelectorAll('style')) {
    const css = style.textContent?.trim();
    if (css) sheets.push({ [window.location.href]: css });
  }
  return sheets;
}

async function paginateWithPagedJs(root: HTMLElement): Promise<{ total: number }> {
  const { Previewer } = await import('pagedjs');
  const sheet = root.querySelector('.book-sheet');
  if (!(sheet instanceof HTMLElement)) {
    throw new Error('No se encontró el documento del libro');
  }
  const html = sheet.outerHTML;
  const holder = document.createElement('div');
  holder.className = 'book-paged-holder';
  sheet.replaceWith(holder);
  const previewer = new Previewer();
  const flow = await previewer.preview(html, collectStylesheets(), holder);
  holder.querySelector('.book-sheet')?.classList.add('book-paginated');
  holder.querySelector('.book-sheet')?.classList.remove('book-toc--plain');
  const total = typeof flow.total === 'number' ? flow.total : 0;
  return { total };
}

export async function runTextbookPrint(root: HTMLElement): Promise<TextbookPrintResult> {
  await waitForPaint();
  const images = await inlineImagesInElement(root);

  try {
    const flow = await paginateWithPagedJs(root);
    return { paginated: true, pages: flow.total, images };
  } catch (error) {
    const fallbackReason = error instanceof Error ? error.message : 'No se pudo paginar';
    root.querySelector('.book-sheet')?.classList.add('book-toc--plain');
    return { paginated: false, images, fallbackReason };
  }
}

export function openTextbookPrintDialog() {
  window.print();
}

export interface OpenTextbookOverlayOptions {
  model: TextbookModel;
  theme?: TextbookTheme;
  onClose: () => void;
  onResult?: (result: TextbookPrintResult) => void;
}

function toolbarMessage(busy: boolean, result: TextbookPrintResult | null): string {
  if (busy) return 'Preparando libro: incrustando figuras y paginando…';
  if (result?.paginated) return `Listo para imprimir · ${result.pages ?? ''} páginas`;
  if (result?.fallbackReason) {
    return `Paginación no disponible (${result.fallbackReason}). Se usará la impresión del navegador.`;
  }
  return 'Libro listo';
}

function renderToolbar(
  host: HTMLElement,
  busy: boolean,
  result: TextbookPrintResult | null,
  onClose: () => void
) {
  const failed = result?.images.failed.length ?? 0;
  host.replaceChildren();

  const status = document.createElement('div');
  status.className = 'text-sm';
  status.textContent = `${toolbarMessage(busy, result)}${failed ? ` · ${failed} figuras omitidas` : ''}`;

  const actions = document.createElement('div');
  actions.className = 'flex gap-2';

  const printBtn = document.createElement('button');
  printBtn.type = 'button';
  printBtn.disabled = busy;
  printBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-semibold disabled:opacity-50';
  printBtn.textContent = busy ? 'Preparando…' : 'Imprimir / Guardar PDF';
  printBtn.addEventListener('click', () => openTextbookPrintDialog());

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-semibold';
  closeBtn.textContent = 'Cerrar';
  closeBtn.addEventListener('click', onClose);

  actions.append(printBtn, closeBtn);
  host.append(status, actions);
}

export function openTextbookPrintOverlay(options: OpenTextbookOverlayOptions): () => void {
  const overlay = document.createElement('div');
  overlay.id = TEXTBOOK_PRINT_ROOT_ID;
  overlay.className = 'textbook-print-root';

  const toolbar = document.createElement('div');
  toolbar.className = 'textbook-print-toolbar';
  const sheet = document.createElement('div');
  overlay.append(toolbar, sheet);
  document.body.appendChild(overlay);

  const sheetRoot = createRoot(sheet);
  sheetRoot.render(createElement(TextbookDocument, {
    model: options.model,
    theme: options.theme ?? DEFAULT_TEXTBOOK_THEME,
  }));
  renderToolbar(toolbar, true, null, options.onClose);

  let cancelled = false;
  const timer = window.setTimeout(() => {
    void runTextbookPrint(overlay).then((result) => {
      if (cancelled) return;
      renderToolbar(toolbar, false, result, options.onClose);
      options.onResult?.(result);
      openTextbookPrintDialog();
    });
  }, 80);

  return () => {
    cancelled = true;
    window.clearTimeout(timer);
    sheetRoot.unmount();
    overlay.remove();
  };
}
