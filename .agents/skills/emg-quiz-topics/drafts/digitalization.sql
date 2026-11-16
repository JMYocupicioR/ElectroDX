-- ============================================================================
-- NeuroSAFE quiz revision (NO toca published_quizzes ni quiz_attempts)
-- Topic: digitalization (Module: fundamentals)
-- Generated at: 2026-11-16T20:12:47.055Z
-- Autor: jmyocupicior@gmail.com. Estado: draft, hasta aprobación humana.
-- ============================================================================
INSERT INTO public.content_revisions (
  target_topic_id, module_id, action, payload, status, author_id
)
SELECT
  'digitalization',
  'fundamentals',
  'update',
  $payload${"title":"Evaluación: Digitalización y muestreo de señales","revisionType":"quiz","quizTopicId":"digitalization","moduleId":"fundamentals","passScore":70,"maxAttempts":null,"shuffleQuestions":true,"shuffleOptions":true,"questions":[{"id":"dig-q1","sortOrder":0,"type":"single","difficulty":"basic","stem":"¿Por qué el equipo de electrodiagnóstico debe digitalizar la señal con una frecuencia de muestreo suficientemente alta (≥ 20 kHz, Teorema de Nyquist)?","options":[{"id":"dig-q1-a","text":"Para capturar fielmente la forma y los picos rápidos de los potenciales sin deformarlos (evitando el aliasing) y medir con exactitud latencias y amplitudes.","isCorrect":true},{"id":"dig-q1-b","text":"Para transformar los impulsos nerviosos del paciente en ondas de ultrasonido dentro del músculo.","isCorrect":false},{"id":"dig-q1-c","text":"Porque una frecuencia de muestreo baja hace que el estimulador eléctrico descargue el doble de corriente.","isCorrect":false},{"id":"dig-q1-d","text":"Porque la digitalización solo sirve para cambiar el color del fondo de la pantalla sin influir en las mediciones.","isCorrect":false}],"explanation":"Las señales del nervio y del músculo ocurren en milisegundos. Al convertirlas de analógicas a digitales, el equipo debe tomar suficientes muestras por segundo (al menos el doble de la frecuencia máxima de la señal, según el Teorema de Nyquist; ≥ 20 kHz en EMG/NCS). Si muestrea lento, ocurre «aliasing»: se pierden los picos reales del potencial y las mediciones automáticas de amplitud y velocidad resultan falsas.\n\n📚 Referencia: Dumitru D, Amato AA, Zwarts MJ. Electrodiagnostic Medicine (2nd ed.). Hanley & Belfus (2002).","citations":[{"authors":"Dumitru D, Amato AA, Zwarts MJ","title":"Electrodiagnostic Medicine (2nd ed)","journal":"Hanley & Belfus","year":2002}]}],"examQuestions":[]}$payload$::jsonb,
  'draft',
  (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.content_revisions r
  WHERE r.target_topic_id = 'digitalization'
    AND r.module_id = 'fundamentals'
    AND r.status = 'draft'
    AND r.payload->>'revisionType' = 'quiz'
    AND r.author_id = (SELECT id FROM auth.users WHERE lower(email) = 'jmyocupicior@gmail.com' LIMIT 1)
);
