-- ============================================================================
-- NeuroSAFE quiz revision (NO toca published_quizzes ni quiz_attempts)
-- Topic: ssr (Module: special-studies)
-- Generated at: 2026-11-16T04:54:09.776Z
-- Autor: jmyocupicior@gmail.com. Estado: draft, hasta aprobación humana.
-- ============================================================================
INSERT INTO public.content_revisions (
  target_topic_id, module_id, action, payload, status, author_id
)
SELECT
  'ssr',
  'special-studies',
  'update',
  $payload${"title":"Evaluación: Respuesta Cutánea Simpática (SSR)","revisionType":"quiz","quizTopicId":"ssr","moduleId":"special-studies","passScore":70,"shuffleQuestions":true,"shuffleOptions":true,"questions":[{"id":"q1","type":"true_false","difficulty":"basic","stem":"Evalúa fibras C simpáticas sudomotoras. ¿Esta afirmación es la que corresponde enseñar en «Respuesta Cutánea Simpática (SSR)»?","options":[{"id":"a","text":"Sí. Esa es la conducta que describe la lección.","isCorrect":true},{"id":"b","text":"No. La lección sostiene lo contrario.","isCorrect":false}],"explanation":"Evalúa fibras C simpáticas sudomotoras.\n\n📚 Referencia: Walker F, Cartwright MS. Neuromuscular Ultrasound. Saunders (2011).","citations":[]},{"id":"q2","type":"single","difficulty":"intermediate","stem":"En «Respuesta Cutánea Simpática (SSR)», ¿cuál afirmación es la correcta?\nRegistro en palmas y plantas.","options":[{"id":"a","text":"Registro en palmas y plantas.","isCorrect":true},{"id":"b","text":"Un valor aislado, sin repetir el trazo, basta para cerrar el diagnóstico.","isCorrect":false},{"id":"c","text":"La temperatura de la extremidad puede ignorarse si el número ya es extremo.","isCorrect":false},{"id":"d","text":"Medir sobre el artefacto de estímulo es aceptable si la amplitud se ve estable.","isCorrect":false}],"explanation":"Registro en palmas y plantas.\n\n📚 Referencia: Walker F, Cartwright MS. Neuromuscular Ultrasound. Saunders (2011).","citations":[]},{"id":"q3","type":"single","difficulty":"advanced","stem":"En «Respuesta Cutánea Simpática (SSR)», ¿cuál afirmación es la correcta?\nAusencia bilateral = Neuropatía autonómica.","options":[{"id":"a","text":"Ausencia bilateral = Neuropatía autonómica.","isCorrect":true},{"id":"b","text":"Un valor aislado, sin repetir el trazo, basta para cerrar el diagnóstico.","isCorrect":false},{"id":"c","text":"La temperatura de la extremidad puede ignorarse si el número ya es extremo.","isCorrect":false},{"id":"d","text":"Medir sobre el artefacto de estímulo es aceptable si la amplitud se ve estable.","isCorrect":false}],"explanation":"Ausencia bilateral = Neuropatía autonómica.\n\n📚 Referencia: Walker F, Cartwright MS. Neuromuscular Ultrasound. Saunders (2011).","citations":[]},{"id":"q4","type":"single","difficulty":"advanced","stem":"En «Respuesta Cutánea Simpática (SSR)», ¿cuál afirmación es la correcta?\nLimitación: Alta habituación y variabilidad.","options":[{"id":"a","text":"Limitación: Alta habituación y variabilidad.","isCorrect":true},{"id":"b","text":"Un valor aislado, sin repetir el trazo, basta para cerrar el diagnóstico.","isCorrect":false},{"id":"c","text":"La temperatura de la extremidad puede ignorarse si el número ya es extremo.","isCorrect":false},{"id":"d","text":"Medir sobre el artefacto de estímulo es aceptable si la amplitud se ve estable.","isCorrect":false}],"explanation":"Limitación: Alta habituación y variabilidad.\n\n📚 Referencia: Walker F, Cartwright MS. Neuromuscular Ultrasound. Saunders (2011).","citations":[]}],"examQuestions":[{"module_id":"special-studies","topic_id":"ssr","topic_name":"Respuesta Cutánea Simpática (SSR)","island_name":"EMG","stem":"Caso breve ligado a «Respuesta Cutánea Simpática (SSR)». Evalúa fibras C simpáticas sudomotoras. ¿Cuál es la conducta correcta?","findings":[],"options":[{"text":"Evalúa fibras C simpáticas sudomotoras.","is_correct":true,"feedback":"Coincide con el texto de la lección."},{"text":"Cerrar el diagnóstico con un solo parámetro no reproducido.","is_correct":false,"feedback":"Un parámetro aislado no cierra la topografía."},{"text":"Ignorar temperatura y distancia.","is_correct":false,"feedback":"Temperatura y distancia cambian latencia y velocidad."},{"text":"Medir la latencia sobre el artefacto de estímulo.","is_correct":false,"feedback":"El onset dentro del artefacto no es una latencia."}],"difficulty":2,"is_critical":false,"pearl":"Si el paciente se acostumbra, la SSR se va.","source_reference":"Walker F, Cartwright MS. Neuromuscular Ultrasound. Saunders (2011).","tags":["special-studies","ssr"],"status":"DRAFT"}]}$payload$::jsonb,
  'draft',
  (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.content_revisions r
  WHERE r.target_topic_id = 'ssr'
    AND r.module_id = 'special-studies'
    AND r.status = 'draft'
    AND r.payload->>'revisionType' = 'quiz'
    AND r.author_id = (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
);
