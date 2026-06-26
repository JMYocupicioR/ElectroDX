# Module Template

## New module file

File: `src/content/modules/module-14-short-name.ts`

```typescript
import { Module } from '../../types/content';

export const module14: Module = {
  id: 'short-name',
  number: 14,
  title: 'Título del módulo',
  titleEn: 'Module title in English',
  emoji: '📚',
  description: 'Descripción para landing y sidebar',
  descriptionEn: 'Description for landing and sidebar',
  color: 'from-blue-500 to-blue-700',
  icon: 'BookOpen',
  topics: [
    {
      id: 'first-section',
      title: 'Primera sección',
      titleEn: 'First section',
      description: 'Resumen de la sección',
      children: [
        {
          id: 'first-lesson',
          title: 'Primera lección',
          titleEn: 'First lesson',
          content: `Contenido inicial del módulo...`,
          keyPoints: ['Punto clave de la lección.'],
        },
      ],
    },
  ],
};
```

## Register in index.ts

```typescript
import { module14 } from './module-14-short-name';

export const allModules: Module[] = [
  module01,
  // ...
  module13,
  module14,
];
```

## Optional references block

In `src/content/topicReferences.ts`:

```typescript
'short-name': {
  'first-section': [
    {
      authors: 'Preston DC, Shapiro BE',
      title: 'Electromyography and Neuromuscular Disorders',
      journal: 'Elsevier',
      year: 2021,
      url: 'https://www.elsevier.com/books/electromyography-and-neuromuscular-disorders/preston/978-0-323-66180-5',
    },
  ],
  '_default': [
  ],
},
```

## Split module (when topics grow large)

```typescript
// module-14-short-name-part1.ts
import { Topic } from '../../types/content';

export const sectionA: Topic = {
  id: 'section-a',
  title: 'Sección A',
  children: [ /* ... */ ],
};

// module-14-short-name.ts
import { Module } from '../../types/content';
import { sectionA } from './module-14-short-name-part1';

export const module14: Module = {
  id: 'short-name',
  number: 14,
  // ...metadata...
  topics: [sectionA],
};
```
