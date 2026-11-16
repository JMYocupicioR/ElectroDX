-- ============================================================================
-- NeuroSAFE quiz revision (NO toca published_quizzes ni quiz_attempts)
-- Topic: electricity-basics (Module: fundamentals)
-- Generated at: 2026-11-16T20:13:33.477Z
-- Autor: jmyocupicior@gmail.com. Estado: draft, hasta aprobación humana.
-- ============================================================================
INSERT INTO public.content_revisions (
  target_topic_id, module_id, action, payload, status, author_id
)
SELECT
  'electricity-basics',
  'fundamentals',
  'update',
  $payload${"title":"Evaluación: Bases de Electricidad y Electrónica","revisionType":"quiz","quizTopicId":"electricity-basics","moduleId":"fundamentals","passScore":70,"maxAttempts":null,"shuffleQuestions":true,"shuffleOptions":true,"questions":[{"id":"eb-q1","sortOrder":0,"type":"single","difficulty":"basic","stem":"¿Por qué es indispensable comprender las bases de electricidad y electrónica antes de realizar o interpretar un estudio de electrodiagnóstico?","options":[{"id":"eb-q1-a","text":"Porque permite distinguir una verdadera lesión del nervio o músculo de un artefacto técnico (como ruido ambiental, alta impedancia en la piel o filtros mal ajustados).","isCorrect":true},{"id":"eb-q1-b","text":"Porque el médico debe reparar manualmente los circuitos internos del equipo antes de atender a cada paciente.","isCorrect":false},{"id":"eb-q1-c","text":"Porque la electricidad de los cables y la de los nervios humanos viajan exactamente a la misma velocidad y por medio de electrones.","isCorrect":false},{"id":"eb-q1-d","text":"Porque los ajustes electrónicos del equipo nunca modifican la amplitud ni la latencia de los trazos registrados.","isCorrect":false}],"explanation":"En electrodiagnóstico las señales del cuerpo son tan pequeñas (milivoltios y microvoltios) que cualquier descuido técnico —piel sucia con alta impedancia, electrodos mal colocados o filtros incorrectos— puede imitar una enfermedad neuromuscular. Dominar estas bases orienta al alumno desde el primer día para no confundir un artefacto técnico con una patología real del paciente.\n\n📚 Referencia: Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders: Clinical-Electrophysiologic Correlations (4th ed.). Elsevier (2021).","citations":[{"authors":"Preston DC, Shapiro BE","title":"Electromyography and Neuromuscular Disorders: Clinical-Electrophysiologic Correlations","journal":"Elsevier","year":2021,"url":"https://www.elsevier.com/books/electromyography-and-neuromuscular-disorders/preston/978-0-323-66180-5"}]}],"examQuestions":[]}$payload$::jsonb,
  'draft',
  (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.content_revisions r
  WHERE r.target_topic_id = 'electricity-basics'
    AND r.module_id = 'fundamentals'
    AND r.status = 'draft'
    AND r.payload->>'revisionType' = 'quiz'
    AND r.author_id = (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
);
