# Template RehabiQuiz

Copia de referencia de los archivos que definen **cómo funciona la app**: mostrar preguntas, personalizar exámenes, calificar y guardar resultados.

Esta carpeta no es código que se ejecuta. Es un snapshot para reconstruir, documentar o clonar el motor de quizzes.

## Cómo usar esta carpeta

1. Lee `HOW_IT_WORKS.md` para el mapa completo del sistema.
2. Abre `source/` para el código real (copias 1:1 de los archivos originales).
3. Usa `skills/` cuando un agente deba implementar, revisar o clonar estos flujos.

## Mapa rápido

| Quieres entender... | Empieza aquí |
|---|---|
| Arquitectura general (islas → temas → preguntas → exámenes) | `HOW_IT_WORKS.md` + `skills/rehabiquiz-architecture/SKILL.md` |
| Cómo se muestran las preguntas de un módulo | `source/admin_panel/src/pages/user/UserIslandQuiz.tsx` + `skills/rehabiquiz-question-display/SKILL.md` |
| Cómo se personaliza un examen | `source/admin_panel/src/pages/user/UserIslandConfig.tsx` + `skills/rehabiquiz-exam-engine/SKILL.md` |
| Cómo se califica y se guarda | `source/admin_panel/src/pages/user/UserExamSession.tsx` + `source/admin_panel/src/hooks/useExamAttempt.ts` |
| Esquema de base de datos | `source/supabase/migrations/` y `source/admin_panel/migrations/applied/` |
| Formato de una pregunta | `source/admin_panel/src/types/database.ts` + `source/GOALS.md` |

## Estructura

```
Template/
├── README.md
├── HOW_IT_WORKS.md
├── source/          # Copias de archivos de producción
└── skills/          # Skills de dominio + skills de Supabase
```
