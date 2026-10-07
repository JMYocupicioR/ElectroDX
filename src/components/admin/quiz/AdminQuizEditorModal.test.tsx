import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminQuizEditorModal } from './AdminQuizEditorModal';

vi.mock('./AdminQuizEditor', () => ({
  AdminQuizEditor: ({ initialTopicId }: { initialTopicId?: string }) => (
    <div data-testid="mock-quiz-editor">
      Editor Mock: {initialTopicId || 'sin tema'}
    </div>
  ),
}));

vi.mock('./AdminQuizCatalog', () => ({
  AdminQuizCatalog: () => (
    <div data-testid="mock-quiz-catalog">
      Catálogo Mock: Todos los temas con y sin quiz
    </div>
  ),
}));

describe('AdminQuizEditorModal', () => {
  it('no renderiza nada cuando isOpen es false', () => {
    const html = renderToStaticMarkup(
      <AdminQuizEditorModal
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    expect(html).toBe('');
  });

  it('renderiza el catálogo de temas con y sin quiz cuando isOpen es true y no hay tema inicial', () => {
    const html = renderToStaticMarkup(
      <AdminQuizEditorModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(html).toContain('Temas del Diplomado: Con y Sin Quiz');
    expect(html).toContain('Catálogo Mock: Todos los temas con y sin quiz');
  });

  it('renderiza directamente el editor cuando se especifica initialTopicId', () => {
    const html = renderToStaticMarkup(
      <AdminQuizEditorModal
        isOpen={true}
        initialTopicId="cts-anatomy"
        initialModuleId="mononeuropathies"
        onClose={vi.fn()}
      />
    );
    expect(html).toContain('Editor de Quiz del Tema');
    expect(html).toContain('Editor Mock: cts-anatomy');
  });
});
