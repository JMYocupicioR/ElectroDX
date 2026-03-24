// clinicalReasoningChain.ts — Generador de Cadena de Razonamiento Clínico Guiado
// Transforma los datos del motor diagnóstico en una cadena pedagógica de 7 pasos
// que guía al alumno en el razonamiento clínico-anatómico de la lesión del plexo braquial.

import {
  LESIONES,
  type DatosEvaluacion,
  type ResultadoDiagnostico,
} from './plexoBraquial';

// =============================================
// TIPOS
// =============================================

export interface PasoRazonamiento {
  numero: number;
  titulo: string;
  preguntaClinica: string;
  observacion: string;           // Lo que los datos muestran
  razonamiento: string;          // La lógica clínica
  conclusion: string;            // Conclusión del paso
  pistaEducativa: string;        // Perla de enseñanza
  tipo: 'localizacion' | 'discriminacion' | 'exclusion' | 'confirmacion';
  confianza: 'alta' | 'moderada' | 'baja';
  colorIndicador: 'green' | 'amber' | 'red' | 'blue';
}

export interface CadenaRazonamiento {
  pasos: PasoRazonamiento[];
  diagnosticoFinal: string;
  resumenRazonamiento: string;
  nivelConfianzaGlobal: number;
}

// =============================================
// MAPAS ANATÓMICOS PARA RAZONAMIENTO
// =============================================

const MUSCULOS_PROXIMALES = ['Deltoides', 'Supraespinoso', 'Infraespinoso', 'Redondo Menor', 'Romboides', 'Elevador Escápula', 'Serrato Anterior'];
const MUSCULOS_MEDIOS = ['Bíceps Braquial', 'Tríceps Braquial', 'Braquial', 'Braquiorradial'];
const MUSCULOS_DISTALES = [
  'Extensor Carpi Radialis', 'Extensor de los Dedos', 'Extensor Carpi Ulnaris', 'Extensor Largo del Pulgar',
  'Flexor Carpi Radialis', 'Flexor Carpi Ulnaris', 'Pronador Redondo', 'Supinador',
  'Flexor Largo del Pulgar', 'Pronador Cuadrado', 'Flexor Profundo de los Dedos'
];
const MUSCULOS_INTRINSECOS = [
  'Interóseos Dorsales', 'Interóseos Palmares', 'Lumbricales 1 y 2', 'Lumbricales 3 y 4',
  'Abductor del Meñique', 'Aductor del Pulgar', 'Abductor Corto del Pulgar'
];

const MUSCULOS_ESCAPULARES = ['Romboides', 'Elevador Escápula', 'Serrato Anterior', 'Supraespinoso', 'Infraespinoso'];
const MUSCULOS_PRE_TRONCALES = ['Romboides', 'Elevador Escápula', 'Serrato Anterior'];

const TERRITORIO_NERVIO: { [musculo: string]: string } = {
  'Deltoides': 'Axilar', 'Redondo Menor': 'Axilar',
  'Bíceps Braquial': 'Musculocutáneo', 'Braquial': 'Musculocutáneo',
  'Tríceps Braquial': 'Radial', 'Braquiorradial': 'Radial', 'Extensor Carpi Radialis': 'Radial',
  'Extensor de los Dedos': 'Radial (PIN)', 'Extensor Carpi Ulnaris': 'Radial (PIN)',
  'Extensor Largo del Pulgar': 'Radial (PIN)', 'Supinador': 'Radial (PIN)',
  'Flexor Carpi Radialis': 'Mediano', 'Pronador Redondo': 'Mediano',
  'Flexor Largo del Pulgar': 'Mediano (NIA)', 'Pronador Cuadrado': 'Mediano (NIA)',
  'Abductor Corto del Pulgar': 'Mediano', 'Lumbricales 1 y 2': 'Mediano',
  'Flexor Carpi Ulnaris': 'Ulnar', 'Interóseos Dorsales': 'Ulnar', 'Interóseos Palmares': 'Ulnar',
  'Lumbricales 3 y 4': 'Ulnar', 'Abductor del Meñique': 'Ulnar', 'Aductor del Pulgar': 'Ulnar',
  'Supraespinoso': 'Supraescapular', 'Infraespinoso': 'Supraescapular',
  'Serrato Anterior': 'Torácico Largo', 'Romboides': 'Dorsal Escápula', 'Elevador Escápula': 'Dorsal Escápula',
};

const TERRITORIO_RAIZ: { [musculo: string]: string } = {
  'Deltoides': 'C5-C6', 'Supraespinoso': 'C5-C6', 'Infraespinoso': 'C5-C6', 'Redondo Menor': 'C5-C6',
  'Bíceps Braquial': 'C5-C6', 'Braquial': 'C5-C6', 'Braquiorradial': 'C5-C6',
  'Serrato Anterior': 'C5-C7', 'Romboides': 'C5', 'Elevador Escápula': 'C3-C5',
  'Tríceps Braquial': 'C7-C8', 'Extensor Carpi Radialis': 'C6-C7', 'Extensor de los Dedos': 'C7-C8',
  'Pronador Redondo': 'C6-C7', 'Flexor Carpi Radialis': 'C6-C7',
  'Flexor Largo del Pulgar': 'C8-T1', 'Pronador Cuadrado': 'C8-T1',
  'Flexor Carpi Ulnaris': 'C8-T1', 'Interóseos Dorsales': 'C8-T1',
  'Abductor del Meñique': 'C8-T1', 'Abductor Corto del Pulgar': 'C8-T1',
  'Aductor del Pulgar': 'C8-T1',
};

// =============================================
// HELPERS
// =============================================

const getMusculosDebiles = (fuerzas: { [m: string]: number }): { nombre: string; mrc: number }[] =>
  Object.entries(fuerzas)
    .filter(([_, mrc]) => mrc < 5)
    .map(([nombre, mrc]) => ({ nombre, mrc }))
    .sort((a, b) => a.mrc - b.mrc);

const getMusculosNormales = (fuerzas: { [m: string]: number }): string[] =>
  Object.entries(fuerzas)
    .filter(([_, mrc]) => mrc === 5)
    .map(([nombre]) => nombre);

const formatMRC = (debiles: { nombre: string; mrc: number }[]): string =>
  debiles.map(m => `${m.nombre} (MRC ${m.mrc}/5)`).join(', ');

// =============================================
// GENERADOR DE CADENA DE RAZONAMIENTO
// =============================================

export const generarCadenaRazonamiento = (
  datosEvaluacion: DatosEvaluacion,
  resultados: ResultadoDiagnostico[]
): CadenaRazonamiento => {
  const { fuerzasMuscular, sintomasSeleccionados, reflejos } = datosEvaluacion;
  const pasos: PasoRazonamiento[] = [];
  const topResult = resultados[0];
  const topResult2 = resultados[1];

  const debiles = getMusculosDebiles(fuerzasMuscular);
  const normales = getMusculosNormales(fuerzasMuscular);

  // ─────────────────────────────────────────────
  // PASO 1: ¿Dónde está la debilidad?
  // ─────────────────────────────────────────────
  const proximalesDebiles = debiles.filter(m => MUSCULOS_PROXIMALES.includes(m.nombre));
  const mediosDebiles = debiles.filter(m => MUSCULOS_MEDIOS.includes(m.nombre));
  const distalesDebiles = debiles.filter(m => MUSCULOS_DISTALES.includes(m.nombre));
  const intrinsecosDebiles = debiles.filter(m => MUSCULOS_INTRINSECOS.includes(m.nombre));

  let distribucionDebilidad: string;
  let conclusionP1: string;
  if (proximalesDebiles.length > 0 && intrinsecosDebiles.length === 0 && distalesDebiles.length === 0) {
    distribucionDebilidad = 'proximal pura';
    conclusionP1 = 'Debilidad PROXIMAL — sugiere lesión alta (tronco superior, raíces C5-C6, o N. supraescapular/axilar)';
  } else if (proximalesDebiles.length === 0 && (distalesDebiles.length > 0 || intrinsecosDebiles.length > 0)) {
    distribucionDebilidad = 'distal pura';
    conclusionP1 = 'Debilidad DISTAL — sugiere lesión baja (tronco inferior, fascículo medial, o neuropatía periférica)';
  } else if (proximalesDebiles.length > 0 && (distalesDebiles.length > 0 || intrinsecosDebiles.length > 0)) {
    distribucionDebilidad = 'mixta (proximal + distal)';
    conclusionP1 = 'Debilidad MIXTA — sugiere lesión extensa (plexopatía total, multitroncal) o distribución parchada (Parsonage-Turner)';
  } else if (mediosDebiles.length > 0) {
    distribucionDebilidad = 'media (brazo/antebrazo proximal)';
    conclusionP1 = 'Debilidad media predominante — evaluar tronco medio (C7) o nervios extensores';
  } else {
    distribucionDebilidad = 'no definida';
    conclusionP1 = 'Datos insuficientes para determinar distribución';
  }

  pasos.push({
    numero: 1,
    titulo: '¿Dónde está la debilidad?',
    preguntaClinica: 'Observa los músculos débiles. ¿La debilidad es predominantemente proximal (hombro/brazo), distal (antebrazo/mano), o mixta?',
    observacion: debiles.length > 0
      ? `Músculos débiles: ${formatMRC(debiles.slice(0, 6))}${debiles.length > 6 ? ` (+${debiles.length - 6} más)` : ''}`
      : 'No se detectó debilidad significativa',
    razonamiento: `La distribución es ${distribucionDebilidad}. Proximales afectados: ${proximalesDebiles.length}, medios: ${mediosDebiles.length}, distales: ${distalesDebiles.length + intrinsecosDebiles.length}.`,
    conclusion: conclusionP1,
    pistaEducativa: 'La distribución proximal vs distal es el primer filtro: proximal → C5-C6/tronco superior. Distal → C8-T1/tronco inferior. Mixta → plexopatía extensa o parchada.',
    tipo: 'localizacion',
    confianza: debiles.length >= 2 ? 'alta' : 'baja',
    colorIndicador: debiles.length >= 2 ? 'green' : 'amber',
  });

  // ─────────────────────────────────────────────
  // PASO 2: ¿Supra o Infraclavicular?
  // ─────────────────────────────────────────────
  const escapularesDebiles = debiles.filter(m => MUSCULOS_ESCAPULARES.includes(m.nombre));
  const escapularesNormales = normales.filter(m => MUSCULOS_ESCAPULARES.includes(m));
  const hayDebilidadNoEscapular = debiles.some(m => !MUSCULOS_ESCAPULARES.includes(m.nombre));

  let nivelLesion: string;
  let conclusionP2: string;
  let confianzaP2: 'alta' | 'moderada' | 'baja';

  if (escapularesDebiles.length > 0) {
    nivelLesion = 'SUPRACLAVICULAR';
    conclusionP2 = `Nivel: SUPRACLAVICULAR — ${escapularesDebiles.length} músculo(s) escapular(es) débil(es): ${formatMRC(escapularesDebiles)}`;
    confianzaP2 = escapularesDebiles.length >= 2 ? 'alta' : 'moderada';
  } else if (escapularesNormales.length >= 2 && hayDebilidadNoEscapular) {
    nivelLesion = 'INFRACLAVICULAR';
    conclusionP2 = `Nivel: INFRACLAVICULAR — Escapulares NORMALES (${escapularesNormales.join(', ')}) con debilidad periférica`;
    confianzaP2 = 'alta';
  } else {
    nivelLesion = 'INDETERMINADO';
    conclusionP2 = 'Nivel indeterminado — no se evaluaron suficientes músculos escapulares para discriminar';
    confianzaP2 = 'baja';
  }

  pasos.push({
    numero: 2,
    titulo: '¿Supraclavicular o Infraclavicular?',
    preguntaClinica: '¿Los músculos del hombro y escápula (romboides, serrato anterior, supra/infraespinoso) están afectados? Si SÍ → supraclavicular. Si NORMALES → infraclavicular.',
    observacion: escapularesDebiles.length > 0
      ? `Escapulares DÉBILES: ${formatMRC(escapularesDebiles)}`
      : escapularesNormales.length > 0
        ? `Escapulares evaluados y NORMALES: ${escapularesNormales.join(', ')}`
        : 'No se evaluaron músculos escapulares',
    razonamiento: 'Los músculos escapulares (serrato anterior, romboides, supra/infraespinoso) son inervados por nervios que salen ANTES de la clavícula. Si están débiles, la lesión está ARRIBA de la clavícula (raíz o tronco). Si están normales pero hay debilidad distal, la lesión está ABAJO de la clavícula (fascículo o nervio terminal).',
    conclusion: conclusionP2,
    pistaEducativa: '🔑 REGLA DE ORO: Los escapulares son la "línea divisoria". Débil = supraclavicular. Normal con debilidad distal = infraclavicular. Sin escápula alada = probablemente NO es raíz C5-C7.',
    tipo: 'localizacion',
    confianza: confianzaP2,
    colorIndicador: confianzaP2 === 'alta' ? 'green' : confianzaP2 === 'moderada' ? 'amber' : 'red',
  });

  // ─────────────────────────────────────────────
  // PASO 3: ¿Raíz o Tronco? (solo si supraclavicular)
  // ─────────────────────────────────────────────
  const preTroncalesDebiles = debiles.filter(m => MUSCULOS_PRE_TRONCALES.includes(m.nombre));
  const preTroncalesNormales = normales.filter(m => MUSCULOS_PRE_TRONCALES.includes(m));

  let subnivelSupra: string;
  let conclusionP3: string;
  let pistaP3: string;

  if (nivelLesion === 'SUPRACLAVICULAR') {
    if (preTroncalesDebiles.length > 0) {
      subnivelSupra = 'RADICULAR (pre-troncal)';
      conclusionP3 = `Subnivel: RADICULAR — Los pre-troncales están débiles (${formatMRC(preTroncalesDebiles)}). La lesión es A NIVEL DE LA RAÍZ, antes de la formación del tronco.`;
      pistaP3 = '🔬 Los músculos pre-troncales (romboides, serrato anterior, elevador escápula) reciben inervación directa de las RAÍCES, antes de que formen troncos. Si están débiles → la lesión es radicular. En lesiones troncales, estos músculos están NORMALES porque sus nervios ya salieron antes del tronco.';
    } else if (preTroncalesNormales.length > 0) {
      subnivelSupra = 'TRONCAL (post-raíz)';
      conclusionP3 = `Subnivel: TRONCAL — Pre-troncales normales (${preTroncalesNormales.join(', ')}) pero escapulares post-troncales débiles → lesión a nivel del TRONCO.`;
      pistaP3 = '🔬 Si el supra/infraespinoso están débiles pero romboides y serrato están NORMALES → la lesión es TRONCAL (N. supraescapular sale del tronco superior, pero N. dorsal escápula y torácico largo salen antes del tronco).';
    } else {
      subnivelSupra = 'INDETERMINADO';
      conclusionP3 = 'No se evaluaron pre-troncales — no se puede diferenciar raíz de tronco con estos datos.';
      pistaP3 = '⚠️ Para diferenciar RAÍZ de TRONCO, se necesitan romboides, serrato anterior y elevador de escápula. Si no se evaluaron, agrégalos al examen.';
    }
  } else if (nivelLesion === 'INFRACLAVICULAR') {
    // Determinar fascicular vs nervio terminal
    const territoriosDebiles = new Set<string>();
    debiles.forEach(m => {
      const nervio = TERRITORIO_NERVIO[m.nombre];
      if (nervio) {
        // Normalizar a nervio principal
        const nervioPrincipal = nervio.replace(/ \(.*\)/, '');
        territoriosDebiles.add(nervioPrincipal);
      }
    });

    if (territoriosDebiles.size === 1) {
      const nervioUnico = [...territoriosDebiles][0];
      subnivelSupra = `NERVIO TERMINAL (${nervioUnico})`;
      conclusionP3 = `Subnivel: MONONEUROPATÍA del ${nervioUnico} — Todos los músculos débiles pertenecen al territorio de un solo nervio.`;
      pistaP3 = `🔬 Distribución de un solo nervio (${nervioUnico}) = MONONEUROPATÍA. Confirma con estudios de conducción nerviosa del nervio afectado comparando con contralateral.`;
    } else if (territoriosDebiles.size >= 2) {
      subnivelSupra = 'FASCICULAR';
      conclusionP3 = `Subnivel: FASCICULAR — Múltiples territorios nerviosos afectados (${[...territoriosDebiles].join(', ')}). La lesión está a nivel del fascículo donde convergen estos nervios.`;
      pistaP3 = `🔬 Múltiples territorios nerviosos = lesión FASCICULAR (lateral, medial o posterior). Recuerda: F. Lateral → mediano sensitivo + musculocutáneo. F. Medial → mediano motor + ulnar. F. Posterior → radial + axilar.`;
    } else {
      subnivelSupra = 'INDETERMINADO';
      conclusionP3 = 'No se pueden determinar los territorios nerviosos con los datos disponibles.';
      pistaP3 = 'Evalúa más músculos de diferentes nervios para localizar el nivel infraclavicular.';
    }
  } else {
    subnivelSupra = 'NO APLICABLE';
    conclusionP3 = 'Nivel no determinado en paso anterior — no se puede sub-clasificar.';
    pistaP3 = 'Regresa al paso 2 y asegúrate de evaluar músculos escapulares para determinar el nivel.';
  }

  pasos.push({
    numero: 3,
    titulo: nivelLesion === 'INFRACLAVICULAR' ? '¿Fascicular o Nervio Terminal?' : '¿Raíz o Tronco?',
    preguntaClinica: nivelLesion === 'SUPRACLAVICULAR'
      ? '¿Los músculos pre-troncales (romboides, serrato anterior, elevador escápula) están débiles? Si SÍ → raíz. Si NORMALES → tronco.'
      : '¿Los músculos débiles siguen el territorio de UN solo nervio o de MÚLTIPLES nervios?',
    observacion: nivelLesion === 'SUPRACLAVICULAR'
      ? preTroncalesDebiles.length > 0
        ? `Pre-troncales DÉBILES: ${formatMRC(preTroncalesDebiles)}`
        : preTroncalesNormales.length > 0
          ? `Pre-troncales NORMALES: ${preTroncalesNormales.join(', ')}`
          : 'Pre-troncales no evaluados'
      : `Territorios nerviosos afectados: ${subnivelSupra}`,
    razonamiento: conclusionP3,
    conclusion: `Subnivel determinado: ${subnivelSupra}`,
    pistaEducativa: pistaP3,
    tipo: 'discriminacion',
    confianza: subnivelSupra.includes('INDETERMINADO') ? 'baja' : 'alta',
    colorIndicador: subnivelSupra.includes('INDETERMINADO') ? 'red' : 'green',
  });

  // ─────────────────────────────────────────────
  // PASO 4: ¿Qué raíces/tronco/fascículo?
  // ─────────────────────────────────────────────
  const raicesAfectadas = new Set<string>();
  debiles.forEach(m => {
    const raiz = TERRITORIO_RAIZ[m.nombre];
    if (raiz) {
      raiz.split('-').forEach(r => raicesAfectadas.add(r.trim()));
    }
  });

  const nerviosAfectados = new Map<string, string[]>();
  debiles.forEach(m => {
    const nervio = TERRITORIO_NERVIO[m.nombre];
    if (nervio) {
      const nervioPrincipal = nervio.replace(/ \(.*\)/, '');
      if (!nerviosAfectados.has(nervioPrincipal)) nerviosAfectados.set(nervioPrincipal, []);
      nerviosAfectados.get(nervioPrincipal)!.push(m.nombre);
    }
  });

  const nerviosListado = [...nerviosAfectados.entries()]
    .map(([n, musculos]) => `${n}: ${musculos.join(', ')}`)
    .join(' | ');

  pasos.push({
    numero: 4,
    titulo: '¿Qué estructura específica?',
    preguntaClinica: '¿A qué raíces, tronco o nervio corresponden los músculos débiles? Mapea cada músculo a su inervación para identificar la estructura lesionada.',
    observacion: `Raíces involucradas: ${[...raicesAfectadas].sort().join(', ') || 'ninguna'}\nNervios involucrados: ${nerviosListado || 'no determinados'}`,
    razonamiento: topResult
      ? `El diagnóstico más probable (${topResult.nombreLesion}) implica las raíces/estructura: ${[...raicesAfectadas].sort().join(', ')}. ${
          topResult.detalles.musculos.filter(m => m.esperado).length
        } de los músculos débiles coinciden con este patrón.`
      : 'No se encontró un patrón diagnóstico compatible.',
    conclusion: topResult
      ? `Estructura más probable: ${topResult.nombreLesion} (score ${Math.round(topResult.normalizedScore * 100)}%)`
      : 'Sin diagnóstico topográfico claro',
    pistaEducativa: '📐 REGLA: C5-C6 = hombro + codo flexión. C7 = codo extensión + muñeca extensión. C8-T1 = mano intrínseca. Si TODO un nivel radicular está débil → radiculopatía o tronco. Si solo PARTE de un nivel → nervio periférico.',
    tipo: 'localizacion',
    confianza: topResult && topResult.normalizedScore > 0.5 ? 'alta' : 'moderada',
    colorIndicador: topResult && topResult.normalizedScore > 0.5 ? 'green' : 'amber',
  });

  // ─────────────────────────────────────────────
  // PASO 5: ¿Coherencia topográfica?
  // ─────────────────────────────────────────────
  const regiones = {
    proximal: debiles.filter(m => MUSCULOS_PROXIMALES.includes(m.nombre)).length,
    medio: debiles.filter(m => MUSCULOS_MEDIOS.includes(m.nombre)).length,
    distal: debiles.filter(m => MUSCULOS_DISTALES.includes(m.nombre)).length,
    intrinseco: debiles.filter(m => MUSCULOS_INTRINSECOS.includes(m.nombre)).length,
  };

  const regionesConDebilidad = Object.entries(regiones).filter(([_, n]) => n > 0).map(([r]) => r);
  const tieneGaps = (regiones.proximal > 0 && regiones.proximal > 0 && regiones.medio === 0 && (regiones.distal > 0 || regiones.intrinseco > 0));
  
  let patronCoherencia: string;
  let conclusionP5: string;

  if (regionesConDebilidad.length <= 1) {
    patronCoherencia = 'COHERENTE (una sola región)';
    conclusionP5 = 'Distribución coherente en una sola región anatómica — compatible con lesión focal.';
  } else if (tieneGaps) {
    patronCoherencia = 'PARCHADO (saltos entre regiones)';
    conclusionP5 = '⚠️ Distribución PARCHADA: hay debilidad proximal Y distal con región media preservada. Esto NO sigue un solo nervio/raíz. Considerar: Parsonage-Turner, lesión multifocal, o proceso infiltrativo.';
  } else if (regionesConDebilidad.length >= 3) {
    patronCoherencia = 'DIFUSO (múltiples regiones contiguas)';
    conclusionP5 = 'Distribución difusa — sugiere lesión extensa (plexopatía total) o proceso sistémico.';
  } else {
    patronCoherencia = 'COHERENTE (regiones contiguas)';
    conclusionP5 = 'Distribución coherente en regiones contiguas — compatible con lesión anatómica localizable.';
  }

  pasos.push({
    numero: 5,
    titulo: '¿Coherencia topográfica?',
    preguntaClinica: '¿Los músculos débiles siguen un patrón anatómico coherente (todas las regiones contiguas), o hay "saltos" entre regiones?',
    observacion: `Regiones afectadas: ${regionesConDebilidad.join(', ') || 'ninguna'} (proximal: ${regiones.proximal}, medio: ${regiones.medio}, distal: ${regiones.distal}, intrínseco: ${regiones.intrinseco})`,
    razonamiento: `Patrón: ${patronCoherencia}. ${regionesConDebilidad.length} regiones anatómicas tienen al menos un músculo débil.`,
    conclusion: conclusionP5,
    pistaEducativa: '🎯 PARSONAGE-TURNER = el "gran imitador" parchado. Si hay dolor neurítico intenso seguido de debilidad en distribución que NO sigue un solo nervio (ej: serrato + supraescapular + NIA simultáneamente), piensa en neuralgia amiotrófica.',
    tipo: 'discriminacion',
    confianza: tieneGaps ? 'moderada' : 'alta',
    colorIndicador: tieneGaps ? 'amber' : 'green',
  });

  // ─────────────────────────────────────────────
  // PASO 6: Exclusión diferencial
  // ─────────────────────────────────────────────
  const exclusiones: string[] = [];

  if (topResult && topResult2) {
    // ¿Por qué el top1 y no el top2?
    const musculosTop1 = new Set(LESIONES.find(l => l.nombre === topResult.nombreLesion)?.musculosClave.map(m => m.nombre) || []);
    const musculosTop2 = new Set(LESIONES.find(l => l.nombre === topResult2.nombreLesion)?.musculosClave.map(m => m.nombre) || []);

    // Músculos que favorecen top1 sobre top2
    const favorecenTop1: string[] = [];
    const favorecenTop2: string[] = [];

    musculosTop1.forEach(m => {
      if (!musculosTop2.has(m) && fuerzasMuscular[m] !== undefined && fuerzasMuscular[m] < 5) {
        favorecenTop1.push(`${m} débil (esperado en ${topResult.nombreLesion}, NO en ${topResult2.nombreLesion})`);
      }
    });

    musculosTop2.forEach(m => {
      if (!musculosTop1.has(m) && fuerzasMuscular[m] !== undefined && fuerzasMuscular[m] === 5) {
        favorecenTop1.push(`${m} NORMAL (sería débil en ${topResult2.nombreLesion})`);
      }
    });

    musculosTop2.forEach(m => {
      if (!musculosTop1.has(m) && fuerzasMuscular[m] !== undefined && fuerzasMuscular[m] < 5) {
        favorecenTop2.push(`${m} débil favorece ${topResult2.nombreLesion}`);
      }
    });

    if (favorecenTop1.length > 0) exclusiones.push(...favorecenTop1.slice(0, 3));
    if (favorecenTop2.length > 0) exclusiones.push(`Nota: ${favorecenTop2.slice(0, 2).join('; ')}`);
  }

  // Exclusiones por reflejos
  const reflexAnormales = Object.entries(reflejos).filter(([_, v]) => v !== 'normal');


  if (reflexAnormales.length > 0) {
    exclusiones.push(`Reflejos alterados (${reflexAnormales.map(([r, v]) => `${r}: ${v}`).join(', ')}) consistentes con el nivel lesionado`);
  }

  // Exclusiones por síntomas
  if (sintomasSeleccionados.includes('Signo de Horner')) {
    exclusiones.push('Horner presente → EXCLUYE lesión de tronco superior puro. Incluye: C8-T1 / tronco inferior');
  }
  if (sintomasSeleccionados.includes('Escápula Alada')) {
    exclusiones.push('Escápula alada → incluye: N. Torácico Largo, Parsonage-Turner. Excluye: lesiones puramente distales');
  }

  pasos.push({
    numero: 6,
    titulo: 'Exclusión diferencial',
    preguntaClinica: `¿Por qué ${topResult?.nombreLesion || 'este diagnóstico'} y NO ${topResult2?.nombreLesion || 'el alternativo'}? ¿Qué hallazgos específicos los diferencian?`,
    observacion: exclusiones.length > 0
      ? exclusiones.map((e, i) => `${i + 1}. ${e}`).join('\n')
      : 'Sin datos suficientes para comparación diferencial detallada',
    razonamiento: topResult && topResult2
      ? `${topResult.nombreLesion} (${Math.round(topResult.normalizedScore * 100)}%) vs ${topResult2.nombreLesion} (${Math.round(topResult2.normalizedScore * 100)}%). Ratio de discriminación: ${(topResult.normalizedScore / (topResult2.normalizedScore || 0.01)).toFixed(1)}x.`
      : 'Solo un diagnóstico en el diferencial.',
    conclusion: topResult && topResult2 && topResult.normalizedScore / (topResult2.normalizedScore || 0.01) >= 1.5
      ? `Discriminación CLARA: ${topResult.nombreLesion} se diferencia bien del alternativo.`
      : topResult && topResult2
        ? `⚠️ Discriminación INCIERTA: los 2 diagnósticos están muy cerca. Evalúa los músculos pivote listados arriba para diferenciar.`
        : 'Diagnóstico único.',
    pistaEducativa: '🔄 La exclusión diferencial es TAN importante como la inclusión. Siempre pregúntate: "¿qué hallazgo EXCLUYE el segundo diagnóstico más probable?" Los músculos pivote son aquellos que están en un patrón pero NO en el otro.',
    tipo: 'exclusion',
    confianza: exclusiones.length >= 2 ? 'alta' : 'moderada',
    colorIndicador: exclusiones.length >= 2 ? 'green' : 'amber',
  });

  // ─────────────────────────────────────────────
  // PASO 7: Confirmación + Red Flags + EMG
  // ─────────────────────────────────────────────
  const redFlags: string[] = [];
  if (sintomasSeleccionados.includes('Signo de Horner') && sintomasSeleccionados.includes('Dolor Neurítico')) {
    redFlags.push('🚨 Horner + Dolor: descartar Pancoast (TC tórax urgente)');
  }
  if (sintomasSeleccionados.includes('Fasciculaciones') && sintomasSeleccionados.includes('Atrofia Muscular')) {
    redFlags.push('🚨 Fasciculaciones + Atrofia: descartar enfermedad de motoneurona');
  }
  if (sintomasSeleccionados.includes('Escápula Alada') && sintomasSeleccionados.includes('Dolor Neurítico')) {
    redFlags.push('💡 Dolor + Escápula Alada: altamente sugestivo de Parsonage-Turner');
  }

  const estudiosEMG: string[] = [];
  if (topResult) {
    const lesionDef = LESIONES.find(l => l.nombre === topResult.nombreLesion);
    if (lesionDef) {
      // Nervios clave para conducción
      (lesionDef.nerviosPerifericos || []).forEach(n => {
        estudiosEMG.push(`Conducción: N. ${n} (motor + sensitivo)`);
      });
      // Músculos clave para aguja
      lesionDef.musculosClave.slice(0, 3).forEach(m => {
        estudiosEMG.push(`Aguja: ${m.nombre} (${TERRITORIO_NERVIO[m.nombre] || ''} / ${TERRITORIO_RAIZ[m.nombre] || ''})`);
      });
      estudiosEMG.push('Aguja: Paraespinales cervicales (diferenciar raíz de tronco/fascículo)');
    }
  }

  pasos.push({
    numero: 7,
    titulo: 'Confirmación: Red Flags + Plan EMG',
    preguntaClinica: '¿Hay señales de alarma que requieran acción urgente? ¿Qué estudios EMG/NCS confirmarán el diagnóstico?',
    observacion: [
      redFlags.length > 0 ? `RED FLAGS:\n${redFlags.join('\n')}` : 'Sin red flags detectadas.',
      estudiosEMG.length > 0 ? `\nPLAN DE ESTUDIO EMG/NCS:\n${estudiosEMG.map((e, i) => `${i + 1}. ${e}`).join('\n')}` : ''
    ].join('\n'),
    razonamiento: `El diagnóstico topográfico más probable es: ${topResult?.nombreLesion || 'indeterminado'}. ${
      redFlags.length > 0 ? 'HAY RED FLAGS — requiere acción inmediata.' : 'Sin alertas urgentes.'
    } Los estudios EMG/NCS propuestos confirmarán/excluirán este diagnóstico.`,
    conclusion: topResult
      ? `✅ DIAGNÓSTICO TOPOGRÁFICO: ${topResult.nombreLesion} (confianza: ${Math.round(topResult.normalizedScore * 100)}%)`
      : '❌ Diagnóstico topográfico no determinable con los datos actuales.',
    pistaEducativa: '📋 NUNCA olvides: 1) Paraespinales cervicales diferencian RAÍZ de TRONCO/FASCÍCULO. 2) SNAP del cut. med. antebrazo diferencia pre de postganglionar en C8-T1. 3) El lado contralateral siempre es tu control. 4) El estudio EMG se hace 3-4 semanas después de la lesión para ver denervación activa.',
    tipo: 'confirmacion',
    confianza: topResult && topResult.normalizedScore > 0.5 ? 'alta' : 'moderada',
    colorIndicador: redFlags.length > 0 ? 'red' : topResult && topResult.normalizedScore > 0.5 ? 'green' : 'amber',
  });

  // ─────────────────────────────────────────────
  // RESUMEN
  // ─────────────────────────────────────────────
  const confianzaGlobal = topResult ? Math.round(topResult.normalizedScore * 100) : 0;

  return {
    pasos,
    diagnosticoFinal: topResult?.nombreLesion || 'Indeterminado',
    resumenRazonamiento: [
      `Distribución: ${distribucionDebilidad}`,
      `Nivel: ${nivelLesion}`,
      `Subnivel: ${subnivelSupra}`,
      `Coherencia: ${patronCoherencia}`,
      `Diagnóstico: ${topResult?.nombreLesion || 'N/A'} (${confianzaGlobal}%)`,
    ].join(' → '),
    nivelConfianzaGlobal: confianzaGlobal,
  };
};
