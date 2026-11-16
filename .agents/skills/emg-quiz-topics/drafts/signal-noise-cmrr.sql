-- ============================================================================
-- NeuroSAFE quiz revision (NO toca published_quizzes ni quiz_attempts)
-- Topic: signal-noise-cmrr (Module: fundamentals)
-- Generated at: 2026-11-16T20:12:44.114Z
-- Autor: jmyocupicior@gmail.com. Estado: draft, hasta aprobación humana.
-- ============================================================================
INSERT INTO public.content_revisions (
  target_topic_id, module_id, action, payload, status, author_id
)
SELECT
  'signal-noise-cmrr',
  'fundamentals',
  'update',
  $payload${"title":"Evaluación: Relación señal/ruido y CMRR","revisionType":"quiz","quizTopicId":"signal-noise-cmrr","moduleId":"fundamentals","passScore":70,"maxAttempts":null,"shuffleQuestions":true,"shuffleOptions":true,"questions":[{"id":"snr-q1","sortOrder":0,"type":"single","difficulty":"basic","stem":"En el electrodiagnóstico, ¿para qué sirven una alta relación señal/ruido (SNR), un buen CMRR (≥ 100 dB) y la promediación (averaging) de estímulos?","options":[{"id":"snr-q1-a","text":"Para distinguir con claridad la respuesta real del nervio frente al ruido de fondo, permitiendo rescatar potenciales pequeños (como los sensitivos) sin confundirlos con interferencia.","isCorrect":true},{"id":"snr-q1-b","text":"Para hacer que el músculo se contraiga con mayor fuerza física en cada estímulo eléctrico.","isCorrect":false},{"id":"snr-q1-c","text":"Para eliminar la necesidad de colocar el electrodo de referencia (G2) y el de tierra en el paciente.","isCorrect":false},{"id":"snr-q1-d","text":"Para acelerar el metabolismo del nervio cuando la extremidad del paciente está fría.","isCorrect":false}],"explanation":"En electrodiagnóstico una buena relación señal/ruido (SNR) significa que la onda biológica sobresale claramente sobre la línea base. El alto rechazo de modo común (CMRR ≥ 100 dB) bloquea la interferencia ambiental y la promediación (averaging) suma las respuestas reales del nervio mientras cancela el ruido aleatorio, lo cual es indispensable para medir con certeza potenciales sensitivos (SNAP) de pocos microvoltios.\n\n📚 Referencia: Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle: Principles and Practice (4th ed.). Oxford University Press (2013).","citations":[{"authors":"Kimura J","title":"Electrodiagnosis in Diseases of Nerve and Muscle: Principles and Practice","journal":"Oxford University Press","year":2013,"url":"https://global.oup.com/academic/product/electrodiagnosis-in-diseases-of-nerve-and-muscle-9780199738687"}]}],"examQuestions":[]}$payload$::jsonb,
  'draft',
  (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.content_revisions r
  WHERE r.target_topic_id = 'signal-noise-cmrr'
    AND r.module_id = 'fundamentals'
    AND r.status = 'draft'
    AND r.payload->>'revisionType' = 'quiz'
    AND r.author_id = (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
);
