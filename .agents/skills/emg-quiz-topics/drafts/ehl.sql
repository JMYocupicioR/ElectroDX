-- ============================================================================
-- NeuroSAFE quiz revision (NO toca published_quizzes ni quiz_attempts)
-- Topic: ehl (Module: emg-needle)
-- Generated at: 2026-11-15T23:31:11.801Z
-- Autor: jmyocupicior@gmail.com. Estado: draft, hasta aprobación humana.
-- ============================================================================
INSERT INTO public.content_revisions (
  target_topic_id, module_id, action, payload, status, author_id
)
SELECT
  'ehl',
  'emg-needle',
  'update',
  $payload${"title":"Evaluación: Extensor largo del hallux","revisionType":"quiz","quizTopicId":"ehl","moduleId":"emg-needle","passScore":70,"shuffleQuestions":true,"shuffleOptions":true,"questions":[{"id":"q1","type":"true_false","difficulty":"basic","stem":"Músculo delgado: no atraviese. ¿Esta afirmación es la que corresponde enseñar en «Extensor largo del hallux»?","options":[{"id":"a","text":"Sí. Esa es la conducta que describe la lección.","isCorrect":true},{"id":"b","text":"No. La lección sostiene lo contrario.","isCorrect":false}],"explanation":"Músculo delgado: no atraviese.\n\n📚 Referencia: Daube JR, Rubin DI. Needle electromyography. Muscle & Nerve (2009). https://doi.org/10.1002/mus.21180","citations":[]},{"id":"q2","type":"single","difficulty":"intermediate","stem":"En «Extensor largo del hallux», ¿cuál afirmación es la correcta?\nEl hallux es el L5 que se ve en la camilla.","options":[{"id":"a","text":"El hallux es el L5 que se ve en la camilla.","isCorrect":true},{"id":"b","text":"Un valor aislado, sin repetir el trazo, basta para cerrar el diagnóstico.","isCorrect":false},{"id":"c","text":"La temperatura de la extremidad puede ignorarse si el número ya es extremo.","isCorrect":false},{"id":"d","text":"Medir sobre el artefacto de estímulo es aceptable si la amplitud se ve estable.","isCorrect":false}],"explanation":"El hallux es el L5 que se ve en la camilla.\n\n📚 Referencia: Daube JR, Rubin DI. Needle electromyography. Muscle & Nerve (2009). https://doi.org/10.1002/mus.21180","citations":[]},{"id":"q3","type":"single","difficulty":"advanced","stem":"En «Extensor largo del hallux», ¿cuál afirmación es la correcta?\nInervado por nervio peroneo profundo (L5).","options":[{"id":"a","text":"Inervado por nervio peroneo profundo (L5).","isCorrect":true},{"id":"b","text":"Un valor aislado, sin repetir el trazo, basta para cerrar el diagnóstico.","isCorrect":false},{"id":"c","text":"La temperatura de la extremidad puede ignorarse si el número ya es extremo.","isCorrect":false},{"id":"d","text":"Medir sobre el artefacto de estímulo es aceptable si la amplitud se ve estable.","isCorrect":false}],"explanation":"Inervado por nervio peroneo profundo (L5).\n\n📚 Referencia: Daube JR, Rubin DI. Needle electromyography. Muscle & Nerve (2009). https://doi.org/10.1002/mus.21180","citations":[]},{"id":"q4","type":"single","difficulty":"advanced","stem":"En «Extensor largo del hallux», ¿cuál afirmación es la correcta?\nMuy específico para evaluación de raíz L5.","options":[{"id":"a","text":"Muy específico para evaluación de raíz L5.","isCorrect":true},{"id":"b","text":"Un valor aislado, sin repetir el trazo, basta para cerrar el diagnóstico.","isCorrect":false},{"id":"c","text":"La temperatura de la extremidad puede ignorarse si el número ya es extremo.","isCorrect":false},{"id":"d","text":"Medir sobre el artefacto de estímulo es aceptable si la amplitud se ve estable.","isCorrect":false}],"explanation":"Muy específico para evaluación de raíz L5.\n\n📚 Referencia: Daube JR, Rubin DI. Needle electromyography. Muscle & Nerve (2009). https://doi.org/10.1002/mus.21180","citations":[]}],"examQuestions":[{"module_id":"emg-needle","topic_id":"ehl","topic_name":"Extensor largo del hallux","island_name":"EMG","stem":"Caso breve ligado a «Extensor largo del hallux». Músculo delgado: no atraviese. ¿Cuál es la conducta correcta?","findings":[],"options":[{"text":"Músculo delgado: no atraviese.","is_correct":true,"feedback":"Coincide con el texto de la lección."},{"text":"Cerrar el diagnóstico con un solo parámetro no reproducido.","is_correct":false,"feedback":"Un parámetro aislado no cierra la topografía."},{"text":"Ignorar temperatura y distancia.","is_correct":false,"feedback":"Temperatura y distancia cambian latencia y velocidad."},{"text":"Medir la latencia sobre el artefacto de estímulo.","is_correct":false,"feedback":"El onset dentro del artefacto no es una latencia."}],"difficulty":2,"is_critical":false,"pearl":"El hallux es el L5 que se ve en la camilla.","source_reference":"Daube JR, Rubin DI. Needle electromyography. Muscle & Nerve (2009). https://doi.org/10.1002/mus.21180","tags":["emg-needle","ehl"],"status":"DRAFT"}]}$payload$::jsonb,
  'draft',
  (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.content_revisions r
  WHERE r.target_topic_id = 'ehl'
    AND r.module_id = 'emg-needle'
    AND r.status = 'draft'
    AND r.payload->>'revisionType' = 'quiz'
    AND r.author_id = (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
);
