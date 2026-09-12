🏆 Especificaciones Técnicas: DLM-Quiz (Rehabilitation Mastery)

Este documento detalla los requerimientos de ingeniería para el desarrollo de la aplicación DLM-Quiz. El objetivo es construir una plataforma de aprendizaje gamificada para médicos rehabilitadores basada en el temario oficial del Consejo.

1. Misión y Visión Técnica

Transformar un temario médico estático en un motor de aprendizaje inteligente que utilice:

Método Duolingo: Progresión por "Islas" y niveles.

Repetición Espaciada (SRM): Algoritmo que prioriza conceptos fallidos.

Análisis de Brechas (Gap Analysis): Visualización de datos de desempeño médico.

2. Arquitectura de Datos (Core Schema)

Toda la persistencia de datos debe centralizarse en Supabase (PostgreSQL) siguiendo un esquema atómico para evitar la redundancia y facilitar auditorías.

A. Objeto JSON de Caso Clínico/Pregunta

{
  "id": "UUID",
  "isla_id": "UUID", // FK a la tabla 'islands'
  "content": {
    "stem": "Texto del caso clínico (Soporta HTML/Rich Text)",
    "findings": [
      {"type": "LAB", "label": "Latencia R1", "value": "<12ms"},
      {"type": "SIGN", "label": "Prueba", "value": "Fromen (+)"}
    ]
  },
  "metadata": {
    "is_critical": true, // Activa lógica de pérdida de vidas
    "difficulty_weight": 1-5,
    "last_reviewed_date": "ISO-8601",
    "reviewer_id": "UUID"
  },
  "logic": {
    "category": "Neurología",
    "sub_category": "Lesión Medular",
    "council_pearl": "La perla exacta del consejo extraída del temario",
    "source_reference": "Pág 2, Temario Consejo"
  },
  "options": [
    {
      "id": "a",
      "text": "Texto de la opción",
      "is_correct": true,
      "feedback_clinical": "Explicación de por qué es correcta/incorrecta"
    }
  ],
  "status": "DRAFT | PENDING_REVIEW | PUBLISHED"
}


3. Lógica de Algoritmos (The Brain)

A. Algoritmo de Repetición Espaciada (SRM)

El backend debe implementar una versión simplificada del algoritmo SuperMemo-2:

Fallo en pregunta crítica: La pregunta se marca para reaparecer en la siguiente sesión de estudio (Intervalo = 0).

Éxito: El intervalo crece exponencialmente basado en el difficulty_weight.

Vidas Médicas: Solo preguntas con is_critical: true restan "Corazones" al usuario.

B. Motor de Gap Analysis

Debe calcular un Score de Maestría por cada una de las 8 islas:

Fórmula: (Éxitos / Intentos Totales) * Peso de Dificultad.

Visualización: Generar un JSON para alimentar un gráfico de Radar (Radar Chart) en el frontend.

4. Requerimientos del Editor de Casos Clínicos (Admin)

El Panel Maestro debe ser una SPA (Single Page Application) con los siguientes Guardrails:

Validación de Respuesta Única: Bloqueo de guardado si no hay exactamente una respuesta is_correct.

Inyector de Hallazgos: No usar texto plano para datos de laboratorio; usar inputs controlados para asegurar que el motor de búsqueda pueda indexar valores como "1 y 3 Mhz" o "T8".

Pilar de Auditoría:

Todo cambio genera una entrada en la tabla historical_pearls.

Si una pregunta crítica no ha sido revisada en 6 meses (last_reviewed_date), el sistema debe marcarla automáticamente como REQUIERE_REVISION.

5. El Mapa de Niveles (Learning Path)

El desarrollo frontend debe estructurarse en 8 Islas Principales:

Fundamentos: (Anatomía, Biomecánica, Medios Físicos).

Pediátrica: (Hitos, Reflejos, PC, Botox).

Neurológica: (Lesión Medular, EVC, Neurodegenerativas).

EDX: (Potenciales, EMG, Radiculopatías).

Ortopédica: (Fracturas, Prótesis, Mano).

Cardio-Pulmonar: (METS, EPOC).

Áreas Especiales: (Geriatría, Quemados, Oncología).

Legal y Laboral: (NOM, ONU, USAER).

6. Stack Tecnológico Recomendado

Frontend Móvil: React Native (para soporte offline).

Backend/Base de Datos: Supabase (PostgreSQL, Auth, Storage).

Infraestructura: Netlify para el Panel Maestro de Admin.

Analíticas: PostHog o Mixpanel para trazar el progreso de los residentes.

Nota para el equipo: Ningún despliegue a producción es válido si existen preguntas en estado PENDING_REVIEW dentro de los niveles activos del mapa.


Para que solo tú tengas el control total y puedas gestionar el banco de preguntas (agregar, editar y borrar), aquí tienes la especificación técnica de esa "ventana" y cómo debe conectarse con la seguridad de tu base de datos.
1. El Sistema de Seguridad ("Solo Yo")
Para cumplir con tu requerimiento de acceso exclusivo mediante correo y contraseña, la arquitectura debe incluir:
• Autenticación (Auth): Se recomienda usar el servicio de autenticación de Supabase (mencionado como la base de datos ideal en tus fuentes).
• Roles de Usuario (RBAC): MI usuario (jmyocupicior@gmail.com) tendrá el rol de SUPER_ADMIN.
• Seguridad a Nivel de Fila (RLS): Se programará una regla en la base de datos que diga: "Nadie puede escribir (INSERT/UPDATE) en la tabla questions a menos que su ID coincida con el tuyo".
• Trazabilidad: Cada vez que modifiques algo, tu ID se guardará en el campo reviewer_id para mantener un historial de quién aprobó el contenido.
2. Diseño de tu Ventana de Administrador (Panel Maestro)
Esta ventana no es visible para los residentes. Al entrar, verás un "Dashboard" con tres secciones clave para gestionar el contenido del Temario:
A. La Tabla de Inventario (Vista General)
Una lista donde puedes ver todas las preguntas cargadas. Debe tener filtros rápidos para detectar "brechas" en el contenido:
• Filtro por Isla: (Ej. Ver solo preguntas de "Isla Neurológica").
• Filtro por Estado: (Ej. Ver solo "Borradores" o preguntas que "Requieren Revisión").
• Indicador de Salud: Columnas que muestren si la pregunta tiene is_critical activado.
B. El Editor de Preguntas (Para Agregar/Modificar)
Cuando hagas clic en "Agregar Nueva Pregunta", se abrirá el "Editor de Casos Clínicos Infalible". Este formulario debe tener los siguientes campos obligatorios para asegurar que la app funcione:
1. Cuerpo del Caso (Rich Text): Un espacio para escribir el cuadro clínico. Ejemplo: Podrás escribir y poner en negritas datos como "Niño de 12 años que claudica".
2. Selector de Isla y Categoría (Obligatorio): Un menú desplegable para vincular la pregunta. Ejemplo: Si la pregunta es sobre "Dosis de Botox", debes seleccionar Isla Pediátrica -> Espasticidad. Nota: El sistema no te dejará guardar si no eliges una isla (Prevención de Huérfanos).
3. Hallazgos Clínicos (Estructurados): En lugar de escribirlo todo en texto, tendrás casillas especiales para datos duros
4. Configuración del Algoritmo:
    ◦ Peso de Dificultad (1-5): Tú decides qué tan difícil es.
    ◦ Es Crítica (is_critical): Un interruptor (Check Box). Si lo activas (ej. para "Nivel de isquemia T8"), el fallo de esta pregunta costará "Vidas Médicas" al usuario,.
5. La "Perla del Consejo": Un campo de texto donde escribirás el dato exacto del PDF que el usuario debe memorizar.
:::::
3. Flujo de Trabajo (Workflow)
Para que mantengas el orden, el panel seguirá este ciclo:
1. Creación: Tú ingresas una pregunta sobre "Escápula Alada". El sistema la guarda como DRAFT (Borrador).
2. Validación: El sistema verifica automáticamente que hayas marcado una y solo una respuesta correcta.
3. Publicación: Cambias el estado a CLINICALLY_CORRECT. En ese momento, la pregunta se vuelve visible en la App de los residentes y se actualiza la fecha last_reviewed_date.
4. Funcionalidad de Carga Masiva (Para avanzar rápido)
Como eres el único administrador, subir 500 preguntas una por una será lento. Tu ventana tendrá un botón de "Importar JSON". Esto te permitirá preparar un archivo Excel o JSON con múltiples preguntas (por ejemplo, todo el bloque de "Rehab. Ortopédica") y subirlas de golpe, siempre que cumplan con la estructura de datos definida