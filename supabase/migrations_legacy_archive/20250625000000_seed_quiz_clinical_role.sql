-- Seed quiz: fundamentals / clinical-role (BACKLOG item)
-- Rol del electrodiagnóstico en medicina — 5 preguntas, pass 70%

DO $$
DECLARE
  v_quiz_id UUID;
BEGIN
  INSERT INTO public.published_quizzes (
    topic_id,
    module_id,
    title,
    pass_score,
    max_attempts,
    shuffle_questions,
    shuffle_options,
    question_count,
    version
  )
  VALUES (
    'clinical-role',
    'fundamentals',
    'Evaluación: Rol del electrodiagnóstico en medicina',
    70,
    NULL,
    true,
    true,
    5,
    1
  )
  ON CONFLICT (topic_id) DO UPDATE SET
    title = EXCLUDED.title,
    pass_score = EXCLUDED.pass_score,
    max_attempts = EXCLUDED.max_attempts,
    shuffle_questions = EXCLUDED.shuffle_questions,
    shuffle_options = EXCLUDED.shuffle_options,
    question_count = EXCLUDED.question_count,
    version = public.published_quizzes.version + 1,
    published_at = now()
  RETURNING id INTO v_quiz_id;

  IF v_quiz_id IS NULL THEN
    SELECT pq.id INTO v_quiz_id
    FROM public.published_quizzes pq
    WHERE pq.topic_id = 'clinical-role';
  END IF;

  DELETE FROM public.quiz_questions qq
  WHERE qq.quiz_id = v_quiz_id;

  INSERT INTO public.quiz_questions (
    quiz_id, sort_order, type, stem, options, explanation, difficulty
  )
  VALUES
  (
    v_quiz_id, 0, 'single',
    '¿Cuál es la relación correcta entre el electrodiagnóstico (EDx) y el examen neurológico?',
    '[
      {"id":"cr-q1-a","text":"El EDx sustituye el examen neurológico cuando el paciente no coopera","isCorrect":false},
      {"id":"cr-q1-b","text":"El EDx es una extensión del examen neurológico que aporta datos objetivos","isCorrect":true},
      {"id":"cr-q1-c","text":"El EDx solo se interpreta sin historia clínica ni examen físico","isCorrect":false},
      {"id":"cr-q1-d","text":"El EDx se limita a confirmar diagnósticos ya establecidos por imagen","isCorrect":false}
    ]'::jsonb,
    'El EDx extiende el examen neurológico con datos objetivos y cuantitativos sobre el SNP y el músculo; siempre debe interpretarse en contexto clínico.',
    'basic'
  ),
  (
    v_quiz_id, 1, 'true_false',
    'Un protocolo electrodiagnóstico "de rutina" sin hipótesis clínica específica tiene bajo rendimiento diagnóstico.',
    '[
      {"id":"cr-q2-true","text":"Verdadero","isCorrect":true},
      {"id":"cr-q2-false","text":"Falso","isCorrect":false}
    ]'::jsonb,
    'El protocolo debe adaptarse a la pregunta clínica; estudios sin hipótesis reducen la utilidad diagnóstica.',
    'basic'
  ),
  (
    v_quiz_id, 2, 'multiple',
    'Seleccione las funciones principales del electrodiagnóstico (marque todas las correctas):',
    '[
      {"id":"cr-q3-a","text":"Localización anatómica de la lesión","isCorrect":true},
      {"id":"cr-q3-b","text":"Determinación de fisiopatología (axonal vs. desmielinizante)","isCorrect":true},
      {"id":"cr-q3-c","text":"Estimación de severidad y pronóstico","isCorrect":true},
      {"id":"cr-q3-d","text":"Diagnóstico histológico definitivo de miopatía","isCorrect":false}
    ]'::jsonb,
    'El EDx localiza, tipifica fisiopatología, estima severidad/pronóstico y guía terapia. El diagnóstico histológico definitivo requiere biopsia, no EDx.',
    'intermediate'
  ),
  (
    v_quiz_id, 3, 'single',
    '¿Qué niveles anatómicos puede distinguir el electrodiagnóstico en la localización de lesiones?',
    '[
      {"id":"cr-q4-a","text":"Solo nervio periférico y músculo","isCorrect":false},
      {"id":"cr-q4-b","text":"Raíz, plexo, nervio periférico, unión neuromuscular o músculo","isCorrect":true},
      {"id":"cr-q4-c","text":"Solo raíz nerviosa y corteza cerebral","isCorrect":false},
      {"id":"cr-q4-d","text":"Únicamente unión neuromuscular y médula espinal","isCorrect":false}
    ]'::jsonb,
    'El EDx permite distinguir lesión en raíz, plexo, nervio periférico, unión neuromuscular o músculo.',
    'intermediate'
  ),
  (
    v_quiz_id, 4, 'single',
    '¿Cuáles son los tres componentes principales del electrodiagnóstico mencionados en el módulo de fundamentos?',
    '[
      {"id":"cr-q5-a","text":"NCS, EMG de aguja y pruebas especiales (ENR, SFEMG, PE)","isCorrect":true},
      {"id":"cr-q5-b","text":"EEG, EMG y potenciales evocados visuales","isCorrect":false},
      {"id":"cr-q5-c","text":"NCS, ecografía y resonancia magnética","isCorrect":false},
      {"id":"cr-q5-d","text":"Solo electromiografía de superficie y NCS","isCorrect":false}
    ]'::jsonb,
    'Los componentes principales son estudios de conducción nerviosa (NCS), EMG de aguja y pruebas especiales como ENR, SFEMG y potenciales evocados.',
    'basic'
  );
END $$;
