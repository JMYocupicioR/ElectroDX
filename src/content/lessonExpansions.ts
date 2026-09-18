import type { Topic } from '../types/content';

export type LessonExpansion = Pick<Topic, 'content' | 'contentEn' | 'clinicalPearls' | 'clinicalPearlsEn' | 'keyPoints' | 'keyPointsEn' | 'imageUrls'>;

/** Ampliaciones de hojas cortas. Pendientes de validación clínica institucional. */
export const LESSON_EXPANSIONS: Record<string, LessonExpansion> = {
  "axonal-membrane": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de membrana axonal y canales iónicos.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nLa membrana axonal depende de canales de Na+ voltaje-dependientes agrupados en el nódulo y de K+ yuxtaparanodales. En NCS, la despolarización catódica abre Na+ y genera el potencial de acción compuesto.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Membrana axonal y canales iónicos se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Membrana axonal y canales iónicos.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nLa membrana axonal depende de canales de Na+ voltaje-dependientes agrupados en el nódulo y de K+ yuxtaparanodales. En NCS, la despolarización catódica abre Na+ y genera el potencial de acción compuesto.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Membrana axonal y canales iónicos inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Membrana axonal y canales iónicos: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Membrana axonal y canales iónicos: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Membrana axonal y canales iónicos en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Membrana axonal y canales iónicos.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Neuron_Hand-tuned.svg/640px-Neuron_Hand-tuned.svg.png",
        "alt": "Neurona y vaina de mielina (Wikimedia Commons)",
        "caption": "Arquitectura neuronal. Fuente: Wikimedia Commons."
      }
    ]
  },
  "myelin-sheath": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de vaina de mielina y células de schwann.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nLas células de Schwann forman mielina internodal que reduce capacitancia y permite conducción saltatoria. La desmielinización focal prolonga latencia y puede bloquear el CMAP sin denervación inmediata.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Vaina de mielina y células de Schwann se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Vaina de mielina y células de Schwann.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nLas células de Schwann forman mielina internodal que reduce capacitancia y permite conducción saltatoria. La desmielinización focal prolonga latencia y puede bloquear el CMAP sin denervación inmediata.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Vaina de mielina y células de Schwann inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Vaina de mielina y células de Schwann: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Vaina de mielina y células de Schwann: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Vaina de mielina y células de Schwann en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Vaina de mielina y células de Schwann.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Neuron_Hand-tuned.svg/640px-Neuron_Hand-tuned.svg.png",
        "alt": "Neurona y vaina de mielina (Wikimedia Commons)",
        "caption": "Arquitectura neuronal. Fuente: Wikimedia Commons."
      }
    ]
  },
  "nodes-saltatory": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de nódulos de ranvier y conducción saltatoria.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nEl nódulo de Ranvier concentra Nav1.6. La conducción saltatoria explica VCM > 40 m/s en fibras mielínicas. El bloqueo nodal (anti-GM1) cae amplitud proximal con duración relativamente conservada.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Nódulos de Ranvier y conducción saltatoria se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Nódulos de Ranvier y conducción saltatoria.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nEl nódulo de Ranvier concentra Nav1.6. La conducción saltatoria explica VCM > 40 m/s en fibras mielínicas. El bloqueo nodal (anti-GM1) cae amplitud proximal con duración relativamente conservada.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Nódulos de Ranvier y conducción saltatoria inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Nódulos de Ranvier y conducción saltatoria: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Nódulos de Ranvier y conducción saltatoria: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Nódulos de Ranvier y conducción saltatoria en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Nódulos de Ranvier y conducción saltatoria.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Neuron_Hand-tuned.svg/640px-Neuron_Hand-tuned.svg.png",
        "alt": "Neurona y vaina de mielina (Wikimedia Commons)",
        "caption": "Arquitectura neuronal. Fuente: Wikimedia Commons."
      }
    ]
  },
  "wallerian-degeneration": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de degeneración walleriana y regeneración axonal.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nTras axonotmesis, la degeneración walleriana distal se completa en 7–10 días. El CMAP distal cae entonces; las fibrilaciones aparecen hacia el día 14–21. No interprete “normalidad” en las primeras 72 h.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Degeneración Walleriana y regeneración axonal se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Degeneración Walleriana y regeneración axonal.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nTras axonotmesis, la degeneración walleriana distal se completa en 7–10 días. El CMAP distal cae entonces; las fibrilaciones aparecen hacia el día 14–21. No interprete “normalidad” en las primeras 72 h.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Degeneración Walleriana y regeneración axonal inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Degeneración Walleriana y regeneración axonal: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Degeneración Walleriana y regeneración axonal: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Degeneración Walleriana y regeneración axonal en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Degeneración Walleriana y regeneración axonal.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Neuron_Hand-tuned.svg/640px-Neuron_Hand-tuned.svg.png",
        "alt": "Neurona y vaina de mielina (Wikimedia Commons)",
        "caption": "Arquitectura neuronal. Fuente: Wikimedia Commons."
      }
    ]
  },
  "fiber-types": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de fibras aα, aβ, aδ, b y c.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nAα (motoras/propioceptivas) y Aβ (tacto) dominan CMAP/SNAP. Aδ/C no se registran en NCS convencional. La neuropatía de fibra pequeña requiere umbrales térmicos o QST, no NCS de rutina.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Fibras Aα, Aβ, Aδ, B y C se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Fibras Aα, Aβ, Aδ, B y C.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nAα (motoras/propioceptivas) y Aβ (tacto) dominan CMAP/SNAP. Aδ/C no se registran en NCS convencional. La neuropatía de fibra pequeña requiere umbrales térmicos o QST, no NCS de rutina.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Fibras Aα, Aβ, Aδ, B y C inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Fibras Aα, Aβ, Aδ, B y C: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Fibras Aα, Aβ, Aδ, B y C: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Fibras Aα, Aβ, Aδ, B y C en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Fibras Aα, Aβ, Aδ, B y C.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Neuron_Hand-tuned.svg/640px-Neuron_Hand-tuned.svg.png",
        "alt": "Neurona y vaina de mielina (Wikimedia Commons)",
        "caption": "Arquitectura neuronal. Fuente: Wikimedia Commons."
      }
    ]
  },
  "endo-peri-epineurium": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de endoneuro, perineuro, epineuro.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nEl perineuro es la barrera hemato-neural. La lesión Sunderland III-V implica discontinuidad fascicular. El registro de superficie promedia todos los fascículos; un fascículo crítico puede pasar inadvertido.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Endoneuro, perineuro, epineuro se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Endoneuro, perineuro, epineuro.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nEl perineuro es la barrera hemato-neural. La lesión Sunderland III-V implica discontinuidad fascicular. El registro de superficie promedia todos los fascículos; un fascículo crítico puede pasar inadvertido.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Endoneuro, perineuro, epineuro inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Endoneuro, perineuro, epineuro: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Endoneuro, perineuro, epineuro: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Endoneuro, perineuro, epineuro en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Endoneuro, perineuro, epineuro.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "motor-unit-composition": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de composición: motoneurona + axón + unm + fibras musculares.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nUnidad motora = motoneurona α + axón + unión neuromuscular + fibras musculares. El territorio determina la duración del PUM. El ratio de inervación es alto en músculos axiales y bajo en intrínsecos de la mano.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Composición: motoneurona + axón + UNM + fibras musculares se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Composición: motoneurona + axón + UNM + fibras musculares.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nUnidad motora = motoneurona α + axón + unión neuromuscular + fibras musculares. El territorio determina la duración del PUM. El ratio de inervación es alto en músculos axiales y bajo en intrínsecos de la mano.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Composición: motoneurona + axón + UNM + fibras musculares inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Composición: motoneurona + axón + UNM + fibras musculares: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Composición: motoneurona + axón + UNM + fibras musculares: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Composición: motoneurona + axón + UNM + fibras musculares en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Composición: motoneurona + axón + UNM + fibras musculares.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "innervation-ratio": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de ratio de inervación.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nEl ratio (fibras/motoneurona) es ~100–300 en intrínsecos y >500 en gastrocnemio. Reinnervación colateral aumenta el territorio y la amplitud del PUM crónico.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Ratio de inervación se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Ratio de inervación.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nEl ratio (fibras/motoneurona) es ~100–300 en intrínsecos y >500 en gastrocnemio. Reinnervación colateral aumenta el territorio y la amplitud del PUM crónico.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Ratio de inervación inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Ratio de inervación: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Ratio de inervación: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Ratio de inervación en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Ratio de inervación.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "motor-unit-territory": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de territorio de la unidad motora.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nEl territorio de una UM se extiende varios milímetros. La aguja concéntrica registra un radio ~0.5–1 mm; no “muestree” un músculo con un solo sitio.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Territorio de la unidad motora se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Territorio de la unidad motora.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nEl territorio de una UM se extiende varios milímetros. La aguja concéntrica registra un radio ~0.5–1 mm; no “muestree” un músculo con un solo sitio.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Territorio de la unidad motora inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Territorio de la unidad motora: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Territorio de la unidad motora: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Territorio de la unidad motora en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Territorio de la unidad motora.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "action-potential-generation": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de generación y propagación del potencial de acción.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nEl PA se inicia cuando Na+ supera el umbral. En el laboratorio, el cátodo de estímulo debe orientarse distalmente en NCS motora para evitar bloqueo anodal.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Generación y propagación del potencial de acción se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Generación y propagación del potencial de acción.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nEl PA se inicia cuando Na+ supera el umbral. En el laboratorio, el cátodo de estímulo debe orientarse distalmente en NCS motora para evitar bloqueo anodal.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Generación y propagación del potencial de acción inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Generación y propagación del potencial de acción: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Generación y propagación del potencial de acción: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Generación y propagación del potencial de acción en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Generación y propagación del potencial de acción.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "neuromuscular-transmission": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de transmisión neuromuscular: acetilcolina y receptores nicotínicos.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nACh en receptores nicotínicos genera PPE. Jitter/SFEMG es más sensible que EOR en MG ocular. El frío mejora la transmisión (efecto de Lambert).\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Transmisión neuromuscular: acetilcolina y receptores nicotínicos se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Transmisión neuromuscular: acetilcolina y receptores nicotínicos.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nACh en receptores nicotínicos genera PPE. Jitter/SFEMG es más sensible que EOR en MG ocular. El frío mejora la transmisión (efecto de Lambert).\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Transmisión neuromuscular: acetilcolina y receptores nicotínicos inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Transmisión neuromuscular: acetilcolina y receptores nicotínicos: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Transmisión neuromuscular: acetilcolina y receptores nicotínicos: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Transmisión neuromuscular: acetilcolina y receptores nicotínicos en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Transmisión neuromuscular: acetilcolina y receptores nicotínicos.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "excitation-contraction": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de acoplamiento excitación-contracción.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nEl acoplamiento T-túbulo/RS libera Ca2+. La miopatía puede mostrar PUM breves y reclutamiento precoz con NCS motora normal.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Acoplamiento excitación-contracción se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Acoplamiento excitación-contracción.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nEl acoplamiento T-túbulo/RS libera Ca2+. La miopatía puede mostrar PUM breves y reclutamiento precoz con NCS motora normal.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Acoplamiento excitación-contracción inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Acoplamiento excitación-contracción: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Acoplamiento excitación-contracción: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Acoplamiento excitación-contracción en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Acoplamiento excitación-contracción.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "facial-motor": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de nervio facial (vii).\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nFacial (VII): registro en nasalis u orbicularis oculi, estímulo en ángulo mandibular. Compare lado a lado; asimetría >50% sugiere axonotmesis en parálisis de Bell.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Nervio Facial (VII) se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Nervio Facial (VII).\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nFacial (VII): registro en nasalis u orbicularis oculi, estímulo en ángulo mandibular. Compare lado a lado; asimetría >50% sugiere axonotmesis en parálisis de Bell.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Nervio Facial (VII) inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Nervio Facial (VII): confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Nervio Facial (VII): confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Nervio Facial (VII) en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Nervio Facial (VII).",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Nerve_conduction_study.jpg/640px-Nerve_conduction_study.jpg",
        "alt": "Estudio de neuroconducción (Wikimedia Commons)",
        "caption": "Montaje de neuroconducción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "trigeminal-motor": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de nervio trigémino motor (v).\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nTrigémino motor (V): masetero o temporal. Útil en plexopatía vs lesión de V. El blink usa V1 aferente y VII eferente.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Nervio Trigémino motor (V) se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Nervio Trigémino motor (V).\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nTrigémino motor (V): masetero o temporal. Útil en plexopatía vs lesión de V. El blink usa V1 aferente y VII eferente.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Nervio Trigémino motor (V) inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Nervio Trigémino motor (V): confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Nervio Trigémino motor (V): confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Nervio Trigémino motor (V) en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Nervio Trigémino motor (V).",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Nerve_conduction_study.jpg/640px-Nerve_conduction_study.jpg",
        "alt": "Estudio de neuroconducción (Wikimedia Commons)",
        "caption": "Montaje de neuroconducción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "accessory-motor": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de nervio espinal accesorio (xi).\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nEspinal accesorio (XI): trapecio. Estímulo en triángulo posterior. Diferencia lesión de XI vs C3–C4.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Nervio Espinal Accesorio (XI) se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Nervio Espinal Accesorio (XI).\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nEspinal accesorio (XI): trapecio. Estímulo en triángulo posterior. Diferencia lesión de XI vs C3–C4.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Nervio Espinal Accesorio (XI) inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Nervio Espinal Accesorio (XI): confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Nervio Espinal Accesorio (XI): confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Nervio Espinal Accesorio (XI) en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Nervio Espinal Accesorio (XI).",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "hypoglossal-motor": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de nervio hipogloso (xii).\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nHipogloso (XII): geniogloso. Lateralización de la lengua y CMAP lingual en ELA bulbar.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Nervio Hipogloso (XII) se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Nervio Hipogloso (XII).\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nHipogloso (XII): geniogloso. Lateralización de la lengua y CMAP lingual en ELA bulbar.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Nervio Hipogloso (XII) inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Nervio Hipogloso (XII): confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Nervio Hipogloso (XII): confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Nervio Hipogloso (XII) en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Nervio Hipogloso (XII).",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "glossopharyngeal-motor": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de nervio glosofaríngeo motor (ix).\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nIX motor se explora poco; el arco del náuseo y el reflejo faríngeo son clínicos. El paladar lo inerva X.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Nervio Glosofaríngeo motor (IX) se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Nervio Glosofaríngeo motor (IX).\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nIX motor se explora poco; el arco del náuseo y el reflejo faríngeo son clínicos. El paladar lo inerva X.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Nervio Glosofaríngeo motor (IX) inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Nervio Glosofaríngeo motor (IX): confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Nervio Glosofaríngeo motor (IX): confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Nervio Glosofaríngeo motor (IX) en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Nervio Glosofaríngeo motor (IX).",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "vagus-motor": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de nervio vago motor (x).\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nX: laringe (cricoaritenoideo). Útil en disfonía y ELA. Evite estímulo excesivo por bradicardia.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Nervio Vago motor (X) se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Nervio Vago motor (X).\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nX: laringe (cricoaritenoideo). Útil en disfonía y ELA. Evite estímulo excesivo por bradicardia.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Nervio Vago motor (X) inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Nervio Vago motor (X): confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Nervio Vago motor (X): confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Nervio Vago motor (X) en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Nervio Vago motor (X).",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "motor-interpretation": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de interpretación: normal vs. axonal vs. desmielinizante.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nAxonal: amplitud baja, VCM conservada. Desmielinizante: latencia/VCM/dispersión/bloqueo. Mixto: combine criterios AANEM y el tiempo de evolución.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Interpretación: normal vs. axonal vs. desmielinizante se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Interpretación: normal vs. axonal vs. desmielinizante.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nAxonal: amplitud baja, VCM conservada. Desmielinizante: latencia/VCM/dispersión/bloqueo. Mixto: combine criterios AANEM y el tiempo de evolución.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Interpretación: normal vs. axonal vs. desmielinizante inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Interpretación: normal vs. axonal vs. desmielinizante: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Interpretación: normal vs. axonal vs. desmielinizante: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Interpretación: normal vs. axonal vs. desmielinizante en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Interpretación: normal vs. axonal vs. desmielinizante.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "snap-morphology": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de el pans (snap): morfología y medición.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nEl SNAP es trifásico. Mida pico-pico o inicial-negativa según laboratorio; sea consistente con sus valores de referencia.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- El PANS (SNAP): morfología y medición se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of El PANS (SNAP): morfología y medición.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nEl SNAP es trifásico. Mida pico-pico o inicial-negativa según laboratorio; sea consistente con sus valores de referencia.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret El PANS (SNAP): morfología y medición inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "El PANS (SNAP): morfología y medición: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "El PANS (SNAP): morfología y medición: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de El PANS (SNAP): morfología y medición en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for El PANS (SNAP): morfología y medición.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Nerve_conduction_study.jpg/640px-Nerve_conduction_study.jpg",
        "alt": "Estudio de neuroconducción (Wikimedia Commons)",
        "caption": "Montaje de neuroconducción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "onset-peak-latency": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de latencia de inicio y latencia pico.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nOnset estima las fibras más rápidas; pico es más reproducible en SNAP de baja amplitud. No mezcle métodos.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Latencia de inicio y latencia pico se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Latencia de inicio y latencia pico.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nOnset estima las fibras más rápidas; pico es más reproducible en SNAP de baja amplitud. No mezcle métodos.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Latencia de inicio y latencia pico inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Latencia de inicio y latencia pico: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Latencia de inicio y latencia pico: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Latencia de inicio y latencia pico en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Latencia de inicio y latencia pico.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Nerve_conduction_study.jpg/640px-Nerve_conduction_study.jpg",
        "alt": "Estudio de neuroconducción (Wikimedia Commons)",
        "caption": "Montaje de neuroconducción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "snap-amplitude": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de amplitud del snap.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nLa amplitud SNAP cae en lesión postganglionar. En radiculopatía (preganglionar) el SNAP suele conservarse.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Amplitud del SNAP se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Amplitud del SNAP.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nLa amplitud SNAP cae en lesión postganglionar. En radiculopatía (preganglionar) el SNAP suele conservarse.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Amplitud del SNAP inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Amplitud del SNAP: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Amplitud del SNAP: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Amplitud del SNAP en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Amplitud del SNAP.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Nerve_conduction_study.jpg/640px-Nerve_conduction_study.jpg",
        "alt": "Estudio de neuroconducción (Wikimedia Commons)",
        "caption": "Montaje de neuroconducción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "sensory-cv": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de velocidad de conducción sensitiva (vcs).\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nVCS = distancia / latencia. Use la misma convención (onset vs pico) que la norma. Temperatura 32–34 °C en la mano.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Velocidad de conducción sensitiva (VCS) se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Velocidad de conducción sensitiva (VCS).\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nVCS = distancia / latencia. Use la misma convención (onset vs pico) que la norma. Temperatura 32–34 °C en la mano.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Velocidad de conducción sensitiva (VCS) inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Velocidad de conducción sensitiva (VCS): confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Velocidad de conducción sensitiva (VCS): confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Velocidad de conducción sensitiva (VCS) en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Velocidad de conducción sensitiva (VCS).",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "antidromic-orthodromic": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de técnica antidrómica vs. ortodrómica.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nAntidrómica: mayor amplitud, más artefacto. Ortodrómica: más nítida, menor amplitud. No compare amplitudes entre técnicas.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Técnica antidrómica vs. ortodrómica se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Técnica antidrómica vs. ortodrómica.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nAntidrómica: mayor amplitud, más artefacto. Ortodrómica: más nítida, menor amplitud. No compare amplitudes entre técnicas.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Técnica antidrómica vs. ortodrómica inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Técnica antidrómica vs. ortodrómica: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Técnica antidrómica vs. ortodrómica: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Técnica antidrómica vs. ortodrómica en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Técnica antidrómica vs. ortodrómica.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "pre-post-ganglionic": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de significado clínico: lesiones pre vs. postganglionares.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nSNAP ausente + EMG de denervación = postganglionar (plexo/nervio). SNAP presente + denervación miotomal = raíz.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Significado clínico: lesiones pre vs. postganglionares se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Significado clínico: lesiones pre vs. postganglionares.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nSNAP ausente + EMG de denervación = postganglionar (plexo/nervio). SNAP presente + denervación miotomal = raíz.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Significado clínico: lesiones pre vs. postganglionares inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Significado clínico: lesiones pre vs. postganglionares: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Significado clínico: lesiones pre vs. postganglionares: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Significado clínico: lesiones pre vs. postganglionares en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Significado clínico: lesiones pre vs. postganglionares.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "age-height": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de efecto de la edad y estatura.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nLa VCM cae ~0.5–1 m/s por década; la altura alarga latencias F. Use normas ajustadas, no valores de adulto joven en octogenarios.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Efecto de la edad y estatura se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Efecto de la edad y estatura.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nLa VCM cae ~0.5–1 m/s por década; la altura alarga latencias F. Use normas ajustadas, no valores de adulto joven en octogenarios.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Efecto de la edad y estatura inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Efecto de la edad y estatura: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Efecto de la edad y estatura: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Efecto de la edad y estatura en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Efecto de la edad y estatura.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "stimulus-artifact": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de artefacto de estímulo.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nArtefacto amplio: reduzca impedancia, gire ánodo, use supresión y separe cables. No “mida” sobre el artefacto.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Artefacto de estímulo se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Artefacto de estímulo.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nArtefacto amplio: reduzca impedancia, gire ánodo, use supresión y separe cables. No “mida” sobre el artefacto.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Artefacto de estímulo inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Artefacto de estímulo: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Artefacto de estímulo: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Artefacto de estímulo en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Artefacto de estímulo.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Nerve_conduction_study.jpg/640px-Nerve_conduction_study.jpg",
        "alt": "Estudio de neuroconducción (Wikimedia Commons)",
        "caption": "Montaje de neuroconducción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "martin-gruber": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de anomalías anatómicas: martin-gruber y riche-cannieu.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nMartin-Gruber (mediano→cubital) simula bloqueo cubital en codo. Riche-Cannieu explica APB “cubitalizado”. Siempre busque anastomosis ante hallazgos incongruentes.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Anomalías anatómicas: Martin-Gruber y Riche-Cannieu se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Anomalías anatómicas: Martin-Gruber y Riche-Cannieu.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nMartin-Gruber (mediano→cubital) simula bloqueo cubital en codo. Riche-Cannieu explica APB “cubitalizado”. Siempre busque anastomosis ante hallazgos incongruentes.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Anomalías anatómicas: Martin-Gruber y Riche-Cannieu inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Anomalías anatómicas: Martin-Gruber y Riche-Cannieu: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Anomalías anatómicas: Martin-Gruber y Riche-Cannieu: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Anomalías anatómicas: Martin-Gruber y Riche-Cannieu en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Anomalías anatómicas: Martin-Gruber y Riche-Cannieu.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Nerve_conduction_study.jpg/640px-Nerve_conduction_study.jpg",
        "alt": "Estudio de neuroconducción (Wikimedia Commons)",
        "caption": "Montaje de neuroconducción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "early-recruitment": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de reclutamiento precoz (miopático).\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nReclutamiento precoz: muchas UM a baja fuerza, PUM breves/bajos. Típico miopático. No lo confunda con esfuerzo incompleto.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Reclutamiento precoz (miopático) se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Reclutamiento precoz (miopático).\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nReclutamiento precoz: muchas UM a baja fuerza, PUM breves/bajos. Típico miopático. No lo confunda con esfuerzo incompleto.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Reclutamiento precoz (miopático) inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Reclutamiento precoz (miopático): confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Reclutamiento precoz (miopático): confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Reclutamiento precoz (miopático) en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Reclutamiento precoz (miopático).",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/EMG_principle.gif/320px-EMG_principle.gif",
        "alt": "Principio de registro EMG (Wikimedia Commons, dominio público/CC)",
        "caption": "Registro de potenciales de unidad motora. Fuente: Wikimedia Commons."
      }
    ]
  },
  "reduced-recruitment": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de reclutamiento disminuido (neurogénico).\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nPocas UM disparando rápido a fuerza submáxima = pérdida de axones. Es el sello neurogénico crónico o agudo.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Reclutamiento disminuido (neurogénico) se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Reclutamiento disminuido (neurogénico).\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nPocas UM disparando rápido a fuerza submáxima = pérdida de axones. Es el sello neurogénico crónico o agudo.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Reclutamiento disminuido (neurogénico) inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Reclutamiento disminuido (neurogénico): confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Reclutamiento disminuido (neurogénico): confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Reclutamiento disminuido (neurogénico) en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Reclutamiento disminuido (neurogénico).",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/EMG_principle.gif/320px-EMG_principle.gif",
        "alt": "Principio de registro EMG (Wikimedia Commons, dominio público/CC)",
        "caption": "Registro de potenciales de unidad motora. Fuente: Wikimedia Commons."
      }
    ]
  },
  "fdi": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de primer interóseo dorsal.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nFDI: cubital, C8-T1. Sitio clave para radiculopatía C8, plexo inferior y cubital. Inserción en el vientre, 1er espacio interóseo.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Primer interóseo dorsal se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Primer interóseo dorsal.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nFDI: cubital, C8-T1. Sitio clave para radiculopatía C8, plexo inferior y cubital. Inserción en el vientre, 1er espacio interóseo.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Primer interóseo dorsal inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Primer interóseo dorsal: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Primer interóseo dorsal: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Primer interóseo dorsal en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Primer interóseo dorsal.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/EMG_principle.gif/320px-EMG_principle.gif",
        "alt": "Principio de registro EMG (Wikimedia Commons, dominio público/CC)",
        "caption": "Registro de potenciales de unidad motora. Fuente: Wikimedia Commons."
      }
    ]
  },
  "apb": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de abductor corto del pulgar.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nAPB: mediano, C8-T1. Túnel carpiano vs raíz C8 vs plexo. Compare con FDI y PQ.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Abductor corto del pulgar se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Abductor corto del pulgar.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nAPB: mediano, C8-T1. Túnel carpiano vs raíz C8 vs plexo. Compare con FDI y PQ.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Abductor corto del pulgar inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Abductor corto del pulgar: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Abductor corto del pulgar: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Abductor corto del pulgar en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Abductor corto del pulgar.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/EMG_principle.gif/320px-EMG_principle.gif",
        "alt": "Principio de registro EMG (Wikimedia Commons, dominio público/CC)",
        "caption": "Registro de potenciales de unidad motora. Fuente: Wikimedia Commons."
      }
    ]
  },
  "biceps": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de bíceps braquial.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nBíceps: musculocutáneo, C5-C6. Diferencia plexo superior vs C6 vs nervio.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Bíceps braquial se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Bíceps braquial.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nBíceps: musculocutáneo, C5-C6. Diferencia plexo superior vs C6 vs nervio.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Bíceps braquial inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Bíceps braquial: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Bíceps braquial: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Bíceps braquial en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Bíceps braquial.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/EMG_principle.gif/320px-EMG_principle.gif",
        "alt": "Principio de registro EMG (Wikimedia Commons, dominio público/CC)",
        "caption": "Registro de potenciales de unidad motora. Fuente: Wikimedia Commons."
      }
    ]
  },
  "triceps": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de tríceps braquial.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nTríceps: radial, C6-C8. Compare cabeza lateral vs ancóneo para radial vs raíz.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Tríceps braquial se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Tríceps braquial.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nTríceps: radial, C6-C8. Compare cabeza lateral vs ancóneo para radial vs raíz.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Tríceps braquial inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Tríceps braquial: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Tríceps braquial: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Tríceps braquial en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Tríceps braquial.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/EMG_principle.gif/320px-EMG_principle.gif",
        "alt": "Principio de registro EMG (Wikimedia Commons, dominio público/CC)",
        "caption": "Registro de potenciales de unidad motora. Fuente: Wikimedia Commons."
      }
    ]
  },
  "deltoid": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de deltoides.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nDeltoides: axilar, C5-C6. Incluya en plexo superior y neuropatía axilar post-luxación.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Deltoides se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Deltoides.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nDeltoides: axilar, C5-C6. Incluya en plexo superior y neuropatía axilar post-luxación.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Deltoides inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Deltoides: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Deltoides: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Deltoides en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Deltoides.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/EMG_principle.gif/320px-EMG_principle.gif",
        "alt": "Principio de registro EMG (Wikimedia Commons, dominio público/CC)",
        "caption": "Registro de potenciales de unidad motora. Fuente: Wikimedia Commons."
      }
    ]
  },
  "forearm-extensors": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de extensores del antebrazo.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nExtensor común: radial posterior/PIN, C7. Caída de muñeca vs C7 vs PIN (supinador spared).\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Extensores del antebrazo se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Extensores del antebrazo.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nExtensor común: radial posterior/PIN, C7. Caída de muñeca vs C7 vs PIN (supinador spared).\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Extensores del antebrazo inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Extensores del antebrazo: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Extensores del antebrazo: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Extensores del antebrazo en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Extensores del antebrazo.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "cervical-paraspinals": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de paraespinales cervicales.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nParaespinales cervicales: denervación apoya radiculopatía (preganglionar). Explore varios niveles; evite C2 superficial.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Paraespinales cervicales se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Paraespinales cervicales.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nParaespinales cervicales: denervación apoya radiculopatía (preganglionar). Explore varios niveles; evite C2 superficial.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Paraespinales cervicales inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Paraespinales cervicales: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Paraespinales cervicales: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Paraespinales cervicales en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Paraespinales cervicales.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/EMG_principle.gif/320px-EMG_principle.gif",
        "alt": "Principio de registro EMG (Wikimedia Commons, dominio público/CC)",
        "caption": "Registro de potenciales de unidad motora. Fuente: Wikimedia Commons."
      }
    ]
  },
  "tibialis-anterior": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de tibial anterior.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nTA: peroneo profundo, L4-L5. Pie caído: peroneo vs L5 vs ciático vs plexo.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Tibial anterior se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Tibial anterior.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nTA: peroneo profundo, L4-L5. Pie caído: peroneo vs L5 vs ciático vs plexo.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Tibial anterior inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Tibial anterior: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Tibial anterior: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Tibial anterior en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Tibial anterior.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/EMG_principle.gif/320px-EMG_principle.gif",
        "alt": "Principio de registro EMG (Wikimedia Commons, dominio público/CC)",
        "caption": "Registro de potenciales de unidad motora. Fuente: Wikimedia Commons."
      }
    ]
  },
  "medial-gastrocnemius": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de gastrocnemio medial.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nGastrocnemio medial: tibial, S1-S2. Complementa sóleo/H-reflex.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Gastrocnemio medial se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Gastrocnemio medial.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nGastrocnemio medial: tibial, S1-S2. Complementa sóleo/H-reflex.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Gastrocnemio medial inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Gastrocnemio medial: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Gastrocnemio medial: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Gastrocnemio medial en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Gastrocnemio medial.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/EMG_principle.gif/320px-EMG_principle.gif",
        "alt": "Principio de registro EMG (Wikimedia Commons, dominio público/CC)",
        "caption": "Registro de potenciales de unidad motora. Fuente: Wikimedia Commons."
      }
    ]
  },
  "vastus-lateralis": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de vasto lateral.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nVasto lateral: femoral, L3-L4. Radiculopatía lumbar alta vs femoral.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Vasto lateral se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Vasto lateral.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nVasto lateral: femoral, L3-L4. Radiculopatía lumbar alta vs femoral.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Vasto lateral inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Vasto lateral: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Vasto lateral: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Vasto lateral en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Vasto lateral.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/EMG_principle.gif/320px-EMG_principle.gif",
        "alt": "Principio de registro EMG (Wikimedia Commons, dominio público/CC)",
        "caption": "Registro de potenciales de unidad motora. Fuente: Wikimedia Commons."
      }
    ]
  },
  "gluteus-medius": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de glúteo medio.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nGlúteo medio: glúteo superior, L4-L5-S1. Útil en L5 vs peroneo (el TA y GM se afectan en L5; el peroneo no denerva glúteos).\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Glúteo medio se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Glúteo medio.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nGlúteo medio: glúteo superior, L4-L5-S1. Útil en L5 vs peroneo (el TA y GM se afectan en L5; el peroneo no denerva glúteos).\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Glúteo medio inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Glúteo medio: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Glúteo medio: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Glúteo medio en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Glúteo medio.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/EMG_principle.gif/320px-EMG_principle.gif",
        "alt": "Principio de registro EMG (Wikimedia Commons, dominio público/CC)",
        "caption": "Registro de potenciales de unidad motora. Fuente: Wikimedia Commons."
      }
    ]
  },
  "ehl": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de extensor largo del hallux.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nEHL: peroneo profundo, L5. Muy sensible para L5.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Extensor largo del hallux se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Extensor largo del hallux.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nEHL: peroneo profundo, L5. Muy sensible para L5.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Extensor largo del hallux inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Extensor largo del hallux: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Extensor largo del hallux: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Extensor largo del hallux en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Extensor largo del hallux.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "lumbar-paraspinals": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de paraespinales lumbares.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nParaespinales lumbares confirman radiculopatía. No los omita en lumbociática con NCS normal.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Paraespinales lumbares se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Paraespinales lumbares.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nParaespinales lumbares confirman radiculopatía. No los omita en lumbociática con NCS normal.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Paraespinales lumbares inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Paraespinales lumbares: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Paraespinales lumbares: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Paraespinales lumbares en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Paraespinales lumbares.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/EMG_principle.gif/320px-EMG_principle.gif",
        "alt": "Principio de registro EMG (Wikimedia Commons, dominio público/CC)",
        "caption": "Registro de potenciales de unidad motora. Fuente: Wikimedia Commons."
      }
    ]
  },
  "f-wave-utility": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de utilidad clínica.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nOnda F: motoneurona más proximal. Útil en CIDP, Guillain-Barré precoz y radiculoplexopatía. Ausencia aislada no diagnostica.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Utilidad Clínica se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Utilidad Clínica.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nOnda F: motoneurona más proximal. Útil en CIDP, Guillain-Barré precoz y radiculoplexopatía. Ausencia aislada no diagnostica.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Utilidad Clínica inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Utilidad Clínica: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Utilidad Clínica: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Utilidad Clínica en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Utilidad Clínica.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "h-reflex-physiology": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de fisiología.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nH es el análogo del Aquiles (S1, Ia). Estímulo submáximo. Lateralidad y cronodispersion importan más que un valor absoluto.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Fisiología se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Fisiología.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nH es el análogo del Aquiles (S1, Ia). Estímulo submáximo. Lateralidad y cronodispersion importan más que un valor absoluto.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Fisiología inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Fisiología: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Fisiología: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Fisiología en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Fisiología.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "h-reflex-values-utilty": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de valores normales y utilidad.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nH tibial-sóleo: compare lados (>1.5 ms o ausencia unilateral). No sustituye la EMG de S1.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Valores Normales y Utilidad se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Valores Normales y Utilidad.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nH tibial-sóleo: compare lados (>1.5 ms o ausencia unilateral). No sustituye la EMG de S1.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Valores Normales y Utilidad inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Valores Normales y Utilidad: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Valores Normales y Utilidad: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Valores Normales y Utilidad en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Valores Normales y Utilidad.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "a-wave-pathophysiology": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de fisiopatología.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nOndas A: axon reflex o efornización. Aparecen en neuropatía desmielinizante o regeneración; no son F tardías.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Fisiopatología se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Fisiopatología.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nOndas A: axon reflex o efornización. Aparecen en neuropatía desmielinizante o regeneración; no son F tardías.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Fisiopatología inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Fisiopatología: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Fisiopatología: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Fisiopatología en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Fisiopatología.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "blink-technique": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de técnica de registro.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nBlink: estímulo supraorbitario, registro orbicularis oculi. R1 ipsilateral, R2 bilateral. Útil en V1, VII y puente.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Técnica de Registro se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Técnica de Registro.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nBlink: estímulo supraorbitario, registro orbicularis oculi. R1 ipsilateral, R2 bilateral. Útil en V1, VII y puente.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Técnica de Registro inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Técnica de Registro: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Técnica de Registro: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Técnica de Registro en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Técnica de Registro.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "uremic-neuropathy": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de neuropatía urémica.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nNeuropatía urémica: axonal distalo-simétrica, SNAP primero. Mejora tras trasplante más que con diálisis sola.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Neuropatía Urémica se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Neuropatía Urémica.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nNeuropatía urémica: axonal distalo-simétrica, SNAP primero. Mejora tras trasplante más que con diálisis sola.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Neuropatía Urémica inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Neuropatía Urémica: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Neuropatía Urémica: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Neuropatía Urémica en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Neuropatía Urémica.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "block-vs-dispersion": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de bloqueo quirúrgico vs dispersión temporal.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nBloqueo: caída de amplitud/área proximal sin dispersión excesiva. Dispersión: duración ↑, área relativamente conservada. Use criterios AANEM.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Bloqueo Quirúrgico vs Dispersión Temporal se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Bloqueo Quirúrgico vs Dispersión Temporal.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nBloqueo: caída de amplitud/área proximal sin dispersión excesiva. Dispersión: duración ↑, área relativamente conservada. Use criterios AANEM.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Bloqueo Quirúrgico vs Dispersión Temporal inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Bloqueo Quirúrgico vs Dispersión Temporal: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Bloqueo Quirúrgico vs Dispersión Temporal: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Bloqueo Quirúrgico vs Dispersión Temporal en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Bloqueo Quirúrgico vs Dispersión Temporal.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "f-wave-tables": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de latencias de onda f y criterios.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nLatencia F mínima depende de talla. Persistencia baja en NCS normales no es patológica por sí sola.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Latencias de Onda F y Criterios se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Latencias de Onda F y Criterios.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nLatencia F mínima depende de talla. Persistencia baja en NCS normales no es patológica por sí sola.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Latencias de Onda F y Criterios inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Latencias de Onda F y Criterios: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Latencias de Onda F y Criterios: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Latencias de Onda F y Criterios en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Latencias de Onda F y Criterios.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "h-reflex-tables": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de reflejo h (s1 / tibial-sóleo).\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nNormas H-sóleo varían por talla y edad. Documente temperatura y lado.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Reflejo H (S1 / Tibial-Sóleo) se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Reflejo H (S1 / Tibial-Sóleo).\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nNormas H-sóleo varían por talla y edad. Documente temperatura y lado.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Reflejo H (S1 / Tibial-Sóleo) inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Reflejo H (S1 / Tibial-Sóleo): confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Reflejo H (S1 / Tibial-Sóleo): confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Reflejo H (S1 / Tibial-Sóleo) en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Reflejo H (S1 / Tibial-Sóleo).",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "ssep-vep-tables": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de pess y valores centrales pev.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nPESS: N9/N13/N20 o lumbares. PEV: P100. Compare interlatencias, no solo un pico.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- PESS y Valores Centrales PEV se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of PESS y Valores Centrales PEV.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nPESS: N9/N13/N20 o lumbares. PEV: P100. Compare interlatencias, no solo un pico.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret PESS y Valores Centrales PEV inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "PESS y Valores Centrales PEV: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "PESS y Valores Centrales PEV: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de PESS y Valores Centrales PEV en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for PESS y Valores Centrales PEV.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "segmental-table": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de miotomas segmentarios clínicos.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nMiotomas: C5 hombro, C6 bíceps/BR, C7 triceps, C8 intrínsecos, L4 cuádriceps, L5 TA/EHL, S1 gastrocnemio.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Miotomas Segmentarios Clínicos se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Miotomas Segmentarios Clínicos.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nMiotomas: C5 hombro, C6 bíceps/BR, C7 triceps, C8 intrínsecos, L4 cuádriceps, L5 TA/EHL, S1 gastrocnemio.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Miotomas Segmentarios Clínicos inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Miotomas Segmentarios Clínicos: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Miotomas Segmentarios Clínicos: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Miotomas Segmentarios Clínicos en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Miotomas Segmentarios Clínicos.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "dermatome-table": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de dermatomas y referencia táctil.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nDermatomas no coinciden 1:1 con SNAP. El SNAP evalúa nervio, no raíz.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Dermatomas y Referencia Táctil se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Dermatomas y Referencia Táctil.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nDermatomas no coinciden 1:1 con SNAP. El SNAP evalúa nervio, no raíz.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Dermatomas y Referencia Táctil inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Dermatomas y Referencia Táctil: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Dermatomas y Referencia Táctil: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Dermatomas y Referencia Táctil en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Dermatomas y Referencia Táctil.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "emg-muscle-table": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de protocolos musculares needle emg.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nProtocolo mínimo radicular: 2 músculos de raíz distinta + paraespinal + 1 distal. Evite “un músculo por raíz”.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Protocolos Musculares Needle EMG se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Protocolos Musculares Needle EMG.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nProtocolo mínimo radicular: 2 músculos de raíz distinta + paraespinal + 1 distal. Evite “un músculo por raíz”.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Protocolos Musculares Needle EMG inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Protocolos Musculares Needle EMG: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Protocolos Musculares Needle EMG: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Protocolos Musculares Needle EMG en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Protocolos Musculares Needle EMG.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/EMG_principle.gif/320px-EMG_principle.gif",
        "alt": "Principio de registro EMG (Wikimedia Commons, dominio público/CC)",
        "caption": "Registro de potenciales de unidad motora. Fuente: Wikimedia Commons."
      }
    ]
  },
  "aanem-guidelines": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de guías de la aanem.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nSiga guías AANEM de valores de referencia, bloqueo y consentimiento. Documente temperatura y distancias.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Guías de la AANEM se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Guías de la AANEM.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nSiga guías AANEM de valores de referencia, bloqueo y consentimiento. Documente temperatura y distancias.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Guías de la AANEM inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Guías de la AANEM: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Guías de la AANEM: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Guías de la AANEM en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Guías de la AANEM.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "atlases-videos": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de atlas fotográficos y videos de técnica.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nUse atlas de Preston/Leis y videos de técnica con licencia. No sustituyen la supervisión en el laboratorio.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Atlas fotográficos y videos de técnica se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Atlas fotográficos y videos de técnica.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nUse atlas de Preston/Leis y videos de técnica con licencia. No sustituyen la supervisión en el laboratorio.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Atlas fotográficos y videos de técnica inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Atlas fotográficos y videos de técnica: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Atlas fotográficos y videos de técnica: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Atlas fotográficos y videos de técnica en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Atlas fotográficos y videos de técnica.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "online-resources": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de recursos en línea y calculadoras.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nCalculadoras de F y nomogramas son auxiliares. La interpretación clínica prevalece.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Recursos en línea y calculadoras se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Recursos en línea y calculadoras.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nCalculadoras de F y nomogramas son auxiliares. La interpretación clínica prevalece.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Recursos en línea y calculadoras inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Recursos en línea y calculadoras: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Recursos en línea y calculadoras: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Recursos en línea y calculadoras en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Recursos en línea y calculadoras.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "clinical-impact": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de impacto clínico del frío.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nEl frío prolonga latencias y aumenta amplitudes. Caliente la extremidad antes de diagnosticar desmielinización.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Impacto Clínico del Frío se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Impacto Clínico del Frío.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nEl frío prolonga latencias y aumenta amplitudes. Caliente la extremidad antes de diagnosticar desmielinización.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Impacto Clínico del Frío inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Impacto Clínico del Frío: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Impacto Clínico del Frío: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Impacto Clínico del Frío en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Impacto Clínico del Frío.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "standard-requirements": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de requisitos estándar.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nLaboratorio: tierra, calibración, consentimiento, temperatura, distancias medidas, trazos archivados.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Requisitos Estándar se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Requisitos Estándar.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nLaboratorio: tierra, calibración, consentimiento, temperatura, distancias medidas, trazos archivados.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Requisitos Estándar inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Requisitos Estándar: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Requisitos Estándar: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Requisitos Estándar en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Requisitos Estándar.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "60hz-noise": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de interferencia de línea (60hz).\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\n60 Hz: notch, aleje cables, mejore tierra, apague luces fluorescentes. No “filtre” un CMAP real.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Interferencia de línea (60Hz) se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Interferencia de línea (60Hz).\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\n60 Hz: notch, aleje cables, mejore tierra, apague luces fluorescentes. No “filtre” un CMAP real.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Interferencia de línea (60Hz) inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Interferencia de línea (60Hz): confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Interferencia de línea (60Hz): confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Interferencia de línea (60Hz) en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Interferencia de línea (60Hz).",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "co-stimulation": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de co-estimulación (efecto de volumen).\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nCo-estimulación activa un nervio vecino y finge amplitud. Palpe el músculo equivocado y reduzca intensidad.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Co-estimulación (Efecto de Volumen) se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Co-estimulación (Efecto de Volumen).\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nCo-estimulación activa un nervio vecino y finge amplitud. Palpe el músculo equivocado y reduzca intensidad.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Co-estimulación (Efecto de Volumen) inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Co-estimulación (Efecto de Volumen): confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Co-estimulación (Efecto de Volumen): confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Co-estimulación (Efecto de Volumen) en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Co-estimulación (Efecto de Volumen).",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "distance-errors": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de errores de medición de distancia.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\n2 cm de error en 10 cm = 20% de error en VCM. Use cinta y puntos óseos.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Errores de Medición de Distancia se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Errores de Medición de Distancia.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\n2 cm de error en 10 cm = 20% de error en VCM. Use cinta y puntos óseos.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Errores de Medición de Distancia inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Errores de Medición de Distancia: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Errores de Medición de Distancia: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Errores de Medición de Distancia en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Errores de Medición de Distancia.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "pacemakers-icd": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de marcapasos y desfibriladores (dai).\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nEvite estímulo cerca del generador; use pulsos cortos y avise al paciente. No contraindica NCS distal de rutina.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Marcapasos y Desfibriladores (DAI) se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Marcapasos y Desfibriladores (DAI).\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nEvite estímulo cerca del generador; use pulsos cortos y avise al paciente. No contraindica NCS distal de rutina.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Marcapasos y Desfibriladores (DAI) inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Marcapasos y Desfibriladores (DAI): confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Marcapasos y Desfibriladores (DAI): confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Marcapasos y Desfibriladores (DAI) en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Marcapasos y Desfibriladores (DAI).",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "bleeding-risk": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de riesgo de sangrado (anticoagulantes).\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nINR elevado: evite músculos profundos (flexor radial del carpo, paracervical profundo, iliopsoas). Documente consentimiento.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Riesgo de Sangrado (Anticoagulantes) se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Riesgo de Sangrado (Anticoagulantes).\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nINR elevado: evite músculos profundos (flexor radial del carpo, paracervical profundo, iliopsoas). Documente consentimiento.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Riesgo de Sangrado (Anticoagulantes) inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Riesgo de Sangrado (Anticoagulantes): confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Riesgo de Sangrado (Anticoagulantes): confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Riesgo de Sangrado (Anticoagulantes) en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Riesgo de Sangrado (Anticoagulantes).",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "infection-risk": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de riesgo de infección y daño cutáneo.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nPiel infectada: no puncione. Celulitis y úlceras son contraindicación local.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Riesgo de Infección y Daño Cutáneo se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Riesgo de Infección y Daño Cutáneo.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nPiel infectada: no puncione. Celulitis y úlceras son contraindicación local.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Riesgo de Infección y Daño Cutáneo inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Riesgo de Infección y Daño Cutáneo: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Riesgo de Infección y Daño Cutáneo: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Riesgo de Infección y Daño Cutáneo en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Riesgo de Infección y Daño Cutáneo.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "pneumothorax": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de riesgo crítico de neumotórax.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nSerrato, supraespinoso, cervicales anteriores: riesgo de neumotórax. Técnica tangencial y experiencia.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Riesgo Crítico de Neumotórax se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Riesgo Crítico de Neumotórax.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nSerrato, supraespinoso, cervicales anteriores: riesgo de neumotórax. Técnica tangencial y experiencia.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Riesgo Crítico de Neumotórax inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Riesgo Crítico de Neumotórax: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Riesgo Crítico de Neumotórax: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Riesgo Crítico de Neumotórax en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Riesgo Crítico de Neumotórax.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "supramaximal": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de estímulo supramáximo riguroso.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nSupramáximo = 20–30% sobre la meseta del CMAP. Infraestimular finge bloqueo.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Estímulo Supramáximo Riguroso se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Estímulo Supramáximo Riguroso.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nSupramáximo = 20–30% sobre la meseta del CMAP. Infraestimular finge bloqueo.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Estímulo Supramáximo Riguroso inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Estímulo Supramáximo Riguroso: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Estímulo Supramáximo Riguroso: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Estímulo Supramáximo Riguroso en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Estímulo Supramáximo Riguroso.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Nerve_conduction_study.jpg/640px-Nerve_conduction_study.jpg",
        "alt": "Estudio de neuroconducción (Wikimedia Commons)",
        "caption": "Montaje de neuroconducción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "sweep-gain": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de configuración sensitiva vs motora.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nMotor: 5 ms/div, 5 mV/div típico. Sensitivo: 1–2 ms/div, 10–20 µV. Ajuste para no recortar picos.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Configuración Sensitiva vs Motora se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Configuración Sensitiva vs Motora.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nMotor: 5 ms/div, 5 mV/div típico. Sensitivo: 1–2 ms/div, 10–20 µV. Ajuste para no recortar picos.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Configuración Sensitiva vs Motora inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Configuración Sensitiva vs Motora: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Configuración Sensitiva vs Motora: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Configuración Sensitiva vs Motora en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Configuración Sensitiva vs Motora.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  },
  "reproducibility": {
    "content": "## Objetivos\n- Describir el fundamento fisiológico de reproducibilidad mínima.\n- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.\n- Reconocer errores técnicos que simulan patología.\n\n## Explicación clínica\nRepita el CMAP/SNAP al menos 2 veces. Variación >10–15% obliga a revisar técnica.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.\n\n## Técnica\n1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.\n2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.\n3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.\n4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.\n\n## Interpretación\nIntegre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.\n\n## Errores frecuentes\n- Diagnosticar desmielinización en extremidad fría.\n- Infraestimulación que imita bloqueo de conducción.\n- Omitir paraespinales en la radiculopatía.\n- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.\n\n## Perlas\n- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.\n- Documente calibración, distancias y temperatura en cada estudio.\n\n## Puntos clave\n- Reproducibilidad Mínima se interpreta siempre en un protocolo sistematizado.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.\n- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.\n- AANEM practice guidelines. https://www.aanem.org/",
    "contentEn": "## Objectives\n- Explain the physiological basis of Reproducibilidad Mínima.\n- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.\n\n## Clinical explanation\nRepita el CMAP/SNAP al menos 2 veces. Variación >10–15% obliga a revisar técnica.\n\nExpanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.\n\n## Technique\nWarm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.\n\n## Key points\n- Interpret Reproducibilidad Mínima inside a complete EDX protocol.\n- Technical reproducibility comes before diagnosis.\n- Use lab-specific or AANEM reference values.",
    "clinicalPearls": [
      "Reproducibilidad Mínima: confirme temperatura y reproducibilidad antes de etiquetar patología.",
      "Un hallazgo técnico no es un síndrome clínico."
    ],
    "clinicalPearlsEn": [
      "Reproducibilidad Mínima: confirm temperature and reproducibility before calling pathology.",
      "A technical finding is not a clinical syndrome."
    ],
    "keyPoints": [
      "Fundamento y técnica de Reproducibilidad Mínima en el laboratorio de EDX.",
      "Errores de medición y temperatura son la primera hipótesis ante un valor extremo.",
      "Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM)."
    ],
    "keyPointsEn": [
      "EDX basis and technique for Reproducibilidad Mínima.",
      "Measurement and temperature error first, disease second.",
      "Correlate with clinical localization."
    ],
    "imageUrls": [
      {
        "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png",
        "alt": "Potencial de acción (Wikimedia Commons)",
        "caption": "Potencial de acción. Fuente: Wikimedia Commons."
      }
    ]
  }
};

/** Hojas con ID duplicado (sin cambiar IDs existentes): se resuelven por título. */
const LESSON_EXPANSION_BY_TITLE: Record<string, LessonExpansion> = {
  'fiber-types::Fibras musculares tipo I vs. tipo II': {
    content:
      '## Objetivos\n- Distinguir fibras musculares tipo I (tónicas) y tipo II (fásicas) y su relevancia para la EMG de aguja.\n- Evitar inferir histología a partir de un solo PUM.\n\n## Explicación clínica\nLas fibras tipo I son de umbral bajo, oxidativas y resistentes a la fatiga; las tipo II son fásicas y glucolíticas. La EMG no sustituye la biopsia, pero el reclutamiento precoz con PUM breves y de baja amplitud sugiere miopatía que afecta unidades de umbral bajo.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional.\n\n## Técnica\nMuestre varios sitios, compare esfuerzo y reclutamiento, y no concluya tipo de fibra con un solo inserto.\n\n## Interpretación\nIntegre NCS, reclutamiento y morfología del PUM. Un patrón “miopático” no tipifica I vs II.\n\n## Errores frecuentes\n- Equivaler PUM breve con “tipo II”.\n- Diagnosticar miopatía por esfuerzo incompleto.\n\n## Perlas\n- La clínica y el laboratorio de enzimas/anticuerpos dirigen la biopsia, no un único PUM.\n\n## Puntos clave\n- Tipo I vs II es un concepto fisiológico; la EMG describe reclutamiento y morfología.\n- La reproducibilidad técnica precede a cualquier conclusión patológica.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.',
    contentEn:
      '## Objectives\n- Distinguish type I vs type II muscle fibers and their EMG implications without over-calling histology.\n\n## Clinical explanation\nType I fibers are tonic and fatigue-resistant; type II are phasic. EMG describes recruitment and MUP morphology, not fiber-type biopsy diagnosis.\n\nPending institutional clinical validation.',
    clinicalPearls: [
      'No infiera histología de fibra a partir de un solo PUM.',
      'El reclutamiento precoz sugiere miopatía, no un “tipo de fibra”.',
    ],
    clinicalPearlsEn: [
      'Do not infer fiber-type histology from a single MUP.',
      'Early recruitment suggests myopathy, not a fiber type.',
    ],
    keyPoints: [
      'Tipo I vs II es fisiología; la EMG describe reclutamiento.',
      'Muestre varios sitios antes de concluir miopatía.',
    ],
    keyPointsEn: [
      'Type I vs II is physiology; EMG describes recruitment.',
      'Sample several sites before calling myopathy.',
    ],
    imageUrls: [
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/EMG_principle.gif/320px-EMG_principle.gif',
        alt: 'Principio de registro EMG (Wikimedia Commons)',
        caption: 'Registro EMG. Fuente: Wikimedia Commons.',
      },
    ],
  },
  'stimulus-artifact::Artefacto de Estímulo Excesivo': {
    content:
      '## Objetivos\n- Reconocer el artefacto de estímulo excesivo y distinguirlo de un CMAP/SNAP real.\n- Aplicar mitigación técnica (impedancia, orientación de ánodo, supresión) sin distorsionar la latencia.\n\n## Explicación clínica\nUn estímulo de alta intensidad o alta impedancia ensancha el artefacto y puede ocultar el onset. Medir sobre el artefacto finge latencias cortas o amplitudes falsas.\n\nEste contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional.\n\n## Técnica\n1. Baje impedancia (<5 kΩ) y separe cables de estímulo/registro.\n2. Gire el ánodo, use pulsos cortos y evite gel en exceso.\n3. Obtenga meseta supramáxima sin “empujar” el artefacto sobre el potencial.\n\n## Interpretación\nSi el onset coincide con el artefacto, no reporte esa latencia; repita el montaje.\n\n## Errores frecuentes\n- Subir intensidad hasta saturar el canal.\n- Usar notch agresivo que deforma el CMAP.\n\n## Perlas\n- Un artefacto limpio es parte de la calidad del estudio, no un adorno.\n\n## Puntos clave\n- No mida sobre el artefacto.\n- Reproducibilidad > intensidad máxima.\n\n## Bibliografía\n- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.\n- AANEM practice guidelines. https://www.aanem.org/',
    contentEn:
      '## Objectives\n- Recognize excessive stimulus artifact and avoid measuring latency on the artifact.\n\n## Technique\nLower impedance, rotate the anode, keep pulses short, and do not drive intensity past a clean supramaximal plateau.\n\nPending institutional clinical validation.',
    clinicalPearls: [
      'Si el onset está dentro del artefacto, repita el montaje.',
      'Más intensidad no equivale a mejor CMAP.',
    ],
    clinicalPearlsEn: [
      'If onset sits inside the artifact, repeat the setup.',
      'More intensity is not a better CMAP.',
    ],
    keyPoints: [
      'Impedancia, orientación y cables antes de “subir el estímulo”.',
      'No reporte latencias medidas sobre el artefacto.',
    ],
    keyPointsEn: [
      'Fix impedance and lead orientation before raising intensity.',
      'Do not report latencies measured on the artifact.',
    ],
    imageUrls: [
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Nerve_conduction_study.jpg/640px-Nerve_conduction_study.jpg',
        alt: 'Estudio de neuroconducción (Wikimedia Commons)',
        caption: 'Montaje de neuroconducción. Fuente: Wikimedia Commons.',
      },
    ],
  },
};

export function getLessonExpansion(topicId: string, title?: string): LessonExpansion | undefined {
  if (title) {
    const byTitle = LESSON_EXPANSION_BY_TITLE[`${topicId}::${title}`];
    if (byTitle) return byTitle;
  }
  return LESSON_EXPANSIONS[topicId];
}
