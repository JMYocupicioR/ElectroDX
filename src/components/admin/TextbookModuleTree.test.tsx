import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_TEXTBOOK_INCLUSION } from '../../pdf/textbook/buildTextbookModel';
import { DEFAULT_CREDIT_OPTIONS } from '../../pdf/textbook/textbookOptions';
import type { Module } from '../../types/content';
import { TextbookModuleTree } from './TextbookModuleTree';

const module: Module = {
  id: 'fundamentals',
  number: 1,
  title: 'Fundamentos de Neurofisiología Clínica',
  titleEn: 'Fundamentals',
  emoji: '📘',
  description: 'Bases',
  descriptionEn: 'Bases',
  color: 'from-blue-500 to-blue-700',
  icon: 'BookOpen',
  topics: [{ id: 'history', title: 'Historia', content: 'Texto' }],
};

describe('TextbookModuleTree', () => {
  it('lists modules and chapter authors that can be turned off', () => {
    const html = renderToStaticMarkup(
      <TextbookModuleTree
        modules={[module]}
        selectedModuleIds={['fundamentals']}
        previewModuleId="fundamentals"
        contributors={[
          {
            id: 'u1',
            name: 'Ana López',
            credentials: 'M.N.',
            label: 'Ana López, M.N.',
            role: 'editor',
            topicIds: ['history'],
            moduleIds: ['fundamentals'],
          },
        ]}
        inclusion={DEFAULT_TEXTBOOK_INCLUSION}
        creditOptions={DEFAULT_CREDIT_OPTIONS}
        topicOverrides={{}}
        publishedTopics={[]}
        onToggleModule={vi.fn()}
        onPreview={vi.fn()}
        onToggleAuthor={vi.fn()}
        onChangeOverrides={vi.fn()}
      />
    );
    expect(html).toContain('Fundamentos');
    expect(html).toContain('1 autor');
  });
});
