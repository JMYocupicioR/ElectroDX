/**
 * Copiar a src/lib/brand.config.ts y reemplazar los valores.
 * Hoy varios de estos strings siguen hardcodeados (ver customize-map.md).
 * Este archivo es el contrato de marca de una instancia nueva.
 */
export const brand = {
  productName: "Nombre del Curso",
  shortName: "Curso",
  legalName: "Institución o Director",
  tagline: "Programa de formación profesional.",
  defaultCourseSlug: "slug-del-curso",
  defaultCourseTitle: "Título público del curso",
  certificate: {
    folioPrefix: "CERT-",
    hours: "40",
    issuedBy: "Director del Curso",
    institutionalText:
      "Se otorga el presente certificado por haber completado satisfactoriamente el programa.",
    signers: [{ name: "Director del Curso", role: "Director", signature_url: null }],
    primaryColor: "#0ea5e9",
  },
  pwa: {
    name: "Nombre del Curso",
    shortName: "Curso",
    description: "Plataforma educativa.",
    themeColor: "#00b4d8",
    backgroundColor: "#0f172a",
    iconPath: "/logos/logo.png",
  },
  urls: {
    supportEmail: "soporte@ejemplo.com",
  },
} as const
