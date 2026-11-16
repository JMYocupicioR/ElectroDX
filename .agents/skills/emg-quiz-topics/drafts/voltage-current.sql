-- ============================================================================
-- NeuroSAFE quiz revision (NO toca published_quizzes ni quiz_attempts)
-- Topic: voltage-current (Module: fundamentals)
-- Generated at: 2026-11-16T20:12:31.077Z
-- Autor: jmyocupicior@gmail.com. Estado: draft, hasta aprobación humana.
-- ============================================================================
INSERT INTO public.content_revisions (
  target_topic_id, module_id, action, payload, status, author_id
)
SELECT
  'voltage-current',
  'fundamentals',
  'update',
  $payload${"title":"Evaluación: Principios de electricidad: voltaje, corriente, resistencia","revisionType":"quiz","quizTopicId":"voltage-current","moduleId":"fundamentals","passScore":70,"maxAttempts":null,"shuffleQuestions":true,"shuffleOptions":true,"questions":[{"id":"vc-q1","sortOrder":0,"type":"single","difficulty":"basic","stem":"¿Por qué es fundamental en el electrodiagnóstico saber que los potenciales sensitivos (SNAP, medidos en microvoltios) son hasta 1,000 veces más pequeños que los motores (CMAP, medidos en milivoltios)?","options":[{"id":"vc-q1-a","text":"Porque al ser tan pequeños, los estudios sensitivos se contaminan fácilmente con el ruido eléctrico y requieren limpiar bien la piel y promediar varias respuestas.","isCorrect":true},{"id":"vc-q1-b","text":"Porque los nervios sensitivos no conducen electricidad mediante iones, sino únicamente mediante electrones.","isCorrect":false},{"id":"vc-q1-c","text":"Porque los potenciales sensitivos solo pueden registrarse insertando una aguja dentro del músculo.","isCorrect":false},{"id":"vc-q1-d","text":"Porque cuanto más pequeño es el potencial, mayor intensidad de corriente dolorosa se debe aplicar siempre al paciente.","isCorrect":false}],"explanation":"En el electrodiagnóstico trabajamos con señales bioeléctricas diminutas: un potencial motor (CMAP) mide milivoltios (mV), mientras que un potencial sensitivo (SNAP) mide apenas microvoltios (µV, mil veces menor). Comprender esta diferencia orienta al médico principiante a extremar el cuidado técnico en los estudios sensitivos (reducir la resistencia de la piel con alcohol y usar promediación) para no confundir un nervio sano con una respuesta «ausente» por ruido.\n\n📚 Referencia: Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders: Clinical-Electrophysiologic Correlations (4th ed.). Elsevier (2021).","citations":[{"authors":"Preston DC, Shapiro BE","title":"Electromyography and Neuromuscular Disorders: Clinical-Electrophysiologic Correlations","journal":"Elsevier","year":2021,"url":"https://www.elsevier.com/books/electromyography-and-neuromuscular-disorders/preston/978-0-323-66180-5"}]}],"examQuestions":[]}$payload$::jsonb,
  'draft',
  (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.content_revisions r
  WHERE r.target_topic_id = 'voltage-current'
    AND r.module_id = 'fundamentals'
    AND r.status = 'draft'
    AND r.payload->>'revisionType' = 'quiz'
    AND r.author_id = (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
);
