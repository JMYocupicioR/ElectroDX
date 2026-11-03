
# REDISEÑO UI/UX PROFESIONAL — ELECTRODX

## Módulo de visualización de clases y aula virtual

Actúa como un **Senior Product Designer, UI/UX Architect y Senior Frontend Developer**, especializado en plataformas SaaS, aplicaciones educativas (EdTech), productos médicos digitales y experiencias mobile-first.

Tu objetivo es realizar un rediseño integral del módulo de visualización de clases de **ElectroDx**, transformándolo en una experiencia educativa digital premium, moderna, intuitiva y altamente funcional.

No quiero simplemente cambiar colores, bordes o tipografías. Quiero una verdadera optimización de la arquitectura visual, jerarquía de información, distribución de componentes, navegación e interacción.

Dispones del código fuente del proyecto. Primero analiza su estructura y después implementa directamente las mejoras.

---

# 1. IDENTIDAD VISUAL Y DIRECCIÓN DE DISEÑO

El concepto visual debe ser:

**Premium Medical EdTech + Modern SaaS + Advanced Technology.**

La interfaz debe transmitir:

- Profesionalismo médico.
- Innovación tecnológica.
- Educación especializada.
- Precisión y claridad.
- Modernidad.
- Confianza.
- Simplicidad y elegancia.

Conserva la identidad de ElectroDx y su estética oscura, pero mejora sustancialmente su ejecución.

### Paleta de colores sugerida

Utiliza variables CSS o tokens de diseño centralizados.

- Background principal: #0B1220
- Background secundario: #111B2D
- Surface: #151F32
- Elevated surface: #1E2B42
- Primary: #2563EB
- Primary light: #3B82F6
- Accent: #38BDF8
- Success: #14B8A6
- Warning: #F59E0B
- Danger: #EF4444
- Text primary: #F8FAFC
- Text secondary: #94A3B8
- Border: rgba(148,163,184,0.16)

Evita utilizar demasiados colores simultáneamente.

El azul eléctrico debe ser el principal color de interacción. El turquesa se utilizará para estados positivos y el violeta exclusivamente para funcionalidades especiales como inteligencia artificial.

### Estilo visual

- Diseño limpio y minimalista.
- Bordes discretos.
- Sombras suaves.
- Radios consistentes.
- Espaciado generoso.
- Tipografía moderna y legible.
- Iconografía coherente.
- Animaciones sutiles.
- Microinteracciones funcionales.
- Excelente contraste.

Evita:

- Exceso de tarjetas.
- Contenedores anidados innecesarios.
- Bordes excesivamente visibles.
- Gradientes decorativos exagerados.
- Botones demasiado grandes.
- Texto excesivamente pequeño.
- Saturación de información.
- Apariencia de plantilla genérica.

---

# 2. ANÁLISIS PREVIO DEL PROYECTO

Antes de modificar cualquier archivo:

1. Inspecciona la arquitectura del proyecto.
2. Identifica el framework y las tecnologías utilizadas.
3. Localiza el módulo de visualización de clases.
4. Identifica el reproductor de video actual y su integración.
5. Localiza los componentes de asistencia, progreso, docentes, temario y preguntas.
6. Identifica la navegación principal y la navegación inferior.
7. Revisa los estilos globales, componentes reutilizables y sistema responsive.
8. Identifica las dependencias existentes.
9. Detecta problemas de usabilidad y duplicación de componentes.

No reemplaces la arquitectura existente sin justificación.

**IMPORTANTE:** Conserva toda la lógica de negocio, rutas, autenticación, conexiones a bases de datos, estados, APIs y funcionalidades actuales.

El rediseño debe trabajar sobre la implementación existente.

No utilices datos ficticios para sustituir información real.

---

# 3. REDISEÑO DEL VISUALIZADOR DE CLASES

Esta es la sección más importante del trabajo.

Reorganiza completamente la distribución visual de la pantalla.

La nueva jerarquía debe ser:

1. Header compacto.
2. Información principal de la clase.
3. Reproductor de video.
4. Indicador de asistencia y progreso.
5. Barra de herramientas académicas.
6. Contenido de la sesión.
7. Información complementaria.

### Header

Optimiza el encabezado actual:

- Logo ElectroDx.
- Buscador.
- Notificaciones.
- Avatar del usuario.
- Menú principal.

En dispositivos móviles debe ocupar el mínimo espacio vertical posible.

Mantén una navegación consistente y evita que el header compita visualmente con el contenido.

### Información de la clase

Rediseña la presentación del título.

Debe incluir:

- Título de la clase.
- Estado: EN VIVO, GRABADA o FINALIZADA.
- Fecha y hora.
- Duración.
- Docente o docentes.
- Modalidad de la sesión.

El título debe ser el elemento visual dominante.

Los nombres de los profesores deben mostrarse de forma compacta, evitando tarjetas grandes innecesarias.

### Reproductor

El reproductor debe convertirse en el elemento principal de la interfaz.

Requisitos:

- Relación de aspecto 16:9.
- Ancho completo del contenedor.
- Bordes discretos.
- Controles intuitivos.
- Integración visual con ElectroDx.
- Compatibilidad con pantallas pequeñas.
- Soporte para pantalla completa.
- Adaptación horizontal en smartphones.

Si actualmente utilizas YouTube, conserva su integración y sus restricciones técnicas. No reemplaces el reproductor por un video ficticio ni rompas sus funcionalidades.

Cuando sea técnicamente posible, incorpora controles complementarios:

- Retroceder 10 segundos.
- Avanzar 10 segundos.
- Velocidad de reproducción.
- Subtítulos.
- Pantalla completa.
- Continuar desde el último minuto.

### Asistencia y progreso

Rediseña el indicador de asistencia.

Debe mostrar claramente:

- Porcentaje visualizado.
- Porcentaje mínimo requerido.
- Tiempo reproducido.
- Tiempo restante.
- Estado de acreditación.

El progreso debe ser visualmente sencillo y comprensible.

Utiliza un indicador horizontal elegante, con animación discreta.

Diferencia claramente entre progreso de reproducción y cumplimiento del requisito de asistencia.

No modifiques la lógica actual de cálculo de asistencia.

---

# 4. SISTEMA DE HERRAMIENTAS ACADÉMICAS

Debajo del reproductor implementa una navegación secundaria mediante pestañas.

Las pestañas propuestas son:

1. Clase.
2. Preguntas.
3. Notas.
4. Material.
5. Transcripción.

Cada pestaña debe tener su propio contenido y conservar un diseño coherente.

En dispositivos móviles, evita mostrar todas las secciones simultáneamente.

### Pestaña Clase

Mostrar:

- Descripción de la clase.
- Objetivos de aprendizaje.
- Temario.
- Capítulos.
- Información del docente.

Los capítulos deben poder utilizarse para navegar al momento correspondiente del video cuando la integración lo permita.

### Pestaña Preguntas

Rediseña el apartado actual de dudas y discusiones.

Debe incluir:

- Formulario para publicar preguntas.
- Lista de preguntas.
- Respuestas.
- Identificación del docente.
- Indicador de preguntas resueltas.
- Votación de preguntas relevantes.
- Orden cronológico o por relevancia.

Conserva la funcionalidad existente y utiliza datos reales.

### Pestaña Notas

Diseña una interfaz de notas académicas.

Si el backend actual no dispone de persistencia, prepara una arquitectura visual y de componentes sin simular que los datos se guardan permanentemente.

Funciones deseables:

- Editor de texto.
- Notas personales.
- Asociación de notas con el minuto del video.
- Marcadores.
- Exportación cuando exista soporte.

### Pestaña Material

Presenta los documentos complementarios mediante una lista ordenada.

Cada elemento puede mostrar:

- Nombre.
- Tipo de archivo.
- Descripción.
- Tamaño, cuando esté disponible.
- Acción de visualización o descarga.

### Pestaña Transcripción

Prepara una interfaz para mostrar transcripciones sincronizadas.

Debe permitir:

- Buscar palabras.
- Consultar fragmentos.
- Navegar entre marcas temporales.
- Saltar al momento correspondiente del video.

No inventes transcripciones.

---

# 5. DISEÑO ADAPTATIVO SEGÚN EL ESTADO DE LA CLASE

La interfaz debe adaptarse a tres escenarios.

### A. Clase en vivo

Mostrar:

- Indicador EN VIVO.
- Reproductor.
- Participantes conectados, si existe ese dato.
- Preguntas.
- Chat.
- Material.
- Estado de asistencia.

Priorizar la interacción y la transmisión.

### B. Clase grabada

Mostrar:

- Reproductor.
- Progreso.
- Continuar reproducción.
- Capítulos.
- Notas.
- Marcadores.
- Transcripción.
- Material complementario.

Priorizar el aprendizaje autónomo.

### C. Clase finalizada

Mostrar:

- Estado de sesión finalizada.
- Grabación disponible.
- Porcentaje de asistencia.
- Estado de acreditación.
- Botón para continuar viendo.
- Material complementario.
- Evaluación, si existe.

Evita mostrar repetidamente mensajes de sesión finalizada en diferentes tarjetas.

---

# 6. NAVEGACIÓN INFERIOR

Rediseña la barra de navegación inferior existente.

Conserva las secciones actuales:

- Portal.
- Estudio.
- Práctica.
- Cursos.
- Perfil.

Requisitos:

- Diseño minimalista.
- Iconografía uniforme.
- Estado activo claramente identificable.
- Altura optimizada para móviles.
- Respeto por las áreas seguras de iOS y Android.
- No interferir con los controles del reproductor.
- Ocultarse o adaptarse durante pantalla completa.

---

# 7. RESPONSIVE DESIGN — PRIORIDAD MOBILE FIRST

Las capturas actuales muestran el proyecto ejecutándose en un iPhone.

Por lo tanto, la experiencia móvil debe ser la prioridad.

Optimiza específicamente:

- Ancho de contenedores.
- Márgenes.
- Espaciado.
- Tipografía.
- Altura de header.
- Reproductor.
- Pestañas horizontales.
- Navegación inferior.
- Scroll.
- Áreas táctiles.
- Orientación horizontal.
- Safe areas.

Evita desbordamientos horizontales.

Los elementos interactivos deben tener dimensiones táctiles adecuadas, preferentemente de 44–48 px.

En escritorio, utiliza una composición más amplia, aprovechando el espacio disponible sin estirar excesivamente el contenido.

No hagas simplemente una versión móvil ampliada de escritorio. Diseña una experiencia adaptativa real.

---

# 8. MICROINTERACCIONES Y ESTADOS VISUALES

Implementa cuando corresponda:

- Hover.
- Active.
- Focus.
- Loading.
- Skeleton.
- Empty states.
- Error states.
- Confirmaciones.
- Transiciones suaves.
- Feedback de interacción.

Las animaciones deben ser discretas y no afectar el rendimiento.

Respeta la preferencia prefers-reduced-motion.

No agregues animaciones decorativas que distraigan durante las clases.

---

# 9. SISTEMA DE DISEÑO REUTILIZABLE

Centraliza los estilos y componentes.

Define:

- Design tokens.
- Colores.
- Tipografías.
- Espaciados.
- Radios.
- Sombras.
- Botones.
- Inputs.
- Badges.
- Cards.
- Tabs.
- Modales.
- Tooltips.
- Progress bars.

Reutiliza los componentes existentes cuando sea conveniente.

Si el proyecto ya utiliza Tailwind, conserva su configuración y convenciones.

Si utiliza otra metodología de estilos, respétala.

Evita incorporar dependencias nuevas si no son necesarias.

---

# 10. REGLAS CRÍTICAS DE IMPLEMENTACIÓN

Estas instrucciones son obligatorias:

1. No elimines funcionalidades existentes.
2. No cambies las rutas de navegación sin necesidad.
3. No alteres la autenticación.
4. No modifiques innecesariamente el esquema de la base de datos.
5. No sustituyas datos reales por contenido de demostración.
6. No rompas la integración de YouTube.
7. No elimines las funciones de seguimiento de asistencia.
8. No introduzcas dependencias innecesarias.
9. No dupliques componentes.
10. No generes código desorganizado o difícil de mantener.

Antes de terminar:

- Ejecuta el proyecto.
- Revisa errores de compilación.
- Comprueba las rutas.
- Comprueba el reproductor.
- Verifica las funcionalidades existentes.
- Prueba diferentes tamaños de pantalla.
- Corrige errores visuales.
- Verifica que los botones realmente funcionen.

Si una funcionalidad propuesta requiere cambios de backend, APIs o servicios externos, no simules su funcionamiento. Deja claramente identificado qué requiere implementación adicional.

---

# 11. RESULTADO ESPERADO

Quiero un resultado visual comparable con una plataforma SaaS educativa premium de última generación.

La experiencia debe sentirse como un producto desarrollado por un equipo profesional de diseño y desarrollo especializado.

El resultado debe tener:

- Una jerarquía visual excelente.
- Una interfaz elegante.
- Una distribución equilibrada.
- Excelente experiencia móvil.
- Reproductor protagonista.
- Herramientas académicas accesibles.
- Navegación intuitiva.
- Consistencia visual.
- Código limpio y mantenible.

**IMPORTANTE: No te limites a entregarme recomendaciones, wireframes o una lista de tareas. Quiero que inspecciones el proyecto y realices directamente los cambios en el código existente.**

Primero analiza, después implementa, finalmente prueba y corrige.

Al terminar, presenta un resumen de:

1. Componentes modificados.
2. Archivos creados.
3. Archivos modificados.
4. Mejoras visuales implementadas.
5. Funcionalidades conservadas.
6. Funcionalidades que requieren backend.
7. Errores detectados y corregidos.

El objetivo final es transformar el visualizador de clases de ElectroDx en un entorno de aprendizaje médico moderno, intuitivo, tecnológico y profesional.
