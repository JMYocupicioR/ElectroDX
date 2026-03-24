import { 
    CONFIG, 
    CONFIG_CONTEXTUAL,
    AJUSTES_TEMPORALES,
    LESIONES, 
    INERVACION_DUAL,
    type DatosEvaluacion, 
    type ResultadoDiagnostico,
    type Lesion,
    type HallazgoInervacionDual,
    type AnalisisTemporal,
    type IndicadoresConfianza
  } from './plexoBraquial';
  
  // =============================================
  // MÚSCULOS ESCAPULARES / PERIESCAPULARES
  // Usados para discriminación supra vs. infraclavicular
  // =============================================
  const MUSCULOS_SUPRACLAVICULARES = [
    'Romboides',        // N. Dorsal Escápula (pre-tronco, directo de C5)
    'Elevador Escápula', // N. Dorsal Escápula (pre-tronco)
    'Serrato Anterior',  // N. Torácico Largo (pre-tronco, C5-C7 directo)
    'Supraespinoso',     // N. Supraescapular (del tronco superior)
    'Infraespinoso',     // N. Supraescapular (del tronco superior)
  ];

  // Músculo "pivot" que diferencia raíz de tronco
  const MUSCULOS_PRE_TRONCALES = [
    'Romboides',        // Sale ANTES de formarse el tronco (N. Dorsal Escápula)
    'Elevador Escápula', // Sale ANTES de formarse el tronco
    'Serrato Anterior',  // Sale ANTES de formarse el tronco (N. Torácico Largo)
  ];

  // =============================================
  // SISTEMA DE RED FLAGS
  // =============================================
  export interface RedFlag {
    tipo: 'urgente' | 'importante' | 'precaucion';
    titulo: string;
    descripcion: string;
    accion: string;
    estudiosUrgentes?: string[];
  }

  // =============================================
  // RECOMENDACIONES EMG/NCS
  // =============================================
  export interface RecomendacionEMG {
    nerviosConduccion: { nervio: string; tipo: 'motor' | 'sensitivo' | 'mixto'; prioridad: 'esencial' | 'complementario' }[];
    musculosAguja: { musculo: string; razon: string; prioridad: 'esencial' | 'complementario' }[];
    pruebasEspeciales?: string[];
    notaClinica?: string;
  }

  // =============================================
  // ANÁLISIS TOPOGRÁFICO AVANZADO
  // =============================================
  export interface AnalisisTopografico {
    nivelLesion: 'supraclavicular' | 'infraclavicular' | 'indeterminado';
    subnivel?: 'radicular' | 'troncal' | 'fascicular' | 'nervio_terminal';
    confianzaNivel: number; // 0-100
    evidenciaPositiva: string[];
    evidenciaNegativa: string[];
    coherenciaTopografica: number; // 0-100, coherente vs parchado
    patronDistribucion: 'coherente' | 'parchado' | 'difuso';
  }

  // =============================================
  // ÍNDICE DE DISCRIMINACIÓN
  // =============================================
  export interface IndiceDiscriminacion {
    esDiscriminativo: boolean;
    ratio: number; // score1 / score2
    diagnosticoPrincipal: string;
    diagnosticoAlternativo?: string;
    musculosPivot?: string[]; // músculos que diferencian entre los dos
    mensaje: string;
  }

  // Función para ajustar lesiones según el tipo de plexo
  const ajustarLesionPorTipoPlexo = (lesion: Lesion, tipoPlexo: string): Lesion => {
      const lesionAjustada = { ...lesion };
      
      if (tipoPlexo === 'prefijado') {
        if (lesion.nombre.includes('C5') || lesion.nombre.includes('Tronco Superior')) {
          lesionAjustada.musculosClave = [
            ...lesionAjustada.musculosClave,
            { nombre: "Trapecio Superior", peso: 0.8 },
            { nombre: "Elevador Escápula", peso: 1.0 }
          ];
          lesionAjustada.areasSensibilidad = [
            ...lesionAjustada.areasSensibilidad,
            "Dermatoma C4"
          ];
        }
      } else if (tipoPlexo === 'postfijado') {
        if (lesion.nombre.includes('T1') || lesion.nombre.includes('Tronco Inferior')) {
          lesionAjustada.musculosClave = [
            ...lesionAjustada.musculosClave,
            { nombre: "Interóseos Dorsales", peso: 1.2 },
            { nombre: "Interóseos Palmares", peso: 1.2 }
          ];
          lesionAjustada.areasSensibilidad = [
            ...lesionAjustada.areasSensibilidad,
            "Dermatoma T2"
          ];
        }
      }
      
      return lesionAjustada;
    };
  
  // Función para analizar inervación dual en músculos clave
  export const analizarInervacionDual = (fuerzasMuscular: { [musculo: string]: number }): HallazgoInervacionDual[] => {
      const hallazgos: HallazgoInervacionDual[] = [];
      
      for (const [musculo, info] of Object.entries(INERVACION_DUAL)) {
        const mrc = fuerzasMuscular[musculo];
        if (mrc !== undefined && mrc < 5) {
          let relevancia: 'Alta' | 'Moderada' | 'Baja' = 'Baja';
          let interpretacion = '';
  
          if (mrc === 0) {
            relevancia = 'Alta';
            interpretacion = `Parálisis completa sugiere lesión de ambos nervios (${info.principal} y ${info.secundario})`;
          } else if (mrc <= 2) {
            relevancia = 'Alta';
            interpretacion = `Debilidad severa: posible lesión predominante del ${info.principal} con preservación parcial del ${info.secundario}`;
          } else if (mrc <= 3) {
            relevancia = 'Moderada';
            interpretacion = `Debilidad moderada: ${info.implicacion}`;
          } else {
            relevancia = 'Baja';
            interpretacion = `Debilidad leve compatible con inervación dual preservada`;
          }
  
          hallazgos.push({
            musculo,
            mrc,
            info,
            relevancia,
            interpretacion
          });
        }
      }
      
      return hallazgos.sort((a, b) => {
        const relevanciaOrder = { 'Alta': 3, 'Moderada': 2, 'Baja': 1 };
        return relevanciaOrder[b.relevancia] - relevanciaOrder[a.relevancia];
      });
    };
  
  // =============================================
  // NUEVO: Análisis Supra vs. Infraclavicular
  // =============================================
  const analizarNivelTopografico = (
    fuerzasMuscular: { [musculo: string]: number }
  ): AnalisisTopografico => {
    const evidenciaPositiva: string[] = [];
    const evidenciaNegativa: string[] = [];

    // ¿Hay músculos supraclaviculares débiles?
    const supraclavicularesDebiles = MUSCULOS_SUPRACLAVICULARES.filter(m => {
      const mrc = fuerzasMuscular[m];
      return mrc !== undefined && mrc < 5;
    });

    // ¿Hay músculos pre-troncales débiles?
    const preTroncalesDebiles = MUSCULOS_PRE_TRONCALES.filter(m => {
      const mrc = fuerzasMuscular[m];
      return mrc !== undefined && mrc < 5;
    });

    let nivelLesion: 'supraclavicular' | 'infraclavicular' | 'indeterminado' = 'indeterminado';
    let subnivel: 'radicular' | 'troncal' | 'fascicular' | 'nervio_terminal' | undefined;
    let confianzaNivel = 50;

    if (supraclavicularesDebiles.length > 0) {
      nivelLesion = 'supraclavicular';
      evidenciaPositiva.push(`Músculos escapulares afectados: ${supraclavicularesDebiles.join(', ')}`);
      confianzaNivel = 70 + (supraclavicularesDebiles.length * 5);

      if (preTroncalesDebiles.length > 0) {
        subnivel = 'radicular';
        evidenciaPositiva.push(`Músculos pre-troncales afectados (${preTroncalesDebiles.join(', ')}): sugiere lesión a nivel de RAÍZ`);
        confianzaNivel += 10;
      } else {
        subnivel = 'troncal';
        evidenciaPositiva.push('Escapulares afectados pero pre-troncales normales: compatible con lesión TRONCAL');
      }
    } else {
      const tieneDebilidadDistal = Object.entries(fuerzasMuscular)
        .some(([m, mrc]) => mrc < 5 && !MUSCULOS_SUPRACLAVICULARES.includes(m));
      
      if (tieneDebilidadDistal) {
        nivelLesion = 'infraclavicular';
        evidenciaPositiva.push('Músculos escapulares NORMALES con debilidad distal: lesión INFRACLAVICULAR');
        confianzaNivel = 75;

        // ¿Fascicular o nervio terminal?
        const territoriosAfectados = new Set<string>();
        Object.entries(fuerzasMuscular).forEach(([m, mrc]) => {
          if (mrc < 5) {
            // Simplificación: mapear músculos a territorios nerviosos
            if (['Deltoides', 'Redondo Menor'].includes(m)) territoriosAfectados.add('axilar');
            if (['Bíceps Braquial', 'Braquial'].includes(m)) territoriosAfectados.add('musculocutaneo');
            if (['Tríceps Braquial', 'Braquiorradial', 'Extensor Carpi Radialis', 'Extensor de los Dedos', 'Extensor Carpi Ulnaris', 'Extensor Largo del Pulgar', 'Supinador'].includes(m)) territoriosAfectados.add('radial');
            if (['Flexor Carpi Radialis', 'Pronador Redondo', 'Flexor Largo del Pulgar', 'Pronador Cuadrado', 'Abductor Corto del Pulgar', 'Lumbricales 1 y 2'].includes(m)) territoriosAfectados.add('mediano');
            if (['Flexor Carpi Ulnaris', 'Interóseos Dorsales', 'Interóseos Palmares', 'Lumbricales 3 y 4', 'Abductor del Meñique', 'Aductor del Pulgar'].includes(m)) territoriosAfectados.add('ulnar');
          }
        });

        if (territoriosAfectados.size === 1) {
          subnivel = 'nervio_terminal';
          evidenciaPositiva.push(`Distribución de un solo nervio (${[...territoriosAfectados][0]}): MONONEUROPATÍA`);
          confianzaNivel += 10;
        } else if (territoriosAfectados.size >= 2) {
          subnivel = 'fascicular';
          evidenciaPositiva.push(`Múltiples territorios nerviosos afectados: lesión FASCICULAR o combinada`);
        }
      }
    }

    // Calcular coherencia topográfica
    const musculosDebiles = Object.entries(fuerzasMuscular)
      .filter(([_, mrc]) => mrc < 5)
      .map(([m]) => m);

    let coherenciaTopografica = 100;
    let patronDistribucion: 'coherente' | 'parchado' | 'difuso' = 'coherente';

    // Verificar si la distribución es coherente con un territorio anatómico
    const regiones = {
      proximal: ['Deltoides', 'Supraespinoso', 'Infraespinoso', 'Redondo Menor', 'Romboides', 'Elevador Escápula', 'Serrato Anterior'],
      mediaProximal: ['Bíceps Braquial', 'Tríceps Braquial', 'Braquial'],
      mediaDistal: ['Braquiorradial', 'Extensor Carpi Radialis', 'Extensor de los Dedos', 'Flexor Carpi Radialis', 'Flexor Carpi Ulnaris', 'Pronador Redondo', 'Supinador'],
      distal: ['Interóseos Dorsales', 'Interóseos Palmares', 'Lumbricales 1 y 2', 'Lumbricales 3 y 4', 'Abductor del Meñique', 'Abductor Corto del Pulgar', 'Aductor del Pulgar']
    };

    const regionesAfectadas = new Set<string>();
    musculosDebiles.forEach(m => {
      if (regiones.proximal.includes(m)) regionesAfectadas.add('proximal');
      if (regiones.mediaProximal.includes(m)) regionesAfectadas.add('mediaProximal');
      if (regiones.mediaDistal.includes(m)) regionesAfectadas.add('mediaDistal');
      if (regiones.distal.includes(m)) regionesAfectadas.add('distal');
    });

    // Patrón parchado: regiones no contiguas afectadas con saltos
    const regionOrder = ['proximal', 'mediaProximal', 'mediaDistal', 'distal'];
    const regionIndices = [...regionesAfectadas].map(r => regionOrder.indexOf(r)).sort();
    
    if (regionIndices.length >= 2) {
      let gaps = 0;
      for (let i = 1; i < regionIndices.length; i++) {
        if (regionIndices[i] - regionIndices[i-1] > 1) gaps++;
      }
      if (gaps > 0) {
        coherenciaTopografica -= gaps * 25;
        patronDistribucion = 'parchado';
        evidenciaNegativa.push(`Distribución parchada (${gaps} salto(s) entre regiones): considerar Parsonage-Turner o lesión multifocal`);
      }
    }

    if (musculosDebiles.length > 10) {
      patronDistribucion = 'difuso';
      coherenciaTopografica -= 15;
    }

    confianzaNivel = Math.max(0, Math.min(100, confianzaNivel));
    coherenciaTopografica = Math.max(0, Math.min(100, coherenciaTopografica));

    return {
      nivelLesion,
      subnivel,
      confianzaNivel,
      evidenciaPositiva,
      evidenciaNegativa,
      coherenciaTopografica,
      patronDistribucion
    };
  };

  // =============================================
  // NUEVO: Bonus de Exclusión Negativa
  // =============================================
  const calcularBonusExclusionNegativa = (
    lesion: Lesion,
    fuerzasMuscular: { [musculo: string]: number }
  ): number => {
    // Define músculos que DEBEN estar normales para cada categoría de lesión
    const exclusionesEsperadas: { [categoria: string]: string[] } = {
      'tronco': [],
      'fasciculo': MUSCULOS_SUPRACLAVICULARES,
      'nervio_periferico': MUSCULOS_SUPRACLAVICULARES,
    };

    // Específicas por lesión
    const exclusionesPorLesion: { [nombre: string]: string[] } = {
      'Lesión de Tronco Superior (C5-C6) - Erb-Duchenne': ['Interóseos Dorsales', 'Interóseos Palmares', 'Flexor Carpi Ulnaris', 'Abductor del Meñique'],
      'Lesión de Tronco Inferior (C8-T1) - Klumpke': ['Deltoides', 'Supraespinoso', 'Infraespinoso', 'Bíceps Braquial'],
      'Lesión de Tronco Medio (C7)': ['Deltoides', 'Supraespinoso', 'Bíceps Braquial', 'Interóseos Dorsales', 'Romboides'],
      'Neuropatía del Nervio Axilar': ['Bíceps Braquial', 'Tríceps Braquial', 'Extensor de los Dedos', 'Interóseos Dorsales', 'Supraespinoso'],
      'Neuropatía del Nervio Interóseo Posterior (PIN)': ['Tríceps Braquial', 'Braquiorradial', 'Extensor Carpi Radialis', 'Deltoides'],
      'Neuropatía del Nervio Interóseo Anterior (Kiloh-Nevin)': ['Abductor Corto del Pulgar', 'Interóseos Dorsales', 'Extensor de los Dedos'],
      'Neuropatía del Nervio Radial (Distal / Surco Espiral)': ['Tríceps Braquial', 'Deltoides', 'Interóseos Dorsales'],
      'Lesión de Fascículo Lateral': ['Romboides', 'Elevador Escápula', 'Serrato Anterior', 'Interóseos Dorsales', 'Flexor Carpi Ulnaris'],
      'Lesión de Fascículo Medial': ['Romboides', 'Elevador Escápula', 'Deltoides', 'Bíceps Braquial'],
      'Lesión de Fascículo Posterior': ['Romboides', 'Elevador Escápula', 'Flexor Carpi Ulnaris', 'Interóseos Dorsales'],
    };

    const musculosExcluidos = [
      ...(exclusionesEsperadas[lesion.categoria] || []),
      ...(exclusionesPorLesion[lesion.nombre] || [])
    ];

    if (musculosExcluidos.length === 0) return 0;

    let normalesCount = 0;
    let evaluadosCount = 0;

    musculosExcluidos.forEach(m => {
      const mrc = fuerzasMuscular[m];
      if (mrc !== undefined) {
        evaluadosCount++;
        if (mrc === 5) normalesCount++;
      }
    });

    if (evaluadosCount === 0) return 0;

    // Bonus proporcional: hasta +15% del score si todos los excluidos están normales
    return (normalesCount / evaluadosCount) * 0.15;
  };

  // =============================================
  // NUEVO: Red Flags Auto-Detection
  // =============================================
  const detectarRedFlags = (
    resultados: ResultadoDiagnostico[],
    datosEvaluacion: DatosEvaluacion
  ): RedFlag[] => {
    const flags: RedFlag[] = [];
    const { sintomasSeleccionados, informacionAdicional } = datosEvaluacion;
    const topResult = resultados[0];

    // Horner + C8-T1 + deterioro → Pancoast?
    if (sintomasSeleccionados.includes('Signo de Horner') &&
        informacionAdicional.patronEvolucion === 'deteriorando') {
      const tieneC8T1 = resultados.some(r => 
        r.nombreLesion.includes('T1') || r.nombreLesion.includes('Klumpke') || r.nombreLesion.includes('Tronco Inferior'));
      if (tieneC8T1) {
        flags.push({
          tipo: 'urgente',
          titulo: '⚠️ Sospecha de Tumor de Pancoast',
          descripcion: 'Horner + C8-T1 + deterioro progresivo sugiere neoplasia apical pulmonar',
          accion: 'TC de tórax URGENTE y derivación oncológica',
          estudiosUrgentes: ['TC de tórax con contraste', 'RMN de plexo braquial', 'RX tórax PA']
        });
      }
    }

    // Debilidad severa aguda traumática → cirugía?
    if (topResult && topResult.categoria === 'traumatica' && 
        informacionAdicional.faseEvolutiva === 'aguda') {
      const musculosSeverament = topResult.detalles.musculos.filter(m => m.mrc <= 1).length;
      if (musculosSeverament >= 3) {
        flags.push({
          tipo: 'urgente',
          titulo: '🔴 Ventana Quirúrgica Crítica',
          descripcion: `${musculosSeverament} músculos con MRC ≤1 en fase aguda traumática`,
          accion: 'Evaluación quirúrgica urgente dentro de las primeras 2-3 semanas',
          estudiosUrgentes: ['RMN de plexo braquial', 'EMG/NCS (a las 3-4 semanas)', 'TC de columna cervical']
        });
      }
    }

    // Atrofia + dolor persistente progresivo
    if (sintomasSeleccionados.includes('Atrofia Muscular') &&
        sintomasSeleccionados.includes('Dolor Neurítico') &&
        informacionAdicional.patronEvolucion === 'deteriorando') {
      flags.push({
        tipo: 'importante',
        titulo: '⚡ Descartar Causa Secundaria',
        descripcion: 'Atrofia + dolor progresivo puede indicar proceso infiltrativo o enfermedad de motoneurona',
        accion: 'Ampliar estudio: EMG multinivel, RMN de plexo y columna cervical',
        estudiosUrgentes: ['EMG/NCS multinivel', 'RMN de plexo braquial', 'Laboratorios (CK, anti-GM1, anti-NF155)']
      });
    }

    // Patrón de dolor + debilidad parchada → Parsonage-Turner
    if (sintomasSeleccionados.includes('Dolor Neurítico') &&
        sintomasSeleccionados.includes('Escápula Alada')) {
      flags.push({
        tipo: 'precaucion',
        titulo: '💡 Considerar Parsonage-Turner',
        descripcion: 'Dolor neurítico severo + escápula alada es altamente sugestivo de neuralgia amiotrófica',
        accion: 'Confirmar con EMG parchado, considerar corticoides si <2 semanas de evolución'
      });
    }

    return flags;
  };

  // =============================================
  // NUEVO: Generador de Recomendaciones EMG/NCS
  // =============================================
  const generarRecomendacionesEMG = (resultado: ResultadoDiagnostico): RecomendacionEMG => {
    const recomendaciones: { [diagnostico: string]: RecomendacionEMG } = {
      'Lesión de Tronco Superior (C5-C6) - Erb-Duchenne': {
        nerviosConduccion: [
          { nervio: 'Axilar motor (Deltoides)', tipo: 'motor', prioridad: 'esencial' },
          { nervio: 'Musculocutáneo SNAP', tipo: 'sensitivo', prioridad: 'esencial' },
          { nervio: 'Mediano motor/sensitivo', tipo: 'mixto', prioridad: 'complementario' },
          { nervio: 'Ulnar motor/sensitivo', tipo: 'mixto', prioridad: 'complementario' },
          { nervio: 'Sural (control)', tipo: 'sensitivo', prioridad: 'complementario' }
        ],
        musculosAguja: [
          { musculo: 'Deltoides', razon: 'Músculo clave C5-C6 (axilar)', prioridad: 'esencial' },
          { musculo: 'Infraespinoso', razon: 'N. Supraescapular (tronco superior)', prioridad: 'esencial' },
          { musculo: 'Bíceps Braquial', razon: 'C5-C6 (musculocutáneo)', prioridad: 'esencial' },
          { musculo: 'Pronador Redondo', razon: 'Control C6-C7 (mediano)', prioridad: 'complementario' },
          { musculo: 'Tríceps Braquial', razon: 'Control C7 (debe estar normal)', prioridad: 'complementario' },
          { musculo: 'Paraespinales cervicales C5-C6', razon: 'Diferencia raíz de tronco', prioridad: 'esencial' }
        ],
        pruebasEspeciales: ['Inching en punto de Erb', 'Potenciales evocados somatosensoriales (PESS)'],
        notaClinica: 'Los paraespinales anormales confirman lesión preganglionar (radicular). Normales favorecen tronco.'
      },
      'Lesión de Tronco Inferior (C8-T1) - Klumpke': {
        nerviosConduccion: [
          { nervio: 'Ulnar motor y sensitivo', tipo: 'mixto', prioridad: 'esencial' },
          { nervio: 'Mediano motor y sensitivo', tipo: 'mixto', prioridad: 'esencial' },
          { nervio: 'Cut. Med. Antebrazo (MABC)', tipo: 'sensitivo', prioridad: 'esencial' },
          { nervio: 'Radial sensitivo', tipo: 'sensitivo', prioridad: 'complementario' }
        ],
        musculosAguja: [
          { musculo: 'Primer Interóseo Dorsal', razon: 'C8-T1 (ulnar)', prioridad: 'esencial' },
          { musculo: 'Abductor del Meñique', razon: 'C8-T1 (ulnar)', prioridad: 'esencial' },
          { musculo: 'Abductor Corto del Pulgar', razon: 'C8-T1 (mediano)', prioridad: 'esencial' },
          { musculo: 'Flexor Carpi Ulnaris', razon: 'Control proximal ulnar', prioridad: 'complementario' },
          { musculo: 'Paraespinales cervicales C8-T1', razon: 'Diferencia pre vs postganglionar', prioridad: 'esencial' }
        ],
        pruebasEspeciales: ['SNAP del MABC (Cut. Med. Antebrazo) - si normal sugiere avulsión preganglionar'],
        notaClinica: 'SNAP de MABC NORMAL con clínica de C8-T1 = avulsión radicular (preganglionar). SNAP ausente = tronco/fascículo (postganglionar).'
      },
      'Neuropatía del Nervio Interóseo Anterior (Kiloh-Nevin)': {
        nerviosConduccion: [
          { nervio: 'Mediano motor (convencional)', tipo: 'motor', prioridad: 'esencial' },
          { nervio: 'Mediano sensitivo', tipo: 'sensitivo', prioridad: 'esencial' },
          { nervio: 'Ulnar motor/sensitivo', tipo: 'mixto', prioridad: 'complementario' }
        ],
        musculosAguja: [
          { musculo: 'Pronador Cuadrado', razon: 'Único músculo exclusivo del NIA', prioridad: 'esencial' },
          { musculo: 'Flexor Largo del Pulgar', razon: 'NIA', prioridad: 'esencial' },
          { musculo: 'Flexor Profundo Dedos 2-3', razon: 'NIA (porción mediana)', prioridad: 'esencial' },
          { musculo: 'Pronador Redondo', razon: 'Control N. Mediano proximal (debe estar normal)', prioridad: 'complementario' }
        ],
        notaClinica: 'Conducciones convencionales normales. El pronador cuadrado es KEY: denervación confirma NIA. Sensitivo mediano NORMAL excluye STC.'
      },
      'Neuropatía del Nervio Interóseo Posterior (PIN)': {
        nerviosConduccion: [
          { nervio: 'Radial motor (EIP)', tipo: 'motor', prioridad: 'esencial' },
          { nervio: 'Radial sensitivo superficial', tipo: 'sensitivo', prioridad: 'esencial' },
          { nervio: 'Mediano/Ulnar', tipo: 'mixto', prioridad: 'complementario' }
        ],
        musculosAguja: [
          { musculo: 'Extensor de los Dedos', razon: 'PIN', prioridad: 'esencial' },
          { musculo: 'Extensor Carpi Ulnaris', razon: 'PIN', prioridad: 'esencial' },
          { musculo: 'Supinador', razon: 'PIN (proximalmente)', prioridad: 'esencial' },
          { musculo: 'Braquiorradial', razon: 'Control proximal al PIN (debe estar normal)', prioridad: 'complementario' },
          { musculo: 'Tríceps Braquial', razon: 'Control radial proximal', prioridad: 'complementario' }
        ],
        notaClinica: 'Sensitivo radial NORMAL confirma PIN (rama puramente motora). Braquiorradial y ECR normales diferencian de radial proximal.'
      }
    };

    // Recomendación genérica si no hay específica
    const defaultRecomendacion: RecomendacionEMG = {
      nerviosConduccion: [
        { nervio: 'Mediano motor y sensitivo', tipo: 'mixto', prioridad: 'esencial' },
        { nervio: 'Ulnar motor y sensitivo', tipo: 'mixto', prioridad: 'esencial' },
        { nervio: 'Radial motor y sensitivo', tipo: 'mixto', prioridad: 'complementario' },
        { nervio: 'Musculocutáneo/Axilar', tipo: 'motor', prioridad: 'complementario' }
      ],
      musculosAguja: [
        { musculo: 'Deltoides', razon: 'Evaluar C5-C6 / axilar', prioridad: 'esencial' },
        { musculo: 'Bíceps Braquial', razon: 'Evaluar C5-C6 / musculocutáneo', prioridad: 'esencial' },
        { musculo: 'Tríceps Braquial', razon: 'Evaluar C7 / radial', prioridad: 'esencial' },
        { musculo: 'Primer Interóseo Dorsal', razon: 'Evaluar C8-T1 / ulnar', prioridad: 'esencial' },
        { musculo: 'Paraespinales cervicales', razon: 'Diferenciar pre vs postganglionar', prioridad: 'complementario' }
      ],
      notaClinica: 'Protocolo estándar de evaluación del plexo braquial.'
    };

    return recomendaciones[resultado.nombreLesion] || defaultRecomendacion;
  };

  // =============================================
  // NUEVO: Discriminación Jerárquica
  // =============================================
  const calcularDiscriminacion = (
    resultados: ResultadoDiagnostico[],
    fuerzasMuscular: { [musculo: string]: number }
  ): IndiceDiscriminacion => {
    if (resultados.length < 2) {
      return {
        esDiscriminativo: true,
        ratio: resultados.length > 0 ? 1.0 : 0,
        diagnosticoPrincipal: resultados[0]?.nombreLesion || 'Sin diagnóstico',
        mensaje: resultados.length > 0 ? 'Diagnóstico único con alta confianza' : 'No se encontraron diagnósticos compatibles'
      };
    }

    const top1 = resultados[0];
    const top2 = resultados[1];
    const ratio = top2.normalizedScore > 0 ? top1.normalizedScore / top2.normalizedScore : 10;

    // Encontrar músculos pivot que diferencian
    const musculosPivot: string[] = [];
    const musculosTop1 = new Set(LESIONES.find(l => l.nombre === top1.nombreLesion)?.musculosClave.map(m => m.nombre) || []);
    const musculosTop2 = new Set(LESIONES.find(l => l.nombre === top2.nombreLesion)?.musculosClave.map(m => m.nombre) || []);

    // Músculos en top1 pero NO en top2 (o viceversa) que sean evaluables
    musculosTop1.forEach(m => {
      if (!musculosTop2.has(m) && fuerzasMuscular[m] !== undefined) {
        musculosPivot.push(m);
      }
    });
    musculosTop2.forEach(m => {
      if (!musculosTop1.has(m) && fuerzasMuscular[m] !== undefined) {
        musculosPivot.push(m);
      }
    });

    let mensaje: string;
    const esDiscriminativo = ratio >= 1.3;

    if (ratio >= 2.0) {
      mensaje = `Diagnóstico claramente diferenciado (ratio ${ratio.toFixed(1)}x)`;
    } else if (ratio >= 1.3) {
      mensaje = `Diagnóstico principal favorecido sobre ${top2.nombreLesion} (ratio ${ratio.toFixed(1)}x)`;
    } else {
      mensaje = `Diagnóstico incierto entre ${top1.nombreLesion} y ${top2.nombreLesion}. ${
        musculosPivot.length > 0 
          ? `Evalúe: ${musculosPivot.slice(0, 3).join(', ')} para diferenciar.`
          : 'Estudios electrofisiológicos necesarios para confirmar.'
      }`;
    }

    return {
      esDiscriminativo,
      ratio: Math.round(ratio * 10) / 10,
      diagnosticoPrincipal: top1.nombreLesion,
      diagnosticoAlternativo: top2.nombreLesion,
      musculosPivot: musculosPivot.length > 0 ? musculosPivot.slice(0, 5) : undefined,
      mensaje
    };
  };

  // Función para calcular métricas de confianza (MEJORADA)
  const calcularIndicadoresConfianza = (
      resultado: ResultadoDiagnostico,
      datosEvaluacion: DatosEvaluacion,
      analisisTopografico: AnalisisTopografico
    ): IndicadoresConfianza => {
      const { informacionAdicional } = datosEvaluacion;
      
      let nivelConfianza = resultado.normalizedScore * 100;
      const factoresPositivos: string[] = [];
      const factoresNegativos: string[] = [];
      const recomendacionesAdicionales: string[] = [];
      let necesidadEstudios = false;
      const estudiosRecomendados: string[] = [];
  
      // Evaluar factores que aumentan la confianza
      if (resultado.detalles.musculos.filter(m => m.esperado && m.mrc <= 2).length >= 2) {
        factoresPositivos.push("Múltiples músculos con debilidad severa");
        nivelConfianza += 5;
      }
  
      if (resultado.detalles.reflejos.filter(r => r.match).length >= 2) {
        factoresPositivos.push("Patrón de reflejos consistente");
        nivelConfianza += 10;
      }
  
      if (resultado.detalles.sintomas.includes("Signo de Horner") && 
          resultado.nombreLesion.includes("T1")) {
        factoresPositivos.push("Signo de Horner presente en lesión T1");
        nivelConfianza += 15;
      }
  
      if (informacionAdicional.contextoClinico && 
          resultado.contextoClinico?.mecanismoFrecuente.some(m => 
            informacionAdicional.mecanismo.toLowerCase().includes(m.toLowerCase().split(' ')[0]))) {
        factoresPositivos.push("Mecanismo compatible con el diagnóstico");
        nivelConfianza += 10;
      }

      // NUEVO: Bonus por coherencia topográfica
      if (analisisTopografico.coherenciaTopografica >= 80) {
        factoresPositivos.push("Distribución anatómicamente coherente");
        nivelConfianza += 5;
      }

      // NUEVO: Bonus por nivel topográfico concordante
      const esSupraclavicular = ['radicular', 'tronco'].includes(resultado.categoria);
      const esInfraclavicular = ['fasciculo', 'nervio_periferico'].includes(resultado.categoria);
      if ((esSupraclavicular && analisisTopografico.nivelLesion === 'supraclavicular') ||
          (esInfraclavicular && analisisTopografico.nivelLesion === 'infraclavicular')) {
        factoresPositivos.push(`Nivel topográfico concordante (${analisisTopografico.nivelLesion})`);
        nivelConfianza += 8;
      }
  
      // Evaluar factores que disminuyen la confianza
      if (resultado.detalles.musculos.filter(m => !m.esperado && m.mrc === 5).length >= 3) {
        factoresNegativos.push("Músculos esperados normales");
        nivelConfianza -= 15;
      }
  
      if (resultado.detalles.sensibilidad.length === 0 && resultado.normalizedScore < 0.6) {
        factoresNegativos.push("Ausencia de alteraciones sensoriales");
        nivelConfianza -= 10;
      }
  
      if (informacionAdicional.faseEvolutiva === 'hiperaguda' && 
          resultado.detalles.musculos.filter(m => m.mrc < 5).length >= 5) {
        factoresNegativos.push("Debilidad extensa muy temprana (puede ser funcional)");
        nivelConfianza -= 20;
      }

      // NUEVO: Penalización por patrón parchado en lesión no-Parsonage
      if (analisisTopografico.patronDistribucion === 'parchado' && 
          !resultado.nombreLesion.includes('Parsonage')) {
        factoresNegativos.push("Distribución parchada no típica de esta lesión");
        nivelConfianza -= 10;
      }
  
      // Recomendaciones adicionales
      if (nivelConfianza < 60) {
        recomendacionesAdicionales.push("Considerar diagnósticos diferenciales");
        necesidadEstudios = true;
      }
  
      if (resultado.categoria === 'traumatica' && informacionAdicional.faseEvolutiva === 'aguda') {
        recomendacionesAdicionales.push("Evaluación urgente para cirugía reconstructiva");
        estudiosRecomendados.push("RMN de plexo braquial", "Electromiografía");
        necesidadEstudios = true;
      }
  
      if (resultado.categoria === 'obstetrica') {
        recomendacionesAdicionales.push("Seguimiento evolutivo estrecho");
        if (informacionAdicional.tiempoEvolucion && informacionAdicional.tiempoEvolucion > 90) {
          estudiosRecomendados.push("RMN de plexo braquial", "Evaluación quirúrgica");
          necesidadEstudios = true;
        }
      }
  
      if (resultado.severidadEsperada?.grado && resultado.severidadEsperada.grado >= 4) {
        recomendacionesAdicionales.push("Pronóstico reservado - considerar cirugía reconstructiva");
        estudiosRecomendados.push("TC de tórax", "RMN de plexo braquial", "Electromiografía seriada");
        necesidadEstudios = true;
      }
  
      // Normalizar nivel de confianza
      nivelConfianza = Math.max(0, Math.min(100, nivelConfianza));
  
      return {
        nivelConfianza: Math.round(nivelConfianza),
        factoresPositivos,
        factoresNegativos,
        recomendacionesAdicionales,
        necesidadEstudios,
        estudiosRecomendados: estudiosRecomendados.length > 0 ? estudiosRecomendados : undefined
      };
    };
  
  // Función para análisis temporal
  const realizarAnalisisTemporal = (
      datosEvaluacion: DatosEvaluacion
    ): AnalisisTemporal => {
      const { informacionAdicional } = datosEvaluacion;
      
      let faseEvolutiva = informacionAdicional.faseEvolutiva || 'aguda';
      
      // Auto-determinar fase si no está especificada
      if (!informacionAdicional.faseEvolutiva && informacionAdicional.tiempoEvolucion) {
        const dias = informacionAdicional.tiempoEvolucion;
        if (dias < 1) faseEvolutiva = 'hiperaguda';
        else if (dias <= 7) faseEvolutiva = 'aguda';
        else if (dias <= 84) faseEvolutiva = 'subaguda'; // 12 semanas
        else faseEvolutiva = 'cronica';
      }
  
      const factoresPronostico: string[] = [];
  
      // Factores pronósticos según fase
      switch (faseEvolutiva) {
        case 'hiperaguda':
          factoresPronostico.push(
            "Edema neural puede simular lesión severa",
            "Evaluación funcional puede ser poco confiable",
            "Potencial de recuperación espontánea alto"
          );
          break;
        case 'aguda':
          factoresPronostico.push(
            "Patrón de lesión se está definiendo",
            "Ventana crítica para intervenciones",
            "Estudios electrofisiológicos aún no confiables"
          );
          break;
        case 'subaguda':
          factoresPronostico.push(
            "Patrón de recuperación establecido",
            "Momento óptimo para estudios electrofisiológicos",
            "Decisión quirúrgica si no hay recuperación"
          );
          break;
        case 'cronica':
          factoresPronostico.push(
            "Recuperación espontánea improbable",
            "Considerar procedimientos reconstructivos",
            "Enfoque en maximizar función residual"
          );
          break;
      }
  
      // Factores adicionales según patrón de evolución
      if (informacionAdicional.patronEvolucion === 'deteriorando') {
        factoresPronostico.push("Deterioro progresivo - descartar causas secundarias");
      } else if (informacionAdicional.patronEvolucion === 'mejorando') {
        factoresPronostico.push("Evolución favorable - continuar tratamiento conservador");
      }
  
      return {
        faseEvolutiva,
        tiempoEvolucion: informacionAdicional.tiempoEvolucion,
        patronEvolucion: informacionAdicional.patronEvolucion,
        factoresPronostico
      };
    };
  
  // Función para obtener configuración adaptativa
  const obtenerConfiguracionAdaptativa = (datosEvaluacion: DatosEvaluacion) => {
      const contexto = datosEvaluacion.informacionAdicional.contextoClinico;
      const fase = datosEvaluacion.informacionAdicional.faseEvolutiva;
      
      // Configuración base
      let config = contexto && CONFIG_CONTEXTUAL[contexto] ? CONFIG_CONTEXTUAL[contexto] : CONFIG;
      
      // Ajustes temporales
      if (fase && AJUSTES_TEMPORALES[fase]) {
        const ajuste = AJUSTES_TEMPORALES[fase];
        config = {
          ...config,
          PESO_MUSCULOS: config.PESO_MUSCULOS * ajuste.multiplicadorMuscular,
          PESO_SENSIBILIDAD: config.PESO_SENSIBILIDAD * ajuste.multiplicadorSensorial,
          UMBRAL_COINCIDENCIA_GENERAL: config.UMBRAL_COINCIDENCIA_GENERAL + ajuste.umbralAjuste,
          UMBRAL_MINIMO_EXCLUSIVO: config.UMBRAL_MINIMO_EXCLUSIVO + ajuste.umbralAjuste
        };
      }
      
      return config;
    };
  
  
  // Función principal de cálculo diagnóstico (MEJORADA)
  export const runPlexusDiagnosis = (datosEvaluacion: DatosEvaluacion): ResultadoDiagnostico[] => {
      const { fuerzasMuscular, sintomasSeleccionados, areasSeleccionadas, reflejos, informacionAdicional } = datosEvaluacion;
      
      // Obtener configuración adaptativa
      const configAdaptativa = obtenerConfiguracionAdaptativa(datosEvaluacion);
      
      // Realizar análisis temporal
      const analisisTemporal = realizarAnalisisTemporal(datosEvaluacion);

      // NUEVO: Análisis topográfico avanzado
      const analisisTopografico = analizarNivelTopografico(fuerzasMuscular);
      
      const resultadosDetallados: ResultadoDiagnostico[] = LESIONES.map(lesion => {
        // Ajustar lesión por tipo de plexo
        const lesionAjustada = ajustarLesionPorTipoPlexo(lesion, informacionAdicional.tipoPlexo);
  
        // 1. Calcular Score de Músculos
        let muscleScore = 0;
        let totalMuscleWeight = 0;
        const muscleMatches: { nombre: string; mrc: number; esperado: boolean; peso: number }[] = [];
        let penalizacionMusculoNormal = 1.0;
  
        lesionAjustada.musculosClave.forEach(musculoClave => {
          const mrc = fuerzasMuscular[musculoClave.nombre];
          if (mrc !== undefined) {
            totalMuscleWeight += musculoClave.peso;
            
            const estaDebil = mrc < 5;
            
            if (estaDebil) {
              const contribucion = (5 - mrc) / 5;
              muscleScore += contribucion * musculoClave.peso;
              muscleMatches.push({ 
                nombre: musculoClave.nombre, 
                mrc, 
                esperado: true,
                peso: musculoClave.peso 
              });
            } else {
              penalizacionMusculoNormal *= configAdaptativa.PENALIZACION_MUSCULO_NORMAL;
              muscleMatches.push({ 
                nombre: musculoClave.nombre, 
                mrc, 
                esperado: false,
                peso: musculoClave.peso 
              });
            }
          }
        });
  
        const musculosEsperadosNombres = lesionAjustada.musculosClave.map(m => m.nombre);
        let penalizacionMusculosInesperados = 1.0;
        const musculosInesperadamenteDebiles: { nombre: string; mrc: number }[] = [];
        
        Object.keys(fuerzasMuscular).forEach(musculoNombre => {
          const mrc = fuerzasMuscular[musculoNombre];
          if (mrc < 5 && !musculosEsperadosNombres.includes(musculoNombre)) {
            penalizacionMusculosInesperados *= 0.9;
            musculosInesperadamenteDebiles.push({ nombre: musculoNombre, mrc });
          }
        });
  
        const normalizedMuscleScore = totalMuscleWeight > 0 ? 
          (muscleScore / totalMuscleWeight) * penalizacionMusculoNormal * penalizacionMusculosInesperados : 0;
  
        // 2. Calcular Score de Sensibilidad
        let sensitivityScore = 0;
        const sensitivityMatches: string[] = [];
        const totalSensitivityAreas = lesionAjustada.areasSensibilidad.length;
        
        if (totalSensitivityAreas > 0) {
          lesionAjustada.areasSensibilidad.forEach(area => {
            if (areasSeleccionadas.includes(area)) {
              sensitivityScore += 1;
              sensitivityMatches.push(area);
            }
          });
          sensitivityScore /= totalSensitivityAreas;
        }
  
        // 3. Calcular Score de Síntomas
        let symptomScore = 0;
        const symptomMatches: string[] = [];
        const totalSymptoms = lesionAjustada.sintomasClave.length;
        let hornerPresentAndExpected = false;
        
        if (totalSymptoms > 0) {
          lesionAjustada.sintomasClave.forEach(sintoma => {
            if (sintomasSeleccionados.includes(sintoma)) {
              symptomScore += 1;
              symptomMatches.push(sintoma);
              if (sintoma === "Signo de Horner") {
                hornerPresentAndExpected = true;
              }
            }
          });
          symptomScore /= totalSymptoms;
        }
  
        // 4. Calcular Score de Reflejos
        let reflexScore = 0;
        const reflexMatches: { nombre: string; esperado: string; encontrado: string; match: boolean }[] = [];
        const expectedReflexes = lesionAjustada.reflejosClave;
        const numReflexesDefined = Object.keys(expectedReflexes).length;
        let reflexMatchCount = 0;
        
        if (numReflexesDefined > 0) {
          for (const reflex in expectedReflexes) {
            const reflexKey = reflex as keyof typeof reflejos;
            const esperado = expectedReflexes[reflexKey];
            const encontrado = reflejos[reflexKey];
            const match = encontrado === esperado;
            
            if (match) {
              reflexMatchCount++;
            }
            
            reflexMatches.push({ 
              nombre: reflex, 
              esperado, 
              encontrado, 
              match 
            });
          }
          reflexScore = reflexMatchCount / numReflexesDefined;
        }
  
        // 5. Combinar Scores Ponderados
        let finalScore = (normalizedMuscleScore * configAdaptativa.PESO_MUSCULOS) +
                         (sensitivityScore * configAdaptativa.PESO_SENSIBILIDAD) +
                         (symptomScore * configAdaptativa.PESO_SINTOMAS) +
                         (reflexScore * configAdaptativa.PESO_REFLEJOS);
  
        if (hornerPresentAndExpected) {
          finalScore += configAdaptativa.PESO_HORNER;
        }
  
        const maxPossibleScore = configAdaptativa.PESO_MUSCULOS + configAdaptativa.PESO_SENSIBILIDAD + 
                                 configAdaptativa.PESO_SINTOMAS + configAdaptativa.PESO_REFLEJOS + 
                                 (lesion.sintomasClave.includes("Signo de Horner") ? configAdaptativa.PESO_HORNER : 0);
        const normalizedFinalScore = maxPossibleScore > 0 ? finalScore / maxPossibleScore : 0;

        // NUEVO: Bonus de exclusión negativa
        const bonusExclusion = calcularBonusExclusionNegativa(lesionAjustada, fuerzasMuscular);
  
        const umbralAplicable = lesionAjustada.exclusivos
          ? (lesionAjustada.umbralMinimo || configAdaptativa.UMBRAL_MINIMO_EXCLUSIVO)
          : configAdaptativa.UMBRAL_COINCIDENCIA_GENERAL;
  
        return {
          nombreLesion: lesionAjustada.nombre,
          score: finalScore,
          normalizedScore: Math.min(1.0, normalizedFinalScore + bonusExclusion),
          umbral: umbralAplicable,
          categoria: lesionAjustada.categoria,
          severidadEsperada: lesionAjustada.severidadEsperada,
          contextoClinico: lesionAjustada.contextoClinico,
          analisisTemporal,
          detalles: {
            musculos: muscleMatches,
            musculosInesperados: musculosInesperadamenteDebiles.length > 0 ? musculosInesperadamenteDebiles : undefined,
            sensibilidad: sensitivityMatches,
            sintomas: symptomMatches,
            reflejos: reflexMatches,
            nerviosPerifericos: lesionAjustada.nerviosPerifericos || []
          }
        };
      });
  
      const resultadosFiltrados = resultadosDetallados.filter(r => r.normalizedScore >= r.umbral);
  
      const resultadosConContexto = resultadosFiltrados.map(resultado => {
        let scoreFinal = resultado.normalizedScore;
        
        const esLesionContextual = ['iatrogena', 'obstetrica', 'traumatica'].includes(resultado.categoria);
        const tieneContextoClinico = informacionAdicional.contextoClinico;
        
        if (esLesionContextual && !tieneContextoClinico) {
          scoreFinal *= 0.3;
        } else if (esLesionContextual && tieneContextoClinico) {
          const contextosCompatibles: { [key: string]: string[] } = {
            'iatrogena': ['iatrogeno'],
            'obstetrica': ['obstetrico'],
            'traumatica': ['traumatico']
          };
          
          const esCompatible = contextosCompatibles[resultado.categoria]?.includes(tieneContextoClinico);
          if (!esCompatible) {
            scoreFinal *= 0.2;
          }
        }
        
        const esLesionTopografica = ['radicular', 'tronco', 'fasciculo', 'nervio_periferico'].includes(resultado.categoria);
        if (esLesionTopografica) {
          scoreFinal *= 1.2;
        }

        // NUEVO: Bonus por concordancia con análisis topográfico
        const esSupraclavicular = ['radicular', 'tronco'].includes(resultado.categoria);
        const esInfraclavicular = ['fasciculo', 'nervio_periferico'].includes(resultado.categoria);
        if ((esSupraclavicular && analisisTopografico.nivelLesion === 'supraclavicular') ||
            (esInfraclavicular && analisisTopografico.nivelLesion === 'infraclavicular')) {
          scoreFinal *= 1.1; // +10% por concordancia
        } else if ((esSupraclavicular && analisisTopografico.nivelLesion === 'infraclavicular') ||
                   (esInfraclavicular && analisisTopografico.nivelLesion === 'supraclavicular')) {
          scoreFinal *= 0.85; // -15% por discordancia
        }

        // NUEVO: Bonus por coherencia topográfica para Parsonage-Turner con patrón parchado
        if (resultado.nombreLesion.includes('Parsonage') && analisisTopografico.patronDistribucion === 'parchado') {
          scoreFinal *= 1.15; // +15% bonus si patrón es parchado
        }
        
        return {
          ...resultado,
          normalizedScore: Math.min(1.0, scoreFinal)
        };
      });
  
      const resultadosConIndicadores = resultadosConContexto.map(resultado => ({
        ...resultado,
        indicadoresConfianza: calcularIndicadoresConfianza(resultado, datosEvaluacion, analisisTopografico)
      }));
  
      const resultadosOrdenados = resultadosConIndicadores.sort((a, b) => {
        if (b.normalizedScore !== a.normalizedScore) {
          return b.normalizedScore - a.normalizedScore;
        }
        
        const prioridadTopografica: { [key: string]: number } = {
          'radicular': 4,
          'tronco': 3,
          'fasciculo': 2,
          'nervio_periferico': 1,
          'combinada': 0,
          'iatrogena': -1,
          'obstetrica': -1,
          'traumatica': -1
        };
        
        const prioridadA = prioridadTopografica[a.categoria] || 0;
        const prioridadB = prioridadTopografica[b.categoria] || 0;
        
        return prioridadB - prioridadA;
      });

      return resultadosOrdenados;
    };

  // =============================================
  // EXPORTACIONES DE ANÁLISIS AVANZADO
  // =============================================
  
  /** Ejecuta el análisis topográfico supra vs. infraclavicular */
  export { analizarNivelTopografico };

  /** Detecta red flags clínicas urgentes */
  export { detectarRedFlags };

  /** Genera recomendaciones de EMG/NCS para un diagnóstico */
  export { generarRecomendacionesEMG };

  /** Calcula el índice de discriminación entre los 2 diagnósticos más probables */
  export { calcularDiscriminacion };
