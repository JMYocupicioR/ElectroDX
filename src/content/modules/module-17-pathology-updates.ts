import { Module } from '../../types/content';

export const module17: Module = {
  id: 'pathology-updates',
  number: 17,
  title: 'Actualizaciones por Patología',
  titleEn: 'Pathology Updates',
  emoji: '📡',
  description: 'Criterios, biomarcadores y técnicas recientes que modifican la interpretación electrodiagnóstica de CIDP, ELA, miastenia y neuropatías.',
  descriptionEn: 'Recent criteria, biomarkers and techniques that change EDX interpretation in CIDP, ALS, myasthenia and neuropathies.',
  color: 'from-sky-500 to-indigo-700',
  icon: 'BookMarked',
  topics: [
    {
      id: 'cidp-criteria-update',
      title: 'CIDP: criterios actuales y variantes',
      titleEn: 'CIDP: current criteria and variants',
      content: `Los criterios EAN/PNS actualizan la CIDP típica y las variantes (multifocal, distal, motora, sensitiva). El laboratorio debe conocer qué parámetros de desmielinización se aceptan y cómo las variantes cambian el mapa de nervios (p. ej. CMAP radiales y musculocutáneos en formas multifocales).

La novedad práctica es no forzar CIDP en neuropatías con IgM-MAG, POEMS o CMT. El electrodiagnóstico aporta el patrón; el diagnóstico final integra proteína, cadenas ligeras, VEGF y genética cuando corresponde. Este tema complementa el módulo de criterios del curso intermedio con literatura posterior.

**Pendiente de validación clínica institucional. Contrastar con la guía EAN/PNS vigente al momento de enseñar.**`,
      keyPoints: [
        'Separe CIDP típica de variantes y de imitadores con biomarcadores.',
        'El EDX solo no sustituye el resto del expediente.',
      ],
    },
    {
      id: 'als-criteria-update',
      title: 'ELA: de Awaji a Gold Coast y el papel del EDX',
      titleEn: 'ALS: from Awaji to Gold Coast and the role of EDX',
      content: `Los criterios de Gold Coast simplifican el diagnóstico de ELA: disfunción de motoneurona superior e inferior en una región, o inferior en dos regiones, con exclusión de imitadores. El EMG sigue siendo la herramienta para demostrar motoneurona inferior en regiones no evidentes a la clínica (torácica, bulbar).

La actualización para el laboratorio: fasciculaciones como signo de inestabilidad de unidad motora cuando se combinan con unidades grandes y reclutamiento reducido; no fasciculaciones aisladas. El estudio debe planearse por regiones, no por “un músculo por extremidad”.

**Pendiente de validación clínica institucional.**`,
      clinicalPearls: [
        'Un EMG de una mano no diagnostica ni descarta ELA.',
      ],
      keyPoints: [
        'Piense en regiones, no en músculos sueltos.',
        'Excluir imitadores es parte del informe.',
      ],
    },
    {
      id: 'mg-updates',
      title: 'Miastenia y síndromes miasténicos: RNS, SFEMG y anticuerpos',
      titleEn: 'Myasthenia and myasthenic syndromes: RNS, SFEMG and antibodies',
      content: `La sensibilidad de la RNS es alta en formas generalizadas y baja en oculares; el SFEMG de jitter sigue siendo el estudio más sensible de unión neuromuscular. Los anticuerpos AChR, MuSK y LRP4 cambian la probabilidad pretest y, por tanto, cómo se interpreta un decremento dudoso.

En el síndrome miasténico de Lambert-Eaton el hallazgo clásico es CMAP bajo que facilita con estímulo de alta frecuencia o ejercicio breve. No todo decremento a 3 Hz es miastenia: la miopatía y la inestabilidad neurogénica pueden imitarlo si la técnica es pobre.

**Pendiente de validación clínica institucional.**`,
      keyPoints: [
        'Ocular: no cierre con RNS negativa.',
        'Facilitación y CMAP bajo orientan a LEMS, no a MG típica.',
      ],
    },
    {
      id: 'imaging-and-small-fiber',
      title: 'Ultrasonido neuromuscular y fibras finas: qué cambia el EDX',
      titleEn: 'Neuromuscular ultrasound and small fiber: what changes in EDX',
      content: `El ultrasonido neuromuscular no sustituye a NCS/EMG: localiza agrandamiento de sección (CSA), neuromas y nervios no estimulables, y guía la aguja. En CIDP y en HNPP el CSA aumentado apoya el patrón. En el síndrome de túnel del carpo el CSA en muñeca se correlaciona con severidad, pero el laboratorio sigue midiendo latencias.

La neuropatía de fibras finas tiene NCS rutinario normal; el EDX “normal” es un resultado esperado, no un error. El informe debe decir que no se evaluaron fibras finas y orientar a biopsia de piel o pruebas autonómicas cuando la clínica lo pide.

**Pendiente de validación clínica institucional.**`,
      keyPoints: [
        'EDX normal no descarta fibras finas.',
        'El CSA complementa; no reemplaza latencias y amplitudes.',
      ],
    },
    {
      id: 'how-to-stay-current',
      title: 'Cómo mantenerse actualizado sin perder el método',
      titleEn: 'How to stay current without losing method',
      content: `La tentación del curso avanzado es coleccionar criterios. El método no cambia: pregunta clínica, localización, fisiopatología, limitaciones. Las actualizaciones se incorporan cuando modifican umbrales (qué se llama bloqueo), cuando añaden una técnica (SFEMG, US) o cuando un biomarcador reclasifica un imitador.

Práctica recomendada: una vez al año revisar guías AANEM y EAN/PNS de las enfermedades que más ve el laboratorio (CIDP, STC, radiculopatía, MG, ELA). Anote en el informe la fecha de los criterios usados si el caso es de referencia o de controversia.

**Pendiente de validación clínica institucional.**`,
      keyPoints: [
        'Actualice umbrales y criterios; no abandone la localización.',
        'Cite la guía cuando el caso lo requiera.',
      ],
    },
  ],
};
