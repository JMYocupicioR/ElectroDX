# Guía de Carga Masiva de Preguntas

Esta guía explica cómo preparar tus preguntas para la carga masiva usando archivos JSON.

---

## 🤖 Instrucciones para GPT (Conversión Automática de Preguntas)

Si tienes preguntas en formato texto y quieres usar ChatGPT u otro AI para convertirlas a JSON, **copia y pega exactamente este prompt**:

### Prompt para GPT:

```
Eres un asistente especializado en convertir preguntas médicas de Medicina Física y Rehabilitación a formato JSON para un sistema de banco de preguntas.

INSTRUCCIONES CRÍTICAS:
1. El output DEBE ser un array JSON válido, listo para copiar y pegar
2. NO agregues explicaciones antes o después del JSON
3. NO uses markdown code blocks, solo el JSON puro
4. Cada pregunta debe seguir EXACTAMENTE esta estructura

ESTRUCTURA REQUERIDA (formato anidado):
{
  "island_name": "Nombre de la Isla/Área (ej: Cardiología, Neurología, Musculoesquelético)",
  "topic_name": "Tema específico (ej: Hipertensión, Lesión Medular, Fracturas)",
  "difficulty": [número del 1 al 5],
  "is_critical": [true o false - true si es concepto fundamental],
  "pearl": "Perla clínica: dato clave para recordar",
  "source_reference": "Fuente bibliográfica (ej: Harrison 21ed, Capítulo X, DeLisa 6ed p.XXX)",
  "content": {
    "stem": "Enunciado completo de la pregunta, incluyendo caso clínico si aplica",
    "options": [
      {
        "text": "Texto de la opción",
        "is_correct": true,
        "feedback_clinical": "Explicación clínica de por qué es correcta/incorrecta"
      }
    ]
  }
}

REGLAS ESPECÍFICAS:
- island_name: Usa estas áreas: Cardiología, Neurología, Musculoesquelético, Pediátrico, Geriátrico, Dolor, Amputados, Cáncer, Cognición, Respiratorio
- topic_name: Sé específico (ej: "Fractura de Cadera" no solo "Fracturas")
- difficulty: 
  * 1 = Muy fácil (concepto básico)
  * 2 = Fácil (conocimiento general)
  * 3 = Medio (requiere razonamiento)
  * 4 = Difícil (requiere conocimiento avanzado)
  * 5 = Muy difícil (casos complejos/raros)
- is_critical: true si es un concepto que un residente DEBE saber, false si es conocimiento complementario
- pearl: SIEMPRE incluye una perla clínica relevante, no dejes este campo vacío
- source_reference: SIEMPRE cita la fuente (libro, edición, capítulo/página)
- content.stem: Escribe el caso/pregunta completo, claro y bien redactado
- content.options: 
  * MÍNIMO 4 opciones
  * EXACTAMENTE UNA opción con "is_correct": true
  * TODAS las opciones deben tener "feedback_clinical" explicando por qué son correctas o incorrectas
  * El feedback debe ser educativo y clínicamente relevante

IMPORTANTE:
- NO numeres las opciones (A, B, C, D) en el texto, solo pon el contenido
- NO uses caracteres especiales que rompan JSON (usa \\n para saltos de línea si es necesario)
- VERIFICA que el JSON sea válido antes de responder
- Si una pregunta no tiene suficiente información, INFIERE basándote en conocimiento médico estándar

EJEMPLO COMPLETO:
[
  {
    "island_name": "Musculoesquelético",
    "topic_name": "Fractura de Cadera",
    "difficulty": 3,
    "is_critical": true,
    "pearl": "La movilización temprana (primeras 24-48h) reduce morbimortalidad post-fractura de cadera",
    "source_reference": "DeLisa 6ed, Capítulo 42, p.1156-1160",
    "content": {
      "stem": "Mujer de 82 años con fractura subcapital de cadera derecha. Artroplastia parcial realizada hace 2 días. Antecedentes de hipertensión y osteoporosis. Actualmente en reposo en cama. ¿Cuál es el plan de rehabilitación MÁS apropiado para las primeras 72 horas postoperatorias?",
      "options": [
        {
          "text": "Sedestación al borde de cama a las 24h, transferencias a silla a las 48h, inicio de marcha con andador a las 72h con carga parcial",
          "is_correct": true,
          "feedback_clinical": "Correcto. La movilización progresiva temprana es el estándar de manejo. Reduce significativamente riesgo de TVP (40%), neumonía (30%), úlceras por presión, y mejora pronóstico funcional. La carga parcial protege la prótesis mientras permite activación muscular."
        },
        {
          "text": "Reposo estricto en cama durante 2 semanas para permitir consolidación ósea adecuada",
          "is_correct": false,
          "feedback_clinical": "Incorrecto. El reposo prolongado en ancianos aumenta dramáticamente la mortalidad (30% a 1 año), pérdida de masa muscular (1-2% diario), complicaciones tromboembólicas y pulmonares. La artroplastia permite movilización inmediata."
        },
        {
          "text": "Iniciar marcha inmediata con carga completa sin restricciones desde el primer día postoperatorio",
          "is_correct": false,
          "feedback_clinical": "Incorrecto. Aunque la movilización temprana es deseable, debe respetarse el protocolo de carga del cirujano ortopédico. La carga completa inmediata puede comprometer la fijación protésica en algunos tipos de artroplastia."
        },
        {
          "text": "Fisioterapia respiratoria exclusivamente durante la primera semana, diferir movilización hasta alta hospitalaria",
          "is_correct": false,
          "feedback_clinical": "Incorrecto. Si bien la fisioterapia respiratoria es importante, la movilización precoz es PRIORITARIA. Diferir la movilización aumenta complicaciones y compromete el resultado funcional final."
        }
      ]
    }
  }
]

Ahora convierte las siguientes preguntas a este formato JSON:
[AQUÍ PEGAS TUS PREGUNTAS EN TEXTO]
```

### Cómo usarlo:

1. Copia TODO el prompt de arriba (desde "Eres un asistente..." hasta "[AQUÍ PEGAS...]")
2. Abre ChatGPT (o GPT-4, Claude, etc.)
3. Pega el prompt
4. Reemplaza `[AQUÍ PEGAS TUS PREGUNTAS EN TEXTO]` con tus preguntas
5. El AI generará el JSON listo para copiar
6. Copia el JSON resultado y pégalo en el sistema de carga masiva

### Formato de tus preguntas en texto (pueden ser simples):

```
Pregunta 1: ¿Cuál es el...?
a) Opción 1
b) Opción 2
c) Opción 3
d) Opción 4
Respuesta correcta: a
Explicación: ...

Pregunta 2: Paciente de 65 años...
...
```

El GPT se encargará de convertirlo al JSON correcto.

---

## 🎯 Formatos Soportados

El sistema **acepta automáticamente AMBOS formatos** y los normaliza internamente:

### Formato 1: Estructura Anidada (Recomendado)

```json
[
  {
    "island_name": "Cardiología",
    "topic_name": "Hipertensión Arterial",
    "difficulty": 3,
    "is_critical": true,
    "pearl": "La HTA es el factor de riesgo cardiovascular más prevalente",
    "source_reference": "Harrison 21ed, Capítulo 298",
    "content": {
      "stem": "Paciente masculino de 55 años con presión arterial de 160/100 mmHg...",
      "options": [
        {
          "text": "Iniciar tratamiento con IECA",
          "is_correct": true,
          "feedback_clinical": "Correcto. Los IECA son primera línea en HTA con factores de riesgo cardiovascular."
        },
        {
          "text": "Observación y cambios de estilo de vida únicamente",
          "is_correct": false,
          "feedback_clinical": "Incorrecto. Con cifras ≥140/90 y factores de riesgo, está indicado tratamiento farmacológico."
        }
      ]
    }
  }
]
```

### Formato 2: Estructura Plana (Auto-convertido)

```json
[
  {
    "island_name": "Neurología",
    "topic_name": "Lesión Medular",
    "difficulty": 4,
    "is_critical": true,
    "pearl": "En lesión medular aguda, el nivel sensitivo es clave para la clasificación",
    "source_reference": "Braddom 5ed, p.1234",
    "stem": "Paciente con lesión medular completa a nivel C6...",
    "options": [
      {
        "text": "Opción correcta",
        "is_correct": true,
        "feedback": "Explicación correcta"
      },
      {
        "text": "Opción incorrecta",
        "is_correct": false
      }
    ]
  }
]
```

> **Nota**: El sistema convierte automáticamente el formato plano al formato anidado.

---

## 📋 Campos del JSON

### Campos Principales (Nivel Raíz)

| Campo | Tipo | Requerido | Descripción | Auto-corrección |
|-------|------|-----------|-------------|-----------------|
| `island_name` | string | ✅ Sí | Nombre de la isla (ej: "Cardiología") | - |
| `topic_name` | string | ✅ Sí | Nombre del tema (ej: "Hipertensión") | - |
| `difficulty` | number | ✅ Sí | Dificultad de 1 a 5 | Se ajusta automáticamente si está fuera de rango |
| `is_critical` | boolean | ⚪ No | ¿Es pregunta crítica? | Se establece en `false` si falta |
| `pearl` | string | ⚪ No | Perla clínica o concepto clave | Cadena vacía si falta |
| `source_reference` | string | ⚪ No | Referencia bibliográfica | Cadena vacía si falta |

### Campo Content (Objeto Anidado)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `content.stem` | string | ✅ Sí | Enunciado de la pregunta |
| `content.options` | array | ✅ Sí | Array de opciones (mínimo 1) |
| `content.findings` | array | ⚪ No | Hallazgos clínicos adicionales |

### Opciones (Dentro de content.options)

| Campo | Tipo | Requerido | Descripción | Auto-corrección |
|-------|------|-----------|-------------|-----------------|
| `text` | string | ✅ Sí | Texto de la opción | Se genera "Opción N" si falta |
| `is_correct` | boolean | ✅ Sí | ¿Es la respuesta correcta? | - |
| `feedback_clinical` | string | ⚪ No | Explicación clínica | También acepta `feedback` |

---

## 🔧 Correcciones Automáticas

El sistema aplica las siguientes correcciones automáticamente:

### 1. **Conversión de Formato**
- ✅ Detecta formato plano → convierte a anidado
- ✅ Mueve `stem` y `options` dentro de `content`

### 2. **Normalización de Campos**
- ✅ `feedback` → `feedback_clinical`
- ✅ Dificultad fuera de rango (ej: 7) → ajusta a 5
- ✅ Dificultad como string ("3") → convierte a número (3)

### 3. **Valores por Defecto**
- ✅ `is_critical` faltante → `false`
- ✅ `pearl` faltante → `""`
- ✅ `source_reference` faltante → `""`
- ✅ `content.findings` faltante → `[]`

### 4. **Validación de Respuestas**
- ⚠️ Sin respuesta correcta → primera opción se marca como correcta
- ⚠️ Múltiples respuestas correctas → solo se mantiene la primera

---

## 💡 Ejemplos de Uso

### Ejemplo Completo (Caso Clínico)

```json
[
  {
    "island_name": "Musculoesquelético",
    "topic_name": "Fractura de Cadera",
    "difficulty": 3,
    "is_critical": false,
    "pearl": "La movilización temprana es esencial para prevenir complicaciones",
    "source_reference": "DeLisa 6ed, Capítulo 42",
    "content": {
      "stem": "Mujer de 82 años con fractura de cuello femoral post-caída. Cirugía de artroplastia hace 3 días. ¿Cuál es el plan de rehabilitación MÁS apropiado?",
      "options": [
        {
          "text": "Sedestación en silla a partir de las 24h, iniciar marcha con andador a las 48h",
          "is_correct": true,
          "feedback_clinical": "Correcto. La movilización temprana reduce riesgo de TVP, neumonía y deterioro funcional."
        },
        {
          "text": "Reposo absoluto en cama por 2 semanas",
          "is_correct": false,
          "feedback_clinical": "Incorrecto. El reposo prolongado aumenta complicaciones y mortalidad."
        },
        {
          "text": "Iniciar marcha con carga completa sin restricciones",
          "is_correct": false,
          "feedback_clinical": "Incorrecto. Debe seguirse las indicaciones de carga del cirujano ortopédico."
        },
        {
          "text": "Esperar 6 meses antes de iniciar fisioterapia",
          "is_correct": false,
          "feedback_clinical": "Incorrecto. La rehabilitación debe iniciarse inmediatamente después de la cirugía."
        }
      ]
    }
  }
]
```

### Ejemplo Mínimo (Auto-completado)

Este ejemplo mínimo será auto-completado por el sistema:

```json
[
  {
    "island_name": "Pediatría",
    "topic_name": "Parálisis Cerebral",
    "difficulty": 2,
    "content": {
      "stem": "¿Cuál es el tipo más común de parálisis cerebral?",
      "options": [
        {"text": "Espástica", "is_correct": true},
        {"text": "Discinética", "is_correct": false},
        {"text": "Atáxica", "is_correct": false},
        {"text": "Mixta", "is_correct": false}
      ]
    }
  }
]
```

El sistema agregará automáticamente:
- `is_critical: false`
- `pearl: ""`
- `source_reference: ""`
- `content.findings: []`

---

## ⚠️ Errores Comunes y Soluciones

### Error: "Campo content faltante"
**Problema**: Usaste formato plano pero olvidaste `stem`
```json
// ❌ Incorrecto
{
  "island_name": "Cardiología",
  "options": [...]
  // Falta stem
}
```

**Solución**: Agrega el campo `stem` o usa formato anidado
```json
// ✅ Correcto
{
  "island_name": "Cardiología",
  "stem": "Tu pregunta aquí...",
  "options": [...]
}
```

### Error: "content.options debe ser un array"
**Problema**: Olvidaste el array de opciones o está vacío
```json
// ❌ Incorrecto
{
  "content": {
    "stem": "Pregunta...",
    "options": []  // Vacío
  }
}
```

**Solución**: Agrega al menos una opción
```json
// ✅ Correcto
{
  "content": {
    "stem": "Pregunta...",
    "options": [
      {"text": "Opción 1", "is_correct": true}
    ]
  }
}
```

### Advertencia: Sin respuesta correcta
**Sistema dice**: "⚠️ Sin respuesta correcta → primera opción marcada como correcta"

**Solución**: Verifica que al menos una opción tenga `"is_correct": true`

### Advertencia: Múltiples respuestas correctas
**Sistema dice**: "⚠️ Múltiples respuestas correctas (3) → solo primera mantenida"

**Solución**: Marca solo UNA opción como `"is_correct": true`

---

## 🚀 Proceso de Carga

1. **Prepara tu archivo JSON** usando cualquiera de los formatos
2. **Sube el archivo** o pega el JSON en el sistema
3. **El sistema normaliza** automáticamente y muestra correcciones
4. **Revisa el log** para ver qué correcciones se aplicaron
5. **Confirma o cancela** la carga

### Log de Ejemplo

```
Analizando 10 preguntas...
🔄 Normalizando y validando formato...
🔧 2 preguntas corregidas automáticamente
⚠️ 5 advertencias generadas

🔧 Pregunta 1 (correcciones aplicadas):
   - Formato plano detectado → convertido a formato anidado
   - Campo "feedback" renombrado a "feedback_clinical" en opciones

🔧 Pregunta 3 (correcciones aplicadas):
   - Dificultad fuera de rango → ajustada a 5
   - ⚠️ Sin respuesta correcta → primera opción marcada como correcta

✅ Normalización completada. Procesando 10 preguntas...
```

---

## 📝 Mejores Prácticas

1. **Usa el formato anidado** para mayor claridad
2. **Incluye feedback clínico** en todas las opciones (mejora el aprendizaje)
3. **Marca solo UNA respuesta** como correcta
4. **Usa referencias bibliográficas** precisas
5. **Escribe perlas clínicas** útiles y memorables
6. **Revisa el log** después de cargar para verificar correcciones

---

## 🆘 Soporte

Si encuentras errores que el sistema no puede corregir automáticamente:

1. Revisa el **log de errores** para detalles específicos
2. Verifica que tu JSON sea **válido** (usa un validador JSON online)
3. Asegúrate de incluir **todos los campos requeridos** (✅ Sí)
4. Consulta los **ejemplos** en esta guía

---

## 📄 Plantillas Descargables

En el sistema encontrarás dos plantillas:

- **📄 questions_template.json** - Plantilla con ejemplos
- **📄 archivosparasubir.json** - Plantilla de referencia

Ambas son compatibles y funcionan perfectamente con el sistema.
