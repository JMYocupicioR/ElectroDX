-- ================================================================================
-- NeuroSAFEMX: Siembra de Banco de Preguntas EMG (isla_EMG.json)
-- 85 preguntas de neurofisiología clínica y electrodiagnóstico
-- Fuente: COMEFYR / Dr. Yocupicio -- Generado automáticamente
-- Total: 85 preguntas
-- ================================================================================
-- Q1: Técnicas de neuroconducción
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'nerve-conduction',
  'Técnicas de neuroconducción',
  '¿Cuál es la raíz nerviosa que media principalmente el Reflejo H (Hoffman) y qué tipo de estímulo se requiere para su activación?',
  '[]'::jsonb,
  '[{"text":"Raíz S1, con un estímulo eléctrico submáximo en un nervio mixto.","is_correct":true,"feedback":"El Reflejo H se produce con un estímulo submáximo que activa las fibras aferentes Ia, principalmente en la raíz S1."},{"text":"Raíz L5, con un estímulo supramáximo de corta duración.","is_correct":false,"feedback":"El estímulo supramáximo se utiliza para generar la Onda F, no el Reflejo H."}]'::jsonb,
  2,
  true,
  'El Reflejo H es un reflejo espinal monosináptico mediado por la raíz S1, siendo el análogo electrofisiológico del reflejo Aquileo.',
  'EMG.doc',
  ARRAY['Técnicas de neuroconducción', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q2: Técnicas de neuroconducción
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'nerve-conduction',
  'Técnicas de neuroconducción',
  '¿Cómo se comportan los potenciales de acción de nervio sensitivo (SNAP) en una lesión proximal a la raíz del ganglio dorsal (radiculopatía)?',
  '[]'::jsonb,
  '[{"text":"Permanecen normales.","is_correct":true,"feedback":"En lesiones proximales al ganglio, la raíz dorsal (célula bipolar) mantiene la continuidad con las fibras distales, por lo que el SNAP es normal."},{"text":"Se encuentran disminuidos o ausentes.","is_correct":false,"feedback":"Los SNAP disminuidos son característicos de lesiones en el ganglio o distales a él, como en plexopatías o neuropatías."}]'::jsonb,
  3,
  false,
  'En lesiones proximales al ganglio (radiculopatías), los SNAP permanecen normales debido a la persistencia de la continuidad con las fibras sensitivas distales.',
  'EMG.doc',
  ARRAY['Técnicas de neuroconducción', 'EMG', 'avanzado'],
  'PUBLISHED'
);

-- Q3: Técnicas de neuroconducción
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'nerve-conduction',
  'Técnicas de neuroconducción',
  '¿A qué edad las velocidades de conducción nerviosa de un niño se igualan a las de un adulto y cuáles son los valores mínimos esperados?',
  '[]'::jsonb,
  '[{"text":"A los 5 años; >50 m/s en miembros superiores y >40 m/s en inferiores.","is_correct":true,"feedback":"A los 5 años se alcanza la madurez. Los valores normales son >50 m/s (MsTs) y >40 m/s (MsPs)."},{"text":"A los 2 años; >60 m/s en miembros superiores y >50 m/s en inferiores.","is_correct":false,"feedback":"Aunque la sinaptogénesis termina cerca de los 2 años, la conducción nerviosa madura hasta los 5 años."}]'::jsonb,
  2,
  true,
  'La maduración de las velocidades de neuroconducción alcanza los niveles del adulto a los 5 años de edad.',
  'EMG.doc',
  ARRAY['Técnicas de neuroconducción', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q4: Electromiografía
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'emg-needle',
  'Electromiografía',
  'En el estudio de estimulación repetitiva a 2-3Hz para Miastenia Gravis, ¿qué hallazgo confirma el diagnóstico?',
  '[]'::jsonb,
  '[{"text":"Reducción de más del 10% en la amplitud entre la primera respuesta y la más pequeña de las primeras cinco.","is_correct":true,"feedback":"El decremento postsináptico típico de la Miastenia Gravis muestra una caída de amplitud superior al 10% en trenes de estímulos a baja frecuencia."},{"text":"Un incremento progresivo (facilitación) superior al 100% tras el ejercicio.","is_correct":false,"feedback":"La facilitación es característica de síndromes presinápticos como el de Lambert-Eaton, no de la Miastenia Gravis."}]'::jsonb,
  3,
  true,
  'El diagnóstico de Miastenia Gravis requiere demostrar un decremento mayor al 10% en la amplitud de la respuesta motora con estimulación repetitiva.',
  'EMG.doc',
  ARRAY['Electromiografía', 'EMG', 'avanzado'],
  'PUBLISHED'
);

-- Q5: Principios básicos
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'fundamentals',
  'Principios básicos',
  '¿Qué órgano sensorial propioceptivo es responsable de informar al sistema nervioso sobre el grado de tensión muscular instantánea?',
  '[]'::jsonb,
  '[{"text":"Aparato tendinoso de Golgi.","is_correct":true,"feedback":"El aparato de Golgi, situado cerca de la unión musculotendinosa, transmite información de tensión a través de fibras aferentes Ib."},{"text":"Huso muscular.","is_correct":false,"feedback":"El huso muscular responde principalmente a los cambios en la longitud (estiramiento) del músculo, no a la tensión."}]'::jsonb,
  2,
  false,
  'El aparato tendinoso de Golgi es un receptor de tensión situado en la unión musculotendinosa que utiliza fibras Ib.',
  'EMG.doc',
  ARRAY['Principios básicos', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q6: Principios básicos
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'fundamentals',
  'Principios básicos',
  'En una radiculopatía (lesión preganglionar), ¿qué hallazgo es esperado en los SNAPs?',
  '[]'::jsonb,
  '[{"text":"SNAPs normales pese a hipoestesia clínica","is_correct":true,"feedback":"Correcto. La lesión es proximal al ganglio de la raíz dorsal y las fibras sensitivas distales conservan continuidad con el soma."},{"text":"SNAPs ausentes en todos los nervios","is_correct":false,"feedback":"Incorrecto. La ausencia de SNAPs sugiere lesión posganglionar o neuropatía."},{"text":"SNAPs con incremento de amplitud","is_correct":false,"feedback":"Incorrecto. No se espera incremento de amplitud por una radiculopatía."},{"text":"SNAPs con latencias muy prolongadas en todos los nervios","is_correct":false,"feedback":"Incorrecto. Latencias difusamente prolongadas sugieren desmielinización generalizada."}]'::jsonb,
  2,
  true,
  'En lesión preganglionar, los SNAPs suelen ser normales.',
  'AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.',
  ARRAY['Principios básicos', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q7: Principios básicos
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'fundamentals',
  'Principios básicos',
  '¿Qué hallazgo en EMG de aguja ayuda a diferenciar radiculopatía de plexopatía?',
  '[]'::jsonb,
  '[{"text":"Denervación en músculos paraspinales","is_correct":true,"feedback":"Correcto. Los paraspinales reciben ramas dorsales antes del plexo, por eso se afectan en radiculopatía."},{"text":"SNAPs disminuidos en el nervio sural","is_correct":false,"feedback":"Incorrecto. SNAPs disminuidos son más propios de lesión posganglionar."},{"text":"Incremento del CMAP tras ejercicio breve","is_correct":false,"feedback":"Incorrecto. Ese patrón corresponde a LEMS."},{"text":"Decremento >10% con RNS baja frecuencia","is_correct":false,"feedback":"Incorrecto. Ese hallazgo es típico de miastenia gravis."}]'::jsonb,
  2,
  true,
  'La denervación paraspinal apoya radiculopatía.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Principios básicos', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q8: Electromiografía
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'emg-needle',
  'Electromiografía',
  '¿Cuál combinación de hallazgos sugiere patrón neurogénico en EMG de aguja?',
  '[]'::jsonb,
  '[{"text":"PAUMs de gran amplitud/duración y reclutamiento disminuido","is_correct":true,"feedback":"Correcto. La reinervación colateral genera unidades grandes con reclutamiento reducido."},{"text":"PAUMs pequeños y reclutamiento precoz","is_correct":false,"feedback":"Incorrecto. Eso es típico de patrón miopático."},{"text":"Bloqueo de conducción motor con sensibilidad normal","is_correct":false,"feedback":"Incorrecto. Eso orienta a neuropatía motora multifocal."},{"text":"Incremento >100% del CMAP post-ejercicio","is_correct":false,"feedback":"Incorrecto. Es característico de LEMS."}]'::jsonb,
  2,
  true,
  'El patrón neurogénico combina PAUMs grandes y reclutamiento reducido.',
  'Jiménez-Domínguez et al. (2016). Abordaje clínico y electrofisiológico del paciente con polineuropatía.',
  ARRAY['Electromiografía', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q9: Electromiografía
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'emg-needle',
  'Electromiografía',
  'En un patrón miopático típico, ¿qué se espera en la EMG de aguja?',
  '[]'::jsonb,
  '[{"text":"PAUMs de baja amplitud y duración con reclutamiento precoz","is_correct":true,"feedback":"Correcto. Muchas unidades pequeñas se activan para generar poca fuerza."},{"text":"PAUMs de gran amplitud y reclutamiento disminuido","is_correct":false,"feedback":"Incorrecto. Eso corresponde a patrón neurogénico."},{"text":"Incremento de amplitud con alta frecuencia de RNS","is_correct":false,"feedback":"Incorrecto. Es un hallazgo presináptico como en LEMS."},{"text":"SNAPs normales con hipoestesia clínica","is_correct":false,"feedback":"Incorrecto. Ese hallazgo sugiere radiculopatía."}]'::jsonb,
  2,
  true,
  'El patrón miopático muestra reclutamiento precoz con PAUMs pequeños.',
  'Selva O’Callaghan & Trallero Araguás (2008). Miopatías inflamatorias.',
  ARRAY['Electromiografía', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q10: Actividad espontánea
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'emg-needle',
  'Actividad espontánea',
  '¿Qué indica la presencia de fibrilaciones y ondas positivas en EMG de aguja?',
  '[]'::jsonb,
  '[{"text":"Denervación activa o inestabilidad de membrana","is_correct":true,"feedback":"Correcto. Sugiere denervación aguda o miopatías inflamatorias/necrotizantes."},{"text":"Trastorno presináptico de la unión neuromuscular","is_correct":false,"feedback":"Incorrecto. Eso se evalúa mejor con RNS alta frecuencia y CMAP."},{"text":"Desmielinización crónica sin denervación","is_correct":false,"feedback":"Incorrecto. La denervación activa sí produce fibrilaciones."},{"text":"Normalidad electromiográfica","is_correct":false,"feedback":"Incorrecto. Es un hallazgo patológico."}]'::jsonb,
  2,
  true,
  'Fibrilaciones y ondas positivas indican denervación activa.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Actividad espontánea', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q11: Actividad espontánea
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'emg-needle',
  'Actividad espontánea',
  'Las fasciculaciones difusas y complejas en EMG sugieren principalmente:',
  '[]'::jsonb,
  '[{"text":"Enfermedad de motoneurona (ELA)","is_correct":true,"feedback":"Correcto. En un contexto de reinervación crónica, son un signo relevante de ELA."},{"text":"Miastenia gravis","is_correct":false,"feedback":"Incorrecto. En MG predominan hallazgos de decremento y jitter."},{"text":"LEMS","is_correct":false,"feedback":"Incorrecto. LEMS se caracteriza por facilitación >100% del CMAP."},{"text":"Radiculopatía pura sin denervación","is_correct":false,"feedback":"Incorrecto. Las fasciculaciones difusas suelen implicar patología de motoneurona."}]'::jsonb,
  2,
  true,
  'Fasciculaciones difusas y complejas sugieren ELA.',
  'Shefner et al. (2020). Gold Coast criteria for ALS.',
  ARRAY['Actividad espontánea', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q12: Actividad espontánea
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'emg-needle',
  'Actividad espontánea',
  '¿Qué describe mejor a las descargas repetitivas complejas en EMG?',
  '[]'::jsonb,
  '[{"text":"Inicio y fin súbito con patrón repetitivo tipo \"máquina\"","is_correct":true,"feedback":"Correcto. Se observan en cronicidad neurógena o miopática."},{"text":"Aumento y descenso gradual de frecuencia con sonido de \"avión en picada\"","is_correct":false,"feedback":"Incorrecto. Esa descripción corresponde a descargas miotónicas."},{"text":"Decremento >10% en RNS a 3 Hz","is_correct":false,"feedback":"Incorrecto. Eso evalúa unión neuromuscular."},{"text":"Bloqueo de conducción motor focal","is_correct":false,"feedback":"Incorrecto. Es un hallazgo de NMM."}]'::jsonb,
  2,
  false,
  'Las descargas repetitivas complejas tienen inicio/fin súbito.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Actividad espontánea', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q13: Actividad espontánea
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'emg-needle',
  'Actividad espontánea',
  'Las descargas miotónicas en EMG se caracterizan por:',
  '[]'::jsonb,
  '[{"text":"Aumentar y disminuir en frecuencia y amplitud con sonido de \"avión en picada\"","is_correct":true,"feedback":"Correcto. Es típico de distrofia miotónica o canalopatías."},{"text":"Inicio y fin súbito con ritmo de \"máquina\"","is_correct":false,"feedback":"Incorrecto. Eso describe descargas repetitivas complejas."},{"text":"Ausencia de actividad espontánea","is_correct":false,"feedback":"Incorrecto. Sí es una forma de actividad espontánea patológica."},{"text":"Incremento >100% del CMAP con ejercicio","is_correct":false,"feedback":"Incorrecto. Ese hallazgo es de LEMS."}]'::jsonb,
  2,
  false,
  'Las descargas miotónicas tienen patrón de "avión en picada".',
  'Selva O’Callaghan & Trallero Araguás (2008). Miopatías inflamatorias.',
  ARRAY['Actividad espontánea', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q14: ELA
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'diagnostic-criteria',
  'ELA',
  'Según Gold Coast 2019, ¿qué combinación diagnóstica es suficiente para ELA?',
  '[]'::jsonb,
  '[{"text":"Disfunción de NMS y NMI en al menos 1 región, con progresión y exclusión de otras causas","is_correct":true,"feedback":"Correcto. Esa combinación cumple criterios Gold Coast."},{"text":"Sólo signos de NMS en dos regiones","is_correct":false,"feedback":"Incorrecto. Se requiere evidencia de NMI."},{"text":"Sólo signos de NMI en una región","is_correct":false,"feedback":"Incorrecto. Se necesita NMI en al menos dos regiones si no hay NMS."},{"text":"Cualquier fasciculación aislada sin progresión","is_correct":false,"feedback":"Incorrecto. Debe documentarse deterioro motor progresivo."}]'::jsonb,
  3,
  true,
  'Gold Coast 2019 simplifica el diagnóstico de ELA.',
  'Shefner et al. (2020). Gold Coast criteria for ALS.',
  ARRAY['ELA', 'EMG', 'avanzado'],
  'PUBLISHED'
);

-- Q15: ELA
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'diagnostic-criteria',
  'ELA',
  'Según los criterios de Awaji, ¿qué hallazgo se considera equivalente a denervación activa en un músculo con reinervación crónica?',
  '[]'::jsonb,
  '[{"text":"Fasciculaciones","is_correct":true,"feedback":"Correcto. Awaji otorga el mismo peso que fibrilaciones/ondas positivas."},{"text":"Potenciales miotónicos","is_correct":false,"feedback":"Incorrecto. Los potenciales miotónicos sugieren canalopatías."},{"text":"Decremento en RNS a 3 Hz","is_correct":false,"feedback":"Incorrecto. Eso es de unión neuromuscular."},{"text":"SNAPs normales","is_correct":false,"feedback":"Incorrecto. Esto no es criterio de denervación activa."}]'::jsonb,
  3,
  true,
  'Awaji equipara fasciculaciones a denervación activa si hay reinervación crónica.',
  'Martínez (2023). Gold Coast y biomarcadores en ELA.',
  ARRAY['ELA', 'EMG', 'avanzado'],
  'PUBLISHED'
);

-- Q16: ELA
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'diagnostic-criteria',
  'ELA',
  '¿Por qué en el estudio electrodiagnóstico de ELA se debe descartar bloqueo de conducción?',
  '[]'::jsonb,
  '[{"text":"Para diferenciarla de neuropatía motora multifocal","is_correct":true,"feedback":"Correcto. El bloqueo de conducción sugiere NMM, no ELA."},{"text":"Porque el bloqueo de conducción es criterio de ELA","is_correct":false,"feedback":"Incorrecto. No es un criterio de ELA."},{"text":"Porque define la severidad de la miopatía inflamatoria","is_correct":false,"feedback":"Incorrecto. No aplica a miopatías."},{"text":"Para descartar túnel del carpo","is_correct":false,"feedback":"Incorrecto. Son problemas distintos."}]'::jsonb,
  2,
  true,
  'En ELA se debe descartar bloqueo de conducción.',
  'AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.',
  ARRAY['ELA', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q17: Guillain-Barré
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'diagnostic-criteria',
  'Guillain-Barré',
  '¿Cuál es un hallazgo típico en AIDP (SGB desmielinizante)?',
  '[]'::jsonb,
  '[{"text":"Latencias distales prolongadas y ondas F prolongadas/ausentes","is_correct":true,"feedback":"Correcto. Son datos clásicos de desmielinización adquirida."},{"text":"SNAPs normales en miembros superiores y sural ausente","is_correct":false,"feedback":"Incorrecto. En AIDP es clásico el ahorro del sural."},{"text":"Incremento >100% del CMAP tras ejercicio","is_correct":false,"feedback":"Incorrecto. Ese hallazgo es de LEMS."},{"text":"PAUMs de gran amplitud con reclutamiento reducido","is_correct":false,"feedback":"Incorrecto. Ese patrón es neurogénico crónico."}]'::jsonb,
  2,
  true,
  'AIDP muestra desmielinización con ondas F prolongadas.',
  'Jiménez-Domínguez et al. (2016). Abordaje clínico y electrofisiológico del paciente con polineuropatía.',
  ARRAY['Guillain-Barré', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q18: Guillain-Barré
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'diagnostic-criteria',
  'Guillain-Barré',
  '¿En qué consiste el "sural sparing" en el SGB?',
  '[]'::jsonb,
  '[{"text":"SNAP sural normal con SNAPs anormales en extremidades superiores","is_correct":true,"feedback":"Correcto. Es un signo clásico de desmielinización adquirida aguda."},{"text":"SNAP sural ausente con SNAPs normales en miembros superiores","is_correct":false,"feedback":"Incorrecto. Eso no corresponde a ahorro del sural."},{"text":"CMAP basal bajo con incremento >100% post-ejercicio","is_correct":false,"feedback":"Incorrecto. Ese patrón es de LEMS."},{"text":"Bloqueo de conducción en sitios de atrapamiento","is_correct":false,"feedback":"Incorrecto. Eso no define el ahorro del sural."}]'::jsonb,
  2,
  true,
  'El ahorro del sural es un signo útil en AIDP.',
  'Jiménez-Domínguez et al. (2016). Abordaje clínico y electrofisiológico del paciente con polineuropatía.',
  ARRAY['Guillain-Barré', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q19: Guillain-Barré
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'diagnostic-criteria',
  'Guillain-Barré',
  'La tríada clásica del síndrome de Miller Fisher incluye:',
  '[]'::jsonb,
  '[{"text":"Oftalmoplejía, ataxia y arreflexia","is_correct":true,"feedback":"Correcto. Además se asocia a anticuerpos anti-GQ1b."},{"text":"Debilidad proximal, miotonía y ptosis","is_correct":false,"feedback":"Incorrecto. Esa combinación no define Miller Fisher."},{"text":"Fasciculaciones, hiperreflexia y espasticidad","is_correct":false,"feedback":"Incorrecto. Eso orienta a NMS."},{"text":"Parestesias distales con dolor y debilidad focal","is_correct":false,"feedback":"Incorrecto. No es la tríada clásica."}]'::jsonb,
  1,
  true,
  'Miller Fisher: oftalmoplejía, ataxia y arreflexia.',
  'Jiménez-Domínguez et al. (2016). Abordaje clínico y electrofisiológico del paciente con polineuropatía.',
  ARRAY['Guillain-Barré', 'EMG', 'basico'],
  'PUBLISHED'
);

-- Q20: CIDP
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'diagnostic-criteria',
  'CIDP',
  '¿Cuál es el criterio temporal que define CIDP (PDIC) frente a SGB?',
  '[]'::jsonb,
  '[{"text":"Progresión o recaídas por más de 8 semanas","is_correct":true,"feedback":"Correcto. CIDP se caracteriza por curso crónico o recurrente."},{"text":"Progresión menor de 2 semanas","is_correct":false,"feedback":"Incorrecto. Eso es más compatible con SGB."},{"text":"Curso fijo menor a 4 semanas","is_correct":false,"feedback":"Incorrecto. CIDP no se define por curso agudo."},{"text":"Solo episodios aislados sin progresión","is_correct":false,"feedback":"Incorrecto. CIDP requiere progresión o recaídas."}]'::jsonb,
  2,
  true,
  'CIDP progresa o recae por más de 8 semanas.',
  'EAN/PNS (2021) guideline on CIDP.',
  ARRAY['CIDP', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q21: CIDP
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'diagnostic-criteria',
  'CIDP',
  'Según EAN/PNS 2021, para diagnóstico de CIDP se requiere evidencia de desmielinización en:',
  '[]'::jsonb,
  '[{"text":"Al menos dos nervios motores","is_correct":true,"feedback":"Correcto. Es un requisito clave en el criterio electrofisiológico."},{"text":"Un nervio sensitivo","is_correct":false,"feedback":"Incorrecto. La evidencia principal es en nervios motores."},{"text":"Cualquier nervio con CMAP bajo","is_correct":false,"feedback":"Incorrecto. La baja amplitud no demuestra desmielinización."},{"text":"Solo paraspinales","is_correct":false,"feedback":"Incorrecto. Paraspinales no definen CIDP."}]'::jsonb,
  3,
  true,
  'EAN/PNS 2021 requiere desmielinización en al menos dos nervios motores.',
  'EAN/PNS (2021) guideline on CIDP.',
  ARRAY['CIDP', 'EMG', 'avanzado'],
  'PUBLISHED'
);

-- Q22: CIDP
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'diagnostic-criteria',
  'CIDP',
  '¿Cuál de las siguientes es una variante reconocida de CIDP según EAN/PNS 2021?',
  '[]'::jsonb,
  '[{"text":"MADSAM (multifocal)","is_correct":true,"feedback":"Correcto. Es una variante multifocal de CIDP."},{"text":"Neuropatía motora multifocal con bloqueo","is_correct":false,"feedback":"Incorrecto. Esa entidad es distinta y tiene conducción sensitiva normal."},{"text":"ELA con predominio bulbar","is_correct":false,"feedback":"Incorrecto. No es una variante de CIDP."},{"text":"Miopatía necrotizante","is_correct":false,"feedback":"Incorrecto. Es una miopatía inflamatoria."}]'::jsonb,
  2,
  false,
  'CIDP tiene variantes: distal, MADSAM, focal, motora pura.',
  'EAN/PNS (2021) guideline on CIDP.',
  ARRAY['CIDP', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q23: CIDP
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'diagnostic-criteria',
  'CIDP',
  '¿Cuál es tratamiento de primera línea para CIDP?',
  '[]'::jsonb,
  '[{"text":"Inmunoglobulina intravenosa o corticosteroides","is_correct":true,"feedback":"Correcto. Ambas son opciones de primera línea."},{"text":"Corticosteroides contraindicados","is_correct":false,"feedback":"Incorrecto. Son una opción válida en CIDP."},{"text":"Evitar IgIV por falta de respuesta","is_correct":false,"feedback":"Incorrecto. IgIV es tratamiento estándar."},{"text":"Solo plasmaféresis en todos los casos","is_correct":false,"feedback":"Incorrecto. No es la única primera línea."}]'::jsonb,
  2,
  true,
  'IgIV o corticosteroides son primera línea en CIDP.',
  'EAN/PNS (2021) guideline on CIDP.',
  ARRAY['CIDP', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q24: Neuropatía motora multifocal
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'diagnostic-criteria',
  'Neuropatía motora multifocal',
  'La presentación clínica típica de neuropatía motora multifocal (NMM) es:',
  '[]'::jsonb,
  '[{"text":"Debilidad asimétrica distal, predominio en MS, sin sensibilidad afectada","is_correct":true,"feedback":"Correcto. No hay síntomas sensitivos ni signos de NMS."},{"text":"Debilidad simétrica proximal con parestesias difusas","is_correct":false,"feedback":"Incorrecto. Eso orienta más a CIDP típica."},{"text":"Debilidad con decremento en RNS a 3 Hz","is_correct":false,"feedback":"Incorrecto. Ese hallazgo es de MG."},{"text":"Debilidad con incremento >100% del CMAP","is_correct":false,"feedback":"Incorrecto. Eso es LEMS."}]'::jsonb,
  2,
  true,
  'NMM: debilidad distal asimétrica sin afectación sensitiva.',
  'AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.',
  ARRAY['Neuropatía motora multifocal', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q25: Neuropatía motora multifocal
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'diagnostic-criteria',
  'Neuropatía motora multifocal',
  '¿Cuál es el hallazgo electrofisiológico clave en NMM?',
  '[]'::jsonb,
  '[{"text":"Bloqueo de conducción motor fuera de sitios de atrapamiento con conducción sensitiva normal","is_correct":true,"feedback":"Correcto. Es el sello electrofisiológico de la NMM."},{"text":"SNAPs abolidos en todos los nervios","is_correct":false,"feedback":"Incorrecto. En NMM la sensibilidad se conserva."},{"text":"PAUMs de baja amplitud con reclutamiento precoz","is_correct":false,"feedback":"Incorrecto. Eso sugiere miopatía."},{"text":"Decremento >10% en RNS a baja frecuencia","is_correct":false,"feedback":"Incorrecto. Es típico de MG."}]'::jsonb,
  3,
  true,
  'El bloqueo de conducción motor fuera de atrapamiento es clave en NMM.',
  'AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.',
  ARRAY['Neuropatía motora multifocal', 'EMG', 'avanzado'],
  'PUBLISHED'
);

-- Q26: Neuropatía motora multifocal
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'diagnostic-criteria',
  'Neuropatía motora multifocal',
  '¿Qué marcador serológico se asocia a NMM en cerca del 50% de los casos?',
  '[]'::jsonb,
  '[{"text":"IgM anti-GM1","is_correct":true,"feedback":"Correcto. Es un marcador clásico de NMM."},{"text":"Anti-GQ1b","is_correct":false,"feedback":"Incorrecto. Se asocia a Miller Fisher."},{"text":"Anti-AChR","is_correct":false,"feedback":"Incorrecto. Se asocia a miastenia gravis."},{"text":"Anti-SRP","is_correct":false,"feedback":"Incorrecto. Se asocia a miopatía necrotizante."}]'::jsonb,
  2,
  false,
  'Anti-GM1 IgM es positivo en ~50% de NMM.',
  'Jiménez-Domínguez et al. (2016). Abordaje clínico y electrofisiológico del paciente con polineuropatía.',
  ARRAY['Neuropatía motora multifocal', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q27: Neuropatía motora multifocal
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'diagnostic-criteria',
  'Neuropatía motora multifocal',
  'El tratamiento recomendado en NMM es:',
  '[]'::jsonb,
  '[{"text":"Inmunoglobulina intravenosa; evitar corticosteroides","is_correct":true,"feedback":"Correcto. IgIV es eficaz y los esteroides pueden empeorar."},{"text":"Corticosteroides como primera línea","is_correct":false,"feedback":"Incorrecto. Pueden empeorar la NMM."},{"text":"No tratar hasta progresión severa","is_correct":false,"feedback":"Incorrecto. El tratamiento temprano mejora la función."},{"text":"Solo plasmaféresis","is_correct":false,"feedback":"Incorrecto. No es el tratamiento estándar."}]'::jsonb,
  2,
  true,
  'NMM responde a IgIV; corticoides pueden empeorar.',
  'AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.',
  ARRAY['Neuropatía motora multifocal', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q28: Unión neuromuscular
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'repetitive-stimulation',
  'Unión neuromuscular',
  'En miastenia gravis, la estimulación nerviosa repetitiva (RNS) a baja frecuencia es positiva cuando:',
  '[]'::jsonb,
  '[{"text":"Hay decremento >10% en la amplitud del CMAP","is_correct":true,"feedback":"Correcto. Se observa típicamente entre el 1° y 4°/5° estímulo."},{"text":"Hay incremento >100% del CMAP","is_correct":false,"feedback":"Incorrecto. Ese patrón es de LEMS."},{"text":"SNAPs normales en miembros superiores","is_correct":false,"feedback":"Incorrecto. Eso no define MG."},{"text":"Ondas F prolongadas en todos los nervios","is_correct":false,"feedback":"Incorrecto. Eso se relaciona con desmielinización."}]'::jsonb,
  2,
  true,
  'RNS a 2-3 Hz con decremento >10% sugiere MG.',
  'AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.',
  ARRAY['Unión neuromuscular', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q29: Unión neuromuscular
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'repetitive-stimulation',
  'Unión neuromuscular',
  'En miastenia gravis, ¿qué hallazgo en SFEMG es típico?',
  '[]'::jsonb,
  '[{"text":"Aumento del jitter o bloqueos","is_correct":true,"feedback":"Correcto. Es la prueba más sensible (95-99%)."},{"text":"Descargas miotónicas","is_correct":false,"feedback":"Incorrecto. Eso sugiere canalopatías."},{"text":"Fibrilaciones difusas","is_correct":false,"feedback":"Incorrecto. Eso sugiere denervación activa."},{"text":"PAUMs de gran amplitud y duración","is_correct":false,"feedback":"Incorrecto. Es un hallazgo neurogénico."}]'::jsonb,
  2,
  true,
  'SFEMG es la prueba más sensible para MG.',
  'AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.',
  ARRAY['Unión neuromuscular', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q30: Unión neuromuscular
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'repetitive-stimulation',
  'Unión neuromuscular',
  '¿Cuál es la implicación de un jitter normal en SFEMG de un músculo clínicamente débil?',
  '[]'::jsonb,
  '[{"text":"Prácticamente excluye miastenia gravis","is_correct":true,"feedback":"Correcto. Un jitter normal en músculo débil hace improbable MG."},{"text":"Confirma LEMS","is_correct":false,"feedback":"Incorrecto. LEMS requiere facilitación del CMAP."},{"text":"Confirma miopatía inflamatoria","is_correct":false,"feedback":"Incorrecto. El jitter no confirma miopatías."},{"text":"Es un hallazgo inespecífico sin valor clínico","is_correct":false,"feedback":"Incorrecto. Tiene alto valor predictivo negativo."}]'::jsonb,
  2,
  true,
  'Jitter normal en músculo débil prácticamente excluye MG.',
  'AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.',
  ARRAY['Unión neuromuscular', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q31: Unión neuromuscular
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'repetitive-stimulation',
  'Unión neuromuscular',
  'El hallazgo electrodiagnóstico típico en LEMS es:',
  '[]'::jsonb,
  '[{"text":"CMAP basal bajo con incremento >100% post-ejercicio o alta frecuencia","is_correct":true,"feedback":"Correcto. Es un defecto presináptico."},{"text":"Decremento >10% a 3 Hz","is_correct":false,"feedback":"Incorrecto. Eso es típico de MG."},{"text":"SNAPs normales en radiculopatía","is_correct":false,"feedback":"Incorrecto. Eso corresponde a lesión preganglionar."},{"text":"Bloqueo de conducción motor fuera de atrapamiento","is_correct":false,"feedback":"Incorrecto. Eso es de NMM."}]'::jsonb,
  2,
  true,
  'LEMS muestra facilitación >100% del CMAP tras ejercicio.',
  'AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.',
  ARRAY['Unión neuromuscular', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q32: Miopatías inflamatorias
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'pathologies',
  'Miopatías inflamatorias',
  'En miopatías inflamatorias, la EMG suele mostrar:',
  '[]'::jsonb,
  '[{"text":"Actividad espontánea y PAUMs de corta duración y baja amplitud","is_correct":true,"feedback":"Correcto. Es el patrón miopático típico con actividad de membrana."},{"text":"PAUMs grandes con reclutamiento disminuido","is_correct":false,"feedback":"Incorrecto. Ese patrón es neurogénico."},{"text":"Bloqueo de conducción motor","is_correct":false,"feedback":"Incorrecto. Sugiere NMM."},{"text":"Incremento >100% del CMAP post-ejercicio","is_correct":false,"feedback":"Incorrecto. Sugiere LEMS."}]'::jsonb,
  2,
  true,
  'EMG muestra actividad espontánea y PAUMs pequeños en miopatías.',
  'Selva O’Callaghan & Trallero Araguás (2008). Miopatías inflamatorias.',
  ARRAY['Miopatías inflamatorias', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q33: Miopatías inflamatorias
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'pathologies',
  'Miopatías inflamatorias',
  '¿Cuál es un patrón clínico-electromiográfico característico de la miositis por cuerpos de inclusión (MCI)?',
  '[]'::jsonb,
  '[{"text":"Patrón mixto y afectación de cuádriceps y flexores de dedos","is_correct":true,"feedback":"Correcto. La MCI puede mostrar unidades largas y cortas."},{"text":"Respuesta excelente a esteroides","is_correct":false,"feedback":"Incorrecto. La MCI responde pobremente a esteroides."},{"text":"Bloqueo de conducción motor","is_correct":false,"feedback":"Incorrecto. Eso sugiere NMM."},{"text":"Ahorro del sural","is_correct":false,"feedback":"Incorrecto. Es un hallazgo de AIDP."}]'::jsonb,
  2,
  false,
  'MCI afecta cuádriceps y flexores de los dedos.',
  'Selva O’Callaghan & Trallero Araguás (2008). Miopatías inflamatorias.',
  ARRAY['Miopatías inflamatorias', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q34: Miopatías inflamatorias
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'pathologies',
  'Miopatías inflamatorias',
  'El anticuerpo anti-Jo1 se asocia clásicamente con:',
  '[]'::jsonb,
  '[{"text":"Síndrome antisintetasa (miositis, EPI, manos de mecánico)","is_correct":true,"feedback":"Correcto. Es el marcador clásico del síndrome antisintetasa."},{"text":"Dermatomiositis asociada a cáncer (anti-p155/140)","is_correct":false,"feedback":"Incorrecto. Ese es anti-p155/140."},{"text":"Miopatía necrotizante grave (anti-SRP)","is_correct":false,"feedback":"Incorrecto. Ese es anti-SRP."},{"text":"Miastenia gravis (anti-AChR)","is_correct":false,"feedback":"Incorrecto. Anti-AChR es de MG."}]'::jsonb,
  2,
  false,
  'Anti-Jo1 se asocia a síndrome antisintetasa.',
  'Selva O’Callaghan & Trallero Araguás (2008). Miopatías inflamatorias.',
  ARRAY['Miopatías inflamatorias', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q35: Miopatías inflamatorias
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'pathologies',
  'Miopatías inflamatorias',
  'El anticuerpo anti-Mi2 se asocia principalmente con:',
  '[]'::jsonb,
  '[{"text":"Dermatomiositis clásica con buen pronóstico","is_correct":true,"feedback":"Correcto. Anti-Mi2 se relaciona con dermatomiositis clásica."},{"text":"Miositis por cuerpos de inclusión","is_correct":false,"feedback":"Incorrecto. No es el marcador típico."},{"text":"Miopatía necrotizante resistente a esteroides","is_correct":false,"feedback":"Incorrecto. Eso se asocia a anti-SRP."},{"text":"Síndrome de Miller Fisher","is_correct":false,"feedback":"Incorrecto. Miller Fisher se asocia a anti-GQ1b."}]'::jsonb,
  1,
  false,
  'Anti-Mi2 se asocia a dermatomiositis clásica y buen pronóstico.',
  'Selva O’Callaghan & Trallero Araguás (2008). Miopatías inflamatorias.',
  ARRAY['Miopatías inflamatorias', 'EMG', 'basico'],
  'PUBLISHED'
);

-- Q36: Miopatías inflamatorias
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'pathologies',
  'Miopatías inflamatorias',
  'El anticuerpo anti-SRP se asocia a:',
  '[]'::jsonb,
  '[{"text":"Miopatía necrotizante grave y resistencia a esteroides","is_correct":true,"feedback":"Correcto. Es un marcador de miopatía necrotizante."},{"text":"Dermatomiositis asociada a cáncer","is_correct":false,"feedback":"Incorrecto. Eso es anti-p155/140."},{"text":"Síndrome antisintetasa","is_correct":false,"feedback":"Incorrecto. Ese es anti-Jo1."},{"text":"Miastenia gravis","is_correct":false,"feedback":"Incorrecto. MG se asocia a anti-AChR o anti-MuSK."}]'::jsonb,
  1,
  false,
  'Anti-SRP sugiere miopatía necrotizante grave.',
  'Selva O’Callaghan & Trallero Araguás (2008). Miopatías inflamatorias.',
  ARRAY['Miopatías inflamatorias', 'EMG', 'basico'],
  'PUBLISHED'
);

-- Q37: Miopatías inflamatorias
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'pathologies',
  'Miopatías inflamatorias',
  '¿Qué anticuerpo se asocia a dermatomiositis vinculada a cáncer?',
  '[]'::jsonb,
  '[{"text":"Anti-p155/140","is_correct":true,"feedback":"Correcto. Es un marcador de riesgo oncológico."},{"text":"Anti-Mi2","is_correct":false,"feedback":"Incorrecto. Anti-Mi2 se asocia a dermatomiositis clásica."},{"text":"Anti-GQ1b","is_correct":false,"feedback":"Incorrecto. Se relaciona con Miller Fisher."},{"text":"Anti-AChR","is_correct":false,"feedback":"Incorrecto. Se asocia a MG."}]'::jsonb,
  1,
  false,
  'Anti-p155/140 se asocia a malignidad en dermatomiositis.',
  'Selva O’Callaghan & Trallero Araguás (2008). Miopatías inflamatorias.',
  ARRAY['Miopatías inflamatorias', 'EMG', 'basico'],
  'PUBLISHED'
);

-- Q38: Miopatías inflamatorias
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'pathologies',
  'Miopatías inflamatorias',
  'En miopatías inflamatorias, ¿por qué se recomienda realizar EMG y biopsia en músculos contralaterales?',
  '[]'::jsonb,
  '[{"text":"Para evitar artefactos inflamatorios inducidos por la aguja","is_correct":true,"feedback":"Correcto. La aguja puede causar cambios inflamatorios locales."},{"text":"Porque la EMG debe siempre preceder a la biopsia","is_correct":false,"feedback":"Incorrecto. Lo importante es no biopsiar el mismo sitio pinchado."},{"text":"Para aumentar la amplitud del CMAP","is_correct":false,"feedback":"Incorrecto. No afecta el CMAP."},{"text":"Para medir la conducción sensitiva de dos nervios","is_correct":false,"feedback":"Incorrecto. Esa no es la razón."}]'::jsonb,
  2,
  false,
  'EMG y biopsia deben hacerse en lados contralaterales.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Miopatías inflamatorias', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q39: Potenciales evocados
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'evoked-potentials',
  'Potenciales evocados',
  'En el sistema 10-20, el punto Cz (vértex) se localiza:',
  '[]'::jsonb,
  '[{"text":"En la línea media entre T3 y T4","is_correct":true,"feedback":"Correcto. Cz corresponde al vértex en la línea media."},{"text":"En la línea media entre Fp1 y Fp2","is_correct":false,"feedback":"Incorrecto. Ese punto corresponde a Fpz."},{"text":"En el punto medio entre O1 y O2","is_correct":false,"feedback":"Incorrecto. Ese punto es Oz."},{"text":"Por delante del vértex en la región frontal","is_correct":false,"feedback":"Incorrecto. Cz es vértex en línea media."}]'::jsonb,
  1,
  false,
  'En el sistema 10-20, Cz está en la línea media entre T3 y T4.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Potenciales evocados', 'EMG', 'basico'],
  'PUBLISHED'
);

-- Q40: Principios básicos
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'fundamentals',
  'Principios básicos',
  '¿Cuál es el efecto del frío en estudios de conducción nerviosa?',
  '[]'::jsonb,
  '[{"text":"Aumenta latencia y amplitud, y disminuye velocidad","is_correct":true,"feedback":"Correcto. La temperatura baja enlentece la conducción."},{"text":"Disminuye latencia y aumenta velocidad","is_correct":false,"feedback":"Incorrecto. Ocurre lo contrario."},{"text":"No tiene efecto sobre la conducción","is_correct":false,"feedback":"Incorrecto. La temperatura es un factor crítico."},{"text":"Solo reduce amplitud sin cambiar latencia","is_correct":false,"feedback":"Incorrecto. La latencia aumenta con el frío."}]'::jsonb,
  2,
  true,
  'Temperatura baja aumenta latencia y reduce velocidad.',
  'Chen et al. (2016). Electrodiagnostic reference values.',
  ARRAY['Principios básicos', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q41: Principios básicos
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'fundamentals',
  'Principios básicos',
  'Temperaturas recomendadas para estudios de conducción nerviosa son:',
  '[]'::jsonb,
  '[{"text":">32°C en miembros superiores y >31°C en inferiores","is_correct":true,"feedback":"Correcto. Garantiza valores comparables y evita falsos positivos."},{"text":">28°C en miembros superiores y >26°C en inferiores","is_correct":false,"feedback":"Incorrecto. Son demasiado bajas."},{"text":"No se requiere control de temperatura","is_correct":false,"feedback":"Incorrecto. La temperatura afecta la conducción."},{"text":">35°C en todos los casos","is_correct":false,"feedback":"Incorrecto. No es un requisito estándar."}]'::jsonb,
  2,
  true,
  'Extremidades deben mantenerse templadas para interpretaciones válidas.',
  'Chen et al. (2016). Electrodiagnostic reference values.',
  ARRAY['Principios básicos', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q42: Reflejo H
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'late-responses',
  'Reflejo H',
  '¿Qué diferencia interlado de latencia del reflejo H es considerada significativa?',
  '[]'::jsonb,
  '[{"text":"Mayor a 1.2–1.5 ms","is_correct":true,"feedback":"Correcto. Esa diferencia sugiere alteración relevante."},{"text":"Mayor a 0.2 ms","is_correct":false,"feedback":"Incorrecto. Ese valor es demasiado bajo."},{"text":"Mayor a 3.5 ms","is_correct":false,"feedback":"Incorrecto. Es un umbral excesivo para interlado."},{"text":"No se evalúa interlado en el reflejo H","is_correct":false,"feedback":"Incorrecto. La comparación interlado es útil."}]'::jsonb,
  2,
  false,
  'Diferencia interlado del reflejo H >1.2-1.5 ms es significativa.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Reflejo H', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q43: Onda F
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'late-responses',
  'Onda F',
  '¿Qué evalúa principalmente la onda F en estudios de conducción nerviosa?',
  '[]'::jsonb,
  '[{"text":"Conducción proximal y raíces","is_correct":true,"feedback":"Correcto. La onda F explora segmentos proximales."},{"text":"Unión neuromuscular postsináptica","is_correct":false,"feedback":"Incorrecto. Eso se evalúa con RNS o SFEMG."},{"text":"Conducción sensitiva distal exclusiva","is_correct":false,"feedback":"Incorrecto. La onda F es motor y proximal."},{"text":"Solo la integridad del músculo estudiado","is_correct":false,"feedback":"Incorrecto. No es una prueba miopática."}]'::jsonb,
  2,
  false,
  'La onda F evalúa conducción proximal (raíces).',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Onda F', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q44: Neuropatia del Mediano
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'nerve-conduction',
  'Neuropatia del Mediano',
  'El signo de Bactrian (doble pico en comparativa radial/mediano sensitiva en dedo 4) sugiere:',
  '[]'::jsonb,
  '[{"text":"Enlentecimiento focal del nervio mediano en túnel del carpo","is_correct":true,"feedback":"Correcto. La diferencia significativa suele ser >0.4–0.5 ms."},{"text":"Neuropatía cubital en canal de Guyón","is_correct":false,"feedback":"Incorrecto. El signo se describe para el mediano."},{"text":"Radiculopatía C8-T1","is_correct":false,"feedback":"Incorrecto. Es un hallazgo de atrapamiento distal."},{"text":"Bloqueo de conducción motor multifocal","is_correct":false,"feedback":"Incorrecto. Eso corresponde a NMM."}]'::jsonb,
  2,
  false,
  'El signo de Bactrian sugiere enlentecimiento focal del mediano.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Neuropatia del Mediano', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q45: Neuropatía cubital
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'nerve-conduction',
  'Neuropatía cubital',
  'En el canal de Guyón, un hallazgo electrofisiológico típico es:',
  '[]'::jsonb,
  '[{"text":"Latencia motora distal cubital prolongada con velocidad antebraquial normal","is_correct":true,"feedback":"Correcto. Suele acompañarse de disminución de amplitud."},{"text":"SNAPs normales en radiculopatía","is_correct":false,"feedback":"Incorrecto. Ese hallazgo no define canal de Guyón."},{"text":"Incremento >100% del CMAP post-ejercicio","is_correct":false,"feedback":"Incorrecto. Es de LEMS."},{"text":"Decremento >10% en RNS a 3 Hz","is_correct":false,"feedback":"Incorrecto. Es de MG."}]'::jsonb,
  2,
  true,
  'En canal de Guyón hay latencia motora distal cubital prolongada.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Neuropatía cubital', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q46: Principios básicos
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'fundamentals',
  'Principios básicos',
  'En neuroconducción, la conducción ortodrómica es:',
  '[]'::jsonb,
  '[{"text":"El impulso viaja en el sentido fisiológico natural","is_correct":true,"feedback":"Correcto. La señal progresa en la dirección normal del sistema."},{"text":"El impulso viaja en sentido contrario al fisiológico","is_correct":false,"feedback":"Incorrecto. Eso describe conducción antidrómica."},{"text":"Un reflejo monosináptico","is_correct":false,"feedback":"Incorrecto. Eso describe el reflejo H."},{"text":"Una descarga recurrente de motoneuronas","is_correct":false,"feedback":"Incorrecto. Eso corresponde a la onda F."}]'::jsonb,
  1,
  true,
  'Ortodrómico sigue la dirección fisiológica natural.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Principios básicos', 'EMG', 'basico'],
  'PUBLISHED'
);

-- Q47: Principios básicos
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'fundamentals',
  'Principios básicos',
  'La conducción antidrómica se define como:',
  '[]'::jsonb,
  '[{"text":"Propagación opuesta a la conducción fisiológica","is_correct":true,"feedback":"Correcto. La señal viaja en sentido inverso al habitual."},{"text":"Propagación exclusiva por fibras sensitivas Ia","is_correct":false,"feedback":"Incorrecto. No se limita a fibras Ia."},{"text":"Respuesta monosináptica constante","is_correct":false,"feedback":"Incorrecto. Eso describe el reflejo H."},{"text":"Respuesta tardía agotable","is_correct":false,"feedback":"Incorrecto. La onda F no es agotable."}]'::jsonb,
  1,
  true,
  'Antidrómico va en sentido opuesto a la conducción fisiológica.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Principios básicos', 'EMG', 'basico'],
  'PUBLISHED'
);

-- Q48: Onda F
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'late-responses',
  'Onda F',
  'Para obtener una onda F confiable se requiere un estímulo:',
  '[]'::jsonb,
  '[{"text":"Supramáximo","is_correct":true,"feedback":"Correcto. Se busca activar todas las fibras motoras posibles."},{"text":"Submáximo","is_correct":false,"feedback":"Incorrecto. El estímulo submáximo se usa para reflejo H."},{"text":"Solo sensitivo","is_correct":false,"feedback":"Incorrecto. La onda F es una respuesta motora."},{"text":"Inhibitorio","is_correct":false,"feedback":"Incorrecto. No aplica a la técnica."}]'::jsonb,
  2,
  true,
  'La onda F requiere estímulo supramáximo.',
  'AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.',
  ARRAY['Onda F', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q49: Onda F
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'late-responses',
  'Onda F',
  'La onda F se genera por activación de:',
  '[]'::jsonb,
  '[{"text":"Fibras alfa motoras","is_correct":true,"feedback":"Correcto. Es una descarga recurrente de motoneuronas alfa."},{"text":"Fibras Ia sensitivas","is_correct":false,"feedback":"Incorrecto. Esas fibras participan en el reflejo H."},{"text":"Fibras Ib del Golgi","is_correct":false,"feedback":"Incorrecto. No son la vía principal de la onda F."},{"text":"Fibras gamma motoras","is_correct":false,"feedback":"Incorrecto. Las gamma modulan el huso muscular."}]'::jsonb,
  2,
  true,
  'La onda F involucra fibras alfa motoras.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Onda F', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q50: Onda F
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'late-responses',
  'Onda F',
  'En condiciones normales, la persistencia de la onda F es:',
  '[]'::jsonb,
  '[{"text":"Variable, depende de la excitabilidad del pool de motoneuronas","is_correct":true,"feedback":"Correcto. Por eso no aparece en todos los estímulos."},{"text":"Constante, siempre aparece en cada estímulo","is_correct":false,"feedback":"Incorrecto. Esa constancia es más propia del reflejo H."},{"text":"Ausente en sujetos sanos","is_correct":false,"feedback":"Incorrecto. La onda F es una respuesta normal."},{"text":"Igual a la del reflejo H","is_correct":false,"feedback":"Incorrecto. La onda F es menos persistente."}]'::jsonb,
  2,
  false,
  'La persistencia de la onda F es variable.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Onda F', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q51: Onda F
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'late-responses',
  'Onda F',
  'La amplitud típica de la onda F es aproximadamente:',
  '[]'::jsonb,
  '[{"text":"5% del CMAP","is_correct":true,"feedback":"Correcto. Es una respuesta pequeña y variable."},{"text":"50-100% del CMAP","is_correct":false,"feedback":"Incorrecto. Esa amplitud corresponde al reflejo H."},{"text":"Igual al CMAP basal","is_correct":false,"feedback":"Incorrecto. La onda F es de menor amplitud."},{"text":">150% del CMAP","is_correct":false,"feedback":"Incorrecto. No es un hallazgo fisiológico."}]'::jsonb,
  2,
  false,
  'La onda F suele medir ~5% del CMAP.',
  'Chen et al. (2016). Electrodiagnostic reference values.',
  ARRAY['Onda F', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q52: Onda F vs Reflejo H
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'late-responses',
  'Onda F vs Reflejo H',
  'En la comparación Onda F vs Reflejo H, el agotamiento es:',
  '[]'::jsonb,
  '[{"text":"Onda F no agotable; Reflejo H agotable","is_correct":true,"feedback":"Correcto. Es una diferencia fisiológica clave."},{"text":"Onda F agotable; Reflejo H no agotable","is_correct":false,"feedback":"Incorrecto. Es al revés."},{"text":"Ambas no agotables","is_correct":false,"feedback":"Incorrecto. El reflejo H sí puede agotarse."},{"text":"Ambas agotables","is_correct":false,"feedback":"Incorrecto. La onda F no es agotable."}]'::jsonb,
  2,
  false,
  'El reflejo H es agotable; la onda F no.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Onda F vs Reflejo H', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q53: Reflejo H
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'late-responses',
  'Reflejo H',
  'El reflejo H corresponde a:',
  '[]'::jsonb,
  '[{"text":"Un arco reflejo monosináptico","is_correct":true,"feedback":"Correcto. Es el análogo eléctrico del reflejo miotático."},{"text":"Una descarga recurrente motora","is_correct":false,"feedback":"Incorrecto. Eso describe la onda F."},{"text":"Un potencial sensitivo distal","is_correct":false,"feedback":"Incorrecto. No es un SNAP."},{"text":"Un potencial evocado visual","is_correct":false,"feedback":"Incorrecto. No pertenece a PE."}]'::jsonb,
  2,
  true,
  'El reflejo H es un arco monosináptico.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Reflejo H', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q54: Reflejo H
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'late-responses',
  'Reflejo H',
  'La vía aferente principal del reflejo H es:',
  '[]'::jsonb,
  '[{"text":"Fibras Ia sensitivas","is_correct":true,"feedback":"Correcto. Hacen sinapsis directa con motoneuronas alfa."},{"text":"Fibras Ib del Golgi","is_correct":false,"feedback":"Incorrecto. Esas fibras no median el reflejo H."},{"text":"Fibras A-delta","is_correct":false,"feedback":"Incorrecto. No participan en este reflejo."},{"text":"Fibras C","is_correct":false,"feedback":"Incorrecto. No median reflejos miotáticos."}]'::jsonb,
  2,
  true,
  'El reflejo H usa fibras aferentes Ia.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Reflejo H', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q55: Reflejo H
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'late-responses',
  'Reflejo H',
  'Para obtener un reflejo H, el estímulo debe ser:',
  '[]'::jsonb,
  '[{"text":"Submáximo","is_correct":true,"feedback":"Correcto. Activa fibras Ia antes que motoras."},{"text":"Supramáximo","is_correct":false,"feedback":"Incorrecto. Eso es típico de la onda F."},{"text":"Doloroso e intenso","is_correct":false,"feedback":"Incorrecto. La intensidad busca selectividad."},{"text":"Sin estimulación eléctrica","is_correct":false,"feedback":"Incorrecto. Es un reflejo inducido."}]'::jsonb,
  2,
  true,
  'El reflejo H se obtiene con estímulo submáximo.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Reflejo H', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q56: Reflejo H
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'late-responses',
  'Reflejo H',
  'Comparado con la onda F, el reflejo H se caracteriza por:',
  '[]'::jsonb,
  '[{"text":"Latencia y morfología más constantes","is_correct":true,"feedback":"Correcto. El reflejo H es más estable."},{"text":"Mayor variabilidad de latencia","is_correct":false,"feedback":"Incorrecto. La variabilidad es propia de la onda F."},{"text":"Amplitud siempre menor al 5% del CMAP","is_correct":false,"feedback":"Incorrecto. El reflejo H es mayor que la onda F."},{"text":"No relacionarse con la raíz S1","is_correct":false,"feedback":"Incorrecto. Es clásico para S1."}]'::jsonb,
  2,
  false,
  'El reflejo H tiene latencia y morfología constantes.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Reflejo H', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q57: Reflejo H
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'late-responses',
  'Reflejo H',
  'El reflejo H es el estándar para evaluar la raíz:',
  '[]'::jsonb,
  '[{"text":"S1 (sóleo/gastrocnemio)","is_correct":true,"feedback":"Correcto. "},{"text":"L5 (Isquiotibiales)","is_correct":false,"feedback":"Incorrecto. No es la raíz principal del reflejo H clásico."},{"text":"L4 (tibial anterior)","is_correct":false,"feedback":"Incorrecto. El reflejo H clásico evalúa S1."},{"text":"S1 (Gluteos)","is_correct":false,"feedback":"Incorrecto. No aplica."}]'::jsonb,
  1,
  true,
  'El reflejo H evalúa principalmente la raíz S1.',
  'American Association of Neuromuscular & Electrodiagnostic Medicine (AANEM). (2023) ',
  ARRAY['Reflejo H', 'EMG', 'basico'],
  'PUBLISHED'
);

-- Q58: Onda F vs Reflejo H
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'late-responses',
  'Onda F vs Reflejo H',
  'En condiciones normales, la amplitud del reflejo H suele ser:',
  '[]'::jsonb,
  '[{"text":"50-100% del CMAP","is_correct":true,"feedback":"Correcto. Es más grande que la onda F."},{"text":"~5% del CMAP","is_correct":false,"feedback":"Incorrecto. Ese valor corresponde a la onda F."},{"text":"Menor al 1% del CMAP","is_correct":false,"feedback":"Incorrecto. Sería demasiado pequeña."},{"text":"Igual al CMAP basal","is_correct":false,"feedback":"Incorrecto. Puede variar, pero no es igual al CMAP."}]'::jsonb,
  2,
  false,
  'La amplitud del reflejo H puede alcanzar 50-100% del CMAP.',
  'Chen et al. (2016). Electrodiagnostic reference values.',
  ARRAY['Onda F vs Reflejo H', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q59: Técnicas de neuroconducción
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'nerve-conduction',
  'Técnicas de neuroconducción',
  'En respuestas tardías, una diferencia interlado patológica se considera cuando es >1.5 ms en miembros superiores o >2 ms en miembros inferiores. Este parámetro se denomina:',
  '[]'::jsonb,
  '[{"text":"Regla de latencia interlado","is_correct":true,"feedback":"Correcto. Es el parámetro más robusto para comparar lados."},{"text":"Regla de amplitud basal","is_correct":false,"feedback":"Incorrecto. La amplitud es menos robusta que la latencia."},{"text":"Regla de velocidad terminal","is_correct":false,"feedback":"Incorrecto. Se refiere a otro parámetro."},{"text":"Regla de conducción sensitiva","is_correct":false,"feedback":"Incorrecto. Aquí hablamos de latencia interlado."}]'::jsonb,
  3,
  true,
  'La diferencia interlado es el parámetro más robusto.',
  'Chen et al. (2016). Electrodiagnostic reference values.',
  ARRAY['Técnicas de neuroconducción', 'EMG', 'avanzado'],
  'PUBLISHED'
);

-- Q60: Onda F
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'late-responses',
  'Onda F',
  'Una persistencia de onda F <50% sugiere:',
  '[]'::jsonb,
  '[{"text":"Pérdida de unidades motoras funcionales o bloqueo proximal","is_correct":true,"feedback":"Correcto. Indica compromiso proximal o pérdida de unidades."},{"text":"Reflejo H normal","is_correct":false,"feedback":"Incorrecto. La persistencia baja es anormal."},{"text":"Miopatía inflamatoria pura","is_correct":false,"feedback":"Incorrecto. Es más indicativo de patología proximal motor."},{"text":"Normalidad del estudio","is_correct":false,"feedback":"Incorrecto. Es un dato patológico."}]'::jsonb,
  2,
  false,
  'Persistencia <50% en onda F sugiere pérdida de unidades motoras o bloqueo proximal.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Onda F', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q61: Principios básicos
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'fundamentals',
  'Principios básicos',
  '¿Qué umbrales sugieren un proceso desmielinizante en neuroconducción?',
  '[]'::jsonb,
  '[{"text":"Latencia distal >130% del límite superior o VCN <75% del límite inferior","is_correct":true,"feedback":"Correcto. Son umbrales clásicos para desmielinización."},{"text":"Latencia distal <80% del límite inferior","is_correct":false,"feedback":"Incorrecto. No sugiere desmielinización."},{"text":"VCN >120% del límite superior","is_correct":false,"feedback":"Incorrecto. No es criterio patológico."},{"text":"Amplitud del CMAP >150% del límite superior","is_correct":false,"feedback":"Incorrecto. No define desmielinización."}]'::jsonb,
  3,
  true,
  'Latencia distal >130% o VCN <75% sugieren desmielinización.',
  'Chen et al. (2016). Electrodiagnostic reference values.',
  ARRAY['Principios básicos', 'EMG', 'avanzado'],
  'PUBLISHED'
);

-- Q62: Radiculopatía
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'topographic-anatomy',
  'Radiculopatía',
  'En sospecha de radiculopatía S1 con conducción distal normal, ¿qué respuesta tardía es más confirmatoria?',
  '[]'::jsonb,
  '[{"text":"Reflejo H ausente o prolongado","is_correct":true,"feedback":"Correcto. Es el estándar de oro para S1."},{"text":"PEV con latencia P100 retrasada","is_correct":false,"feedback":"Incorrecto. PEV evalúa vía visual."},{"text":"SNAP sural ausente","is_correct":false,"feedback":"Incorrecto. En radiculopatía el SNAP puede ser normal."},{"text":"CMAP con incremento post-ejercicio","is_correct":false,"feedback":"Incorrecto. Eso es LEMS."}]'::jsonb,
  2,
  true,
  'El reflejo H confirma radiculopatía S1.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Radiculopatía', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q63: Neurofisiología básica
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'fundamentals',
  'Neurofisiología básica',
  'El potencial de acción se define como:',
  '[]'::jsonb,
  '[{"text":"Cambio rápido de potencial con retorno inmediato al reposo","is_correct":true,"feedback":"Correcto. Es la base eléctrica de la conducción."},{"text":"Liberación de neurotransmisor en la sinapsis","is_correct":false,"feedback":"Incorrecto. Eso es un proceso químico."},{"text":"Contracción sostenida del músculo","is_correct":false,"feedback":"Incorrecto. No define un potencial de acción."},{"text":"Bloqueo de conducción por desmielinización","is_correct":false,"feedback":"Incorrecto. Es un fenómeno patológico."}]'::jsonb,
  1,
  false,
  'El potencial de acción es un cambio rápido seguido de retorno al reposo.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Neurofisiología básica', 'EMG', 'basico'],
  'PUBLISHED'
);

-- Q64: Neurofisiología básica
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'fundamentals',
  'Neurofisiología básica',
  'El proceso funcional neuronal se describe como tripartito, integrando:',
  '[]'::jsonb,
  '[{"text":"Procesos metabólicos, eléctricos y energéticos","is_correct":true,"feedback":"Correcto. El potencial de acción es el componente eléctrico."},{"text":"Solo procesos eléctricos y químicos","is_correct":false,"feedback":"Incorrecto. Falta el componente energético."},{"text":"Procesos mecánicos y vasculares","is_correct":false,"feedback":"Incorrecto. No corresponde a la definición."},{"text":"Procesos térmicos y osmóticos","is_correct":false,"feedback":"Incorrecto. No es la clasificación clásica."}]'::jsonb,
  2,
  false,
  'El proceso neuronal integra componentes metabólicos, eléctricos y energéticos.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Neurofisiología básica', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q65: Electromiografía
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'emg-needle',
  'Electromiografía',
  'En el análisis del patrón de reclutamiento, la densidad se refiere a:',
  '[]'::jsonb,
  '[{"text":"El número de espigas o actividad presente","is_correct":true,"feedback":"Correcto. Es un indicador del número de unidades activas."},{"text":"El voltaje total de la contracción","is_correct":false,"feedback":"Incorrecto. Eso describe el promedio de amplitud."},{"text":"La velocidad de conducción","is_correct":false,"feedback":"Incorrecto. No es un parámetro de reclutamiento."},{"text":"La latencia de la onda F","is_correct":false,"feedback":"Incorrecto. No aplica."}]'::jsonb,
  2,
  false,
  'El patrón de reclutamiento integra densidad y amplitud promedio.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Electromiografía', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q66: Potenciales evocados
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'evoked-potentials',
  'Potenciales evocados',
  'El sistema internacional 10-20 se basa en:',
  '[]'::jsonb,
  '[{"text":"Distancias del 10% y 20% entre puntos anatómicos","is_correct":true,"feedback":"Correcto. Garantiza proporciones reproducibles."},{"text":"Distancias fijas de 2 cm entre electrodos","is_correct":false,"feedback":"Incorrecto. Se usan proporciones, no centímetros fijos."},{"text":"La distancia entre Fp1 y Fp2 exclusivamente","is_correct":false,"feedback":"Incorrecto. Usa varios puntos de referencia."},{"text":"Solo puntos preauriculares","is_correct":false,"feedback":"Incorrecto. Incluye nasion e inion."}]'::jsonb,
  2,
  false,
  'El sistema 10-20 usa proporciones 10% y 20%.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Potenciales evocados', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q67: Potenciales evocados
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'evoked-potentials',
  'Potenciales evocados',
  'En el sistema 10-20, Nasion e Inion se utilizan como:',
  '[]'::jsonb,
  '[{"text":"Puntos de referencia longitudinales para el mapa","is_correct":true,"feedback":"Correcto. Son polos anatómicos para la medición."},{"text":"Puntos de referencia exclusivamente laterales","is_correct":false,"feedback":"Incorrecto. Los puntos laterales son preauriculares."},{"text":"Sitios de estimulación eléctrica","is_correct":false,"feedback":"Incorrecto. Se usan para ubicación, no para estimular."},{"text":"Referencias para la conducción nerviosa periférica","is_correct":false,"feedback":"Incorrecto. Son referencias craneales."}]'::jsonb,
  2,
  false,
  'Nasion e inion son polos del mapa 10-20.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Potenciales evocados', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q68: Potenciales evocados
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'evoked-potentials',
  'Potenciales evocados',
  'En la nomenclatura 10-20, ¿qué indican los números impares?',
  '[]'::jsonb,
  '[{"text":"Hemisferio izquierdo","is_correct":true,"feedback":"Correcto. Los pares corresponden al hemisferio derecho."},{"text":"Hemisferio derecho","is_correct":false,"feedback":"Incorrecto. Los pares indican el derecho."},{"text":"Línea media","is_correct":false,"feedback":"Incorrecto. La línea media se marca con \"z\"."},{"text":"Zona occipital exclusivamente","is_correct":false,"feedback":"Incorrecto. Los números no indican región."}]'::jsonb,
  1,
  false,
  'En la nomenclatura 10-20, números impares son izquierdos.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Potenciales evocados', 'EMG', 'basico'],
  'PUBLISHED'
);

-- Q69: Principios básicos
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'fundamentals',
  'Principios básicos',
  'El huso muscular responde a cambios de longitud e integra aferencias:',
  '[]'::jsonb,
  '[{"text":"Ia y II, con eferencias gamma","is_correct":true,"feedback":"Correcto. Es la base del reflejo miotático."},{"text":"Ib exclusivamente","is_correct":false,"feedback":"Incorrecto. Ib corresponde al órgano tendinoso de Golgi."},{"text":"Fibras C","is_correct":false,"feedback":"Incorrecto. No participan en propiocepción rápida."},{"text":"Fibras motoras alfa exclusivamente","is_correct":false,"feedback":"Incorrecto. Las alfa inervan músculo extrafusal."}]'::jsonb,
  2,
  false,
  'El huso muscular se inerva por fibras Ia y II.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Principios básicos', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q70: Principios básicos
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'fundamentals',
  'Principios básicos',
  'El órgano tendinoso de Golgi informa sobre tensión muscular mediante fibras:',
  '[]'::jsonb,
  '[{"text":"Ib","is_correct":true,"feedback":"Correcto. Se ubica en la unión musculotendinosa."},{"text":"Ia","is_correct":false,"feedback":"Incorrecto. Ia es del huso muscular."},{"text":"II","is_correct":false,"feedback":"Incorrecto. II también es del huso muscular."},{"text":"C","is_correct":false,"feedback":"Incorrecto. No es la vía principal."}]'::jsonb,
  2,
  false,
  'El órgano tendinoso de Golgi usa aferencias Ib.',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Principios básicos', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q71: Actividad espontánea
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'emg-needle',
  'Actividad espontánea',
  'Las fibrilaciones/ondas puntiagudas positivas en EMG suelen describirse con sonido de:',
  '[]'::jsonb,
  '[{"text":"\"Lluvia en techo\" o \"golpeteo sordo\"","is_correct":true,"feedback":"Correcto. Es una descripción clásica de denervación activa."},{"text":"\"Avión en picada\"","is_correct":false,"feedback":"Incorrecto. Eso describe descargas miotónicas."},{"text":"\"Máquina\" de inicio y fin súbito","is_correct":false,"feedback":"Incorrecto. Eso corresponde a descargas repetitivas complejas."},{"text":"\"Marcha de soldados\"","is_correct":false,"feedback":"Incorrecto. Ese sonido es típico de miocimias."}]'::jsonb,
  2,
  false,
  'Fibrilaciones suenan como "lluvia en techo".',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Actividad espontánea', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q72: Actividad espontánea
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'emg-needle',
  'Actividad espontánea',
  'Las miocimias en EMG se describen típicamente como sonido de:',
  '[]'::jsonb,
  '[{"text":"\"Marcha de soldados\"","is_correct":true,"feedback":"Correcto. Son descargas en ráfaga características."},{"text":"\"Avión en picada\"","is_correct":false,"feedback":"Incorrecto. Ese sonido es de miotonía."},{"text":"\"Lluvia en techo\"","is_correct":false,"feedback":"Incorrecto. Eso es de fibrilaciones."},{"text":"\"Máquina\" con inicio y fin súbito","is_correct":false,"feedback":"Incorrecto. Eso es de descargas repetitivas complejas."}]'::jsonb,
  2,
  false,
  'Miocimias suenan como "marcha de soldados".
Las mioquimias son contracciones involuntarias, rítmicas o semirrítmicas, de pequeñas fibras musculares, frecuentemente observadas en párpados o cara. Electromiográficamente (EMG), se caracterizan por descargas agrupadas de unidades motoras de alta frecuencia (\(5\) a \(150\) Hz), con episodios repetitivos separados por silencios breves. Generalmente benignas, indican irritación nerviosa o fatiga. ',
  'Manual de operaciones de electromiografía (INR, 2020).',
  ARRAY['Actividad espontánea', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q73: Lesión nerviosa
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'fundamentals',
  'Lesión nerviosa',
  'Según Sunderland, la neuropraxia (tipo 1) se caracteriza por:',
  '[]'::jsonb,
  '[{"text":"Bloqueo de conducción focal por lesión de mielina","is_correct":true,"feedback":"Correcto. La recuperación suele ser en semanas o meses."},{"text":"Sección completa del nervio","is_correct":false,"feedback":"Incorrecto. Eso corresponde a neurotmesis."},{"text":"Interrupción axonal con degeneración walleriana","is_correct":false,"feedback":"Incorrecto. Eso es axonotmesis."},{"text":"Necrosis muscular primaria","is_correct":false,"feedback":"Incorrecto. No es una lesión muscular."}]'::jsonb,
  2,
  false,
  'Neuropraxia es bloqueo por lesión de mielina, con recuperación en semanas/meses.',
  'Jiménez-Domínguez et al. (2016). Abordaje clínico y electrofisiológico del paciente con polineuropatía.',
  ARRAY['Lesión nerviosa', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q74: Lesión nerviosa
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'fundamentals',
  'Lesión nerviosa',
  'La neurotmesis (tipo 5 de Sunderland) se define como:',
  '[]'::jsonb,
  '[{"text":"Sección completa del nervio con necesidad de reparación quirúrgica","is_correct":true,"feedback":"Correcto. Es la lesión más grave en la clasificación."},{"text":"Bloqueo de conducción por desmielinización","is_correct":false,"feedback":"Incorrecto. Eso es neuropraxia."},{"text":"Interrupción axonal con endoneuro intacto","is_correct":false,"feedback":"Incorrecto. Eso es axonotmesis leve."},{"text":"Lesión reversible en días","is_correct":false,"feedback":"Incorrecto. Es una lesión grave."}]'::jsonb,
  2,
  false,
  'Neurotmesis (tipo 5) implica sección completa del nervio.',
  'Jiménez-Domínguez et al. (2016). Abordaje clínico y electrofisiológico del paciente con polineuropatía.',
  ARRAY['Lesión nerviosa', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q75: CIDP y autoanticuerpos
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'diagnostic-criteria',
  'CIDP y autoanticuerpos',
  'En CIDP, la presencia de autoanticuerpos IgG4 anti-NF155 suele asociarse con:',
  '[]'::jsonb,
  '[{"text":"Pobre respuesta a IgIV y temblor","is_correct":true,"feedback":"Correcto. Es un fenotipo descrito en guías recientes."},{"text":"Respuesta excelente y rápida a IgIV","is_correct":false,"feedback":"Incorrecto. Suele responder peor."},{"text":"Ausencia total de síntomas sensitivos y motores","is_correct":false,"feedback":"Incorrecto. No describe el fenotipo."},{"text":"Incremento >100% del CMAP tras ejercicio","is_correct":false,"feedback":"Incorrecto. Eso es típico de LEMS."}]'::jsonb,
  3,
  false,
  'Anti-NF155 (IgG4) se asocia a pobre respuesta a IgIV y temblor.',
  'EAN/PNS (2021) guideline on CIDP.',
  ARRAY['CIDP y autoanticuerpos', 'EMG', 'avanzado'],
  'PUBLISHED'
);

-- Q76: Potenciales evocados
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'evoked-potentials',
  'Potenciales evocados',
  'Los potenciales evocados auditivos de tronco (PEAT) evalúan típicamente las ondas:',
  '[]'::jsonb,
  '[{"text":"I, III y V","is_correct":true,"feedback":"Correcto. Son los picos clásicos en PEAT."},{"text":"N75, P100 y N145","is_correct":false,"feedback":"Incorrecto. Esas son de potenciales evocados visuales."},{"text":"N9 y N13","is_correct":false,"feedback":"Incorrecto. Esos son somatosensoriales."},{"text":"P300 y N400","is_correct":false,"feedback":"Incorrecto. Son componentes cognitivos."}]'::jsonb,
  2,
  false,
  'PEAT evalúa ondas I, III y V.',
  'AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.',
  ARRAY['Potenciales evocados', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q77: Potenciales evocados
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'evoked-potentials',
  'Potenciales evocados',
  'En los potenciales evocados visuales (PEV), las ondas clásicas incluyen:',
  '[]'::jsonb,
  '[{"text":"N75, P100 y N145","is_correct":true,"feedback":"Correcto. Son componentes típicos del PEV."},{"text":"I, III y V","is_correct":false,"feedback":"Incorrecto. Esas ondas corresponden a PEAT."},{"text":"M y H","is_correct":false,"feedback":"Incorrecto. Esas son respuestas de neuroconducción."},{"text":"P50 y N100","is_correct":false,"feedback":"Incorrecto. No son componentes estándar del PEV."}]'::jsonb,
  2,
  false,
  'PEV evalúa la vía visual con N75, P100 y N145.',
  'AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.',
  ARRAY['Potenciales evocados', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q78: Potenciales evocados
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'evoked-potentials',
  'Potenciales evocados',
  'Los potenciales evocados somatosensoriales (PESS) se utilizan especialmente en nervios:',
  '[]'::jsonb,
  '[{"text":"Mediano, ulnar, peroneo y tibial","is_correct":true,"feedback":"Correcto. Evalúan la vía sensorial ascendente."},{"text":"Óptico y acústico","is_correct":false,"feedback":"Incorrecto. Esos corresponden a PEV y PEAT."},{"text":"Frénico y facial","is_correct":false,"feedback":"Incorrecto. No son nervios típicos para PESS."},{"text":"Vago y glosofaríngeo","is_correct":false,"feedback":"Incorrecto. No son usados en PESS."}]'::jsonb,
  2,
  false,
  'PESS evalúan vías ascendentes, útil en mediano, ulnar, peroneo y tibial.',
  'AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.',
  ARRAY['Potenciales evocados', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q79: Principios básicos
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'fundamentals',
  'Principios básicos',
  'Según AANEM, la EMG debe ser realizada e interpretada por:',
  '[]'::jsonb,
  '[{"text":"Médicos capacitados (neurólogos o fisiatras)","is_correct":true,"feedback":"Correcto. La EMG requiere síntesis clínica en tiempo real."},{"text":"Técnicos sin supervisión médica","is_correct":false,"feedback":"Incorrecto. No cumple con estándares profesionales."},{"text":"Personal administrativo entrenado","is_correct":false,"feedback":"Incorrecto. No es un acto administrativo."},{"text":"Cualquier profesional de salud sin formación específica","is_correct":false,"feedback":"Incorrecto. Se requiere formación especializada."}]'::jsonb,
  2,
  true,
  'La EMG es un acto médico con interpretación dinámica.',
  'AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.',
  ARRAY['Principios básicos', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q80: Radiculopatía
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'topographic-anatomy',
  'Radiculopatía',
  'De acuerdo con AANEM, un límite razonable de nervios estudiados en radiculopatía es:',
  '[]'::jsonb,
  '[{"text":"7 nervios","is_correct":true,"feedback":"Correcto. Para polineuropatía el límite sugerido es mayor."},{"text":"2 nervios","is_correct":false,"feedback":"Incorrecto. Es insuficiente para un estudio completo."},{"text":"20 nervios","is_correct":false,"feedback":"Incorrecto. Excede los límites razonables."},{"text":"No hay límites sugeridos","is_correct":false,"feedback":"Incorrecto. AANEM sí propone límites."}]'::jsonb,
  2,
  true,
  'AANEM recomienda límites razonables de nervios por categoría diagnóstica.',
  'AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.',
  ARRAY['Radiculopatía', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q81: Polineuropatia
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'nerve-conduction',
  'Polineuropatia',
  'Según AANEM, el número razonable de nervios estudiados en polineuropatía es:',
  '[]'::jsonb,
  '[{"text":"10 nervios","is_correct":true,"feedback":"Correcto. Evita la sobreutilización."},{"text":"4 nervios","is_correct":false,"feedback":"Incorrecto. Suele ser insuficiente."},{"text":"15 nervios","is_correct":false,"feedback":"Incorrecto. Supera el límite sugerido."},{"text":"Sin límite establecido","is_correct":false,"feedback":"Incorrecto. Hay límites recomendados."}]'::jsonb,
  2,
  true,
  'Para polineuropatía, AANEM sugiere hasta 10 nervios.',
  'AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.',
  ARRAY['Polineuropatia', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q82: Electromiografía
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'emg-needle',
  'Electromiografía',
  'Tras una lesión nerviosa, la EMG de aguja es más informativa después de:',
  '[]'::jsonb,
  '[{"text":"21 días","is_correct":true,"feedback":"Correcto. Es el tiempo típico para aparición de fibrilaciones."},{"text":"24 horas","is_correct":false,"feedback":"Incorrecto. Es demasiado temprano para denervación activa."},{"text":"5 días","is_correct":false,"feedback":"Incorrecto. Aún puede no haber fibrilaciones."},{"text":"2 horas","is_correct":false,"feedback":"Incorrecto. No es útil tan temprano."}]'::jsonb,
  2,
  false,
  'La EMG es más informativa después de 21 días de lesión.',
  'AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.',
  ARRAY['Electromiografía', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q83: Neuroconducción pediátrica
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'nerve-conduction',
  'Neuroconducción pediátrica',
  'En niños, las velocidades de conducción alcanzan valores de adulto aproximadamente a los:',
  '[]'::jsonb,
  '[{"text":"5 años","is_correct":true,"feedback":"Correcto. Es una referencia importante en neuroconducción pediátrica."},{"text":"6 meses","is_correct":false,"feedback":"Incorrecto. Es demasiado temprano."},{"text":"12 años","is_correct":false,"feedback":"Incorrecto. Ocurre antes."},{"text":"18 años","is_correct":false,"feedback":"Incorrecto. No requiere llegar a la adultez."}]'::jsonb,
  2,
  false,
  'Las velocidades de conducción alcanzan valores de adulto a los 5 años.',
  'Chen et al. (2016). Electrodiagnostic reference values.',
  ARRAY['Neuroconducción pediátrica', 'EMG', 'intermedio'],
  'PUBLISHED'
);

-- Q84: Principios básicos
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'fundamentals',
  'Principios básicos',
  'En un estudio de conducción nerviosa, se aplica un estímulo eléctrico submáximo. ¿Qué representa fisiológicamente la aparición de la onda H?',
  '[]'::jsonb,
  '[{"text":"La activación antidrómica de las fibras Ia y su descarga sináptica sobre las motoneuronas.","is_correct":true,"feedback":"La onda H es el equivalente electrofisiológico del reflejo miotático y depende de la integridad del arco reflejo medular."},{"text":"La contracción muscular directa producida por el estímulo del axón motor.","is_correct":false,"feedback":""},{"text":"La descarga repetitiva de las motoneuronas gamma.","is_correct":false,"feedback":""},{"text":"El tiempo de conducción exclusiva a través de los ganglios basales.","is_correct":false,"feedback":""}]'::jsonb,
  3,
  false,
  'La onda M es la respuesta directa del nervio motor; la onda H es la respuesta refleja tras pasar por la médula.',
  'Arbat i Plana (2016)',
  ARRAY['Principios básicos', 'EMG', 'avanzado'],
  'PUBLISHED'
);

-- Q85: Principios básicos
INSERT INTO public.exam_questions (
  island_name, module_id, topic_name, stem, findings, options,
  difficulty, is_critical, pearl, source_reference, tags, status
) VALUES (
  'EMG',
  'fundamentals',
  'Principios básicos',
  '¿Cómo se define el periodo de latencia en la fisiología de los reflejos?',
  '[]'::jsonb,
  '[{"text":"El tiempo que transcurre desde la aplicación del estímulo hasta el inicio de la respuesta.","is_correct":true,"feedback":"La latencia incluye el tiempo de transducción, conducción y procesamiento sináptico."},{"text":"La intensidad mínima necesaria para generar un potencial de acción.","is_correct":false,"feedback":""},{"text":"La duración total de la contracción muscular resultante.","is_correct":false,"feedback":""},{"text":"El tiempo que tarda el neurotransmisor en degradarse en la hendidura.","is_correct":false,"feedback":""}]'::jsonb,
  2,
  false,
  'La latencia es el tiempo entre el estímulo y la respuesta; a mayor estímulo, menor latencia.',
  'Costa et al. (2020)',
  ARRAY['Principios básicos', 'EMG', 'intermedio'],
  'PUBLISHED'
);
