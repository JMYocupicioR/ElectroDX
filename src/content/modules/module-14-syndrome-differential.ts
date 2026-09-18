import { Module } from '../../types/content';

export const module14: Module = {
  id: 'syndrome-differential',
  number: 14,
  title: 'Abordaje por Síndrome: Diagnóstico Diferencial',
  titleEn: 'Syndrome-Based Approach: Differential Diagnosis',
  emoji: '🧭',
  description: 'Traduce síntomas comunes (mano dormida, pie caído, debilidad proximal) en protocolos de NCS/EMG y diagnósticos diferenciales reales.',
  descriptionEn: 'Translate common symptoms into practical NCS/EMG protocols and real-world differentials.',
  color: 'from-teal-500 to-emerald-700',
  icon: 'Stethoscope',
  topics: [
    {
      id: 'sleepy-hand',
      title: 'Mano dormida y parestesias nocturnas',
      titleEn: 'Sleepy hand and nocturnal paresthesias',
      description: 'Cómo separar túnel del carpo, radiculopatía C6-C7, plexopatía y polineuropatía en la mesa de exploración.',
      content: `La queja de “mano dormida” es el motivo de consulta más frecuente en el laboratorio de neuroconducción. El error clásico es pedir “solo medianos” y cerrar el caso. En la práctica, el mismo síntoma puede corresponder a neuropatía del mediano en muñeca, radiculopatía cervical, plexopatía inferior, neuropatía cubital en codo o polineuropatía distal simétrica.

El protocolo mínimo incluye: SNAP y CMAP de mediano y cubital bilaterales, comparación palmar o anillo 4 si el estudio de muñeca es fronterizo, y EMG de músculos miotómicos C6-T1 (abductor corto del pulgar, primer interóseo dorsal, flexor radial del carpo y, si hay duda axial, paraespinales cervicales). Si hay dolor cervical, pérdida de reflejos o debilidad proximal, no basta con un estudio de túnel del carpo.

La clave fisiológica es la distribución: el síndrome del túnel del carpo respeta el dorso de la mano y suele empeorar de noche; la radiculopatía sigue un dermatoma y se acompaña de cambios agudos o crónicos en EMG de músculos proximales; la plexopatía inferior afecta medianos y cubitales con SNAPs bajos y EMG de músculos no dependientes de un solo nervio.

**Pendiente de validación clínica institucional.** Este tema traduce el módulo de patologías a la mesa de trabajo del laboratorio.`,
      clinicalPearls: [
        'Un SNAP de mediano ausente con cubital y radial sensitivos normales apunta a mediano distal, no a C6 aislada (el SNAP suele preservarse en radiculopatía).',
        'Si el paciente describe el 5.º dedo, el estudio de cubital en codo es obligatorio aunque el mediano sea anormal.',
      ],
      keyPoints: [
        'No reducir “mano dormida” a un único nervio.',
        'Comparar medianos y cubitales; añadir EMG miotómica cuando hay dolor axial o debilidad.',
      ],
    },
    {
      id: 'foot-drop',
      title: 'Pie caído: peroneo, ciático, L5 o motoneurona',
      titleEn: 'Foot drop: peroneal, sciatic, L5 or motor neuron',
      description: 'Algoritmo de localización para debilidad de dorsiflexión.',
      content: `El pie caído obliga a localizar con precisión: nervio peroneo común en cabeza de peroné, nervio ciático, plexo lumbosacro, raíz L5 o enfermedad de motoneurona. Un CMAP peroneo bajo no cierra el diagnóstico.

Protocolo práctico: CMAP de peroneo al extensor corto de los dedos y al tibial anterior (estimulación en tobillo, cabeza de peroné y hueco poplíteo), CMAP tibial, SNAP sural y peroneo superficial, y EMG de tibial anterior, peroneo largo, tibial posterior, bíceps femoral cabeza corta y paraespinales lumbares. El tibial posterior (L5, tibial) y el bíceps femoral cabeza corta (peroneo, ciático) son los músculos que separan peroneo común de L5 y de ciático.

Si el SNAP peroneo superficial está ausente y el sural está conservado, el foco es peroneo (o plexo/ciático de fascículos peroneos). Si ambos SNAPs están conservados y hay denervación paraespinal y en tibial posterior, el foco es radicular L5. La enfermedad de motoneurona suele respetar sensitivos y mostrar reclutamiento reducido amplio, fasciculaciones y distribución que no cabe en un nervio.

**Pendiente de validación clínica institucional.**`,
      clinicalPearls: [
        'El bíceps femoral cabeza corta es el músculo decisivo para no confundir peroneo común con ciático.',
        'Un pie caído bilateral agudo obliga a pensar en radiculoplexopatía, polirradiculopatía o motoneurona, no en dos compresiones de peroné.',
      ],
      keyPoints: [
        'Localizar con CMAP segmentario + SNAP + EMG de músculos “divisorios”.',
        'No emitir “neuropatía peronea” si el tibial posterior está denervado.',
      ],
    },
    {
      id: 'proximal-weakness',
      title: 'Debilidad proximal: miopatía, plexo o polirradiculopatía',
      titleEn: 'Proximal weakness: myopathy, plexus or polyradiculopathy',
      description: 'Cómo elegir NCS, EMG y, si procede, estimulación repetitiva.',
      content: `La debilidad de cinturas no se resuelve con un estudio de túneles. El diferencial incluye miopatía (inflamatoria, tóxica, hereditaria), radiculoplexopatía, polirradiculopatía, trastornos de unión neuromuscular y, menos frecuente, mielopatía.

NCS: CMAP y SNAP de al menos un nervio motor y uno sensitivo por extremidad; si hay fluctuación, añadir estimulación repetitiva a 3 Hz en un músculo proximal (trapecio o nasalis). EMG: músculos proximales y distales, buscando reclutamiento precoz y potenciales miopáticos versus unidades grandes, reclutamiento reducido y denervación.

Patrón miopático: SNAPs y CMAPs distales conservados (salvo miopatía distal), EMG con unidades breves y polifásicas, reclutamiento precoz. Patrón neurogénico proximal: CMAPs pueden caer, SNAPs bajos si hay plexo, denervación en distribución de plexo o raíces. La miositis puede coexistir con potenciales de fibrilación abundantes; no interpretar fibrilaciones como “siempre neuropáticas”.

**Pendiente de validación clínica institucional.**`,
      clinicalPearls: [
        'Fibrilaciones en un músculo proximal no equivalen a radiculopatía: las miopatías inflamatorias las producen con frecuencia.',
        'Si hay fatigabilidad, la RNS y el SFEMG (curso avanzado) cambian el algoritmo.',
      ],
      keyPoints: [
        'El EMG de cinturas es el estudio, no un apéndice.',
        'Separar miopatía, plexo y unión neuromuscular antes de emitir el informe.',
      ],
    },
    {
      id: 'asymmetric-numbness',
      title: 'Parestesias asimétricas y “múltiples túneles”',
      titleEn: 'Asymmetric numbness and multiple entrapments',
      description: 'Cuándo es mononeuropatía múltiple y cuándo es radiculopatía o HNPP.',
      content: `El laboratorio recibe con frecuencia solicitudes de “túnel del carpo y túnel del tarso”. Encadenar atrapamientos sin un mapa de distribución es una trampa. La mononeuropatía múltiple (vasculitis, diabetes, Hansen, HNPP) produce déficits en territorios de nervios nombrados, a menudo dolorosos y paso a paso. La radiculopatía múltiple sigue miotomas. La polineuropatía es distal y simétrica.

El abordaje: documentar cada nervio con SNAP y CMAP, buscar bloqueo o caída de amplitud en sitios no entrapment (sugiere desmielinización adquirida o HNPP), y completar EMG de músculos fuera de los túneles sospechados. Un “STC + cubital en codo + peroneo” en un paciente joven con historia familiar obliga a pensar en HNPP; el mismo patrón en un adulto con pérdida de peso y VSG alta obliga a vasculitis.

**Pendiente de validación clínica institucional.**`,
      clinicalPearls: [
        'Tres atrapamientos en sitios clásicos en un paciente joven: pida PMP22 antes de operar el tercer túnel.',
        'Dolor neuropático paso a paso con SNAPs focalmente ausentes: no cierre como polineuropatía simétrica.',
      ],
      keyPoints: [
        'Mapear nervios, no “túneles”.',
        'La asimetría y el paso temporal separan vasculitis, HNPP y radiculopatía.',
      ],
    },
    {
      id: 'exam-strategy',
      title: 'Estrategia del estudio según la pregunta clínica',
      titleEn: 'Study strategy driven by the clinical question',
      description: 'Cómo convertir la historia en un protocolo y no al revés.',
      content: `El electrodiagnóstico no es un paquete fijo de nervios. Antes de colocar electrodos, formule la pregunta: ¿localizar?, ¿axonal vs desmielinizante?, ¿actividad de denervación?, ¿unión neuromuscular? Esa pregunta determina el orden: a veces se empieza por el lado sintomático y un nervio de comparación; a veces se necesita un estudio de cuatro extremidades.

Regla práctica: estudie primero el territorio que puede cambiar la conducta (cirugía, inmunoterapia, seguridad). Documente temperatura, distancias y estímulo supramáximo. Si a mitad del estudio la localización ya es clara, no añada nervios “por protocolo” que no responden la pregunta; si la localización no cierra, amplíe de forma dirigida (p. ej. radial superficial cuando el mediano y el cubital no bastan).

Este tema conecta el curso principiante (técnica) con la práctica real del laboratorio. **Pendiente de validación clínica institucional.**`,
      clinicalPearls: [
        'Si no puede escribir la pregunta clínica en una frase, no encienda el equipo.',
        'Un estudio corto y bien dirigido supera a un estudio largo y no interpretado.',
      ],
      keyPoints: [
        'La historia manda el protocolo.',
        'Ampliar el estudio es una decisión, no una costumbre.',
      ],
    },
  ],
};
