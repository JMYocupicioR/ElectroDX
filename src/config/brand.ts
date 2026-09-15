/**
 * Configuración central de marca e identidad institucional
 * ElectoDX Diplomado - Plataforma de Posgrado en Electrodiagnóstico y Neurofisiología Clínica
 */

export const BRAND = {
  /** Nombre completo de la plataforma y diplomado */
  name: 'ElectoDX Diplomado',

  /** Nombre corto para insignias, favicons y menús reducidos */
  shortName: 'ElectoDX',

  /** Letras para monogramas y logotipos simplificados */
  monogram: 'EDX',

  /** Sufijo o badge secundario */
  badge: 'Diplomado',

  /** Título extendido para acreditaciones y kardex oficial */
  academicTitle: 'Diplomado de Posgrado en Electrodiagnóstico y Electromiografía Clínica',

  /**
   * Switch maestro de acreditación oficial (COMEFYR / COMFEFYR).
   * En `false` mientras el trámite formal de aval se encuentre en proceso.
   * Cambiar a `true` para reactivar instantáneamente todas las insignias,
   * menciones y constancias oficiales en toda la aplicación.
   */
  enableAccreditation: false,

  /** Institución que otorga el aval */
  accreditation: 'Aval Oficial COMEFYR',
  accreditationFull: 'Colegio Mexicano de Medicina de Rehabilitación A.C. (COMEFYR)',

  /** Textos institucionales neutros utilizados mientras el aval está en trámite */
  accreditationPending: 'Programa Académico de Posgrado',
  accreditationPendingFull: 'Programa de Posgrado y Formación Médica Continua en Electrodiagnóstico',

  /** Subtítulo institucional y propuesta de valor */
  tagline: 'Plataforma Integral de Formación en Electrodiagnóstico y Neurofisiología Clínica',

  /** Versión del motor clínico */
  engineName: 'ElectoDX Engine v2',

  /** Paleta de colores oficial de la identidad */
  colors: {
    primary: '#2563eb', // Cobalto eléctrico
    primaryDark: '#1d4ed8',
    secondary: '#06b6d4', // Cian bioeléctrico
    darkBg: '#0b1329', // Ónix zafiro
    accent: '#38bdf8',
  },
} as const;
