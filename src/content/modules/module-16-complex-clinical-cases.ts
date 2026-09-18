import { Module } from '../../types/content';

export const module16: Module = {
  id: 'complex-clinical-cases',
  number: 16,
  title: 'Casos Clínicos de Alta Complejidad',
  titleEn: 'High-Complexity Clinical Cases',
  emoji: '🧩',
  description: 'Casos donde conviven dos localizaciones, criterios incompletos o hallazgos que no caben en un único patrón.',
  descriptionEn: 'Cases with dual localization, incomplete criteria or findings that do not fit a single pattern.',
  color: 'from-violet-500 to-fuchsia-700',
  icon: 'Brain',
  topics: [
    {
      id: 'als-versus-mmn',
      title: 'Debilidad progresiva: ELA versus MMN versus radiculopatía',
      titleEn: 'Progressive weakness: ALS versus MMN versus radiculopathy',
      content: `Un adulto con debilidad asimétrica de manos puede ser enfermedad de motoneurona, neuropatía motora multifocal o radiculopatía cervical múltiple. El electrodiagnóstico debe buscar: SNAPs conservados, bloqueos de conducción fuera de sitios de atrapamiento (MMN), denervación amplia incluyendo paraespinales y músculos bulbares o torácicos (ELA), y distribución miotómica con cambios crónicos (radiculopatía).

La trampa es etiquetar “ELA” porque hay fasciculaciones y unidades grandes en una mano. Hace falta diseminación regional y la integración con clínica y, cuando proceda, criterios Awaji o Gold Coast. En MMN los bloqueos pueden ser técnicos si no se controla la co-estimulación; confirme con inching y comparación de áreas.

Este caso se trabaja mejor junto al módulo de criterios diagnósticos y al de estudios especiales. **Pendiente de validación clínica institucional.**`,
      clinicalPearls: [
        'SNAPs bajos en un cuadro “de motoneurona” reabren plexo, polineuropatía y radiculoplexopatía.',
        'Un solo bloqueo en codo no es MMN.',
      ],
      keyPoints: [
        'Diseminación, sensitivos y bloqueos reales separan ELA, MMN y raíz.',
      ],
    },
    {
      id: 'cidp-mimics',
      title: 'CIDP y sus imitadores en el laboratorio',
      titleEn: 'CIDP and laboratory mimics',
      content: `La CIDP típica muestra desmielinización adquirida en varios nervios motores: latencias distales prolongadas, ralentización, bloqueo o dispersión, y ondas F muy tardías, con SNAPs a menudo afectados. Los imitadores incluyen CMT desmielinizante (simetría de larga data, ausencia de bloqueo, historia familiar), anticuerpo MAG (latencias distales desproporcionadas), POEMS y radiculopatía inflamatoria.

El caso complejo aparece cuando hay criterios “parciales”: un nervio muy desmielinizante y el resto axonal, o un paciente diabético con lentificación moderada. Aquí el informe debe decir qué criterios EFNS/PNS o EAN/PNS se cumplen y cuáles faltan, no forzar el diagnóstico. La ecografía y la respuesta a inmunoterapia se discuten en actualizaciones (módulo 17).

**Pendiente de validación clínica institucional.**`,
      keyPoints: [
        'Liste criterios cumplidos; no “CIDP probable” sin datos.',
        'La cronicidad y la simetría histórica separan CMT de CIDP.',
      ],
    },
    {
      id: 'nmj-versus-myopathy',
      title: 'Fatiga y CK: unión neuromuscular versus miopatía',
      titleEn: 'Fatigue and CK: NMJ versus myopathy',
      content: `Fatigabilidad, ptosis y CK elevada pueden convivir. La miastenia puede tener CK normal; las miopatías inflamatorias pueden tener RNS normal. El caso difícil es el paciente con diplopía, CK 400 y EMG “irritativo” proximal.

Estrategia: NCS rutinario, RNS a 3 Hz en músculo proximal y distal, EMG de cinturas buscando unidades miopáticas versus inestabilidad de MUAP, y, si está indicado, SFEMG de jitter (módulo de estudios especiales). Una RNS negativa no excluye miastenia ocular; un EMG miopático no excluye síndrome miasténico si hay decremento claro.

Correlacione con anticuerpos (AChR, MuSK, HMGCR) y con la pregunta de biopsia. El informe debe jerarquizar: primero el hallazgo más específico (decremento, jitter, o patrón miopático florido). **Pendiente de validación clínica institucional.**`,
      clinicalPearls: [
        'MuSK y miopatía necrotizante inmunomediada pueden coexistir en el diagnóstico diferencial de debilidad proximal con CK alta.',
      ],
      keyPoints: [
        'RNS/SFEMG y EMG de cinturas contestan preguntas distintas; haga las dos si la clínica es mixta.',
      ],
    },
    {
      id: 'post-surgical-plexus',
      title: 'Plexopatía postquirúrgica y lesión iatrogénica',
      titleEn: 'Postsurgical plexopathy and iatrogenic injury',
      content: `Tras cirugía de mama, posicionamiento intraoperatorio, bloqueo anestésico o tracción obstétrica, el laboratorio debe localizar si la lesión es plexual, radicular o de nervio periférico, y si es axonal o hay bloqueo (neurapraxia). El momento del estudio importa: antes de 3 semanas la denervación puede no haber aparecido; un estudio demasiado precoz solo muestra bloqueo o CMAP bajo por axonotmesis reciente.

SNAPs: si están bajos, la lesión está en o distal al ganglio (plexo o nervio); si están conservados con EMG de denervación, piense raíz o motoneurona. Compare con el lado sano. Documente fecha de la cirugía y dé un pronóstico cauteloso basado en amplitud residual del CMAP, no en una sola aguja.

**Pendiente de validación clínica institucional.**`,
      keyPoints: [
        'El calendario post-lesión cambia la interpretación.',
        'SNAP vs EMG paraespinal separa plexo de raíz.',
      ],
    },
  ],
};
