import { describe, expect, it } from 'vitest';
import {
  CASOS_CLINICOS_DEMO,
  INERVACION_DUAL,
  LESIONES,
  MUSCULOS_EVALUACION,
  type DatosEvaluacion,
} from '../plexoBraquial';
import { LESION_LEVELS, getLesionLevel } from '../plexusAnatomy';
import { runPlexusDiagnosis } from '../plexusDiagnosisEngine';

const REFLEJOS_NORMALES = {
  bicipital: 'normal' as const,
  braquiorradial: 'normal' as const,
  tricipital: 'normal' as const,
};

const crearDatos = (
  fuerzas: Record<string, number>,
  extras: Partial<DatosEvaluacion> = {},
): DatosEvaluacion => ({
  fuerzasMuscular: {
    ...Object.fromEntries(MUSCULOS_EVALUACION.map(musculo => [musculo, 5])),
    ...fuerzas,
  },
  musculosEvaluados: Object.keys(fuerzas),
  sintomasSeleccionados: [],
  areasSeleccionadas: [],
  reflejos: REFLEJOS_NORMALES,
  informacionAdicional: {
    mecanismo: '',
    evolucion: '',
    tipoPlexo: 'normal',
  },
  ...extras,
});

const datosDesdeCaso = (nombre: string): DatosEvaluacion => {
  const caso = CASOS_CLINICOS_DEMO[nombre];
  return crearDatos(caso.musculos, {
    sintomasSeleccionados: caso.sintomas,
    areasSeleccionadas: caso.sensibilidad,
    reflejos: caso.reflejos,
    informacionAdicional: caso.informacionAdicional,
  });
};

describe('runPlexusDiagnosis', () => {
  const casosDemo = Object.values(CASOS_CLINICOS_DEMO);

  it.each(casosDemo.map(caso => [caso.nombre, caso] as const))(
    'caso demo %s sugiere el diagnóstico esperado',
    (_nombre, caso) => {
      const resultados = runPlexusDiagnosis(datosDesdeCaso(caso.nombre));

      expect(resultados.length).toBeGreaterThan(0);
      expect(resultados[0].nombreLesion).toBe(caso.diagnosticoEsperado);
    },
  );

  it('no fuerza un nivel infraclavicular cuando los escapulares están conservados', () => {
    const datos = crearDatos({
      'Tríceps Braquial': 2,
      'Extensor de los Dedos': 2,
      'Extensor Carpi Radialis': 2,
      'Extensor Carpi Ulnaris': 2,
      'Flexor Carpi Radialis': 4,
      'Pronador Redondo': 4,
    });

    const [resultado] = runPlexusDiagnosis(datos);

    expect(resultado).toBeDefined();
    expect(['radicular', 'tronco']).toContain(resultado.nivel);
    expect(resultado.nivel).not.toBe('nervio_periferico');
    expect(resultado.nivel).not.toBe('fasciculo');
  });

  it('marca músculos no evaluados y calcula cobertura parcial', () => {
    const datos = crearDatos({
      'Deltoides': 0,
      'Supraespinoso': 2,
      'Infraespinoso': 2,
      'Bíceps Braquial': 4,
    });

    const [resultado] = runPlexusDiagnosis(datos);

    expect(resultado).toBeDefined();
    expect(resultado.detalles.musculosFaltantes?.length).toBeGreaterThan(0);
    expect(resultado.detalles.coberturaMuscular).toBeLessThan(1);
    expect(resultado.analisisNiveles).toBeDefined();
    expect(resultado.analisisNiveles?.nivelMasProbable).toBeDefined();
  });
});

describe('integridad del catálogo anatómico', () => {
  it('mapea todas las lesiones a un nivel topográfico', () => {
    for (const lesion of LESIONES) {
      expect(LESION_LEVELS[lesion.nombre], lesion.nombre).toBeDefined();
      expect(getLesionLevel(lesion.nombre)).toBe(LESION_LEVELS[lesion.nombre]);
    }
  });

  it('las claves de INERVACION_DUAL existen en el catálogo de músculos', () => {
    for (const musculo of Object.keys(INERVACION_DUAL)) {
      expect(MUSCULOS_EVALUACION).toContain(musculo);
    }
  });
});
