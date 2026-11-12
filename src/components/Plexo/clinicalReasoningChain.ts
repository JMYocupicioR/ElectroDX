import {
  LESIONES,
  type DatosEvaluacion,
  type ResultadoDiagnostico,
} from './plexoBraquial';
import {
  MUSCLE_REGIONS,
  TERRITORIO_NERVIO,
  TERRITORIO_RAIZ,
} from './plexusAnatomy';
import { analizarNiveles } from './plexusLevelAnalyzer';
import {
  calcularDiscriminacion,
  detectarRedFlags,
  generarRecomendacionesEMG,
} from './plexusDiagnosisEngine';

export interface PasoRazonamiento {
  numero: number;
  titulo: string;
  preguntaClinica: string;
  observacion: string;
  razonamiento: string;
  conclusion: string;
  pistaEducativa: string;
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

const getMusculosDebiles = (datos: DatosEvaluacion): { nombre: string; mrc: number }[] => {
  const evaluados = datos.musculosEvaluados ?? Object.keys(datos.fuerzasMuscular);
  return evaluados
    .filter(nombre => (datos.fuerzasMuscular[nombre] ?? 5) < 5)
    .map(nombre => ({ nombre, mrc: datos.fuerzasMuscular[nombre] ?? 5 }))
    .sort((a, b) => a.mrc - b.mrc);
};

const formatMRC = (musculos: { nombre: string; mrc: number }[]): string =>
  musculos.map(m => `${m.nombre} (MRC ${m.mrc}/5)`).join(', ');

const confianzaDesdeScore = (score: number): 'alta' | 'moderada' | 'baja' => {
  if (score >= 75) return 'alta';
  if (score >= 50) return 'moderada';
  return 'baja';
};

const colorDesdeConfianza = (confianza: 'alta' | 'moderada' | 'baja'): 'green' | 'amber' | 'red' => {
  if (confianza === 'alta') return 'green';
  if (confianza === 'moderada') return 'amber';
  return 'red';
};

export const generarCadenaRazonamiento = (
  datosEvaluacion: DatosEvaluacion,
  resultados: ResultadoDiagnostico[],
): CadenaRazonamiento => {
  const { fuerzasMuscular } = datosEvaluacion;
  const pasos: PasoRazonamiento[] = [];
  const topResult = resultados[0];
  const analisis = topResult?.analisisNiveles ?? analizarNiveles(resultados, datosEvaluacion);
  const nivel = analisis.nivelMasProbable;
  const nivelSecundario = analisis.nivelSecundario;

  const debiles = getMusculosDebiles(datosEvaluacion);
  const regionesAfectadas = Array.from(
    new Set(debiles.map(m => MUSCLE_REGIONS[m.nombre]).filter(Boolean)),
  );
  const tieneProximal = regionesAfectadas.some(region => region === 'escapular' || region === 'proximal');
  const tieneBrazo = regionesAfectadas.includes('brazo');
  const tieneDistal = regionesAfectadas.some(region => region === 'antebrazo' || region === 'mano');

  let distribucion = 'no definida';
  if (debiles.length > 0) {
    if (tieneProximal && tieneDistal) distribucion = 'mixta (proximal + distal)';
    else if (tieneProximal) distribucion = 'proximal';
    else if (tieneBrazo && tieneDistal) distribucion = 'braquial y distal';
    else if (tieneDistal) distribucion = 'distal';
    else distribucion = 'braquial';
  }

  const conclusionP1 = distribucion === 'proximal'
    ? 'Debilidad proximal: sugiere lesión alta (raíces C5-C6, tronco superior, supraescapular o axilar)'
    : distribucion === 'distal'
      ? 'Debilidad distal: sugiere lesión baja (C8-T1, tronco inferior, fascículo medial o nervio periférico)'
      : distribucion === 'mixta (proximal + distal)'
        ? 'Debilidad mixta: sugiere plexopatía extensa, lesión multitroncal o distribución parchada'
        : distribucion === 'braquial y distal'
          ? 'Debilidad braquial y distal: evaluar tronco medio, radial y nervios del antebrazo'
          : 'Datos insuficientes para definir la distribución';

  pasos.push({
    numero: 1,
    titulo: '¿Dónde está la debilidad?',
    preguntaClinica: '¿La debilidad predomina en hombro y brazo, en antebrazo y mano, o en ambos?',
    observacion: debiles.length > 0
      ? `Músculos débiles: ${formatMRC(debiles.slice(0, 6))}${debiles.length > 6 ? ` (+${debiles.length - 6} más)` : ''}`
      : 'No se detectó debilidad significativa',
    razonamiento: `Distribución ${distribucion}. Regiones afectadas: ${regionesAfectadas.join(', ') || 'ninguna'}.`,
    conclusion: conclusionP1,
    pistaEducativa: 'La distribución proximal frente a distal es el primer filtro topográfico. Una debilidad mixta obliga a considerar lesiones extensas o multifocales.',
    tipo: 'localizacion',
    confianza: debiles.length >= 2 ? 'alta' : 'baja',
    colorIndicador: debiles.length >= 2 ? 'green' : 'amber',
  });

  const probabilidadNivel = nivel ? Math.round(nivel.probabilidad * 100) : 0;
  const confianzaNivel = nivel?.confianza ?? 0;
  const coberturaNivel = nivel ? Math.round(nivel.cobertura * 100) : 0;
  const confianzaP2 = confianzaDesdeScore(confianzaNivel);

  pasos.push({
    numero: 2,
    titulo: '¿Qué nivel topográfico?',
    preguntaClinica: '¿La lesión se localiza en raíces, troncos, fascículos, nervios periféricos o es multifocal?',
    observacion: nivel
      ? [
          `Nivel más probable: ${nivel.etiqueta} (${probabilidadNivel}% del peso topográfico, confianza ${confianzaNivel}%, cobertura ${coberturaNivel}%)`,
          `Músculos afectados: ${nivel.musculosAfectados.join(', ') || 'ninguno'}`,
          nivel.musculosFaltantes.length > 0 ? `Músculos faltantes: ${nivel.musculosFaltantes.join(', ')}` : '',
          nivelSecundario ? `Alternativa: ${nivelSecundario.etiqueta} (${Math.round(nivelSecundario.probabilidad * 100)}%)` : '',
        ].filter(Boolean).join('\n')
      : 'No hay debilidad suficiente para estimar un nivel topográfico',
    razonamiento: 'El motor agrupa las lesiones por nivel anatómico y ajusta el mejor score de cada grupo según la cobertura muscular. No usa una regla binaria de escápula alada.',
    conclusion: nivel
      ? `Nivel más probable: ${nivel.etiqueta}. ${nivel.descripcion}.`
      : 'Nivel indeterminado con los datos actuales.',
    pistaEducativa: 'Los músculos pre-troncales (romboides, elevador de la escápula y serrato anterior) salen de las raíces antes de los troncos. Si están débiles favorecen una lesión radicular; si están normales con debilidad post-troncal favorecen una lesión troncal. La ausencia de escápula alada no descarta una lesión de raíz.',
    tipo: 'localizacion',
    confianza: confianzaP2,
    colorIndicador: colorDesdeConfianza(confianzaP2),
  });

  const lesionesNivel = nivel?.lesiones.slice(0, 3) ?? [];
  const lesionTop = lesionesNivel[0];
  const evidenciaNivel = nivel
    ? [
        nivel.evidenciaPositiva.length > 0 ? `A favor: ${nivel.evidenciaPositiva.join(', ')}` : '',
        nivel.evidenciaNegativa.length > 0 ? `En contra: ${nivel.evidenciaNegativa.join(', ')}` : '',
      ].filter(Boolean).join(' | ')
    : '';

  pasos.push({
    numero: 3,
    titulo: '¿Qué estructura específica?',
    preguntaClinica: 'Dentro del nivel más probable, ¿qué lesión explica mejor la combinación de músculos débiles y conservados?',
    observacion: [
      lesionesNivel.length > 0
        ? `Lesiones del nivel: ${lesionesNivel.map(l => `${l.nombre} (${Math.round(l.probabilidad * 100)}%)`).join('; ')}`
        : 'Sin lesiones compatibles dentro del nivel',
      evidenciaNivel,
    ].filter(Boolean).join('\n'),
    razonamiento: lesionTop
      ? `El mejor score del nivel corresponde a ${lesionTop.nombre}. La probabilidad mostrada es relativa al resto de lesiones del mismo nivel.`
      : 'No se pudo identificar una lesión dominante dentro del nivel.',
    conclusion: lesionTop
      ? `Estructura más probable: ${lesionTop.nombre} (${Math.round(lesionTop.probabilidad * 100)}% dentro del nivel)`
      : 'Sin estructura específica identificable',
    pistaEducativa: 'La discriminación dentro de un nivel depende de los músculos pivote. Si faltan músculos clave, el análisis debe interpretarse con cautela y completarse el examen.',
    tipo: 'discriminacion',
    confianza: lesionTop ? confianzaDesdeScore(confianzaNivel) : 'baja',
    colorIndicador: lesionTop ? colorDesdeConfianza(confianzaDesdeScore(confianzaNivel)) : 'red',
  });

  const raicesAfectadas = new Set<string>();
  const nerviosAfectados = new Map<string, string[]>();

  debiles.forEach(musculo => {
    const raiz = TERRITORIO_RAIZ[musculo.nombre];
    if (raiz) {
      raiz.split('-').forEach(segmento => raicesAfectadas.add(segmento.trim()));
    }

    const nervio = TERRITORIO_NERVIO[musculo.nombre];
    if (nervio) {
      const nervioPrincipal = nervio.replace(/ \(.*\)/, '');
      const acumulado = nerviosAfectados.get(nervioPrincipal) ?? [];
      acumulado.push(musculo.nombre);
      nerviosAfectados.set(nervioPrincipal, acumulado);
    }
  });

  const lesionDef = topResult
    ? LESIONES.find(lesion => lesion.nombre === topResult.nombreLesion)
    : undefined;
  const esperadosDebiles = lesionDef
    ? lesionDef.musculosClave
        .filter(musculo => (fuerzasMuscular[musculo.nombre] ?? 5) < 5)
        .map(musculo => musculo.nombre)
    : [];

  const nerviosListado = Array.from(nerviosAfectados.entries())
    .map(([nervio, musculos]) => `${nervio}: ${musculos.join(', ')}`)
    .join(' | ');

  pasos.push({
    numero: 4,
    titulo: '¿Qué raíces y nervios están comprometidos?',
    preguntaClinica: '¿A qué raíces y nervios corresponden los músculos débiles? ¿Coinciden con la lesión principal?',
    observacion: [
      `Raíces involucradas: ${Array.from(raicesAfectadas).sort().join(', ') || 'ninguna'}`,
      `Nervios involucrados: ${nerviosListado || 'no determinados'}`,
      `Músculos esperados y débiles en la lesión principal: ${esperadosDebiles.join(', ') || 'ninguno'}`,
    ].join('\n'),
    razonamiento: topResult
      ? `El patrón de territorios se compara con la anatomía esperada de ${topResult.nombreLesion}. ${esperadosDebiles.length} músculo(s) clave de esa lesión están débiles.`
      : 'No hay una lesión principal para comparar con el territorio de los músculos débiles.',
    conclusion: topResult
      ? `El territorio afectado es compatible con ${topResult.nombreLesion}.`
      : 'No se puede establecer una correlación anatómica clara.',
    pistaEducativa: 'C5-C6 explica hombro y flexión del codo; C7 explica extensión del codo y de la muñeca; C8-T1 explica la mano intrínseca. Si todo un nivel está afectado, pensar en raíz o tronco; si solo una parte, pensar en nervio periférico.',
    tipo: 'localizacion',
    confianza: topResult ? confianzaDesdeScore(confianzaNivel) : 'baja',
    colorIndicador: topResult ? colorDesdeConfianza(confianzaDesdeScore(confianzaNivel)) : 'amber',
  });

  const patron = analisis.patron;
  const confianzaP5 = patron === 'coherente' ? 'alta' : patron === 'parchado' ? 'moderada' : 'baja';

  pasos.push({
    numero: 5,
    titulo: '¿El patrón es coherente?',
    preguntaClinica: '¿La debilidad sigue regiones contiguas o hay saltos que sugieran un proceso multifocal?',
    observacion: [
      `Regiones afectadas: ${regionesAfectadas.join(', ') || 'ninguna'}`,
      `Patrón: ${patron}. Coherencia topográfica: ${analisis.coherencia}%.`,
      analisis.advertencias.length > 0 ? `Advertencias: ${analisis.advertencias.join('; ')}` : '',
    ].filter(Boolean).join('\n'),
    razonamiento: 'La coherencia se calcula con las regiones afectadas y los saltos entre ellas. Un patrón parchado o difuso reduce la confianza en una lesión focal única.',
    conclusion: patron === 'coherente'
      ? 'Distribución coherente con una lesión localizable.'
      : patron === 'parchado'
        ? 'Distribución parchada: considerar Parsonage-Turner, lesión multifocal o proceso infiltrativo.'
        : patron === 'difuso'
          ? 'Debilidad difusa: considerar plexopatía extensa o afectación de múltiples niveles.'
          : 'Patrón indeterminado por falta de debilidad o de cobertura.',
    pistaEducativa: 'Parsonage-Turner es el gran imitador parchado. Dolor neurítico intenso seguido de debilidad que no sigue un solo nervio debe hacer pensar en neuralgia amiotrófica.',
    tipo: 'discriminacion',
    confianza: confianzaP5,
    colorIndicador: colorDesdeConfianza(confianzaP5),
  });

  const discriminacion = calcularDiscriminacion(resultados, fuerzasMuscular);
  const confianzaP6 = discriminacion.esDiscriminativo ? 'alta' : 'moderada';

  pasos.push({
    numero: 6,
    titulo: 'Exclusión diferencial',
    preguntaClinica: '¿Por qué la lesión principal es más probable que la alternativa? ¿Qué músculos permiten diferenciarlas?',
    observacion: [
      `Principal: ${discriminacion.diagnosticoPrincipal}`,
      discriminacion.diagnosticoAlternativo ? `Alternativo: ${discriminacion.diagnosticoAlternativo}` : '',
      `Ratio de discriminación: ${discriminacion.ratio}x`,
      discriminacion.musculosPivot?.length
        ? `Músculos pivote: ${discriminacion.musculosPivot.join(', ')}`
        : '',
    ].filter(Boolean).join('\n'),
    razonamiento: discriminacion.mensaje,
    conclusion: discriminacion.esDiscriminativo
      ? `Discriminación suficiente a favor de ${discriminacion.diagnosticoPrincipal}.`
      : 'Discriminación incierta: completar los músculos pivote antes de concluir.',
    pistaEducativa: 'La exclusión diferencial es tan importante como la inclusión. Los músculos pivote están en un patrón y no en el otro, por lo que son los que más información aportan.',
    tipo: 'exclusion',
    confianza: confianzaP6,
    colorIndicador: colorDesdeConfianza(confianzaP6),
  });

  const redFlags = detectarRedFlags(resultados, datosEvaluacion);
  const recomendaciones = topResult ? generarRecomendacionesEMG(topResult) : undefined;

  const estudios = recomendaciones
    ? [
        ...recomendaciones.nerviosConduccion.map(
          nervio => `Conducción ${nervio.nervio} (${nervio.tipo}, ${nervio.prioridad})`,
        ),
        ...recomendaciones.musculosAguja.map(
          musculo => `Aguja ${musculo.musculo}: ${musculo.razon}`,
        ),
        ...(recomendaciones.pruebasEspeciales ?? []),
      ]
    : [];

  const confianzaGlobal = topResult?.indicadoresConfianza?.nivelConfianza
    ?? confianzaNivel
    ?? (topResult ? Math.round(topResult.normalizedScore * 100) : 0);
  const confianzaP7 = confianzaDesdeScore(confianzaGlobal);

  pasos.push({
    numero: 7,
    titulo: 'Confirmación: señales de alarma y plan EMG',
    preguntaClinica: '¿Hay señales de alarma que exijan acción urgente? ¿Qué estudios confirman el diagnóstico?',
    observacion: [
      redFlags.length > 0
        ? `Señales de alarma:\n${redFlags.map(flag => `[${flag.tipo}] ${flag.titulo}: ${flag.descripcion}. Acción: ${flag.accion}`).join('\n')}`
        : 'Sin señales de alarma detectadas.',
      estudios.length > 0
        ? `Plan EMG/NCS:\n${estudios.slice(0, 8).map((estudio, indice) => `${indice + 1}. ${estudio}`).join('\n')}`
        : '',
    ].filter(Boolean).join('\n\n'),
    razonamiento: topResult
      ? `El diagnóstico topográfico más probable es ${topResult.nombreLesion}. ${
          redFlags.length > 0 ? 'Hay señales de alarma que requieren acción inmediata.' : 'No hay alertas urgentes.'
        } Los estudios propuestos permiten confirmar o excluir la lesión.`
      : 'No se identificó un diagnóstico principal con los datos actuales.',
    conclusion: topResult
      ? `Diagnóstico topográfico: ${topResult.nombreLesion} (confianza ${confianzaGlobal}%).`
      : 'Diagnóstico topográfico no determinable con los datos actuales.',
    pistaEducativa: 'Los paraespinales cervicales diferencian raíz de tronco o fascículo. El SNAP del cutáneo medial del antebrazo ayuda a distinguir lesión preganglionar de postganglionar en C8-T1. El lado contralateral es el control. La EMG suele mostrar denervación activa a partir de las 3-4 semanas.',
    tipo: 'confirmacion',
    confianza: confianzaP7,
    colorIndicador: redFlags.length > 0 ? 'red' : colorDesdeConfianza(confianzaP7),
  });

  return {
    pasos,
    diagnosticoFinal: topResult?.nombreLesion || 'Indeterminado',
    resumenRazonamiento: [
      `Distribución: ${distribucion}`,
      `Nivel: ${nivel?.etiqueta || 'indeterminado'}`,
      `Patrón: ${patron}`,
      `Diagnóstico: ${topResult?.nombreLesion || 'N/A'} (${confianzaGlobal}%)`,
    ].join(' → '),
    nivelConfianzaGlobal: confianzaGlobal,
  };
};
