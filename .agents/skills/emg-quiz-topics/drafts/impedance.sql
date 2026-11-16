-- ============================================================================
-- NeuroSAFE quiz revision (NO toca published_quizzes ni quiz_attempts)
-- Topic: impedance (Module: fundamentals)
-- Generated at: 2026-11-15T23:31:04.693Z
-- Autor: jmyocupicior@gmail.com. Estado: draft, hasta aprobación humana.
-- ============================================================================
INSERT INTO public.content_revisions (
  target_topic_id, module_id, action, payload, status, author_id
)
SELECT
  'impedance',
  'fundamentals',
  'update',
  $payload${"title":"Evaluación: Impedancia de electrodos","revisionType":"quiz","quizTopicId":"impedance","moduleId":"fundamentals","passScore":70,"shuffleQuestions":true,"shuffleOptions":true,"questions":[{"id":"q1","type":"true_false","difficulty":"basic","stem":"Impedancia objetivo: <5-10 kΩ. ¿Esta afirmación es la que corresponde enseñar en «Impedancia de electrodos»?","options":[{"id":"a","text":"Sí. Esa es la conducta que describe la lección.","isCorrect":true},{"id":"b","text":"No. La lección sostiene lo contrario.","isCorrect":false}],"explanation":"Impedancia objetivo: <5-10 kΩ.\n\n📚 Referencia: Brown WF. The Physiological and Technical Basis of Electromyography. Butterworth (1984).","citations":[]},{"id":"q2","type":"single","difficulty":"intermediate","stem":"En «Impedancia de electrodos», ¿cuál afirmación es la correcta?\nBalance entre electrodos: <1 kΩ de diferencia.","options":[{"id":"a","text":"Balance entre electrodos: <1 kΩ de diferencia.","isCorrect":true},{"id":"b","text":"Un valor aislado, sin repetir el trazo, basta para cerrar el diagnóstico.","isCorrect":false},{"id":"c","text":"La temperatura de la extremidad puede ignorarse si el número ya es extremo.","isCorrect":false},{"id":"d","text":"Medir sobre el artefacto de estímulo es aceptable si la amplitud se ve estable.","isCorrect":false}],"explanation":"Balance entre electrodos: <1 kΩ de diferencia.\n\n📚 Referencia: Brown WF. The Physiological and Technical Basis of Electromyography. Butterworth (1984).","citations":[]},{"id":"q3","type":"single","difficulty":"advanced","stem":"En «Impedancia de electrodos», ¿cuál afirmación es la correcta?\nPreparación: alcohol + abrasión + gel conductor.","options":[{"id":"a","text":"Preparación: alcohol + abrasión + gel conductor.","isCorrect":true},{"id":"b","text":"Un valor aislado, sin repetir el trazo, basta para cerrar el diagnóstico.","isCorrect":false},{"id":"c","text":"La temperatura de la extremidad puede ignorarse si el número ya es extremo.","isCorrect":false},{"id":"d","text":"Medir sobre el artefacto de estímulo es aceptable si la amplitud se ve estable.","isCorrect":false}],"explanation":"Preparación: alcohol + abrasión + gel conductor.\n\n📚 Referencia: Brown WF. The Physiological and Technical Basis of Electromyography. Butterworth (1984).","citations":[]},{"id":"q4","type":"single","difficulty":"advanced","stem":"En «Impedancia de electrodos», ¿cuál afirmación es la correcta?\nImpedancia alta = más ruido = potenciales de peor calidad.","options":[{"id":"a","text":"Impedancia alta = más ruido = potenciales de peor calidad.","isCorrect":true},{"id":"b","text":"Un valor aislado, sin repetir el trazo, basta para cerrar el diagnóstico.","isCorrect":false},{"id":"c","text":"La temperatura de la extremidad puede ignorarse si el número ya es extremo.","isCorrect":false},{"id":"d","text":"Medir sobre el artefacto de estímulo es aceptable si la amplitud se ve estable.","isCorrect":false}],"explanation":"Impedancia alta = más ruido = potenciales de peor calidad.\n\n📚 Referencia: Brown WF. The Physiological and Technical Basis of Electromyography. Butterworth (1984).","citations":[]}],"examQuestions":[{"module_id":"fundamentals","topic_id":"impedance","topic_name":"Impedancia de electrodos","island_name":"EMG","stem":"Caso breve ligado a «Impedancia de electrodos». Impedancia objetivo: <5-10 kΩ. ¿Cuál es la conducta correcta?","findings":[],"options":[{"text":"Impedancia objetivo: <5-10 kΩ.","is_correct":true,"feedback":"Coincide con el texto de la lección."},{"text":"Cerrar el diagnóstico con un solo parámetro no reproducido.","is_correct":false,"feedback":"Un parámetro aislado no cierra la topografía."},{"text":"Ignorar temperatura y distancia.","is_correct":false,"feedback":"Temperatura y distancia cambian latencia y velocidad."},{"text":"Medir la latencia sobre el artefacto de estímulo.","is_correct":false,"feedback":"El onset dentro del artefacto no es una latencia."}],"difficulty":2,"is_critical":false,"pearl":"Si un SNAP no se puede obtener, antes de declararlo \"ausente\", verifica la impedancia. Una impedancia alta puede enterrar la señal en el ruido.","source_reference":"Brown WF. The Physiological and Technical Basis of Electromyography. Butterworth (1984).","tags":["fundamentals","impedance"],"status":"DRAFT"}]}$payload$::jsonb,
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
