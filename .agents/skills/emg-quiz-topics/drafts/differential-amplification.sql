-- ============================================================================
-- NeuroSAFE quiz revision (NO toca published_quizzes ni quiz_attempts)
-- Topic: differential-amplification (Module: fundamentals)
-- Generated at: 2026-11-16T20:12:34.502Z
-- Autor: jmyocupicior@gmail.com. Estado: draft, hasta aprobación humana.
-- ============================================================================
INSERT INTO public.content_revisions (
  target_topic_id, module_id, action, payload, status, author_id
)
SELECT
  'differential-amplification',
  'fundamentals',
  'update',
  $payload${"title":"Evaluación: Amplificación diferencial","revisionType":"quiz","quizTopicId":"differential-amplification","moduleId":"fundamentals","passScore":70,"maxAttempts":null,"shuffleQuestions":true,"shuffleOptions":true,"questions":[{"id":"da-q1","sortOrder":0,"type":"single","difficulty":"basic","stem":"¿Cuál es la función principal del amplificador diferencial (electrodos activo G1 y de referencia G2) durante un estudio de electrodiagnóstico?","options":[{"id":"da-q1-a","text":"Restar las señales de G1 y G2 para cancelar el ruido eléctrico ambiental común a ambos y amplificar únicamente la señal real del nervio o músculo.","isCorrect":true},{"id":"da-q1-b","text":"Enviar corriente eléctrica desde la pantalla hacia el músculo para provocar su contracción.","isCorrect":false},{"id":"da-q1-c","text":"Aumentar por igual tanto el ruido de la habitación como la señal del paciente para ver trazos más gruesos.","isCorrect":false},{"id":"da-q1-d","text":"Sustituir al electrodo de tierra (ground) para que solo se necesite pegar un cable en la piel.","isCorrect":false}],"explanation":"En cualquier consultorio u hospital el ruido electromagnético ambiental (lámparas, enchufes de 60 Hz) es mucho más grande que la señal del nervio. El amplificador diferencial resuelve este problema restando lo que captan G1 y G2 (A − B): como el ruido ambiental entra igual por ambos electrodos, se cancela (Ruido − Ruido = 0) y en pantalla queda limpia la respuesta biológica del paciente.\n\n📚 Referencia: Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle: Principles and Practice (4th ed.). Oxford University Press (2013).","citations":[{"authors":"Kimura J","title":"Electrodiagnosis in Diseases of Nerve and Muscle: Principles and Practice","journal":"Oxford University Press","year":2013,"url":"https://global.oup.com/academic/product/electrodiagnosis-in-diseases-of-nerve-and-muscle-9780199738687"}]}],"examQuestions":[]}$payload$::jsonb,
  'draft',
  (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.content_revisions r
  WHERE r.target_topic_id = 'differential-amplification'
    AND r.module_id = 'fundamentals'
    AND r.status = 'draft'
    AND r.payload->>'revisionType' = 'quiz'
    AND r.author_id = (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
);
