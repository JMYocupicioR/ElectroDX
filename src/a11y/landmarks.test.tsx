import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SkipLink } from '../components/a11y/SkipLink';
import { AccessibleModal } from '../components/a11y/AccessibleModal';
import { StudentPortalTabBar } from '../components/student/StudentPortalTabBar';

describe('accessibility landmarks and dialogs', () => {
  it('exposes a skip link to the main landmark', () => {
    const html = renderToStaticMarkup(<SkipLink />);
    expect(html).toContain('contenido-principal');
    expect(html).toContain('Saltar al contenido principal');
  });

  it('renders dialogs with modal semantics', () => {
    const html = renderToStaticMarkup(
      <AccessibleModal open title="Constancia" onClose={() => undefined}>
        <p>Folio</p>
      </AccessibleModal>
    );
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
  });

  it('exposes a tablist for the student portal', () => {
    const html = renderToStaticMarkup(
      <StudentPortalTabBar activeTab="summary" onSelect={() => undefined} counts={{}} />
    );
    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tab"');
  });
});
