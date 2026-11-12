import type {
  AnalisisNiveles,
  DatosEvaluacion,
  LesionNivel,
  NivelLesion,
  NivelResultado,
  ResultadoDiagnostico,
} from './plexoBraquial';
import { LEVELS, MUSCLE_REGIONS, getLesionLevel } from './plexusAnatomy';

const ORDEN_REGIONES = ['escapular', 'proximal', 'brazo', 'antebrazo', 'mano'] as const;

const clamp = (valor: number): number => Math.max(0, Math.min(100, valor));

const estaEvaluado = (nombre: string, datos: DatosEvaluacion): boolean => {
  if (datos.musculosEvaluados) {
    return datos.musculosEvaluados.includes(nombre);
  }
  return datos.fuerzasMuscular[nombre] !== undefined;
};

const mrcDe = (nombre: string, datos: DatosEvaluacion): number =>
  datos.fuerzasMuscular[nombre] ?? 5;

const regionDe = (nombre: string): (typeof ORDEN_REGIONES)[number] | undefined => {
  const region = MUSCLE_REGIONS[nombre];
  return ORDEN_REGIONES.includes(region as (typeof ORDEN_REGIONES)[number])
    ? (region as (typeof ORDEN_REGIONES)[number])
    : undefined;
};

interface GrupoNivel {
  nivel: NivelLesion;
  resultados: ResultadoDiagnostico[];
  musculosClave: string[];
  musculosEvaluados: string[];
  musculosFaltantes: string[];
  musculosAfectados: string[];
  cobertura: number;
  score: number;
  scoreAjustado: number;
  probabilidad: number;
  confianza: number;
  lesiones: LesionNivel[];
  evidenciaPositiva: string[];
  evidenciaNegativa: string[];
  advertencias: string[];
}

const construirGrupo = (
  nivel: NivelLesion,
  resultados: ResultadoDiagnostico[],
  datos: DatosEvaluacion,
): GrupoNivel => {
  const mejorResultado = resultados.reduce((mejor, resultado) =>
    resultado.normalizedScore > mejor.normalizedScore ? resultado : mejor,
  );

  const clave = Array.from(
    new Set(
      mejorResultado.detalles.musculos
        .filter(musculo => musculo.esperado)
        .map(musculo => musculo.nombre),
    ),
  );

  const evaluados = clave.filter(musculo => estaEvaluado(musculo, datos));
  const faltantes = clave.filter(musculo => !estaEvaluado(musculo, datos));
  const afectados = evaluados.filter(musculo => mrcDe(musculo, datos) <= 3);
  const cobertura = clave.length > 0 ? evaluados.length / clave.length : 0;
  const score = mejorResultado.normalizedScore;
  const scoreAjustado = score * (0.65 + 0.35 * cobertura);
  const totalScore = resultados.reduce((suma, resultado) => suma + resultado.normalizedScore, 0);

  const lesiones: LesionNivel[] = resultados
    .slice()
    .sort((a, b) => b.normalizedScore - a.normalizedScore)
    .map(resultado => ({
      nombre: resultado.nombreLesion,
      score: resultado.normalizedScore,
      probabilidad: totalScore > 0 ? resultado.normalizedScore / totalScore : 0,
    }));

  const evidenciaPositiva = afectados
    .slice(0, 6)
    .map(musculo => `${musculo} (MRC ${mrcDe(musculo, datos)})`);

  const evidenciaNegativa = evaluados
    .filter(musculo => mrcDe(musculo, datos) >= 4)
    .slice(0, 6)
    .map(musculo => `${musculo} conservado`);

  const advertencias: string[] = [];
  if (faltantes.length > 0) {
    const muestra = faltantes.slice(0, 4).join(', ');
    const resto = faltantes.length > 4 ? ` y ${faltantes.length - 4} más` : '';
    advertencias.push(`Cobertura incompleta: faltan ${muestra}${resto}`);
  }
  if (afectados.length === 0) {
    advertencias.push('Sin debilidad en los músculos clave de este nivel');
  }
  if (cobertura < 0.5) {
    advertencias.push('Cobertura menor al 50% en este nivel');
  }

  return {
    nivel,
    resultados,
    musculosClave: clave,
    musculosEvaluados: evaluados,
    musculosFaltantes: faltantes,
    musculosAfectados: afectados,
    cobertura,
    score,
    scoreAjustado,
    probabilidad: 0,
    confianza: 0,
    lesiones,
    evidenciaPositiva,
    evidenciaNegativa,
    advertencias,
  };
};

export const analizarNiveles = (
  resultados: ResultadoDiagnostico[],
  datos: DatosEvaluacion,
): AnalisisNiveles => {
  const grupos = new Map<NivelLesion, ResultadoDiagnostico[]>();

  for (const resultado of resultados) {
    const nivel = getLesionLevel(resultado.nombreLesion);
    const acumulado = grupos.get(nivel) ?? [];
    acumulado.push(resultado);
    grupos.set(nivel, acumulado);
  }

  const construidos = Array.from(grupos.entries())
    .map(([nivel, resultadosNivel]) => construirGrupo(nivel, resultadosNivel, datos))
    .filter(grupo => grupo.score > 0);

  const totalAjustado = construidos.reduce((suma, grupo) => suma + grupo.scoreAjustado, 0);

  for (const grupo of construidos) {
    grupo.probabilidad = totalAjustado > 0 ? grupo.scoreAjustado / totalAjustado : 0;
  }

  for (const grupo of construidos) {
    const segundo = construidos
      .filter(otro => otro.nivel !== grupo.nivel)
      .reduce((maximo, otro) => Math.max(maximo, otro.probabilidad), 0);
    const margen = Math.max(0, grupo.probabilidad - segundo);
    grupo.confianza = clamp(
      Math.round(30 + 45 * grupo.probabilidad + 25 * grupo.cobertura + Math.min(15, margen * 30)),
    );
  }

  construidos.sort((a, b) => b.scoreAjustado - a.scoreAjustado);

  const niveles: NivelResultado[] = construidos.map(grupo => ({
    nivel: grupo.nivel,
    etiqueta: LEVELS.find(nivel => nivel.id === grupo.nivel)?.etiqueta ?? grupo.nivel,
    descripcion: LEVELS.find(nivel => nivel.id === grupo.nivel)?.descripcion ?? '',
    score: grupo.score,
    scoreAjustado: grupo.scoreAjustado,
    probabilidad: grupo.probabilidad,
    confianza: grupo.confianza,
    cobertura: grupo.cobertura,
    lesiones: grupo.lesiones,
    evidenciaPositiva: grupo.evidenciaPositiva,
    evidenciaNegativa: grupo.evidenciaNegativa,
    advertencias: grupo.advertencias,
    musculosClave: grupo.musculosClave,
    musculosEvaluados: grupo.musculosEvaluados,
    musculosAfectados: grupo.musculosAfectados,
    musculosFaltantes: grupo.musculosFaltantes,
  }));

  const nivelMasProbable = niveles[0] ?? null;
  const nivelSecundario = niveles[1];

  const evaluadosGlobal = datos.musculosEvaluados ?? Object.keys(datos.fuerzasMuscular);
  const afectadosGlobal = evaluadosGlobal.filter(musculo => mrcDe(musculo, datos) <= 3);
  const regionesAfectadas = new Set(
    afectadosGlobal.map(musculo => regionDe(musculo)).filter((region): region is (typeof ORDEN_REGIONES)[number] => region !== undefined),
  );
  const indices = ORDEN_REGIONES
    .map((region, indice) => (regionesAfectadas.has(region) ? indice : -1))
    .filter(indice => indice >= 0);
  const span = indices.length > 0 ? indices[indices.length - 1] - indices[0] + 1 : 0;
  const huecos = span - indices.length;
  const coherencia = indices.length <= 1 ? 1 : Math.max(0, 1 - huecos / span);

  let patron: AnalisisNiveles['patron'] = 'indeterminado';
  if (afectadosGlobal.length > 0) {
    if (regionesAfectadas.size >= 4 || afectadosGlobal.length > 12) {
      patron = 'difuso';
    } else if (nivelMasProbable?.nivel === 'multifocal' || huecos > 0) {
      patron = 'parchado';
    } else {
      patron = 'coherente';
    }
  }

  const coberturaGlobal =
    Object.keys(MUSCLE_REGIONS).length > 0
      ? evaluadosGlobal.length / Object.keys(MUSCLE_REGIONS).length
      : 0;

  const advertencias = [...(nivelMasProbable?.advertencias ?? [])];
  if (patron === 'parchado') {
    advertencias.push('Distribución parchada: la debilidad no sigue un territorio continuo');
  }
  if (patron === 'difuso') {
    advertencias.push(
      `Debilidad difusa en ${afectadosGlobal.length} músculos; considerar plexopatía extensa o multifocal`,
    );
  }
  if (coberturaGlobal < 0.5) {
    advertencias.push(`Cobertura global baja (${Math.round(coberturaGlobal * 100)}%)`);
  }

  return {
    nivelMasProbable,
    nivelSecundario,
    niveles,
    coherencia: Math.round(coherencia * 100),
    patron,
    evidenciaPositiva: nivelMasProbable?.evidenciaPositiva ?? [],
    evidenciaNegativa: nivelMasProbable?.evidenciaNegativa ?? [],
    advertencias,
    cobertura: Math.round(coberturaGlobal * 100),
  };
};
