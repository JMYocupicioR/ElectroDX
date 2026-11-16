-- ============================================================================
-- NeuroSAFE quiz revision (NO toca published_quizzes ni quiz_attempts)
-- Topic: coherence (Module: special-studies)
-- Generated at: 2026-11-16T04:54:10.533Z
-- Autor: jmyocupicior@gmail.com. Estado: draft, hasta aprobación humana.
-- ============================================================================
INSERT INTO public.content_revisions (
  target_topic_id, module_id, action, payload, status, author_id
)
SELECT
  'coherence',
  'special-studies',
  'update',
  $payload${"title":"Evaluación: Análisis de Coherencia Corticomuscular","revisionType":"quiz","quizTopicId":"coherence","moduleId":"special-studies","passScore":70,"shuffleQuestions":true,"shuffleOptions":true,"questions":[{"id":"q1","type":"true_false","difficulty":"basic","stem":"Mide sincronización entre EEG cortical y EMG muscular. ¿Esta afirmación es la que corresponde enseñar en «Análisis de Coherencia Corticomuscular»?","options":[{"id":"a","text":"Sí. Esa es la conducta que describe la lección.","isCorrect":true},{"id":"b","text":"No. La lección sostiene lo contrario.","isCorrect":false}],"explanation":"Mide sincronización entre EEG cortical y EMG muscular.\n\n📚 Referencia: Walker F, Cartwright MS. Neuromuscular Ultrasound. Saunders (2011).","citations":[]},{"id":"q2","type":"single","difficulty":"intermediate","stem":"En «Análisis de Coherencia Corticomuscular», ¿cuál afirmación es la correcta?\nFrecuencias beta (15-30 Hz) y gamma (30-60 Hz).","options":[{"id":"a","text":"Frecuencias beta (15-30 Hz) y gamma (30-60 Hz).","isCorrect":true},{"id":"b","text":"Un valor aislado, sin repetir el trazo, basta para cerrar el diagnóstico.","isCorrect":false},{"id":"c","text":"La temperatura de la extremidad puede ignorarse si el número ya es extremo.","isCorrect":false},{"id":"d","text":"Medir sobre el artefacto de estímulo es aceptable si la amplitud se ve estable.","isCorrect":false}],"explanation":"Frecuencias beta (15-30 Hz) y gamma (30-60 Hz).\n\n📚 Referencia: Walker F, Cartwright MS. Neuromuscular Ultrasound. Saunders (2011).","citations":[]},{"id":"q3","type":"single","difficulty":"advanced","stem":"En «Análisis de Coherencia Corticomuscular», ¿cuál afirmación es la correcta?\nPotencial uso temprano en ELA y pronóstico en ACV.","options":[{"id":"a","text":"Potencial uso temprano en ELA y pronóstico en ACV.","isCorrect":true},{"id":"b","text":"Un valor aislado, sin repetir el trazo, basta para cerrar el diagnóstico.","isCorrect":false},{"id":"c","text":"La temperatura de la extremidad puede ignorarse si el número ya es extremo.","isCorrect":false},{"id":"d","text":"Medir sobre el artefacto de estímulo es aceptable si la amplitud se ve estable.","isCorrect":false}],"explanation":"Potencial uso temprano en ELA y pronóstico en ACV.\n\n📚 Referencia: Walker F, Cartwright MS. Neuromuscular Ultrasound. Saunders (2011).","citations":[]},{"id":"q4","type":"single","difficulty":"advanced","stem":"En «Análisis de Coherencia Corticomuscular», ¿cuál afirmación es la correcta?\nActualmente es técnica de investigación.","options":[{"id":"a","text":"Actualmente es técnica de investigación.","isCorrect":true},{"id":"b","text":"Un valor aislado, sin repetir el trazo, basta para cerrar el diagnóstico.","isCorrect":false},{"id":"c","text":"La temperatura de la extremidad puede ignorarse si el número ya es extremo.","isCorrect":false},{"id":"d","text":"Medir sobre el artefacto de estímulo es aceptable si la amplitud se ve estable.","isCorrect":false}],"explanation":"Actualmente es técnica de investigación.\n\n📚 Referencia: Walker F, Cartwright MS. Neuromuscular Ultrasound. Saunders (2011).","citations":[]}],"examQuestions":[{"module_id":"special-studies","topic_id":"coherence","topic_name":"Análisis de Coherencia Corticomuscular","island_name":"EMG","stem":"Caso breve ligado a «Análisis de Coherencia Corticomuscular». Mide sincronización entre EEG cortical y EMG muscular. ¿Cuál es la conducta correcta?","findings":[],"options":[{"text":"Mide sincronización entre EEG cortical y EMG muscular.","is_correct":true,"feedback":"Coincide con el texto de la lección."},{"text":"Cerrar el diagnóstico con un solo parámetro no reproducido.","is_correct":false,"feedback":"Un parámetro aislado no cierra la topografía."},{"text":"Ignorar temperatura y distancia.","is_correct":false,"feedback":"Temperatura y distancia cambian latencia y velocidad."},{"text":"Medir la latencia sobre el artefacto de estímulo.","is_correct":false,"feedback":"El onset dentro del artefacto no es una latencia."}],"difficulty":2,"is_critical":false,"pearl":"Mide sincronización entre EEG cortical y EMG muscular.","source_reference":"Walker F, Cartwright MS. Neuromuscular Ultrasound. Saunders (2011).","tags":["special-studies","coherence"],"status":"DRAFT"}]}$payload$::jsonb,
  'draft',
  (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.content_revisions r
  WHERE r.target_topic_id = 'coherence'
    AND r.module_id = 'special-studies'
    AND r.status = 'draft'
    AND r.payload->>'revisionType' = 'quiz'
    AND r.author_id = (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
);
