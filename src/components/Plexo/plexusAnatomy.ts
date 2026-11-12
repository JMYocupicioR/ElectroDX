import type { NivelLesion } from './plexoBraquial';

export type RegionMuscular = 'escapular' | 'proximal' | 'brazo' | 'antebrazo' | 'mano';

export interface MusculoAnatomia {
  nombre: string;
  region: RegionMuscular;
  nervio: string;
  raices: string;
  preTroncal?: boolean;
  escapular?: boolean;
}

export interface NivelDef {
  id: NivelLesion;
  etiqueta: string;
  descripcion: string;
}

export const LEVELS: NivelDef[] = [
  { id: 'radicular', etiqueta: 'Radicular', descripcion: 'Raíces C5-T1 antes de formar los troncos' },
  { id: 'tronco', etiqueta: 'Troncal', descripcion: 'Troncos superior, medio o inferior' },
  { id: 'fasciculo', etiqueta: 'Fascicular', descripcion: 'Fascículos lateral, medial o posterior' },
  { id: 'nervio_periferico', etiqueta: 'Nervio periférico', descripcion: 'Nervios terminales del plexo' },
  { id: 'multifocal', etiqueta: 'Multifocal', descripcion: 'Distribución parchada o de varios niveles' },
];

export const MUSCLE_ANATOMY: MusculoAnatomia[] = [
  { nombre: 'Deltoides', region: 'proximal', nervio: 'Axilar', raices: 'C5-C6' },
  { nombre: 'Supraespinoso', region: 'proximal', nervio: 'Supraescapular', raices: 'C5-C6' },
  { nombre: 'Infraespinoso', region: 'proximal', nervio: 'Supraescapular', raices: 'C5-C6' },
  { nombre: 'Redondo Menor', region: 'proximal', nervio: 'Axilar', raices: 'C5-C6' },
  { nombre: 'Bíceps Braquial', region: 'brazo', nervio: 'Musculocutáneo', raices: 'C5-C6' },
  { nombre: 'Tríceps Braquial', region: 'brazo', nervio: 'Radial', raices: 'C7-C8' },
  { nombre: 'Braquial', region: 'brazo', nervio: 'Musculocutáneo', raices: 'C5-C6' },
  { nombre: 'Braquiorradial', region: 'antebrazo', nervio: 'Radial', raices: 'C5-C6' },
  { nombre: 'Extensor Carpi Radialis', region: 'antebrazo', nervio: 'Radial', raices: 'C6-C7' },
  { nombre: 'Extensor de los Dedos', region: 'antebrazo', nervio: 'Radial (PIN)', raices: 'C7-C8' },
  { nombre: 'Extensor Carpi Ulnaris', region: 'antebrazo', nervio: 'Radial (PIN)', raices: 'C7-C8' },
  { nombre: 'Extensor Largo del Pulgar', region: 'antebrazo', nervio: 'Radial (PIN)', raices: 'C7-C8' },
  { nombre: 'Flexor Carpi Radialis', region: 'antebrazo', nervio: 'Mediano', raices: 'C6-C7' },
  { nombre: 'Flexor Carpi Ulnaris', region: 'antebrazo', nervio: 'Ulnar', raices: 'C8-T1' },
  { nombre: 'Flexor Profundo de los Dedos', region: 'antebrazo', nervio: 'Mediano/Ulnar', raices: 'C8-T1' },
  { nombre: 'Flexor Largo del Pulgar', region: 'antebrazo', nervio: 'Mediano (NIA)', raices: 'C8-T1' },
  { nombre: 'Pronador Redondo', region: 'antebrazo', nervio: 'Mediano', raices: 'C6-C7' },
  { nombre: 'Pronador Cuadrado', region: 'antebrazo', nervio: 'Mediano (NIA)', raices: 'C8-T1' },
  { nombre: 'Supinador', region: 'antebrazo', nervio: 'Radial (PIN)', raices: 'C6-C7' },
  { nombre: 'Interóseos Dorsales', region: 'mano', nervio: 'Ulnar', raices: 'C8-T1' },
  { nombre: 'Interóseos Palmares', region: 'mano', nervio: 'Ulnar', raices: 'C8-T1' },
  { nombre: 'Lumbricales 1 y 2', region: 'mano', nervio: 'Mediano', raices: 'C8-T1' },
  { nombre: 'Lumbricales 3 y 4', region: 'mano', nervio: 'Ulnar', raices: 'C8-T1' },
  { nombre: 'Abductor del Meñique', region: 'mano', nervio: 'Ulnar', raices: 'C8-T1' },
  { nombre: 'Oponente del Meñique', region: 'mano', nervio: 'Ulnar', raices: 'C8-T1' },
  { nombre: 'Flexor Corto del Meñique', region: 'mano', nervio: 'Ulnar', raices: 'C8-T1' },
  { nombre: 'Abductor Corto del Pulgar', region: 'mano', nervio: 'Mediano', raices: 'C8-T1' },
  { nombre: 'Aductor del Pulgar', region: 'mano', nervio: 'Ulnar', raices: 'C8-T1' },
  { nombre: 'Flexor Corto del Pulgar', region: 'mano', nervio: 'Mediano/Ulnar', raices: 'C8-T1' },
  { nombre: 'Subclavio', region: 'proximal', nervio: 'Subclavio', raices: 'C5-C6' },
  { nombre: 'Romboides', region: 'escapular', nervio: 'Dorsal Escápula', raices: 'C5', preTroncal: true, escapular: true },
  { nombre: 'Elevador Escápula', region: 'escapular', nervio: 'Dorsal Escápula', raices: 'C3-C5', preTroncal: true, escapular: true },
  { nombre: 'Serrato Anterior', region: 'escapular', nervio: 'Torácico Largo', raices: 'C5-C7', preTroncal: true, escapular: true },
  { nombre: 'Pectoral Mayor (Porción Clavicular)', region: 'proximal', nervio: 'Pectoral Lateral', raices: 'C5-C7' },
  { nombre: 'Dorsal Ancho', region: 'proximal', nervio: 'Toracodorsal', raices: 'C6-C8' },
  { nombre: 'Trapecio Superior', region: 'escapular', nervio: 'Espinal XI', raices: 'C3-C4', escapular: true },
];

export const MUSCLE_REGIONS: Record<string, RegionMuscular> = Object.fromEntries(
  MUSCLE_ANATOMY.map(m => [m.nombre, m.region])
);

export const TERRITORIO_NERVIO: Record<string, string> = Object.fromEntries(
  MUSCLE_ANATOMY.map(m => [m.nombre, m.nervio])
);

export const TERRITORIO_RAIZ: Record<string, string> = Object.fromEntries(
  MUSCLE_ANATOMY.map(m => [m.nombre, m.raices])
);

export const MUSCULOS_PRE_TRONCALES = MUSCLE_ANATOMY
  .filter(m => m.preTroncal)
  .map(m => m.nombre);

export const MUSCULOS_ESCAPULARES = MUSCLE_ANATOMY
  .filter(m => m.escapular)
  .map(m => m.nombre);

export const LESION_LEVELS: Record<string, NivelLesion> = {
  'Lesión de Raíz C5': 'radicular',
  'Lesión de Raíz C6': 'radicular',
  'Lesión de Raíz C7': 'radicular',
  'Lesión de Raíz C8': 'radicular',
  'Lesión de Raíz T1': 'radicular',
  'Lesión de Tronco Superior (C5-C6) - Erb-Duchenne': 'tronco',
  'Lesión de Tronco Inferior (C8-T1) - Klumpke': 'tronco',
  'Lesión de Tronco Medio (C7)': 'tronco',
  'Lesión de Tronco Superior + Medio (C5-C7)': 'tronco',
  'Lesión de Fascículo Lateral': 'fasciculo',
  'Lesión de Fascículo Medial': 'fasciculo',
  'Lesión de Fascículo Posterior': 'fasciculo',
  'Lesión de Fascículo Lateral + Medial': 'fasciculo',
  'Lesión de Fascículo Lateral + Posterior': 'fasciculo',
  'Neuropatía del Nervio Axilar': 'nervio_periferico',
  'Neuropatía del Nervio Musculocutáneo': 'nervio_periferico',
  'Neuropatía del Nervio Radial (Proximal)': 'nervio_periferico',
  'Neuropatía del Nervio Mediano (Proximal)': 'nervio_periferico',
  'Neuropatía del Nervio Ulnar (Proximal)': 'nervio_periferico',
  'Neuropatía del Nervio Supraescapular': 'nervio_periferico',
  'Neuropatía del Nervio Torácico Largo': 'nervio_periferico',
  'Neuropatía del Nervio Interóseo Anterior (Kiloh-Nevin)': 'nervio_periferico',
  'Neuropatía del Nervio Interóseo Posterior (PIN)': 'nervio_periferico',
  'Neuropatía del Nervio Radial (Distal / Surco Espiral)': 'nervio_periferico',
  'Neuropatía del Nervio Mediano Distal (STC)': 'nervio_periferico',
  'Neuropatía del Nervio Ulnar a Nivel del Codo': 'nervio_periferico',
  'Neuropatía del Nervio Ulnar a Nivel de la Muñeca (Guyon)': 'nervio_periferico',
  'Avulsión Total del Plexo Braquial (C5-T1)': 'multifocal',
  'Lesión Obstétrica Erb-Duchenne + Axilar': 'tronco',
  'Lesión Traumática C8-T1 con Horner': 'tronco',
  'Lesión Iatrogénica Post-Cirugía de Hombro': 'nervio_periferico',
  'Síndrome del Desfiladero Torácico Neurogénico': 'tronco',
  'Lesión por Radiación (Plexopatía Actínica)': 'multifocal',
  'Parálisis Braquial Obstétrica Total (C5-T1)': 'multifocal',
  'Síndrome de Parsonage-Turner (Neuralgia Amiotrófica)': 'multifocal',
  'Plexopatía Neoplásica (Infiltración Tumoral)': 'tronco',
};

export const getLesionLevel = (nombre: string): NivelLesion =>
  LESION_LEVELS[nombre] ?? 'multifocal';

export const getNivelDef = (nivel: NivelLesion): NivelDef | undefined =>
  LEVELS.find(l => l.id === nivel);
