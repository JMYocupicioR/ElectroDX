-- =============================================================================
-- Migration: Seed Published Quizzes and Questions from isla_EMG
-- Date: 2026-09-12
-- Links 85 electrodiagnosis questions to 22 leaf topics in NeuroSAFE curriculum
-- =============================================================================

-- ─── QUIZ: Evaluación: Principios Básicos y Electricidad (voltage-current) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  '0fcf3f32-3646-4a95-ada3-7b71089dac52', 'voltage-current', 'fundamentals', 'Evaluación: Principios Básicos y Electricidad', 70, NULL, true, true, 13, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = '0fcf3f32-3646-4a95-ada3-7b71089dac52';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '82511ce2-415b-4596-a009-ed21f9c18e73', '0fcf3f32-3646-4a95-ada3-7b71089dac52', 1, 'single', '¿Qué órgano sensorial propioceptivo es responsable de informar al sistema nervioso sobre el grado de tensión muscular instantánea?', '[{"id":"opt_82511ce2_0","text":"Aparato tendinoso de Golgi.","isCorrect":true,"feedback":"El aparato de Golgi, situado cerca de la unión musculotendinosa, transmite información de tensión a través de fibras aferentes Ib."},{"id":"opt_82511ce2_1","text":"Huso muscular.","isCorrect":false,"feedback":"El huso muscular responde principalmente a los cambios en la longitud (estiramiento) del músculo, no a la tensión."}]'::jsonb, 'El aparato tendinoso de Golgi es un receptor de tensión situado en la unión musculotendinosa que utiliza fibras Ib.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '0a0a961f-c531-4707-a655-af00b81c1673', '0fcf3f32-3646-4a95-ada3-7b71089dac52', 2, 'single', 'En una radiculopatía (lesión preganglionar), ¿qué hallazgo es esperado en los SNAPs?', '[{"id":"opt_0a0a961f_0","text":"SNAPs normales pese a hipoestesia clínica","isCorrect":true,"feedback":"Correcto. La lesión es proximal al ganglio de la raíz dorsal y las fibras sensitivas distales conservan continuidad con el soma."},{"id":"opt_0a0a961f_1","text":"SNAPs ausentes en todos los nervios","isCorrect":false,"feedback":"Incorrecto. La ausencia de SNAPs sugiere lesión posganglionar o neuropatía."},{"id":"opt_0a0a961f_2","text":"SNAPs con incremento de amplitud","isCorrect":false,"feedback":"Incorrecto. No se espera incremento de amplitud por una radiculopatía."},{"id":"opt_0a0a961f_3","text":"SNAPs con latencias muy prolongadas en todos los nervios","isCorrect":false,"feedback":"Incorrecto. Latencias difusamente prolongadas sugieren desmielinización generalizada."}]'::jsonb, 'En lesión preganglionar, los SNAPs suelen ser normales.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '94f3d7cc-607d-4ed8-abe3-208d69867ac2', '0fcf3f32-3646-4a95-ada3-7b71089dac52', 3, 'single', '¿Qué hallazgo en EMG de aguja ayuda a diferenciar radiculopatía de plexopatía?', '[{"id":"opt_94f3d7cc_0","text":"Denervación en músculos paraspinales","isCorrect":true,"feedback":"Correcto. Los paraspinales reciben ramas dorsales antes del plexo, por eso se afectan en radiculopatía."},{"id":"opt_94f3d7cc_1","text":"SNAPs disminuidos en el nervio sural","isCorrect":false,"feedback":"Incorrecto. SNAPs disminuidos son más propios de lesión posganglionar."},{"id":"opt_94f3d7cc_2","text":"Incremento del CMAP tras ejercicio breve","isCorrect":false,"feedback":"Incorrecto. Ese patrón corresponde a LEMS."},{"id":"opt_94f3d7cc_3","text":"Decremento >10% con RNS baja frecuencia","isCorrect":false,"feedback":"Incorrecto. Ese hallazgo es típico de miastenia gravis."}]'::jsonb, 'La denervación paraspinal apoya radiculopatía.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '8fd35705-e41d-4a78-aca8-24f77b5ef3eb', '0fcf3f32-3646-4a95-ada3-7b71089dac52', 4, 'single', '¿Cuál es el efecto del frío en estudios de conducción nerviosa?', '[{"id":"opt_8fd35705_0","text":"Aumenta latencia y amplitud, y disminuye velocidad","isCorrect":true,"feedback":"Correcto. La temperatura baja enlentece la conducción."},{"id":"opt_8fd35705_1","text":"Disminuye latencia y aumenta velocidad","isCorrect":false,"feedback":"Incorrecto. Ocurre lo contrario."},{"id":"opt_8fd35705_2","text":"No tiene efecto sobre la conducción","isCorrect":false,"feedback":"Incorrecto. La temperatura es un factor crítico."},{"id":"opt_8fd35705_3","text":"Solo reduce amplitud sin cambiar latencia","isCorrect":false,"feedback":"Incorrecto. La latencia aumenta con el frío."}]'::jsonb, 'Temperatura baja aumenta latencia y reduce velocidad.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'bbda7f67-7fdb-4ae6-a4fe-cac9bcdd7d8b', '0fcf3f32-3646-4a95-ada3-7b71089dac52', 5, 'single', 'Temperaturas recomendadas para estudios de conducción nerviosa son:', '[{"id":"opt_bbda7f67_0","text":">32°C en miembros superiores y >31°C en inferiores","isCorrect":true,"feedback":"Correcto. Garantiza valores comparables y evita falsos positivos."},{"id":"opt_bbda7f67_1","text":">28°C en miembros superiores y >26°C en inferiores","isCorrect":false,"feedback":"Incorrecto. Son demasiado bajas."},{"id":"opt_bbda7f67_2","text":"No se requiere control de temperatura","isCorrect":false,"feedback":"Incorrecto. La temperatura afecta la conducción."},{"id":"opt_bbda7f67_3","text":">35°C en todos los casos","isCorrect":false,"feedback":"Incorrecto. No es un requisito estándar."}]'::jsonb, 'Extremidades deben mantenerse templadas para interpretaciones válidas.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '2b358c49-2610-46c1-a471-1ba29819bef6', '0fcf3f32-3646-4a95-ada3-7b71089dac52', 6, 'single', 'En neuroconducción, la conducción ortodrómica es:', '[{"id":"opt_2b358c49_0","text":"El impulso viaja en el sentido fisiológico natural","isCorrect":true,"feedback":"Correcto. La señal progresa en la dirección normal del sistema."},{"id":"opt_2b358c49_1","text":"El impulso viaja en sentido contrario al fisiológico","isCorrect":false,"feedback":"Incorrecto. Eso describe conducción antidrómica."},{"id":"opt_2b358c49_2","text":"Un reflejo monosináptico","isCorrect":false,"feedback":"Incorrecto. Eso describe el reflejo H."},{"id":"opt_2b358c49_3","text":"Una descarga recurrente de motoneuronas","isCorrect":false,"feedback":"Incorrecto. Eso corresponde a la onda F."}]'::jsonb, 'Ortodrómico sigue la dirección fisiológica natural.', 'basic'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'c1754fcb-a8f1-4eb4-a534-bcb5e72bbda3', '0fcf3f32-3646-4a95-ada3-7b71089dac52', 7, 'single', 'La conducción antidrómica se define como:', '[{"id":"opt_c1754fcb_0","text":"Propagación opuesta a la conducción fisiológica","isCorrect":true,"feedback":"Correcto. La señal viaja en sentido inverso al habitual."},{"id":"opt_c1754fcb_1","text":"Propagación exclusiva por fibras sensitivas Ia","isCorrect":false,"feedback":"Incorrecto. No se limita a fibras Ia."},{"id":"opt_c1754fcb_2","text":"Respuesta monosináptica constante","isCorrect":false,"feedback":"Incorrecto. Eso describe el reflejo H."},{"id":"opt_c1754fcb_3","text":"Respuesta tardía agotable","isCorrect":false,"feedback":"Incorrecto. La onda F no es agotable."}]'::jsonb, 'Antidrómico va en sentido opuesto a la conducción fisiológica.', 'basic'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '71e52de5-1d70-42fb-a74a-155886eea272', '0fcf3f32-3646-4a95-ada3-7b71089dac52', 8, 'single', '¿Qué umbrales sugieren un proceso desmielinizante en neuroconducción?', '[{"id":"opt_71e52de5_0","text":"Latencia distal >130% del límite superior o VCN <75% del límite inferior","isCorrect":true,"feedback":"Correcto. Son umbrales clásicos para desmielinización."},{"id":"opt_71e52de5_1","text":"Latencia distal <80% del límite inferior","isCorrect":false,"feedback":"Incorrecto. No sugiere desmielinización."},{"id":"opt_71e52de5_2","text":"VCN >120% del límite superior","isCorrect":false,"feedback":"Incorrecto. No es criterio patológico."},{"id":"opt_71e52de5_3","text":"Amplitud del CMAP >150% del límite superior","isCorrect":false,"feedback":"Incorrecto. No define desmielinización."}]'::jsonb, 'Latencia distal >130% o VCN <75% sugieren desmielinización.', 'advanced'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'd899378f-0e94-4791-a015-d6676785e4bb', '0fcf3f32-3646-4a95-ada3-7b71089dac52', 9, 'single', 'El huso muscular responde a cambios de longitud e integra aferencias:', '[{"id":"opt_d899378f_0","text":"Ia y II, con eferencias gamma","isCorrect":true,"feedback":"Correcto. Es la base del reflejo miotático."},{"id":"opt_d899378f_1","text":"Ib exclusivamente","isCorrect":false,"feedback":"Incorrecto. Ib corresponde al órgano tendinoso de Golgi."},{"id":"opt_d899378f_2","text":"Fibras C","isCorrect":false,"feedback":"Incorrecto. No participan en propiocepción rápida."},{"id":"opt_d899378f_3","text":"Fibras motoras alfa exclusivamente","isCorrect":false,"feedback":"Incorrecto. Las alfa inervan músculo extrafusal."}]'::jsonb, 'El huso muscular se inerva por fibras Ia y II.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '91d20b9f-b6bf-4c42-a3df-26ac68cacf81', '0fcf3f32-3646-4a95-ada3-7b71089dac52', 10, 'single', 'El órgano tendinoso de Golgi informa sobre tensión muscular mediante fibras:', '[{"id":"opt_91d20b9f_0","text":"Ib","isCorrect":true,"feedback":"Correcto. Se ubica en la unión musculotendinosa."},{"id":"opt_91d20b9f_1","text":"Ia","isCorrect":false,"feedback":"Incorrecto. Ia es del huso muscular."},{"id":"opt_91d20b9f_2","text":"II","isCorrect":false,"feedback":"Incorrecto. II también es del huso muscular."},{"id":"opt_91d20b9f_3","text":"C","isCorrect":false,"feedback":"Incorrecto. No es la vía principal."}]'::jsonb, 'El órgano tendinoso de Golgi usa aferencias Ib.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'f32be4aa-050a-4023-a5ff-8895f2939935', '0fcf3f32-3646-4a95-ada3-7b71089dac52', 11, 'single', 'Según AANEM, la EMG debe ser realizada e interpretada por:', '[{"id":"opt_f32be4aa_0","text":"Médicos capacitados (neurólogos o fisiatras)","isCorrect":true,"feedback":"Correcto. La EMG requiere síntesis clínica en tiempo real."},{"id":"opt_f32be4aa_1","text":"Técnicos sin supervisión médica","isCorrect":false,"feedback":"Incorrecto. No cumple con estándares profesionales."},{"id":"opt_f32be4aa_2","text":"Personal administrativo entrenado","isCorrect":false,"feedback":"Incorrecto. No es un acto administrativo."},{"id":"opt_f32be4aa_3","text":"Cualquier profesional de salud sin formación específica","isCorrect":false,"feedback":"Incorrecto. Se requiere formación especializada."}]'::jsonb, 'La EMG es un acto médico con interpretación dinámica.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '49931ae3-4c19-4ca4-a0fe-8f7a13eb0d43', '0fcf3f32-3646-4a95-ada3-7b71089dac52', 12, 'single', 'En un estudio de conducción nerviosa, se aplica un estímulo eléctrico submáximo. ¿Qué representa fisiológicamente la aparición de la onda H?', '[{"id":"opt_49931ae3_0","text":"La activación antidrómica de las fibras Ia y su descarga sináptica sobre las motoneuronas.","isCorrect":true,"feedback":"La onda H es el equivalente electrofisiológico del reflejo miotático y depende de la integridad del arco reflejo medular."},{"id":"opt_49931ae3_1","text":"La contracción muscular directa producida por el estímulo del axón motor.","isCorrect":false,"feedback":""},{"id":"opt_49931ae3_2","text":"La descarga repetitiva de las motoneuronas gamma.","isCorrect":false,"feedback":""},{"id":"opt_49931ae3_3","text":"El tiempo de conducción exclusiva a través de los ganglios basales.","isCorrect":false,"feedback":""}]'::jsonb, 'La onda M es la respuesta directa del nervio motor; la onda H es la respuesta refleja tras pasar por la médula.', 'advanced'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'c807bd13-37a2-49a7-a5fc-4df98a4486c8', '0fcf3f32-3646-4a95-ada3-7b71089dac52', 13, 'single', '¿Cómo se define el periodo de latencia en la fisiología de los reflejos?', '[{"id":"opt_c807bd13_0","text":"El tiempo que transcurre desde la aplicación del estímulo hasta el inicio de la respuesta.","isCorrect":true,"feedback":"La latencia incluye el tiempo de transducción, conducción y procesamiento sináptico."},{"id":"opt_c807bd13_1","text":"La intensidad mínima necesaria para generar un potencial de acción.","isCorrect":false,"feedback":""},{"id":"opt_c807bd13_2","text":"La duración total de la contracción muscular resultante.","isCorrect":false,"feedback":""},{"id":"opt_c807bd13_3","text":"El tiempo que tarda el neurotransmisor en degradarse en la hendidura.","isCorrect":false,"feedback":""}]'::jsonb, 'La latencia es el tiempo entre el estímulo y la respuesta; a mayor estímulo, menor latencia.', 'intermediate'
);

-- ─── QUIZ: Evaluación: Fisiología de la Contracción Muscular (muscle-contraction-physiology) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  '1e7a1f8c-c4df-4768-a7a3-bc28e419d5b7', 'muscle-contraction-physiology', 'fundamentals', 'Evaluación: Fisiología de la Contracción Muscular', 70, NULL, true, true, 2, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = '1e7a1f8c-c4df-4768-a7a3-bc28e419d5b7';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '539fbddd-12c2-472d-a337-fe6cc276ffd8', '1e7a1f8c-c4df-4768-a7a3-bc28e419d5b7', 1, 'single', 'El potencial de acción se define como:', '[{"id":"opt_539fbddd_0","text":"Cambio rápido de potencial con retorno inmediato al reposo","isCorrect":true,"feedback":"Correcto. Es la base eléctrica de la conducción."},{"id":"opt_539fbddd_1","text":"Liberación de neurotransmisor en la sinapsis","isCorrect":false,"feedback":"Incorrecto. Eso es un proceso químico."},{"id":"opt_539fbddd_2","text":"Contracción sostenida del músculo","isCorrect":false,"feedback":"Incorrecto. No define un potencial de acción."},{"id":"opt_539fbddd_3","text":"Bloqueo de conducción por desmielinización","isCorrect":false,"feedback":"Incorrecto. Es un fenómeno patológico."}]'::jsonb, 'El potencial de acción es un cambio rápido seguido de retorno al reposo.', 'basic'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '7e41b72e-3a62-472a-abb2-56afff67a006', '1e7a1f8c-c4df-4768-a7a3-bc28e419d5b7', 2, 'single', 'El proceso funcional neuronal se describe como tripartito, integrando:', '[{"id":"opt_7e41b72e_0","text":"Procesos metabólicos, eléctricos y energéticos","isCorrect":true,"feedback":"Correcto. El potencial de acción es el componente eléctrico."},{"id":"opt_7e41b72e_1","text":"Solo procesos eléctricos y químicos","isCorrect":false,"feedback":"Incorrecto. Falta el componente energético."},{"id":"opt_7e41b72e_2","text":"Procesos mecánicos y vasculares","isCorrect":false,"feedback":"Incorrecto. No corresponde a la definición."},{"id":"opt_7e41b72e_3","text":"Procesos térmicos y osmóticos","isCorrect":false,"feedback":"Incorrecto. No es la clasificación clásica."}]'::jsonb, 'El proceso neuronal integra componentes metabólicos, eléctricos y energéticos.', 'intermediate'
);

-- ─── QUIZ: Evaluación: Clasificación de Lesiones Nerviosas (nerve-fiber-classification) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  'e6e2ffca-99e1-4142-a0f1-9ad447d72346', 'nerve-fiber-classification', 'fundamentals', 'Evaluación: Clasificación de Lesiones Nerviosas', 70, NULL, true, true, 2, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = 'e6e2ffca-99e1-4142-a0f1-9ad447d72346';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '2a4ac672-6903-44b1-a874-2beafd9aa84f', 'e6e2ffca-99e1-4142-a0f1-9ad447d72346', 1, 'single', 'Según Sunderland, la neuropraxia (tipo 1) se caracteriza por:', '[{"id":"opt_2a4ac672_0","text":"Bloqueo de conducción focal por lesión de mielina","isCorrect":true,"feedback":"Correcto. La recuperación suele ser en semanas o meses."},{"id":"opt_2a4ac672_1","text":"Sección completa del nervio","isCorrect":false,"feedback":"Incorrecto. Eso corresponde a neurotmesis."},{"id":"opt_2a4ac672_2","text":"Interrupción axonal con degeneración walleriana","isCorrect":false,"feedback":"Incorrecto. Eso es axonotmesis."},{"id":"opt_2a4ac672_3","text":"Necrosis muscular primaria","isCorrect":false,"feedback":"Incorrecto. No es una lesión muscular."}]'::jsonb, 'Neuropraxia es bloqueo por lesión de mielina, con recuperación en semanas/meses.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'fcbb53e2-1a35-4ae6-a2d2-f687facfc6e8', 'e6e2ffca-99e1-4142-a0f1-9ad447d72346', 2, 'single', 'La neurotmesis (tipo 5 de Sunderland) se define como:', '[{"id":"opt_fcbb53e2_0","text":"Sección completa del nervio con necesidad de reparación quirúrgica","isCorrect":true,"feedback":"Correcto. Es la lesión más grave en la clasificación."},{"id":"opt_fcbb53e2_1","text":"Bloqueo de conducción por desmielinización","isCorrect":false,"feedback":"Incorrecto. Eso es neuropraxia."},{"id":"opt_fcbb53e2_2","text":"Interrupción axonal con endoneuro intacto","isCorrect":false,"feedback":"Incorrecto. Eso es axonotmesis leve."},{"id":"opt_fcbb53e2_3","text":"Lesión reversible en días","isCorrect":false,"feedback":"Incorrecto. Es una lesión grave."}]'::jsonb, 'Neurotmesis (tipo 5) implica sección completa del nervio.', 'intermediate'
);

-- ─── QUIZ: Evaluación: Principios Generales de Neuroconducción (general-principles) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  '9b13ecc7-4f82-4c86-ac53-9c235eaddf1f', 'general-principles', 'nerve-conduction', 'Evaluación: Principios Generales de Neuroconducción', 70, NULL, true, true, 4, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = '9b13ecc7-4f82-4c86-ac53-9c235eaddf1f';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '13883a32-3068-4bfd-a3e2-8bda0b7206b7', '9b13ecc7-4f82-4c86-ac53-9c235eaddf1f', 1, 'single', '¿Cuál es la raíz nerviosa que media principalmente el Reflejo H (Hoffman) y qué tipo de estímulo se requiere para su activación?', '[{"id":"opt_13883a32_0","text":"Raíz S1, con un estímulo eléctrico submáximo en un nervio mixto.","isCorrect":true,"feedback":"El Reflejo H se produce con un estímulo submáximo que activa las fibras aferentes Ia, principalmente en la raíz S1."},{"id":"opt_13883a32_1","text":"Raíz L5, con un estímulo supramáximo de corta duración.","isCorrect":false,"feedback":"El estímulo supramáximo se utiliza para generar la Onda F, no el Reflejo H."}]'::jsonb, 'El Reflejo H es un reflejo espinal monosináptico mediado por la raíz S1, siendo el análogo electrofisiológico del reflejo Aquileo.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'b33dd1dd-4c29-4685-aa4c-e0a678f31f03', '9b13ecc7-4f82-4c86-ac53-9c235eaddf1f', 2, 'single', '¿Cómo se comportan los potenciales de acción de nervio sensitivo (SNAP) en una lesión proximal a la raíz del ganglio dorsal (radiculopatía)?', '[{"id":"opt_b33dd1dd_0","text":"Permanecen normales.","isCorrect":true,"feedback":"En lesiones proximales al ganglio, la raíz dorsal (célula bipolar) mantiene la continuidad con las fibras distales, por lo que el SNAP es normal."},{"id":"opt_b33dd1dd_1","text":"Se encuentran disminuidos o ausentes.","isCorrect":false,"feedback":"Los SNAP disminuidos son característicos de lesiones en el ganglio o distales a él, como en plexopatías o neuropatías."}]'::jsonb, 'En lesiones proximales al ganglio (radiculopatías), los SNAP permanecen normales debido a la persistencia de la continuidad con las fibras sensitivas distales.', 'advanced'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '037b7823-2a5a-4870-a167-4069bf469ebe', '9b13ecc7-4f82-4c86-ac53-9c235eaddf1f', 3, 'single', '¿A qué edad las velocidades de conducción nerviosa de un niño se igualan a las de un adulto y cuáles son los valores mínimos esperados?', '[{"id":"opt_037b7823_0","text":"A los 5 años; >50 m/s en miembros superiores y >40 m/s en inferiores.","isCorrect":true,"feedback":"A los 5 años se alcanza la madurez. Los valores normales son >50 m/s (MsTs) y >40 m/s (MsPs)."},{"id":"opt_037b7823_1","text":"A los 2 años; >60 m/s en miembros superiores y >50 m/s en inferiores.","isCorrect":false,"feedback":"Aunque la sinaptogénesis termina cerca de los 2 años, la conducción nerviosa madura hasta los 5 años."}]'::jsonb, 'La maduración de las velocidades de neuroconducción alcanza los niveles del adulto a los 5 años de edad.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '1c801730-4aa5-4102-ad77-135aa5dc1ed7', '9b13ecc7-4f82-4c86-ac53-9c235eaddf1f', 4, 'single', 'En respuestas tardías, una diferencia interlado patológica se considera cuando es >1.5 ms en miembros superiores o >2 ms en miembros inferiores. Este parámetro se denomina:', '[{"id":"opt_1c801730_0","text":"Regla de latencia interlado","isCorrect":true,"feedback":"Correcto. Es el parámetro más robusto para comparar lados."},{"id":"opt_1c801730_1","text":"Regla de amplitud basal","isCorrect":false,"feedback":"Incorrecto. La amplitud es menos robusta que la latencia."},{"id":"opt_1c801730_2","text":"Regla de velocidad terminal","isCorrect":false,"feedback":"Incorrecto. Se refiere a otro parámetro."},{"id":"opt_1c801730_3","text":"Regla de conducción sensitiva","isCorrect":false,"feedback":"Incorrecto. Aquí hablamos de latencia interlado."}]'::jsonb, 'La diferencia interlado es el parámetro más robusto.', 'advanced'
);

-- ─── QUIZ: Evaluación: Onda F vs. Reflejo H (f-vs-h) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  'e7331b21-e60d-463e-ad6e-3efcbc47c897', 'f-vs-h', 'nerve-conduction', 'Evaluación: Onda F vs. Reflejo H', 70, NULL, true, true, 2, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = 'e7331b21-e60d-463e-ad6e-3efcbc47c897';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '9176d8ec-3b49-4f3d-a3f9-b49809bad8c1', 'e7331b21-e60d-463e-ad6e-3efcbc47c897', 1, 'single', 'En la comparación Onda F vs Reflejo H, el agotamiento es:', '[{"id":"opt_9176d8ec_0","text":"Onda F no agotable; Reflejo H agotable","isCorrect":true,"feedback":"Correcto. Es una diferencia fisiológica clave."},{"id":"opt_9176d8ec_1","text":"Onda F agotable; Reflejo H no agotable","isCorrect":false,"feedback":"Incorrecto. Es al revés."},{"id":"opt_9176d8ec_2","text":"Ambas no agotables","isCorrect":false,"feedback":"Incorrecto. El reflejo H sí puede agotarse."},{"id":"opt_9176d8ec_3","text":"Ambas agotables","isCorrect":false,"feedback":"Incorrecto. La onda F no es agotable."}]'::jsonb, 'El reflejo H es agotable; la onda F no.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '3532853c-b161-4063-ac52-4506d6dc88c3', 'e7331b21-e60d-463e-ad6e-3efcbc47c897', 2, 'single', 'En condiciones normales, la amplitud del reflejo H suele ser:', '[{"id":"opt_3532853c_0","text":"50-100% del CMAP","isCorrect":true,"feedback":"Correcto. Es más grande que la onda F."},{"id":"opt_3532853c_1","text":"~5% del CMAP","isCorrect":false,"feedback":"Incorrecto. Ese valor corresponde a la onda F."},{"id":"opt_3532853c_2","text":"Menor al 1% del CMAP","isCorrect":false,"feedback":"Incorrecto. Sería demasiado pequeña."},{"id":"opt_3532853c_3","text":"Igual al CMAP basal","isCorrect":false,"feedback":"Incorrecto. Puede variar, pero no es igual al CMAP."}]'::jsonb, 'La amplitud del reflejo H puede alcanzar 50-100% del CMAP.', 'intermediate'
);

-- ─── QUIZ: Evaluación: Reflejo H (Hoffmann) (h-reflex) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  '52d504bd-2e11-42b6-a278-21b08eb2d372', 'h-reflex', 'late-responses', 'Evaluación: Reflejo H (Hoffmann)', 70, NULL, true, true, 6, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = '52d504bd-2e11-42b6-a278-21b08eb2d372';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '33f808f9-8143-4b17-af64-f372f69fa1c5', '52d504bd-2e11-42b6-a278-21b08eb2d372', 1, 'single', '¿Qué diferencia interlado de latencia del reflejo H es considerada significativa?', '[{"id":"opt_33f808f9_0","text":"Mayor a 1.2–1.5 ms","isCorrect":true,"feedback":"Correcto. Esa diferencia sugiere alteración relevante."},{"id":"opt_33f808f9_1","text":"Mayor a 0.2 ms","isCorrect":false,"feedback":"Incorrecto. Ese valor es demasiado bajo."},{"id":"opt_33f808f9_2","text":"Mayor a 3.5 ms","isCorrect":false,"feedback":"Incorrecto. Es un umbral excesivo para interlado."},{"id":"opt_33f808f9_3","text":"No se evalúa interlado en el reflejo H","isCorrect":false,"feedback":"Incorrecto. La comparación interlado es útil."}]'::jsonb, 'Diferencia interlado del reflejo H >1.2-1.5 ms es significativa.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'c433637c-a95f-4b44-a597-6a87ff92fb30', '52d504bd-2e11-42b6-a278-21b08eb2d372', 2, 'single', 'El reflejo H corresponde a:', '[{"id":"opt_c433637c_0","text":"Un arco reflejo monosináptico","isCorrect":true,"feedback":"Correcto. Es el análogo eléctrico del reflejo miotático."},{"id":"opt_c433637c_1","text":"Una descarga recurrente motora","isCorrect":false,"feedback":"Incorrecto. Eso describe la onda F."},{"id":"opt_c433637c_2","text":"Un potencial sensitivo distal","isCorrect":false,"feedback":"Incorrecto. No es un SNAP."},{"id":"opt_c433637c_3","text":"Un potencial evocado visual","isCorrect":false,"feedback":"Incorrecto. No pertenece a PE."}]'::jsonb, 'El reflejo H es un arco monosináptico.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '89c07df4-6560-4192-a496-bfafe4d82ab2', '52d504bd-2e11-42b6-a278-21b08eb2d372', 3, 'single', 'La vía aferente principal del reflejo H es:', '[{"id":"opt_89c07df4_0","text":"Fibras Ia sensitivas","isCorrect":true,"feedback":"Correcto. Hacen sinapsis directa con motoneuronas alfa."},{"id":"opt_89c07df4_1","text":"Fibras Ib del Golgi","isCorrect":false,"feedback":"Incorrecto. Esas fibras no median el reflejo H."},{"id":"opt_89c07df4_2","text":"Fibras A-delta","isCorrect":false,"feedback":"Incorrecto. No participan en este reflejo."},{"id":"opt_89c07df4_3","text":"Fibras C","isCorrect":false,"feedback":"Incorrecto. No median reflejos miotáticos."}]'::jsonb, 'El reflejo H usa fibras aferentes Ia.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '6babd4a1-ddba-4f6c-a279-55a937d0d606', '52d504bd-2e11-42b6-a278-21b08eb2d372', 4, 'single', 'Para obtener un reflejo H, el estímulo debe ser:', '[{"id":"opt_6babd4a1_0","text":"Submáximo","isCorrect":true,"feedback":"Correcto. Activa fibras Ia antes que motoras."},{"id":"opt_6babd4a1_1","text":"Supramáximo","isCorrect":false,"feedback":"Incorrecto. Eso es típico de la onda F."},{"id":"opt_6babd4a1_2","text":"Doloroso e intenso","isCorrect":false,"feedback":"Incorrecto. La intensidad busca selectividad."},{"id":"opt_6babd4a1_3","text":"Sin estimulación eléctrica","isCorrect":false,"feedback":"Incorrecto. Es un reflejo inducido."}]'::jsonb, 'El reflejo H se obtiene con estímulo submáximo.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'fe3b8841-124b-4d4f-aa21-587f8f441aa0', '52d504bd-2e11-42b6-a278-21b08eb2d372', 5, 'single', 'Comparado con la onda F, el reflejo H se caracteriza por:', '[{"id":"opt_fe3b8841_0","text":"Latencia y morfología más constantes","isCorrect":true,"feedback":"Correcto. El reflejo H es más estable."},{"id":"opt_fe3b8841_1","text":"Mayor variabilidad de latencia","isCorrect":false,"feedback":"Incorrecto. La variabilidad es propia de la onda F."},{"id":"opt_fe3b8841_2","text":"Amplitud siempre menor al 5% del CMAP","isCorrect":false,"feedback":"Incorrecto. El reflejo H es mayor que la onda F."},{"id":"opt_fe3b8841_3","text":"No relacionarse con la raíz S1","isCorrect":false,"feedback":"Incorrecto. Es clásico para S1."}]'::jsonb, 'El reflejo H tiene latencia y morfología constantes.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'f03a21de-f8e7-40f5-a9a2-ddd04c6293a7', '52d504bd-2e11-42b6-a278-21b08eb2d372', 6, 'single', 'El reflejo H es el estándar para evaluar la raíz:', '[{"id":"opt_f03a21de_0","text":"S1 (sóleo/gastrocnemio)","isCorrect":true,"feedback":"Correcto. "},{"id":"opt_f03a21de_1","text":"L5 (Isquiotibiales)","isCorrect":false,"feedback":"Incorrecto. No es la raíz principal del reflejo H clásico."},{"id":"opt_f03a21de_2","text":"L4 (tibial anterior)","isCorrect":false,"feedback":"Incorrecto. El reflejo H clásico evalúa S1."},{"id":"opt_f03a21de_3","text":"S1 (Gluteos)","isCorrect":false,"feedback":"Incorrecto. No aplica."}]'::jsonb, 'El reflejo H evalúa principalmente la raíz S1.', 'basic'
);

-- ─── QUIZ: Evaluación: Onda F (f-wave) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  '11fd48ba-3706-4929-a71c-f8d294367f1b', 'f-wave', 'late-responses', 'Evaluación: Onda F', 70, NULL, true, true, 6, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = '11fd48ba-3706-4929-a71c-f8d294367f1b';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '82b1d52a-b35d-4807-a568-d759745b187c', '11fd48ba-3706-4929-a71c-f8d294367f1b', 1, 'single', '¿Qué evalúa principalmente la onda F en estudios de conducción nerviosa?', '[{"id":"opt_82b1d52a_0","text":"Conducción proximal y raíces","isCorrect":true,"feedback":"Correcto. La onda F explora segmentos proximales."},{"id":"opt_82b1d52a_1","text":"Unión neuromuscular postsináptica","isCorrect":false,"feedback":"Incorrecto. Eso se evalúa con RNS o SFEMG."},{"id":"opt_82b1d52a_2","text":"Conducción sensitiva distal exclusiva","isCorrect":false,"feedback":"Incorrecto. La onda F es motor y proximal."},{"id":"opt_82b1d52a_3","text":"Solo la integridad del músculo estudiado","isCorrect":false,"feedback":"Incorrecto. No es una prueba miopática."}]'::jsonb, 'La onda F evalúa conducción proximal (raíces).', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '5d63f9ab-acb8-488b-ac5f-e0c40d284cb6', '11fd48ba-3706-4929-a71c-f8d294367f1b', 2, 'single', 'Para obtener una onda F confiable se requiere un estímulo:', '[{"id":"opt_5d63f9ab_0","text":"Supramáximo","isCorrect":true,"feedback":"Correcto. Se busca activar todas las fibras motoras posibles."},{"id":"opt_5d63f9ab_1","text":"Submáximo","isCorrect":false,"feedback":"Incorrecto. El estímulo submáximo se usa para reflejo H."},{"id":"opt_5d63f9ab_2","text":"Solo sensitivo","isCorrect":false,"feedback":"Incorrecto. La onda F es una respuesta motora."},{"id":"opt_5d63f9ab_3","text":"Inhibitorio","isCorrect":false,"feedback":"Incorrecto. No aplica a la técnica."}]'::jsonb, 'La onda F requiere estímulo supramáximo.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '03390863-d7bd-4f64-a93c-e4b4996a0e17', '11fd48ba-3706-4929-a71c-f8d294367f1b', 3, 'single', 'La onda F se genera por activación de:', '[{"id":"opt_03390863_0","text":"Fibras alfa motoras","isCorrect":true,"feedback":"Correcto. Es una descarga recurrente de motoneuronas alfa."},{"id":"opt_03390863_1","text":"Fibras Ia sensitivas","isCorrect":false,"feedback":"Incorrecto. Esas fibras participan en el reflejo H."},{"id":"opt_03390863_2","text":"Fibras Ib del Golgi","isCorrect":false,"feedback":"Incorrecto. No son la vía principal de la onda F."},{"id":"opt_03390863_3","text":"Fibras gamma motoras","isCorrect":false,"feedback":"Incorrecto. Las gamma modulan el huso muscular."}]'::jsonb, 'La onda F involucra fibras alfa motoras.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '15a4283f-0d5c-4a0a-a741-00b072ddccc0', '11fd48ba-3706-4929-a71c-f8d294367f1b', 4, 'single', 'En condiciones normales, la persistencia de la onda F es:', '[{"id":"opt_15a4283f_0","text":"Variable, depende de la excitabilidad del pool de motoneuronas","isCorrect":true,"feedback":"Correcto. Por eso no aparece en todos los estímulos."},{"id":"opt_15a4283f_1","text":"Constante, siempre aparece en cada estímulo","isCorrect":false,"feedback":"Incorrecto. Esa constancia es más propia del reflejo H."},{"id":"opt_15a4283f_2","text":"Ausente en sujetos sanos","isCorrect":false,"feedback":"Incorrecto. La onda F es una respuesta normal."},{"id":"opt_15a4283f_3","text":"Igual a la del reflejo H","isCorrect":false,"feedback":"Incorrecto. La onda F es menos persistente."}]'::jsonb, 'La persistencia de la onda F es variable.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '6f657f7b-f66a-43a6-a0db-0dc4852f6546', '11fd48ba-3706-4929-a71c-f8d294367f1b', 5, 'single', 'La amplitud típica de la onda F es aproximadamente:', '[{"id":"opt_6f657f7b_0","text":"5% del CMAP","isCorrect":true,"feedback":"Correcto. Es una respuesta pequeña y variable."},{"id":"opt_6f657f7b_1","text":"50-100% del CMAP","isCorrect":false,"feedback":"Incorrecto. Esa amplitud corresponde al reflejo H."},{"id":"opt_6f657f7b_2","text":"Igual al CMAP basal","isCorrect":false,"feedback":"Incorrecto. La onda F es de menor amplitud."},{"id":"opt_6f657f7b_3","text":">150% del CMAP","isCorrect":false,"feedback":"Incorrecto. No es un hallazgo fisiológico."}]'::jsonb, 'La onda F suele medir ~5% del CMAP.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'f3899fe0-dea8-46f6-a34d-790854804811', '11fd48ba-3706-4929-a71c-f8d294367f1b', 6, 'single', 'Una persistencia de onda F <50% sugiere:', '[{"id":"opt_f3899fe0_0","text":"Pérdida de unidades motoras funcionales o bloqueo proximal","isCorrect":true,"feedback":"Correcto. Indica compromiso proximal o pérdida de unidades."},{"id":"opt_f3899fe0_1","text":"Reflejo H normal","isCorrect":false,"feedback":"Incorrecto. La persistencia baja es anormal."},{"id":"opt_f3899fe0_2","text":"Miopatía inflamatoria pura","isCorrect":false,"feedback":"Incorrecto. Es más indicativo de patología proximal motor."},{"id":"opt_f3899fe0_3","text":"Normalidad del estudio","isCorrect":false,"feedback":"Incorrecto. Es un dato patológico."}]'::jsonb, 'Persistencia <50% en onda F sugiere pérdida de unidades motoras o bloqueo proximal.', 'intermediate'
);

-- ─── QUIZ: Evaluación: Principios de la EMG de Aguja (emg-principles) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  '090dcc60-491f-4d40-a2a9-c8d811f4b4aa', 'emg-principles', 'emg-needle', 'Evaluación: Principios de la EMG de Aguja', 70, NULL, true, true, 5, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = '090dcc60-491f-4d40-a2a9-c8d811f4b4aa';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '9b790a29-5b9c-48c6-a496-c6bf8a6a4edb', '090dcc60-491f-4d40-a2a9-c8d811f4b4aa', 1, 'single', 'En el estudio de estimulación repetitiva a 2-3Hz para Miastenia Gravis, ¿qué hallazgo confirma el diagnóstico?', '[{"id":"opt_9b790a29_0","text":"Reducción de más del 10% en la amplitud entre la primera respuesta y la más pequeña de las primeras cinco.","isCorrect":true,"feedback":"El decremento postsináptico típico de la Miastenia Gravis muestra una caída de amplitud superior al 10% en trenes de estímulos a baja frecuencia."},{"id":"opt_9b790a29_1","text":"Un incremento progresivo (facilitación) superior al 100% tras el ejercicio.","isCorrect":false,"feedback":"La facilitación es característica de síndromes presinápticos como el de Lambert-Eaton, no de la Miastenia Gravis."}]'::jsonb, 'El diagnóstico de Miastenia Gravis requiere demostrar un decremento mayor al 10% en la amplitud de la respuesta motora con estimulación repetitiva.', 'advanced'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'f68ce4fa-efdf-4915-a8df-64e39fd19ed5', '090dcc60-491f-4d40-a2a9-c8d811f4b4aa', 2, 'single', '¿Cuál combinación de hallazgos sugiere patrón neurogénico en EMG de aguja?', '[{"id":"opt_f68ce4fa_0","text":"PAUMs de gran amplitud/duración y reclutamiento disminuido","isCorrect":true,"feedback":"Correcto. La reinervación colateral genera unidades grandes con reclutamiento reducido."},{"id":"opt_f68ce4fa_1","text":"PAUMs pequeños y reclutamiento precoz","isCorrect":false,"feedback":"Incorrecto. Eso es típico de patrón miopático."},{"id":"opt_f68ce4fa_2","text":"Bloqueo de conducción motor con sensibilidad normal","isCorrect":false,"feedback":"Incorrecto. Eso orienta a neuropatía motora multifocal."},{"id":"opt_f68ce4fa_3","text":"Incremento >100% del CMAP post-ejercicio","isCorrect":false,"feedback":"Incorrecto. Es característico de LEMS."}]'::jsonb, 'El patrón neurogénico combina PAUMs grandes y reclutamiento reducido.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'dc61bb67-fee2-4b54-af64-0e89226d14e9', '090dcc60-491f-4d40-a2a9-c8d811f4b4aa', 3, 'single', 'En un patrón miopático típico, ¿qué se espera en la EMG de aguja?', '[{"id":"opt_dc61bb67_0","text":"PAUMs de baja amplitud y duración con reclutamiento precoz","isCorrect":true,"feedback":"Correcto. Muchas unidades pequeñas se activan para generar poca fuerza."},{"id":"opt_dc61bb67_1","text":"PAUMs de gran amplitud y reclutamiento disminuido","isCorrect":false,"feedback":"Incorrecto. Eso corresponde a patrón neurogénico."},{"id":"opt_dc61bb67_2","text":"Incremento de amplitud con alta frecuencia de RNS","isCorrect":false,"feedback":"Incorrecto. Es un hallazgo presináptico como en LEMS."},{"id":"opt_dc61bb67_3","text":"SNAPs normales con hipoestesia clínica","isCorrect":false,"feedback":"Incorrecto. Ese hallazgo sugiere radiculopatía."}]'::jsonb, 'El patrón miopático muestra reclutamiento precoz con PAUMs pequeños.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'a995d4fe-e648-4520-a068-a384725d9fea', '090dcc60-491f-4d40-a2a9-c8d811f4b4aa', 4, 'single', 'En el análisis del patrón de reclutamiento, la densidad se refiere a:', '[{"id":"opt_a995d4fe_0","text":"El número de espigas o actividad presente","isCorrect":true,"feedback":"Correcto. Es un indicador del número de unidades activas."},{"id":"opt_a995d4fe_1","text":"El voltaje total de la contracción","isCorrect":false,"feedback":"Incorrecto. Eso describe el promedio de amplitud."},{"id":"opt_a995d4fe_2","text":"La velocidad de conducción","isCorrect":false,"feedback":"Incorrecto. No es un parámetro de reclutamiento."},{"id":"opt_a995d4fe_3","text":"La latencia de la onda F","isCorrect":false,"feedback":"Incorrecto. No aplica."}]'::jsonb, 'El patrón de reclutamiento integra densidad y amplitud promedio.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '2ef78402-0fa3-4b81-afb9-ed8e4cac4b5c', '090dcc60-491f-4d40-a2a9-c8d811f4b4aa', 5, 'single', 'Tras una lesión nerviosa, la EMG de aguja es más informativa después de:', '[{"id":"opt_2ef78402_0","text":"21 días","isCorrect":true,"feedback":"Correcto. Es el tiempo típico para aparición de fibrilaciones."},{"id":"opt_2ef78402_1","text":"24 horas","isCorrect":false,"feedback":"Incorrecto. Es demasiado temprano para denervación activa."},{"id":"opt_2ef78402_2","text":"5 días","isCorrect":false,"feedback":"Incorrecto. Aún puede no haber fibrilaciones."},{"id":"opt_2ef78402_3","text":"2 horas","isCorrect":false,"feedback":"Incorrecto. No es útil tan temprano."}]'::jsonb, 'La EMG es más informativa después de 21 días de lesión.', 'intermediate'
);

-- ─── QUIZ: Evaluación: Actividad Espontánea Anormal (spontaneous-activity) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  '16175fb3-1a20-4eb8-a6f6-67a290454a28', 'spontaneous-activity', 'emg-needle', 'Evaluación: Actividad Espontánea Anormal', 70, NULL, true, true, 6, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = '16175fb3-1a20-4eb8-a6f6-67a290454a28';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '11ebd687-e0fb-45b2-a53c-d7ea33606e1e', '16175fb3-1a20-4eb8-a6f6-67a290454a28', 1, 'single', '¿Qué indica la presencia de fibrilaciones y ondas positivas en EMG de aguja?', '[{"id":"opt_11ebd687_0","text":"Denervación activa o inestabilidad de membrana","isCorrect":true,"feedback":"Correcto. Sugiere denervación aguda o miopatías inflamatorias/necrotizantes."},{"id":"opt_11ebd687_1","text":"Trastorno presináptico de la unión neuromuscular","isCorrect":false,"feedback":"Incorrecto. Eso se evalúa mejor con RNS alta frecuencia y CMAP."},{"id":"opt_11ebd687_2","text":"Desmielinización crónica sin denervación","isCorrect":false,"feedback":"Incorrecto. La denervación activa sí produce fibrilaciones."},{"id":"opt_11ebd687_3","text":"Normalidad electromiográfica","isCorrect":false,"feedback":"Incorrecto. Es un hallazgo patológico."}]'::jsonb, 'Fibrilaciones y ondas positivas indican denervación activa.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'd6fd98a6-d00b-4be1-a04d-ef551d5a0b1f', '16175fb3-1a20-4eb8-a6f6-67a290454a28', 2, 'single', 'Las fasciculaciones difusas y complejas en EMG sugieren principalmente:', '[{"id":"opt_d6fd98a6_0","text":"Enfermedad de motoneurona (ELA)","isCorrect":true,"feedback":"Correcto. En un contexto de reinervación crónica, son un signo relevante de ELA."},{"id":"opt_d6fd98a6_1","text":"Miastenia gravis","isCorrect":false,"feedback":"Incorrecto. En MG predominan hallazgos de decremento y jitter."},{"id":"opt_d6fd98a6_2","text":"LEMS","isCorrect":false,"feedback":"Incorrecto. LEMS se caracteriza por facilitación >100% del CMAP."},{"id":"opt_d6fd98a6_3","text":"Radiculopatía pura sin denervación","isCorrect":false,"feedback":"Incorrecto. Las fasciculaciones difusas suelen implicar patología de motoneurona."}]'::jsonb, 'Fasciculaciones difusas y complejas sugieren ELA.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '0ed66bdf-c319-493f-a6c3-fc2a068590ed', '16175fb3-1a20-4eb8-a6f6-67a290454a28', 3, 'single', '¿Qué describe mejor a las descargas repetitivas complejas en EMG?', '[{"id":"opt_0ed66bdf_0","text":"Inicio y fin súbito con patrón repetitivo tipo \"máquina\"","isCorrect":true,"feedback":"Correcto. Se observan en cronicidad neurógena o miopática."},{"id":"opt_0ed66bdf_1","text":"Aumento y descenso gradual de frecuencia con sonido de \"avión en picada\"","isCorrect":false,"feedback":"Incorrecto. Esa descripción corresponde a descargas miotónicas."},{"id":"opt_0ed66bdf_2","text":"Decremento >10% en RNS a 3 Hz","isCorrect":false,"feedback":"Incorrecto. Eso evalúa unión neuromuscular."},{"id":"opt_0ed66bdf_3","text":"Bloqueo de conducción motor focal","isCorrect":false,"feedback":"Incorrecto. Es un hallazgo de NMM."}]'::jsonb, 'Las descargas repetitivas complejas tienen inicio/fin súbito.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '1ead1d48-0402-4635-af5f-052f83b337d4', '16175fb3-1a20-4eb8-a6f6-67a290454a28', 4, 'single', 'Las descargas miotónicas en EMG se caracterizan por:', '[{"id":"opt_1ead1d48_0","text":"Aumentar y disminuir en frecuencia y amplitud con sonido de \"avión en picada\"","isCorrect":true,"feedback":"Correcto. Es típico de distrofia miotónica o canalopatías."},{"id":"opt_1ead1d48_1","text":"Inicio y fin súbito con ritmo de \"máquina\"","isCorrect":false,"feedback":"Incorrecto. Eso describe descargas repetitivas complejas."},{"id":"opt_1ead1d48_2","text":"Ausencia de actividad espontánea","isCorrect":false,"feedback":"Incorrecto. Sí es una forma de actividad espontánea patológica."},{"id":"opt_1ead1d48_3","text":"Incremento >100% del CMAP con ejercicio","isCorrect":false,"feedback":"Incorrecto. Ese hallazgo es de LEMS."}]'::jsonb, 'Las descargas miotónicas tienen patrón de "avión en picada".', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '8ddb44df-2d92-4beb-ac51-480c2e460c8f', '16175fb3-1a20-4eb8-a6f6-67a290454a28', 5, 'single', 'Las fibrilaciones/ondas puntiagudas positivas en EMG suelen describirse con sonido de:', '[{"id":"opt_8ddb44df_0","text":"\"Lluvia en techo\" o \"golpeteo sordo\"","isCorrect":true,"feedback":"Correcto. Es una descripción clásica de denervación activa."},{"id":"opt_8ddb44df_1","text":"\"Avión en picada\"","isCorrect":false,"feedback":"Incorrecto. Eso describe descargas miotónicas."},{"id":"opt_8ddb44df_2","text":"\"Máquina\" de inicio y fin súbito","isCorrect":false,"feedback":"Incorrecto. Eso corresponde a descargas repetitivas complejas."},{"id":"opt_8ddb44df_3","text":"\"Marcha de soldados\"","isCorrect":false,"feedback":"Incorrecto. Ese sonido es típico de miocimias."}]'::jsonb, 'Fibrilaciones suenan como "lluvia en techo".', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'af5f801d-46d4-41ce-addd-240c48ba4474', '16175fb3-1a20-4eb8-a6f6-67a290454a28', 6, 'single', 'Las miocimias en EMG se describen típicamente como sonido de:', '[{"id":"opt_af5f801d_0","text":"\"Marcha de soldados\"","isCorrect":true,"feedback":"Correcto. Son descargas en ráfaga características."},{"id":"opt_af5f801d_1","text":"\"Avión en picada\"","isCorrect":false,"feedback":"Incorrecto. Ese sonido es de miotonía."},{"id":"opt_af5f801d_2","text":"\"Lluvia en techo\"","isCorrect":false,"feedback":"Incorrecto. Eso es de fibrilaciones."},{"id":"opt_af5f801d_3","text":"\"Máquina\" con inicio y fin súbito","isCorrect":false,"feedback":"Incorrecto. Eso es de descargas repetitivas complejas."}]'::jsonb, 'Miocimias suenan como "marcha de soldados".
Las mioquimias son contracciones involuntarias, rítmicas o semirrítmicas, de pequeñas fibras musculares, frecuentemente observadas en párpados o cara. Electromiográficamente (EMG), se caracterizan por descargas agrupadas de unidades motoras de alta frecuencia (\(5\) a \(150\) Hz), con episodios repetitivos separados por silencios breves. Generalmente benignas, indican irritación nerviosa o fatiga. ', 'intermediate'
);

-- ─── QUIZ: Evaluación: Fisiología de la Unión Neuromuscular (nmj-physiology) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  'b211345d-2a85-4b05-a66d-56f405be3585', 'nmj-physiology', 'repetitive-stimulation', 'Evaluación: Fisiología de la Unión Neuromuscular', 70, NULL, true, true, 4, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = 'b211345d-2a85-4b05-a66d-56f405be3585';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'f16860a8-8cf4-47b7-a4b8-7902d19f5582', 'b211345d-2a85-4b05-a66d-56f405be3585', 1, 'single', 'En miastenia gravis, la estimulación nerviosa repetitiva (RNS) a baja frecuencia es positiva cuando:', '[{"id":"opt_f16860a8_0","text":"Hay decremento >10% en la amplitud del CMAP","isCorrect":true,"feedback":"Correcto. Se observa típicamente entre el 1° y 4°/5° estímulo."},{"id":"opt_f16860a8_1","text":"Hay incremento >100% del CMAP","isCorrect":false,"feedback":"Incorrecto. Ese patrón es de LEMS."},{"id":"opt_f16860a8_2","text":"SNAPs normales en miembros superiores","isCorrect":false,"feedback":"Incorrecto. Eso no define MG."},{"id":"opt_f16860a8_3","text":"Ondas F prolongadas en todos los nervios","isCorrect":false,"feedback":"Incorrecto. Eso se relaciona con desmielinización."}]'::jsonb, 'RNS a 2-3 Hz con decremento >10% sugiere MG.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'b26219dd-39bb-4fe4-af73-5cafa1d1073b', 'b211345d-2a85-4b05-a66d-56f405be3585', 2, 'single', 'En miastenia gravis, ¿qué hallazgo en SFEMG es típico?', '[{"id":"opt_b26219dd_0","text":"Aumento del jitter o bloqueos","isCorrect":true,"feedback":"Correcto. Es la prueba más sensible (95-99%)."},{"id":"opt_b26219dd_1","text":"Descargas miotónicas","isCorrect":false,"feedback":"Incorrecto. Eso sugiere canalopatías."},{"id":"opt_b26219dd_2","text":"Fibrilaciones difusas","isCorrect":false,"feedback":"Incorrecto. Eso sugiere denervación activa."},{"id":"opt_b26219dd_3","text":"PAUMs de gran amplitud y duración","isCorrect":false,"feedback":"Incorrecto. Es un hallazgo neurogénico."}]'::jsonb, 'SFEMG es la prueba más sensible para MG.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '7f0d56c0-a864-4a35-a887-e831d681c3b5', 'b211345d-2a85-4b05-a66d-56f405be3585', 3, 'single', '¿Cuál es la implicación de un jitter normal en SFEMG de un músculo clínicamente débil?', '[{"id":"opt_7f0d56c0_0","text":"Prácticamente excluye miastenia gravis","isCorrect":true,"feedback":"Correcto. Un jitter normal en músculo débil hace improbable MG."},{"id":"opt_7f0d56c0_1","text":"Confirma LEMS","isCorrect":false,"feedback":"Incorrecto. LEMS requiere facilitación del CMAP."},{"id":"opt_7f0d56c0_2","text":"Confirma miopatía inflamatoria","isCorrect":false,"feedback":"Incorrecto. El jitter no confirma miopatías."},{"id":"opt_7f0d56c0_3","text":"Es un hallazgo inespecífico sin valor clínico","isCorrect":false,"feedback":"Incorrecto. Tiene alto valor predictivo negativo."}]'::jsonb, 'Jitter normal en músculo débil prácticamente excluye MG.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'f6495751-a1b9-4244-a943-20784b627e41', 'b211345d-2a85-4b05-a66d-56f405be3585', 4, 'single', 'El hallazgo electrodiagnóstico típico en LEMS es:', '[{"id":"opt_f6495751_0","text":"CMAP basal bajo con incremento >100% post-ejercicio o alta frecuencia","isCorrect":true,"feedback":"Correcto. Es un defecto presináptico."},{"id":"opt_f6495751_1","text":"Decremento >10% a 3 Hz","isCorrect":false,"feedback":"Incorrecto. Eso es típico de MG."},{"id":"opt_f6495751_2","text":"SNAPs normales en radiculopatía","isCorrect":false,"feedback":"Incorrecto. Eso corresponde a lesión preganglionar."},{"id":"opt_f6495751_3","text":"Bloqueo de conducción motor fuera de atrapamiento","isCorrect":false,"feedback":"Incorrecto. Eso es de NMM."}]'::jsonb, 'LEMS muestra facilitación >100% del CMAP tras ejercicio.', 'intermediate'
);

-- ─── QUIZ: Evaluación: Fundamentos de Potenciales Evocados (ep-fundamentals) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  'a632fce3-d99f-4e22-aab9-4ba4d5e1e314', 'ep-fundamentals', 'evoked-potentials', 'Evaluación: Fundamentos de Potenciales Evocados', 70, NULL, true, true, 7, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = 'a632fce3-d99f-4e22-aab9-4ba4d5e1e314';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '45fa6af9-222c-4344-a338-f16b6dd008ba', 'a632fce3-d99f-4e22-aab9-4ba4d5e1e314', 1, 'single', 'En el sistema 10-20, el punto Cz (vértex) se localiza:', '[{"id":"opt_45fa6af9_0","text":"En la línea media entre T3 y T4","isCorrect":true,"feedback":"Correcto. Cz corresponde al vértex en la línea media."},{"id":"opt_45fa6af9_1","text":"En la línea media entre Fp1 y Fp2","isCorrect":false,"feedback":"Incorrecto. Ese punto corresponde a Fpz."},{"id":"opt_45fa6af9_2","text":"En el punto medio entre O1 y O2","isCorrect":false,"feedback":"Incorrecto. Ese punto es Oz."},{"id":"opt_45fa6af9_3","text":"Por delante del vértex en la región frontal","isCorrect":false,"feedback":"Incorrecto. Cz es vértex en línea media."}]'::jsonb, 'En el sistema 10-20, Cz está en la línea media entre T3 y T4.', 'basic'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '6dcff8fa-8caa-41a6-a9fd-1e01a6582725', 'a632fce3-d99f-4e22-aab9-4ba4d5e1e314', 2, 'single', 'El sistema internacional 10-20 se basa en:', '[{"id":"opt_6dcff8fa_0","text":"Distancias del 10% y 20% entre puntos anatómicos","isCorrect":true,"feedback":"Correcto. Garantiza proporciones reproducibles."},{"id":"opt_6dcff8fa_1","text":"Distancias fijas de 2 cm entre electrodos","isCorrect":false,"feedback":"Incorrecto. Se usan proporciones, no centímetros fijos."},{"id":"opt_6dcff8fa_2","text":"La distancia entre Fp1 y Fp2 exclusivamente","isCorrect":false,"feedback":"Incorrecto. Usa varios puntos de referencia."},{"id":"opt_6dcff8fa_3","text":"Solo puntos preauriculares","isCorrect":false,"feedback":"Incorrecto. Incluye nasion e inion."}]'::jsonb, 'El sistema 10-20 usa proporciones 10% y 20%.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '096cd2b4-2dea-4968-aad1-6d29b5612c80', 'a632fce3-d99f-4e22-aab9-4ba4d5e1e314', 3, 'single', 'En el sistema 10-20, Nasion e Inion se utilizan como:', '[{"id":"opt_096cd2b4_0","text":"Puntos de referencia longitudinales para el mapa","isCorrect":true,"feedback":"Correcto. Son polos anatómicos para la medición."},{"id":"opt_096cd2b4_1","text":"Puntos de referencia exclusivamente laterales","isCorrect":false,"feedback":"Incorrecto. Los puntos laterales son preauriculares."},{"id":"opt_096cd2b4_2","text":"Sitios de estimulación eléctrica","isCorrect":false,"feedback":"Incorrecto. Se usan para ubicación, no para estimular."},{"id":"opt_096cd2b4_3","text":"Referencias para la conducción nerviosa periférica","isCorrect":false,"feedback":"Incorrecto. Son referencias craneales."}]'::jsonb, 'Nasion e inion son polos del mapa 10-20.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '657d5737-2cf7-41d8-aac2-d7c6372e5342', 'a632fce3-d99f-4e22-aab9-4ba4d5e1e314', 4, 'single', 'En la nomenclatura 10-20, ¿qué indican los números impares?', '[{"id":"opt_657d5737_0","text":"Hemisferio izquierdo","isCorrect":true,"feedback":"Correcto. Los pares corresponden al hemisferio derecho."},{"id":"opt_657d5737_1","text":"Hemisferio derecho","isCorrect":false,"feedback":"Incorrecto. Los pares indican el derecho."},{"id":"opt_657d5737_2","text":"Línea media","isCorrect":false,"feedback":"Incorrecto. La línea media se marca con \"z\"."},{"id":"opt_657d5737_3","text":"Zona occipital exclusivamente","isCorrect":false,"feedback":"Incorrecto. Los números no indican región."}]'::jsonb, 'En la nomenclatura 10-20, números impares son izquierdos.', 'basic'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '905e6d26-bb1b-4da0-a6f5-fca327c9cd70', 'a632fce3-d99f-4e22-aab9-4ba4d5e1e314', 5, 'single', 'Los potenciales evocados auditivos de tronco (PEAT) evalúan típicamente las ondas:', '[{"id":"opt_905e6d26_0","text":"I, III y V","isCorrect":true,"feedback":"Correcto. Son los picos clásicos en PEAT."},{"id":"opt_905e6d26_1","text":"N75, P100 y N145","isCorrect":false,"feedback":"Incorrecto. Esas son de potenciales evocados visuales."},{"id":"opt_905e6d26_2","text":"N9 y N13","isCorrect":false,"feedback":"Incorrecto. Esos son somatosensoriales."},{"id":"opt_905e6d26_3","text":"P300 y N400","isCorrect":false,"feedback":"Incorrecto. Son componentes cognitivos."}]'::jsonb, 'PEAT evalúa ondas I, III y V.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'a2966fae-69b0-401a-a968-2cd12cd1ea67', 'a632fce3-d99f-4e22-aab9-4ba4d5e1e314', 6, 'single', 'En los potenciales evocados visuales (PEV), las ondas clásicas incluyen:', '[{"id":"opt_a2966fae_0","text":"N75, P100 y N145","isCorrect":true,"feedback":"Correcto. Son componentes típicos del PEV."},{"id":"opt_a2966fae_1","text":"I, III y V","isCorrect":false,"feedback":"Incorrecto. Esas ondas corresponden a PEAT."},{"id":"opt_a2966fae_2","text":"M y H","isCorrect":false,"feedback":"Incorrecto. Esas son respuestas de neuroconducción."},{"id":"opt_a2966fae_3","text":"P50 y N100","isCorrect":false,"feedback":"Incorrecto. No son componentes estándar del PEV."}]'::jsonb, 'PEV evalúa la vía visual con N75, P100 y N145.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '3cd770d9-1722-416c-acc7-7a1a2d303907', 'a632fce3-d99f-4e22-aab9-4ba4d5e1e314', 7, 'single', 'Los potenciales evocados somatosensoriales (PESS) se utilizan especialmente en nervios:', '[{"id":"opt_3cd770d9_0","text":"Mediano, ulnar, peroneo y tibial","isCorrect":true,"feedback":"Correcto. Evalúan la vía sensorial ascendente."},{"id":"opt_3cd770d9_1","text":"Óptico y acústico","isCorrect":false,"feedback":"Incorrecto. Esos corresponden a PEV y PEAT."},{"id":"opt_3cd770d9_2","text":"Frénico y facial","isCorrect":false,"feedback":"Incorrecto. No son nervios típicos para PESS."},{"id":"opt_3cd770d9_3","text":"Vago y glosofaríngeo","isCorrect":false,"feedback":"Incorrecto. No son usados en PESS."}]'::jsonb, 'PESS evalúan vías ascendentes, útil en mediano, ulnar, peroneo y tibial.', 'intermediate'
);

-- ─── QUIZ: Evaluación: Neuroconducción y EMG Pediátrica (pediatric-emg) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  'eedeadb5-bf04-445b-a304-c30c7c31f02f', 'pediatric-emg', 'special-studies', 'Evaluación: Neuroconducción y EMG Pediátrica', 70, NULL, true, true, 1, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = 'eedeadb5-bf04-445b-a304-c30c7c31f02f';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'aee8ceb7-64ae-4087-ad08-8b1854f9883a', 'eedeadb5-bf04-445b-a304-c30c7c31f02f', 1, 'single', 'En niños, las velocidades de conducción alcanzan valores de adulto aproximadamente a los:', '[{"id":"opt_aee8ceb7_0","text":"5 años","isCorrect":true,"feedback":"Correcto. Es una referencia importante en neuroconducción pediátrica."},{"id":"opt_aee8ceb7_1","text":"6 meses","isCorrect":false,"feedback":"Incorrecto. Es demasiado temprano."},{"id":"opt_aee8ceb7_2","text":"12 años","isCorrect":false,"feedback":"Incorrecto. Ocurre antes."},{"id":"opt_aee8ceb7_3","text":"18 años","isCorrect":false,"feedback":"Incorrecto. No requiere llegar a la adultez."}]'::jsonb, 'Las velocidades de conducción alcanzan valores de adulto a los 5 años.', 'intermediate'
);

-- ─── QUIZ: Evaluación: Síndrome del Túnel Carpiano (carpal-tunnel) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  'f1ac9654-4fe9-4429-adb7-21a56c01dbfc', 'carpal-tunnel', 'topographic-anatomy', 'Evaluación: Síndrome del Túnel Carpiano', 70, NULL, true, true, 1, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = 'f1ac9654-4fe9-4429-adb7-21a56c01dbfc';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'e81266f4-27ef-4ca2-a40a-c229dca069c7', 'f1ac9654-4fe9-4429-adb7-21a56c01dbfc', 1, 'single', 'El signo de Bactrian (doble pico en comparativa radial/mediano sensitiva en dedo 4) sugiere:', '[{"id":"opt_e81266f4_0","text":"Enlentecimiento focal del nervio mediano en túnel del carpo","isCorrect":true,"feedback":"Correcto. La diferencia significativa suele ser >0.4–0.5 ms."},{"id":"opt_e81266f4_1","text":"Neuropatía cubital en canal de Guyón","isCorrect":false,"feedback":"Incorrecto. El signo se describe para el mediano."},{"id":"opt_e81266f4_2","text":"Radiculopatía C8-T1","isCorrect":false,"feedback":"Incorrecto. Es un hallazgo de atrapamiento distal."},{"id":"opt_e81266f4_3","text":"Bloqueo de conducción motor multifocal","isCorrect":false,"feedback":"Incorrecto. Eso corresponde a NMM."}]'::jsonb, 'El signo de Bactrian sugiere enlentecimiento focal del mediano.', 'intermediate'
);

-- ─── QUIZ: Evaluación: Neuropatía Cubital / Túnel Cubital (cubital-tunnel) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  'f68f1a8b-7074-4e24-aefb-7f7ee51f5ee7', 'cubital-tunnel', 'topographic-anatomy', 'Evaluación: Neuropatía Cubital / Túnel Cubital', 70, NULL, true, true, 1, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = 'f68f1a8b-7074-4e24-aefb-7f7ee51f5ee7';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '109bce07-7604-46eb-a0c9-b63dbeb31815', 'f68f1a8b-7074-4e24-aefb-7f7ee51f5ee7', 1, 'single', 'En el canal de Guyón, un hallazgo electrofisiológico típico es:', '[{"id":"opt_109bce07_0","text":"Latencia motora distal cubital prolongada con velocidad antebraquial normal","isCorrect":true,"feedback":"Correcto. Suele acompañarse de disminución de amplitud."},{"id":"opt_109bce07_1","text":"SNAPs normales en radiculopatía","isCorrect":false,"feedback":"Incorrecto. Ese hallazgo no define canal de Guyón."},{"id":"opt_109bce07_2","text":"Incremento >100% del CMAP post-ejercicio","isCorrect":false,"feedback":"Incorrecto. Es de LEMS."},{"id":"opt_109bce07_3","text":"Decremento >10% en RNS a 3 Hz","isCorrect":false,"feedback":"Incorrecto. Es de MG."}]'::jsonb, 'En canal de Guyón hay latencia motora distal cubital prolongada.', 'intermediate'
);

-- ─── QUIZ: Evaluación: Radiculopatías (cervical-radic) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  '6b10aee0-d45d-4d39-a630-fafce3c00174', 'cervical-radic', 'radiculopathies', 'Evaluación: Radiculopatías', 70, NULL, true, true, 2, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = '6b10aee0-d45d-4d39-a630-fafce3c00174';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '9a8c6409-310b-4f3b-ab62-90ac15987069', '6b10aee0-d45d-4d39-a630-fafce3c00174', 1, 'single', 'En sospecha de radiculopatía S1 con conducción distal normal, ¿qué respuesta tardía es más confirmatoria?', '[{"id":"opt_9a8c6409_0","text":"Reflejo H ausente o prolongado","isCorrect":true,"feedback":"Correcto. Es el estándar de oro para S1."},{"id":"opt_9a8c6409_1","text":"PEV con latencia P100 retrasada","isCorrect":false,"feedback":"Incorrecto. PEV evalúa vía visual."},{"id":"opt_9a8c6409_2","text":"SNAP sural ausente","isCorrect":false,"feedback":"Incorrecto. En radiculopatía el SNAP puede ser normal."},{"id":"opt_9a8c6409_3","text":"CMAP con incremento post-ejercicio","isCorrect":false,"feedback":"Incorrecto. Eso es LEMS."}]'::jsonb, 'El reflejo H confirma radiculopatía S1.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '0d2ffe13-59d4-4833-a340-af1debde9c36', '6b10aee0-d45d-4d39-a630-fafce3c00174', 2, 'single', 'De acuerdo con AANEM, un límite razonable de nervios estudiados en radiculopatía es:', '[{"id":"opt_0d2ffe13_0","text":"7 nervios","isCorrect":true,"feedback":"Correcto. Para polineuropatía el límite sugerido es mayor."},{"id":"opt_0d2ffe13_1","text":"2 nervios","isCorrect":false,"feedback":"Incorrecto. Es insuficiente para un estudio completo."},{"id":"opt_0d2ffe13_2","text":"20 nervios","isCorrect":false,"feedback":"Incorrecto. Excede los límites razonables."},{"id":"opt_0d2ffe13_3","text":"No hay límites sugeridos","isCorrect":false,"feedback":"Incorrecto. AANEM sí propone límites."}]'::jsonb, 'AANEM recomienda límites razonables de nervios por categoría diagnóstica.', 'intermediate'
);

-- ─── QUIZ: Evaluación: Polineuropatías y Algoritmo Diagnóstico (sensorimotor-poly) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  '98599623-af3f-44c0-a193-a942301f8ce4', 'sensorimotor-poly', 'diagnostic-criteria', 'Evaluación: Polineuropatías y Algoritmo Diagnóstico', 70, NULL, true, true, 1, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = '98599623-af3f-44c0-a193-a942301f8ce4';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '8964fe72-0038-4e46-ad50-2e1b764377ca', '98599623-af3f-44c0-a193-a942301f8ce4', 1, 'single', 'Según AANEM, el número razonable de nervios estudiados en polineuropatía es:', '[{"id":"opt_8964fe72_0","text":"10 nervios","isCorrect":true,"feedback":"Correcto. Evita la sobreutilización."},{"id":"opt_8964fe72_1","text":"4 nervios","isCorrect":false,"feedback":"Incorrecto. Suele ser insuficiente."},{"id":"opt_8964fe72_2","text":"15 nervios","isCorrect":false,"feedback":"Incorrecto. Supera el límite sugerido."},{"id":"opt_8964fe72_3","text":"Sin límite establecido","isCorrect":false,"feedback":"Incorrecto. Hay límites recomendados."}]'::jsonb, 'Para polineuropatía, AANEM sugiere hasta 10 nervios.', 'intermediate'
);

-- ─── QUIZ: Evaluación: Síndrome de Guillain-Barré (SGB) (gbs-subtypes) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  '7d3790f8-087e-466b-aae8-ef909e7f66c5', 'gbs-subtypes', 'diagnostic-criteria', 'Evaluación: Síndrome de Guillain-Barré (SGB)', 70, NULL, true, true, 3, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = '7d3790f8-087e-466b-aae8-ef909e7f66c5';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '4bc6db0b-1382-4e78-a795-955c9d80707b', '7d3790f8-087e-466b-aae8-ef909e7f66c5', 1, 'single', '¿Cuál es un hallazgo típico en AIDP (SGB desmielinizante)?', '[{"id":"opt_4bc6db0b_0","text":"Latencias distales prolongadas y ondas F prolongadas/ausentes","isCorrect":true,"feedback":"Correcto. Son datos clásicos de desmielinización adquirida."},{"id":"opt_4bc6db0b_1","text":"SNAPs normales en miembros superiores y sural ausente","isCorrect":false,"feedback":"Incorrecto. En AIDP es clásico el ahorro del sural."},{"id":"opt_4bc6db0b_2","text":"Incremento >100% del CMAP tras ejercicio","isCorrect":false,"feedback":"Incorrecto. Ese hallazgo es de LEMS."},{"id":"opt_4bc6db0b_3","text":"PAUMs de gran amplitud con reclutamiento reducido","isCorrect":false,"feedback":"Incorrecto. Ese patrón es neurogénico crónico."}]'::jsonb, 'AIDP muestra desmielinización con ondas F prolongadas.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '9fe8e4e6-6807-4ea8-aea2-99629ee4a3f6', '7d3790f8-087e-466b-aae8-ef909e7f66c5', 2, 'single', '¿En qué consiste el "sural sparing" en el SGB?', '[{"id":"opt_9fe8e4e6_0","text":"SNAP sural normal con SNAPs anormales en extremidades superiores","isCorrect":true,"feedback":"Correcto. Es un signo clásico de desmielinización adquirida aguda."},{"id":"opt_9fe8e4e6_1","text":"SNAP sural ausente con SNAPs normales en miembros superiores","isCorrect":false,"feedback":"Incorrecto. Eso no corresponde a ahorro del sural."},{"id":"opt_9fe8e4e6_2","text":"CMAP basal bajo con incremento >100% post-ejercicio","isCorrect":false,"feedback":"Incorrecto. Ese patrón es de LEMS."},{"id":"opt_9fe8e4e6_3","text":"Bloqueo de conducción en sitios de atrapamiento","isCorrect":false,"feedback":"Incorrecto. Eso no define el ahorro del sural."}]'::jsonb, 'El ahorro del sural es un signo útil en AIDP.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '10eddfb2-04d8-49b7-af8d-ce6194a913c1', '7d3790f8-087e-466b-aae8-ef909e7f66c5', 3, 'single', 'La tríada clásica del síndrome de Miller Fisher incluye:', '[{"id":"opt_10eddfb2_0","text":"Oftalmoplejía, ataxia y arreflexia","isCorrect":true,"feedback":"Correcto. Además se asocia a anticuerpos anti-GQ1b."},{"id":"opt_10eddfb2_1","text":"Debilidad proximal, miotonía y ptosis","isCorrect":false,"feedback":"Incorrecto. Esa combinación no define Miller Fisher."},{"id":"opt_10eddfb2_2","text":"Fasciculaciones, hiperreflexia y espasticidad","isCorrect":false,"feedback":"Incorrecto. Eso orienta a NMS."},{"id":"opt_10eddfb2_3","text":"Parestesias distales con dolor y debilidad focal","isCorrect":false,"feedback":"Incorrecto. No es la tríada clásica."}]'::jsonb, 'Miller Fisher: oftalmoplejía, ataxia y arreflexia.', 'basic'
);

-- ─── QUIZ: Evaluación: Criterios Diagnósticos de CIDP (cidp-criteria) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  '2d14847c-0526-4881-a349-af24775daa1f', 'cidp-criteria', 'diagnostic-criteria', 'Evaluación: Criterios Diagnósticos de CIDP', 70, NULL, true, true, 4, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = '2d14847c-0526-4881-a349-af24775daa1f';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'f695c8d6-2ce0-45e8-a647-fa81476a71bb', '2d14847c-0526-4881-a349-af24775daa1f', 1, 'single', '¿Cuál es el criterio temporal que define CIDP (PDIC) frente a SGB?', '[{"id":"opt_f695c8d6_0","text":"Progresión o recaídas por más de 8 semanas","isCorrect":true,"feedback":"Correcto. CIDP se caracteriza por curso crónico o recurrente."},{"id":"opt_f695c8d6_1","text":"Progresión menor de 2 semanas","isCorrect":false,"feedback":"Incorrecto. Eso es más compatible con SGB."},{"id":"opt_f695c8d6_2","text":"Curso fijo menor a 4 semanas","isCorrect":false,"feedback":"Incorrecto. CIDP no se define por curso agudo."},{"id":"opt_f695c8d6_3","text":"Solo episodios aislados sin progresión","isCorrect":false,"feedback":"Incorrecto. CIDP requiere progresión o recaídas."}]'::jsonb, 'CIDP progresa o recae por más de 8 semanas.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '8a743ae4-872f-4e11-aed1-46ab2e017adb', '2d14847c-0526-4881-a349-af24775daa1f', 2, 'single', 'Según EAN/PNS 2021, para diagnóstico de CIDP se requiere evidencia de desmielinización en:', '[{"id":"opt_8a743ae4_0","text":"Al menos dos nervios motores","isCorrect":true,"feedback":"Correcto. Es un requisito clave en el criterio electrofisiológico."},{"id":"opt_8a743ae4_1","text":"Un nervio sensitivo","isCorrect":false,"feedback":"Incorrecto. La evidencia principal es en nervios motores."},{"id":"opt_8a743ae4_2","text":"Cualquier nervio con CMAP bajo","isCorrect":false,"feedback":"Incorrecto. La baja amplitud no demuestra desmielinización."},{"id":"opt_8a743ae4_3","text":"Solo paraspinales","isCorrect":false,"feedback":"Incorrecto. Paraspinales no definen CIDP."}]'::jsonb, 'EAN/PNS 2021 requiere desmielinización en al menos dos nervios motores.', 'advanced'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'f3a885e7-8546-46c3-ac6c-584612513cf5', '2d14847c-0526-4881-a349-af24775daa1f', 3, 'single', '¿Cuál de las siguientes es una variante reconocida de CIDP según EAN/PNS 2021?', '[{"id":"opt_f3a885e7_0","text":"MADSAM (multifocal)","isCorrect":true,"feedback":"Correcto. Es una variante multifocal de CIDP."},{"id":"opt_f3a885e7_1","text":"Neuropatía motora multifocal con bloqueo","isCorrect":false,"feedback":"Incorrecto. Esa entidad es distinta y tiene conducción sensitiva normal."},{"id":"opt_f3a885e7_2","text":"ELA con predominio bulbar","isCorrect":false,"feedback":"Incorrecto. No es una variante de CIDP."},{"id":"opt_f3a885e7_3","text":"Miopatía necrotizante","isCorrect":false,"feedback":"Incorrecto. Es una miopatía inflamatoria."}]'::jsonb, 'CIDP tiene variantes: distal, MADSAM, focal, motora pura.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '87c5d6cf-3aed-47f2-ae52-6f9f897631d1', '2d14847c-0526-4881-a349-af24775daa1f', 4, 'single', '¿Cuál es tratamiento de primera línea para CIDP?', '[{"id":"opt_87c5d6cf_0","text":"Inmunoglobulina intravenosa o corticosteroides","isCorrect":true,"feedback":"Correcto. Ambas son opciones de primera línea."},{"id":"opt_87c5d6cf_1","text":"Corticosteroides contraindicados","isCorrect":false,"feedback":"Incorrecto. Son una opción válida en CIDP."},{"id":"opt_87c5d6cf_2","text":"Evitar IgIV por falta de respuesta","isCorrect":false,"feedback":"Incorrecto. IgIV es tratamiento estándar."},{"id":"opt_87c5d6cf_3","text":"Solo plasmaféresis en todos los casos","isCorrect":false,"feedback":"Incorrecto. No es la única primera línea."}]'::jsonb, 'IgIV o corticosteroides son primera línea en CIDP.', 'intermediate'
);

-- ─── QUIZ: Evaluación: Nodopatías Autoinmunes y Autoanticuerpos (autoimmune-nodopathies-detail) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  '8ee60f1c-bf99-4052-a19e-b902f4508609', 'autoimmune-nodopathies-detail', 'diagnostic-criteria', 'Evaluación: Nodopatías Autoinmunes y Autoanticuerpos', 70, NULL, true, true, 1, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = '8ee60f1c-bf99-4052-a19e-b902f4508609';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '0daf3794-335d-4424-ac40-b497ed8a3fae', '8ee60f1c-bf99-4052-a19e-b902f4508609', 1, 'single', 'En CIDP, la presencia de autoanticuerpos IgG4 anti-NF155 suele asociarse con:', '[{"id":"opt_0daf3794_0","text":"Pobre respuesta a IgIV y temblor","isCorrect":true,"feedback":"Correcto. Es un fenotipo descrito en guías recientes."},{"id":"opt_0daf3794_1","text":"Respuesta excelente y rápida a IgIV","isCorrect":false,"feedback":"Incorrecto. Suele responder peor."},{"id":"opt_0daf3794_2","text":"Ausencia total de síntomas sensitivos y motores","isCorrect":false,"feedback":"Incorrecto. No describe el fenotipo."},{"id":"opt_0daf3794_3","text":"Incremento >100% del CMAP tras ejercicio","isCorrect":false,"feedback":"Incorrecto. Eso es típico de LEMS."}]'::jsonb, 'Anti-NF155 (IgG4) se asocia a pobre respuesta a IgIV y temblor.', 'advanced'
);

-- ─── QUIZ: Evaluación: Neuropatía Motora Multifocal (NMM) (mmn-criteria) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  '2bbb134c-3e3b-4611-a0e1-6afdefd4b05d', 'mmn-criteria', 'diagnostic-criteria', 'Evaluación: Neuropatía Motora Multifocal (NMM)', 70, NULL, true, true, 4, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = '2bbb134c-3e3b-4611-a0e1-6afdefd4b05d';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '84492767-ff86-4c3d-a88f-79f7b3a00d39', '2bbb134c-3e3b-4611-a0e1-6afdefd4b05d', 1, 'single', 'La presentación clínica típica de neuropatía motora multifocal (NMM) es:', '[{"id":"opt_84492767_0","text":"Debilidad asimétrica distal, predominio en MS, sin sensibilidad afectada","isCorrect":true,"feedback":"Correcto. No hay síntomas sensitivos ni signos de NMS."},{"id":"opt_84492767_1","text":"Debilidad simétrica proximal con parestesias difusas","isCorrect":false,"feedback":"Incorrecto. Eso orienta más a CIDP típica."},{"id":"opt_84492767_2","text":"Debilidad con decremento en RNS a 3 Hz","isCorrect":false,"feedback":"Incorrecto. Ese hallazgo es de MG."},{"id":"opt_84492767_3","text":"Debilidad con incremento >100% del CMAP","isCorrect":false,"feedback":"Incorrecto. Eso es LEMS."}]'::jsonb, 'NMM: debilidad distal asimétrica sin afectación sensitiva.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'b8ce8474-2d0a-497f-a133-47bd64248a02', '2bbb134c-3e3b-4611-a0e1-6afdefd4b05d', 2, 'single', '¿Cuál es el hallazgo electrofisiológico clave en NMM?', '[{"id":"opt_b8ce8474_0","text":"Bloqueo de conducción motor fuera de sitios de atrapamiento con conducción sensitiva normal","isCorrect":true,"feedback":"Correcto. Es el sello electrofisiológico de la NMM."},{"id":"opt_b8ce8474_1","text":"SNAPs abolidos en todos los nervios","isCorrect":false,"feedback":"Incorrecto. En NMM la sensibilidad se conserva."},{"id":"opt_b8ce8474_2","text":"PAUMs de baja amplitud con reclutamiento precoz","isCorrect":false,"feedback":"Incorrecto. Eso sugiere miopatía."},{"id":"opt_b8ce8474_3","text":"Decremento >10% en RNS a baja frecuencia","isCorrect":false,"feedback":"Incorrecto. Es típico de MG."}]'::jsonb, 'El bloqueo de conducción motor fuera de atrapamiento es clave en NMM.', 'advanced'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'b1193a89-a3ff-41ca-ae97-7d5a4a1e5319', '2bbb134c-3e3b-4611-a0e1-6afdefd4b05d', 3, 'single', '¿Qué marcador serológico se asocia a NMM en cerca del 50% de los casos?', '[{"id":"opt_b1193a89_0","text":"IgM anti-GM1","isCorrect":true,"feedback":"Correcto. Es un marcador clásico de NMM."},{"id":"opt_b1193a89_1","text":"Anti-GQ1b","isCorrect":false,"feedback":"Incorrecto. Se asocia a Miller Fisher."},{"id":"opt_b1193a89_2","text":"Anti-AChR","isCorrect":false,"feedback":"Incorrecto. Se asocia a miastenia gravis."},{"id":"opt_b1193a89_3","text":"Anti-SRP","isCorrect":false,"feedback":"Incorrecto. Se asocia a miopatía necrotizante."}]'::jsonb, 'Anti-GM1 IgM es positivo en ~50% de NMM.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '01f8750a-22e0-4475-a769-d88ada53469f', '2bbb134c-3e3b-4611-a0e1-6afdefd4b05d', 4, 'single', 'El tratamiento recomendado en NMM es:', '[{"id":"opt_01f8750a_0","text":"Inmunoglobulina intravenosa; evitar corticosteroides","isCorrect":true,"feedback":"Correcto. IgIV es eficaz y los esteroides pueden empeorar."},{"id":"opt_01f8750a_1","text":"Corticosteroides como primera línea","isCorrect":false,"feedback":"Incorrecto. Pueden empeorar la NMM."},{"id":"opt_01f8750a_2","text":"No tratar hasta progresión severa","isCorrect":false,"feedback":"Incorrecto. El tratamiento temprano mejora la función."},{"id":"opt_01f8750a_3","text":"Solo plasmaféresis","isCorrect":false,"feedback":"Incorrecto. No es el tratamiento estándar."}]'::jsonb, 'NMM responde a IgIV; corticoides pueden empeorar.', 'intermediate'
);

-- ─── QUIZ: Evaluación: Esclerosis Lateral Amiotrófica (ELA) (als) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  'af069b86-67e8-428e-a4b0-9c5d2b790a4b', 'als', 'motor-neuron-diseases', 'Evaluación: Esclerosis Lateral Amiotrófica (ELA)', 70, NULL, true, true, 3, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = 'af069b86-67e8-428e-a4b0-9c5d2b790a4b';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'b579328d-8603-49b9-aabe-94902386f04a', 'af069b86-67e8-428e-a4b0-9c5d2b790a4b', 1, 'single', 'Según Gold Coast 2019, ¿qué combinación diagnóstica es suficiente para ELA?', '[{"id":"opt_b579328d_0","text":"Disfunción de NMS y NMI en al menos 1 región, con progresión y exclusión de otras causas","isCorrect":true,"feedback":"Correcto. Esa combinación cumple criterios Gold Coast."},{"id":"opt_b579328d_1","text":"Sólo signos de NMS en dos regiones","isCorrect":false,"feedback":"Incorrecto. Se requiere evidencia de NMI."},{"id":"opt_b579328d_2","text":"Sólo signos de NMI en una región","isCorrect":false,"feedback":"Incorrecto. Se necesita NMI en al menos dos regiones si no hay NMS."},{"id":"opt_b579328d_3","text":"Cualquier fasciculación aislada sin progresión","isCorrect":false,"feedback":"Incorrecto. Debe documentarse deterioro motor progresivo."}]'::jsonb, 'Gold Coast 2019 simplifica el diagnóstico de ELA.', 'advanced'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '948a1738-665f-453a-ae2a-6f41fac42053', 'af069b86-67e8-428e-a4b0-9c5d2b790a4b', 2, 'single', 'Según los criterios de Awaji, ¿qué hallazgo se considera equivalente a denervación activa en un músculo con reinervación crónica?', '[{"id":"opt_948a1738_0","text":"Fasciculaciones","isCorrect":true,"feedback":"Correcto. Awaji otorga el mismo peso que fibrilaciones/ondas positivas."},{"id":"opt_948a1738_1","text":"Potenciales miotónicos","isCorrect":false,"feedback":"Incorrecto. Los potenciales miotónicos sugieren canalopatías."},{"id":"opt_948a1738_2","text":"Decremento en RNS a 3 Hz","isCorrect":false,"feedback":"Incorrecto. Eso es de unión neuromuscular."},{"id":"opt_948a1738_3","text":"SNAPs normales","isCorrect":false,"feedback":"Incorrecto. Esto no es criterio de denervación activa."}]'::jsonb, 'Awaji equipara fasciculaciones a denervación activa si hay reinervación crónica.', 'advanced'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '22cd2a5d-5882-439a-aff3-a56e5cc1411d', 'af069b86-67e8-428e-a4b0-9c5d2b790a4b', 3, 'single', '¿Por qué en el estudio electrodiagnóstico de ELA se debe descartar bloqueo de conducción?', '[{"id":"opt_22cd2a5d_0","text":"Para diferenciarla de neuropatía motora multifocal","isCorrect":true,"feedback":"Correcto. El bloqueo de conducción sugiere NMM, no ELA."},{"id":"opt_22cd2a5d_1","text":"Porque el bloqueo de conducción es criterio de ELA","isCorrect":false,"feedback":"Incorrecto. No es un criterio de ELA."},{"id":"opt_22cd2a5d_2","text":"Porque define la severidad de la miopatía inflamatoria","isCorrect":false,"feedback":"Incorrecto. No aplica a miopatías."},{"id":"opt_22cd2a5d_3","text":"Para descartar túnel del carpo","isCorrect":false,"feedback":"Incorrecto. Son problemas distintos."}]'::jsonb, 'En ELA se debe descartar bloqueo de conducción.', 'intermediate'
);

-- ─── QUIZ: Evaluación: Miopatías Inflamatorias (inflammatory-myopathies) ───
INSERT INTO public.published_quizzes (
  id, topic_id, module_id, title, pass_score, max_attempts, shuffle_questions, shuffle_options, question_count, version
) VALUES (
  'd0401982-c02b-44eb-a931-78ca76f3b22c', 'inflammatory-myopathies', 'motor-neuron-diseases', 'Evaluación: Miopatías Inflamatorias', 70, NULL, true, true, 7, 1
) ON CONFLICT (topic_id) DO UPDATE SET
  title = EXCLUDED.title,
  module_id = EXCLUDED.module_id,
  question_count = EXCLUDED.question_count,
  pass_score = 70;

DELETE FROM public.quiz_questions WHERE quiz_id = 'd0401982-c02b-44eb-a931-78ca76f3b22c';

INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '15479809-04ad-4232-afd4-d103eaddebd5', 'd0401982-c02b-44eb-a931-78ca76f3b22c', 1, 'single', 'En miopatías inflamatorias, la EMG suele mostrar:', '[{"id":"opt_15479809_0","text":"Actividad espontánea y PAUMs de corta duración y baja amplitud","isCorrect":true,"feedback":"Correcto. Es el patrón miopático típico con actividad de membrana."},{"id":"opt_15479809_1","text":"PAUMs grandes con reclutamiento disminuido","isCorrect":false,"feedback":"Incorrecto. Ese patrón es neurogénico."},{"id":"opt_15479809_2","text":"Bloqueo de conducción motor","isCorrect":false,"feedback":"Incorrecto. Sugiere NMM."},{"id":"opt_15479809_3","text":"Incremento >100% del CMAP post-ejercicio","isCorrect":false,"feedback":"Incorrecto. Sugiere LEMS."}]'::jsonb, 'EMG muestra actividad espontánea y PAUMs pequeños en miopatías.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '6509ba1b-a649-4223-a4c2-f9296e1cd7cc', 'd0401982-c02b-44eb-a931-78ca76f3b22c', 2, 'single', '¿Cuál es un patrón clínico-electromiográfico característico de la miositis por cuerpos de inclusión (MCI)?', '[{"id":"opt_6509ba1b_0","text":"Patrón mixto y afectación de cuádriceps y flexores de dedos","isCorrect":true,"feedback":"Correcto. La MCI puede mostrar unidades largas y cortas."},{"id":"opt_6509ba1b_1","text":"Respuesta excelente a esteroides","isCorrect":false,"feedback":"Incorrecto. La MCI responde pobremente a esteroides."},{"id":"opt_6509ba1b_2","text":"Bloqueo de conducción motor","isCorrect":false,"feedback":"Incorrecto. Eso sugiere NMM."},{"id":"opt_6509ba1b_3","text":"Ahorro del sural","isCorrect":false,"feedback":"Incorrecto. Es un hallazgo de AIDP."}]'::jsonb, 'MCI afecta cuádriceps y flexores de los dedos.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '7a4bef0a-44e9-44c2-a967-e3b0f2988572', 'd0401982-c02b-44eb-a931-78ca76f3b22c', 3, 'single', 'El anticuerpo anti-Jo1 se asocia clásicamente con:', '[{"id":"opt_7a4bef0a_0","text":"Síndrome antisintetasa (miositis, EPI, manos de mecánico)","isCorrect":true,"feedback":"Correcto. Es el marcador clásico del síndrome antisintetasa."},{"id":"opt_7a4bef0a_1","text":"Dermatomiositis asociada a cáncer (anti-p155/140)","isCorrect":false,"feedback":"Incorrecto. Ese es anti-p155/140."},{"id":"opt_7a4bef0a_2","text":"Miopatía necrotizante grave (anti-SRP)","isCorrect":false,"feedback":"Incorrecto. Ese es anti-SRP."},{"id":"opt_7a4bef0a_3","text":"Miastenia gravis (anti-AChR)","isCorrect":false,"feedback":"Incorrecto. Anti-AChR es de MG."}]'::jsonb, 'Anti-Jo1 se asocia a síndrome antisintetasa.', 'intermediate'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '6eba8cad-9388-4de0-a30d-a103195c4b3f', 'd0401982-c02b-44eb-a931-78ca76f3b22c', 4, 'single', 'El anticuerpo anti-Mi2 se asocia principalmente con:', '[{"id":"opt_6eba8cad_0","text":"Dermatomiositis clásica con buen pronóstico","isCorrect":true,"feedback":"Correcto. Anti-Mi2 se relaciona con dermatomiositis clásica."},{"id":"opt_6eba8cad_1","text":"Miositis por cuerpos de inclusión","isCorrect":false,"feedback":"Incorrecto. No es el marcador típico."},{"id":"opt_6eba8cad_2","text":"Miopatía necrotizante resistente a esteroides","isCorrect":false,"feedback":"Incorrecto. Eso se asocia a anti-SRP."},{"id":"opt_6eba8cad_3","text":"Síndrome de Miller Fisher","isCorrect":false,"feedback":"Incorrecto. Miller Fisher se asocia a anti-GQ1b."}]'::jsonb, 'Anti-Mi2 se asocia a dermatomiositis clásica y buen pronóstico.', 'basic'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '55f4dc79-636b-4168-a125-45d215985564', 'd0401982-c02b-44eb-a931-78ca76f3b22c', 5, 'single', 'El anticuerpo anti-SRP se asocia a:', '[{"id":"opt_55f4dc79_0","text":"Miopatía necrotizante grave y resistencia a esteroides","isCorrect":true,"feedback":"Correcto. Es un marcador de miopatía necrotizante."},{"id":"opt_55f4dc79_1","text":"Dermatomiositis asociada a cáncer","isCorrect":false,"feedback":"Incorrecto. Eso es anti-p155/140."},{"id":"opt_55f4dc79_2","text":"Síndrome antisintetasa","isCorrect":false,"feedback":"Incorrecto. Ese es anti-Jo1."},{"id":"opt_55f4dc79_3","text":"Miastenia gravis","isCorrect":false,"feedback":"Incorrecto. MG se asocia a anti-AChR o anti-MuSK."}]'::jsonb, 'Anti-SRP sugiere miopatía necrotizante grave.', 'basic'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  'cac2231f-2fec-4ad1-a132-55916e5fa70b', 'd0401982-c02b-44eb-a931-78ca76f3b22c', 6, 'single', '¿Qué anticuerpo se asocia a dermatomiositis vinculada a cáncer?', '[{"id":"opt_cac2231f_0","text":"Anti-p155/140","isCorrect":true,"feedback":"Correcto. Es un marcador de riesgo oncológico."},{"id":"opt_cac2231f_1","text":"Anti-Mi2","isCorrect":false,"feedback":"Incorrecto. Anti-Mi2 se asocia a dermatomiositis clásica."},{"id":"opt_cac2231f_2","text":"Anti-GQ1b","isCorrect":false,"feedback":"Incorrecto. Se relaciona con Miller Fisher."},{"id":"opt_cac2231f_3","text":"Anti-AChR","isCorrect":false,"feedback":"Incorrecto. Se asocia a MG."}]'::jsonb, 'Anti-p155/140 se asocia a malignidad en dermatomiositis.', 'basic'
);
INSERT INTO public.quiz_questions (
  id, quiz_id, sort_order, type, stem, options, explanation, difficulty
) VALUES (
  '4e8dbc8b-22ee-4fad-ac83-a52683253375', 'd0401982-c02b-44eb-a931-78ca76f3b22c', 7, 'single', 'En miopatías inflamatorias, ¿por qué se recomienda realizar EMG y biopsia en músculos contralaterales?', '[{"id":"opt_4e8dbc8b_0","text":"Para evitar artefactos inflamatorios inducidos por la aguja","isCorrect":true,"feedback":"Correcto. La aguja puede causar cambios inflamatorios locales."},{"id":"opt_4e8dbc8b_1","text":"Porque la EMG debe siempre preceder a la biopsia","isCorrect":false,"feedback":"Incorrecto. Lo importante es no biopsiar el mismo sitio pinchado."},{"id":"opt_4e8dbc8b_2","text":"Para aumentar la amplitud del CMAP","isCorrect":false,"feedback":"Incorrecto. No afecta el CMAP."},{"id":"opt_4e8dbc8b_3","text":"Para medir la conducción sensitiva de dos nervios","isCorrect":false,"feedback":"Incorrecto. Esa no es la razón."}]'::jsonb, 'EMG y biopsia deben hacerse en lados contralaterales.', 'intermediate'
);

