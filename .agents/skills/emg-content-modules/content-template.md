# Topic Templates

Copy and adapt. Replace placeholders. Remove optional blocks not needed.

## Leaf topic (lesson with content)

```typescript
{
  id: 'topic-slug',
  title: 'Título de la lección',
  titleEn: 'Lesson title in English',
  content: `Primer párrafo de introducción.

**Sección con negrita:** texto explicativo con valores como 4.2 ms y 49–65 m/s.

• Punto de lista uno
• Punto de lista dos

| Parámetro | Normal | Patológico |
|-----------|--------|------------|
| Latencia | 2.5–4.2 ms | >4.2 ms |
| Velocidad | 49–65 m/s | <49 m/s |

Más detalle en [Kimura (Oxford)](https://global.oup.com/academic/product/electrodiagnosis-in-diseases-of-nerve-and-muscle-9780199738687).`,
  contentEn: `Optional English body...`,
  clinicalPearls: [
    'Perla clínica: adapta el protocolo a la pregunta clínica.',
    'Segunda perla si aplica.',
  ],
  clinicalPearlsEn: [
    'Clinical pearl in English.',
  ],
  keyPoints: [
    'Punto clave uno.',
    'Punto clave dos.',
  ],
  keyPointsEn: [
    'Key point in English.',
  ],
  youtubeUrls: [
    { title: 'Video educativo', videoId: 'dPHnBPXRQxc' },
  ],
  tags: ['neuroconducción', 'valores normales'],
  keyTerms: ['velocidad de conducción', 'latencia distal'],
},
```

## Container topic (section with children)

```typescript
{
  id: 'section-slug',
  title: 'Nombre de la sección',
  titleEn: 'Section name in English',
  description: 'Breve descripción para el índice del módulo',
  descriptionEn: 'Short index description in English',
  children: [
  // leaf or nested container topics here
  ],
},
```

## Nested container (3+ levels)

```typescript
{
  id: 'level-1',
  title: 'Nivel 1',
  children: [
    {
      id: 'level-2',
      title: 'Nivel 2',
      children: [
        {
          id: 'level-3-leaf',
          title: 'Lección hoja',
          content: `Contenido de la lección...`,
        },
      ],
    },
  ],
},
```

URL for nested example: `/modulo/{moduleId}/level-1/level-2/level-3-leaf`
