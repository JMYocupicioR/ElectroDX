/**
 * Servicio de Verificación Oficial de Cédula Profesional ante la Dirección General de Profesiones (SEP México)
 * NeuroSAFEMX - Plataforma de Posgrado Médico COMEFYR
 */
import { supabase } from '../lib/supabase';

export interface RawSepCedulaRecord {
  cedula: string;
  tipo?: string;
  anioRegistro?: string;
  fechaExpedicion?: string;
  nombre: string;
  primerApellido: string;
  segundoApellido?: string;
  genero?: string;
  curp?: string | null;
  nivelEducativo?: string;
  profesion: string;
  institucion: string;
  entidadInstitucion?: string;
}

export interface CedulaVerificationResult {
  found: boolean;
  cedula: string;
  fullName: string;
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  profession: string;
  rawProfession: string;
  institution: string;
  registrationYear: string;
  type: string;
  isMedical: boolean;
  suggestedCategory?: 'resident' | 'specialist_rehab' | 'neurophysiologist' | 'other_doctor';
  rawData?: RawSepCedulaRecord;
  error?: string;
}

/**
 * Convierte cadenas en MAYÚSCULAS a formato Título respetando acentos y preposiciones en español.
 */
export function toSpanishTitleCase(str?: string | null): string {
  if (!str) return '';
  const lowercaseWords = new Set([
    'de',
    'del',
    'la',
    'las',
    'el',
    'los',
    'en',
    'y',
    'o',
    'para',
    'por',
    'con',
    'a',
    'e',
  ]);

  const acronyms = new Set([
    'UNAM',
    'IPN',
    'UANL',
    'UADY',
    'UDG',
    'UASLP',
    'BUAP',
    'UV',
    'UAEM',
    'UACH',
    'ITESM',
    'IMSS',
    'ISSSTE',
    'SEDENA',
    'SEMAR',
    'INR',
    'INNN',
    'COMEFYR',
    'SEP',
    'CDMX',
  ]);

  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      const upper = word.toUpperCase();
      if (acronyms.has(upper)) return upper;
      if (index > 0 && lowercaseWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Consulta la base de datos de la SEP México para verificar una cédula profesional
 */
export async function verifyCedula(cedulaInput: string): Promise<CedulaVerificationResult> {
  const cleanCedula = (cedulaInput || '').replace(/\D/g, '').trim();

  if (!cleanCedula) {
    return {
      found: false,
      cedula: '',
      fullName: '',
      firstName: '',
      paternalSurname: '',
      maternalSurname: '',
      profession: '',
      rawProfession: '',
      institution: '',
      registrationYear: '',
      type: '',
      isMedical: false,
      error: 'Por favor ingresa un número de cédula válido.',
    };
  }

  if (cleanCedula.length < 5 || cleanCedula.length > 10) {
    return {
      found: false,
      cedula: cleanCedula,
      fullName: '',
      firstName: '',
      paternalSurname: '',
      maternalSurname: '',
      profession: '',
      rawProfession: '',
      institution: '',
      registrationYear: '',
      type: '',
      isMedical: false,
      error: 'La cédula debe contener entre 6 y 8 dígitos numéricos.',
    };
  }

  try {
    let items: RawSepCedulaRecord[] | null = null;

    // 1. Intentar con el endpoint de backend proxy local / Netlify
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const resp = await fetch(`/api/verify-cedula?cedula=${cleanCedula}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const json = await resp.json();
        if (json.success && Array.isArray(json.items)) {
          items = json.items;
        }
      }
    } catch {
      // Fallback si la ruta relativa falla
    }

    // 2. Si no respondió /api/verify-cedula, intentar invocar Supabase Edge Function
    if (!items) {
      try {
        const { data, error } = await supabase.functions.invoke('verify-cedula', {
          body: { cedula: cleanCedula },
        });
        if (!error && data?.success && Array.isArray(data.items)) {
          items = data.items;
        }
      } catch {
        // Fallback
      }
    }

    if (!items) {
      return {
        found: false,
        cedula: cleanCedula,
        fullName: '',
        firstName: '',
        paternalSurname: '',
        maternalSurname: '',
        profession: '',
        rawProfession: '',
        institution: '',
        registrationYear: '',
        type: '',
        isMedical: false,
        error:
          'No fue posible conectar con el Registro Nacional de Profesionistas en este momento. Puedes ingresar tus datos manualmente.',
      };
    }

    if (items.length === 0) {
      return {
        found: false,
        cedula: cleanCedula,
        fullName: '',
        firstName: '',
        paternalSurname: '',
        maternalSurname: '',
        profession: '',
        rawProfession: '',
        institution: '',
        registrationYear: '',
        type: '',
        isMedical: false,
        error: `No se encontró ningún registro para la cédula ${cleanCedula} en el padrón nacional de la SEP.`,
      };
    }

    // Tomar el registro principal o más relevante
    const record = items[0];

    const firstName = toSpanishTitleCase(record.nombre);
    const paternalSurname = toSpanishTitleCase(record.primerApellido);
    const maternalSurname = toSpanishTitleCase(record.segundoApellido);
    const fullNameParts = [firstName, paternalSurname, maternalSurname].filter(Boolean);
    const fullName = fullNameParts.join(' ');

    const rawProfession = record.profesion || '';
    const profession = toSpanishTitleCase(rawProfession);
    const institution = toSpanishTitleCase(record.institucion);

    // Clasificación médica inteligente
    const isMedical =
      /m[eé]dic|cirujan|rehabilitaci[oó]n|neurolog|neurofisiolog|fisioterapi|terapia|salud|enfermer|audiolog/i.test(
        rawProfession
      );

    let suggestedCategory: CedulaVerificationResult['suggestedCategory'] = 'resident';
    if (/rehabilitaci[oó]n/i.test(rawProfession)) {
      suggestedCategory = 'specialist_rehab';
    } else if (/neurofisiolog|electrodiagn/i.test(rawProfession)) {
      suggestedCategory = 'neurophysiologist';
    } else if (/especialidad|subespecialidad|maestr|doctor/i.test(rawProfession)) {
      suggestedCategory = 'other_doctor';
    } else {
      suggestedCategory = 'resident';
    }

    return {
      found: true,
      cedula: cleanCedula,
      fullName,
      firstName,
      paternalSurname,
      maternalSurname,
      profession,
      rawProfession,
      institution,
      registrationYear: record.anioRegistro || '',
      type: record.tipo || 'C1',
      isMedical,
      suggestedCategory,
      rawData: record,
    };
  } catch (err: any) {
    return {
      found: false,
      cedula: cleanCedula,
      fullName: '',
      firstName: '',
      paternalSurname: '',
      maternalSurname: '',
      profession: '',
      rawProfession: '',
      institution: '',
      registrationYear: '',
      type: '',
      isMedical: false,
      error:
        err?.message || 'Ocurrió un error al procesar la respuesta del Registro Nacional de Profesionistas.',
    };
  }
}
