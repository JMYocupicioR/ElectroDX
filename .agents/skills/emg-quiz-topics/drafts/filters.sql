-- ============================================================================
-- NeuroSAFE quiz revision (NO toca published_quizzes ni quiz_attempts)
-- Topic: filters (Module: fundamentals)
-- Generated at: 2026-11-16T20:12:37.800Z
-- Autor: jmyocupicior@gmail.com. Estado: draft, hasta aprobación humana.
-- ============================================================================
INSERT INTO public.content_revisions (
  target_topic_id, module_id, action, payload, status, author_id
)
SELECT
  'filters',
  'fundamentals',
  'update',
  $payload${"title":"Evaluación: Filtros: pasa-bajos, pasa-altos, notch","revisionType":"quiz","quizTopicId":"filters","moduleId":"fundamentals","passScore":70,"maxAttempts":null,"shuffleQuestions":true,"shuffleOptions":true,"questions":[{"id":"flt-q1","sortOrder":0,"type":"single","difficulty":"basic","stem":"¿Por qué es indispensable mantener los filtros estándar del equipo y evitar usar por rutina el filtro Notch (50/60 Hz) en el electrodiagnóstico?","options":[{"id":"flt-q1-a","text":"Porque modificar los filtros o activar el filtro Notch distorsiona la amplitud, duración y latencia reales del potencial, pudiendo causar diagnósticos erróneos.","isCorrect":true},{"id":"flt-q1-b","text":"Porque los filtros sirven únicamente para cambiar el volumen del altavoz sin afectar la forma de la onda en pantalla.","isCorrect":false},{"id":"flt-q1-c","text":"Porque el filtro Notch aumenta el riesgo de dar un choque eléctrico más fuerte con el estimulador.","isCorrect":false},{"id":"flt-q1-d","text":"Porque apagar todos los filtros siempre produce una línea base perfectamente plana y sin artefactos.","isCorrect":false}],"explanation":"Los filtros pasa-altos y pasa-bajos delimitan la ventana donde viven las señales reales del nervio y del músculo. Si el operador altera los filtros o enciende el filtro Notch en lugar de corregir primero la limpieza de la piel y la tierra, el equipo recorta partes reales de la señal biológica, alterando amplitudes y latencias respecto a los valores normales de referencia.\n\n📚 Referencia: Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders: Clinical-Electrophysiologic Correlations (4th ed.). Elsevier (2021).","citations":[{"authors":"Preston DC, Shapiro BE","title":"Electromyography and Neuromuscular Disorders: Clinical-Electrophysiologic Correlations","journal":"Elsevier","year":2021,"url":"https://www.elsevier.com/books/electromyography-and-neuromuscular-disorders/preston/978-0-323-66180-5"}]}],"examQuestions":[]}$payload$::jsonb,
  'draft',
  (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.content_revisions r
  WHERE r.target_topic_id = 'filters'
    AND r.module_id = 'fundamentals'
    AND r.status = 'draft'
    AND r.payload->>'revisionType' = 'quiz'
    AND r.author_id = (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
);
