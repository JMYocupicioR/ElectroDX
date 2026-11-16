-- ============================================================================
-- NeuroSAFE quiz revision (NO toca published_quizzes ni quiz_attempts)
-- Topic: fourier (Module: special-studies)
-- Generated at: 2026-11-16T04:54:10.214Z
-- Autor: jmyocupicior@gmail.com. Estado: draft, hasta aprobación humana.
-- ============================================================================
INSERT INTO public.content_revisions (
  target_topic_id, module_id, action, payload, status, author_id
)
SELECT
  'fourier',
  'special-studies',
  'update',
  $payload${"title":"Evaluación: Transformada Rápida de Fourier (FFT)","revisionType":"quiz","quizTopicId":"fourier","moduleId":"special-studies","passScore":70,"shuffleQuestions":true,"shuffleOptions":true,"questions":[{"id":"q1","type":"true_false","difficulty":"basic","stem":"FFT: Descompone la señal EMG en frecuencias. ¿Esta afirmación es la que corresponde enseñar en «Transformada Rápida de Fourier (FFT)»?","options":[{"id":"a","text":"Sí. Esa es la conducta que describe la lección.","isCorrect":true},{"id":"b","text":"No. La lección sostiene lo contrario.","isCorrect":false}],"explanation":"FFT: Descompone la señal EMG en frecuencias.\n\n📚 Referencia: Walker F, Cartwright MS. Neuromuscular Ultrasound. Saunders (2011).","citations":[]},{"id":"q2","type":"single","difficulty":"intermediate","stem":"En «Transformada Rápida de Fourier (FFT)», ¿cuál afirmación es la correcta?\nFatiga muscular: El espectro se desplaza a la izquierda.","options":[{"id":"a","text":"Fatiga muscular: El espectro se desplaza a la izquierda.","isCorrect":true},{"id":"b","text":"Un valor aislado, sin repetir el trazo, basta para cerrar el diagnóstico.","isCorrect":false},{"id":"c","text":"La temperatura de la extremidad puede ignorarse si el número ya es extremo.","isCorrect":false},{"id":"d","text":"Medir sobre el artefacto de estímulo es aceptable si la amplitud se ve estable.","isCorrect":false}],"explanation":"Fatiga muscular: El espectro se desplaza a la izquierda.\n\n📚 Referencia: Walker F, Cartwright MS. Neuromuscular Ultrasound. Saunders (2011).","citations":[]},{"id":"q3","type":"single","difficulty":"advanced","stem":"En «Transformada Rápida de Fourier (FFT)», ¿cuál afirmación es la correcta?\nAsume señal estacionaria; limitada para EMG dinámico.","options":[{"id":"a","text":"Asume señal estacionaria; limitada para EMG dinámico.","isCorrect":true},{"id":"b","text":"Un valor aislado, sin repetir el trazo, basta para cerrar el diagnóstico.","isCorrect":false},{"id":"c","text":"La temperatura de la extremidad puede ignorarse si el número ya es extremo.","isCorrect":false},{"id":"d","text":"Medir sobre el artefacto de estímulo es aceptable si la amplitud se ve estable.","isCorrect":false}],"explanation":"Asume señal estacionaria; limitada para EMG dinámico.\n\n📚 Referencia: Walker F, Cartwright MS. Neuromuscular Ultrasound. Saunders (2011).","citations":[]},{"id":"q4","type":"single","difficulty":"advanced","stem":"En «Transformada Rápida de Fourier (FFT)», ¿cuál afirmación es la correcta?\nIzquierda = más lento, a menudo fatiga.","options":[{"id":"a","text":"Izquierda = más lento, a menudo fatiga.","isCorrect":true},{"id":"b","text":"Un valor aislado, sin repetir el trazo, basta para cerrar el diagnóstico.","isCorrect":false},{"id":"c","text":"La temperatura de la extremidad puede ignorarse si el número ya es extremo.","isCorrect":false},{"id":"d","text":"Medir sobre el artefacto de estímulo es aceptable si la amplitud se ve estable.","isCorrect":false}],"explanation":"Izquierda = más lento, a menudo fatiga.\n\n📚 Referencia: Walker F, Cartwright MS. Neuromuscular Ultrasound. Saunders (2011).","citations":[]}],"examQuestions":[{"module_id":"special-studies","topic_id":"fourier","topic_name":"Transformada Rápida de Fourier (FFT)","island_name":"EMG","stem":"Caso breve ligado a «Transformada Rápida de Fourier (FFT)». FFT: Descompone la señal EMG en frecuencias. ¿Cuál es la conducta correcta?","findings":[],"options":[{"text":"FFT: Descompone la señal EMG en frecuencias.","is_correct":true,"feedback":"Coincide con el texto de la lección."},{"text":"Cerrar el diagnóstico con un solo parámetro no reproducido.","is_correct":false,"feedback":"Un parámetro aislado no cierra la topografía."},{"text":"Ignorar temperatura y distancia.","is_correct":false,"feedback":"Temperatura y distancia cambian latencia y velocidad."},{"text":"Medir la latencia sobre el artefacto de estímulo.","is_correct":false,"feedback":"El onset dentro del artefacto no es una latencia."}],"difficulty":2,"is_critical":false,"pearl":"Estacionaria o no es FFT.","source_reference":"Walker F, Cartwright MS. Neuromuscular Ultrasound. Saunders (2011).","tags":["special-studies","fourier"],"status":"DRAFT"}]}$payload$::jsonb,
  'draft',
  (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.content_revisions r
  WHERE r.target_topic_id = 'fourier'
    AND r.module_id = 'special-studies'
    AND r.status = 'draft'
    AND r.payload->>'revisionType' = 'quiz'
    AND r.author_id = (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
);
