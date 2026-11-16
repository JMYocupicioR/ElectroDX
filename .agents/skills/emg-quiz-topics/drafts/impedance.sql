-- ============================================================================
-- NeuroSAFE quiz revision (NO toca published_quizzes ni quiz_attempts)
-- Topic: impedance (Module: fundamentals)
-- Generated at: 2026-11-16T20:12:41.133Z
-- Autor: jmyocupicior@gmail.com. Estado: draft, hasta aprobación humana.
-- ============================================================================
INSERT INTO public.content_revisions (
  target_topic_id, module_id, action, payload, status, author_id
)
SELECT
  'impedance',
  'fundamentals',
  'update',
  $payload${"title":"Evaluación: Impedancia de electrodos","revisionType":"quiz","quizTopicId":"impedance","moduleId":"fundamentals","passScore":70,"maxAttempts":null,"shuffleQuestions":true,"shuffleOptions":true,"questions":[{"id":"imp-q1","sortOrder":0,"type":"single","difficulty":"basic","stem":"Antes de iniciar un estudio de conducción nerviosa, ¿por qué es tan importante limpiar la piel y usar gel conductor para bajar la impedancia de los electrodos (< 5–10 kΩ)?","options":[{"id":"imp-q1-a","text":"Porque una impedancia alta llena el trazo de ruido eléctrico y puede ocultar respuestas pequeñas (como un SNAP), simulando falsamente una lesión nerviosa.","isCorrect":true},{"id":"imp-q1-b","text":"Porque la impedancia de la piel cambia directamente la velocidad real a la que viajan los impulsos dentro del axón.","isCorrect":false},{"id":"imp-q1-c","text":"Porque mientras más alta sea la impedancia entre la piel y el electrodo, más nítido se verá el potencial en pantalla.","isCorrect":false},{"id":"imp-q1-d","text":"Porque el gel conductor sirve únicamente para enfriar la piel del paciente durante el estudio.","isCorrect":false}],"explanation":"La impedancia electrodo-piel es la oposición al paso de la señal desde el cuerpo hacia el equipo. En la práctica clínica, la primera causa de un registro ruidoso o de un potencial sensitivo aparentemente «ausente» no es una neuropatía, sino una piel mal preparada (crema, grasa o poco gel). Limpiar con alcohol y asegurar buen contacto mantiene la impedancia baja (< 5–10 kΩ) y protege contra falsos positivos.\n\n📚 Referencia: Dumitru D, Amato AA, Zwarts MJ. Electrodiagnostic Medicine (2nd ed.). Hanley & Belfus (2002).","citations":[{"authors":"Dumitru D, Amato AA, Zwarts MJ","title":"Electrodiagnostic Medicine (2nd ed)","journal":"Hanley & Belfus","year":2002}]}],"examQuestions":[]}$payload$::jsonb,
  'draft',
  (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.content_revisions r
  WHERE r.target_topic_id = 'impedance'
    AND r.module_id = 'fundamentals'
    AND r.status = 'draft'
    AND r.payload->>'revisionType' = 'quiz'
    AND r.author_id = (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
);
