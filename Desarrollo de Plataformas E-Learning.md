# **Arquitectura de Sistemas de Aprendizaje Modernos: Guía de Ingeniería para el Desarrollo de Plataformas E-learning Adaptativas, Móviles y de Alto Rendimiento**

La creación de una aplicación de aprendizaje moderna exige superar el enfoque tradicional de los sistemas de gestión de aprendizaje monolíticos, integrando metodologías pedagógicas basadas en la evidencia, modelos de consolidación cognitiva, interfaces ergonómicas y una infraestructura de software desacoplada y altamente escalable1. Un diseño de sistema robusto debe fusionar de manera armónica la psicometría, la computación móvil y la inteligencia artificial para construir un entorno de evaluación que reduzca el roce operativo, optimice la retención de conocimientos a largo plazo y maximice la fidelización del estudiante1.

## **Metodologías de Evaluación y Modelos de Consolidación Cognitiva**

### **El Triptico Evaluativo: Diagnóstica, Formativa y Sumativa**

La estructura pedagógica de la plataforma se articula a través de tres fases de evaluación secuenciales y complementarias1. El equilibrio métrico y operativo de estas fases determina el éxito del proceso instructivo y la precisión de los datos de aprendizaje recopilados por la aplicación1.  
La evaluación diagnóstica se sitúa en el umbral del viaje de aprendizaje del usuario1. Su propósito fundamental es determinar el nivel competencial latente del estudiante y la presencia de vacíos cognitivos específicos antes del inicio de la instrucción1. Este diagnóstico inicial permite al sistema parametrizar las variables de personalización y configurar una ruta adaptativa a la medida de la habilidad demostrada por el alumno1.  
La evaluación formativa se ejecuta de forma continua e integrada en el flujo diario de estudio7. Consiste en la aplicación de reactivos de baja exigencia psicométrica y micro-evaluaciones diseñadas para consolidar la memoria episódica mediante el principio del esfuerzo de recuperación activa7. En entornos de educación superior, se ha evidenciado la viabilidad de incorporar múltiples evaluaciones formativas automatizadas a lo largo del periodo lectivo, representando una cuota significativa del peso final de la asignatura9.  
La evaluación sumativa actúa como el instrumento de acreditación final5. Su diseño busca certificar la adquisición formal de competencias y la asimilación global del material del curso mediante la asignación de una calificación final robusta y confiable5.

### **Algoritmia de Repetición Espaciada para Combatir la Curva del Olvido**

La retención de la memoria a largo plazo está sujeta a la ley del decaimiento temporal postulada por Hermann Ebbinghaus en 1885, la cual establece que el ser humano pierde aproximadamente el setenta por ciento del conocimiento recién adquirido en un lapso de veinticuatro horas en ausencia de repasos estructurados10. Para contrarrestar esta pérdida de manera eficiente, el software de aprendizaje implementa algoritmos de repetición espaciada que programan las preguntas de repaso en intervalos progresivamente amplios, justo antes de que se alcance el umbral estimado de olvido11.  
El algoritmo clásico SM-2, diseñado por Piotr Woźniak en 1987, sirve como base para el cálculo de intervalos dinámicos individualizados por reactivo11. En este modelo, cada tarjeta o elemento de conocimiento cuenta con un Factor de Facilidad (![][image1]) inicializado de forma universal en ![][image2]10. Ante la interacción del alumno, se evalúa la calidad de la respuesta en una escala cuantitativa de calidad de recuerdo (![][image3]) de ![][image4] a ![][image5]11:

* ![][image5]: Evocación perfecta y sin esfuerzo11.  
* ![][image6]: Respuesta correcta tras una breve vacilación11.  
* ![][image7]: Respuesta correcta pero lograda con dificultad seria11.  
* ![][image8]: Respuesta incorrecta, pero el elemento resultaba familiar11.  
* ![][image9]: Respuesta incorrecta, reconociendo el elemento tras revelarse la solución11.  
* ![][image4]: Ausencia absoluta de recuerdo o evocación11.

Una vez obtenida la calificación del usuario, el algoritmo actualiza el Factor de Facilidad (![][image10]) mediante la siguiente relación matemática11:  
![][image11]  
Para evitar que los intervalos de repaso se vuelvan excesivamente cortos y saturen la agenda de estudio del alumno, el algoritmo implementa un límite inferior absoluto para el factor de facilidad11:  
![][image12]  
La determinación del nuevo intervalo de tiempo medido en días (![][image13]) responde al número de repasos exitosos consecutivos realizados por el usuario (![][image14])11:  
![][image15]  
![][image16]  
La modificación implementada en Anki refina el modelo clásico de Woźniak introduciendo fases de aprendizaje previas a la fase exponencial14. En Anki SM-2, la tarjeta se inicia con una facilidad de ![][image17] (![][image18]) por defecto14. Durante el aprendizaje inicial, el fallo de una tarjeta mediante la opción "Forgot" restablece el elemento al primer paso de aprendizaje14.  
La opción "Partially recalled" aplica un Factor de Intervalo de ![][image19] y penaliza el factor de facilidad restando quince puntos porcentuales, mientras que la opción "Recalled with effort" mantiene el factor de facilidad intacto y utiliza el valor actual de facilidad como el Factor de Intervalo de multiplicación14. Además, se aplica un multiplicador de lapsos durante la fase de reaprendizaje (por defecto de ![][image20]), lo que reduce la duración del nuevo intervalo a una décima parte del intervalo anterior14.  
Finalmente, para evitar el fenómeno de agrupamiento artificial de tarjetas (donde múltiples elementos introducidos en una misma fecha aparecen sistemáticamente en los mismos días de repaso), se introduce un pequeño factor de ruido aleatorio o "jitter" a los intervalos calculados14.  
Frente al modelo de reglas estáticas de SM-2, aproximaciones de aprendizaje automático de vanguardia como el algoritmo FSRS (Free Spaced Repetition Scheduler), publicado en 2022 por Jarrett Ye, emplean optimización mediante descenso de gradiente basada en el historial de revisiones del propio usuario10. FSRS entrena de forma personalizada las curvas de olvido de cada estudiante tras alcanzar aproximadamente ![][image21] interacciones individuales, ajustando la frecuencia de repasos de forma óptima según un nivel deseado de retención objetivo preestablecido por el alumno (usualmente configurado entre un ![][image22] y un ![][image23])10.

### **Diseño y Automatización de Rúbricas de Evaluación Complejas**

La automatización de la evaluación de proyectos abiertos requiere de rúbricas analíticas estructuradas que el motor de la aplicación sea capaz de procesar sin ambigüedad conceptual15. La robustez de una rúbrica analítica integrada en un sistema e-learning descansa sobre tres principios psicométricos fundamentales16:

1. **Especificidad Conductual**: Cada nivel de la escala de evaluación debe describirse mediante acciones objetivamente observables e inequívocas para evitar la interpretación libre del evaluador15.  
2. **Mensurabilidad Directa**: Las dimensiones a evaluar deben redactarse sobre elementos que puedan contarse o verificarse físicamente a partir del entregable del alumno16.  
3. **Independencia de Criterios**: Las dimensiones de evaluación deben estar desacopladas entre sí de modo que un único fallo cometido por el alumno no penalice repetidamente su puntuación en diferentes apartados de la rúbrica16.

Para que estas rúbricas sean procesables por el sistema, se modelan a través de esquemas de datos estructurados basados en JSON Schema, los cuales guían tanto los formularios de evaluación de los usuarios como las peticiones de inferencia de los modelos de lenguaje utilizados en la corrección automática17.

## **Funcionalidades de Evaluación Adaptativa e Interactiva**

### **Testing Adaptativo Computarizado (CAT) y Calibración de Bancos de Preguntas**

El Testing Adaptativo Computarizado (CAT) personaliza la evaluación ajustando de forma dinámica la dificultad de los reactivos según el desempeño del estudiante en tiempo real, lo que reduce la duración media de los exámenes hasta en un cincuenta por ciento sin comprometer la precisión de la medición psicométrica4. El núcleo matemático de un sistema CAT está regido por la Teoría de Respuesta al Ítem (IRT), que postula que la probabilidad ![][image24] de responder correctamente a una pregunta ![][image25] depende del nivel latente de habilidad del examinado (![][image26]) y de las propiedades estadísticas del ítem4.  
El modelo logístico de tres parámetros (3-PL) define esta probabilidad de acierto mediante la siguiente formulación19:  
![][image27]  
Donde los parámetros definidos para cada reactivo se estructuran de la siguiente manera19:

* ![][image26]: Representa el nivel latente de aptitud o habilidad del estudiante, medido típicamente en un rango de ![][image28] (baja habilidad) a ![][image29] (alta habilidad)19.  
* ![][image30]: Parámetro de discriminación del ítem. Define la pendiente de la función en su punto de máxima inflexión; valores superiores a ![][image31] demuestran una adecuada capacidad de diferenciar entre sujetos con habilidades próximas19.  
* ![][image32]: Parámetro de dificultad del ítem. Representa el punto de la escala de habilidad donde la probabilidad de acierto es del cincuenta por ciento (corregido por azar)19.  
* ![][image33]: Parámetro de pseudo-adivinación o azar. Representa la probabilidad asintótica de que un examinado con habilidad infinitamente baja responda correctamente al reactivo por pura coincidencia19.

Antes de que un banco de preguntas pueda ser habilitado como fuente para un test adaptativo computarizado, el conjunto de reactivos debe someterse a pruebas de calibración estadística estricta bajo los siguientes supuestos psicométricos obligatorios20:

* **Unidimensionalidad**: El conjunto de ítems de evaluación debe medir única y exclusivamente un constructo latente o competencia unificada del estudiante20.  
* **Ajuste del Modelo**: Los datos empíricos de respuestas deben exhibir un ajuste estadístico adecuado a la curva de probabilidad matemática definida por la ecuación IRT seleccionada20.  
* **Independencia Local**: La respuesta proporcionada por un estudiante a un reactivo específico no debe influir ni guardar relación estadística con el acierto o fallo en cualquier otro ítem del examen20.  
* **Ajuste del Ítem**: Cada ítem analizado individualmente debe presentar un ajuste adecuado a las métricas del grupo y carecer de sesgos significativos de medida20.  
* **Discriminación Mínima**: Las estimaciones paramétricas del factor de discriminación del ítem (![][image30]) deben exceder el umbral de ![][image31] para considerarse válidas dentro del banco operativo20.

### **Sistemas de Evaluación por Pares de Doble Ciego y Calibración Algorítmica**

La evaluación distribuida entre estudiantes mitiga el cuello de botella que representa la corrección de respuestas abiertas en cursos masivos22. El diseño de sistemas de evaluación por pares (Peer Review) modernos implementa flujos de trabajo de doble ciego estricto que resuelven los problemas de sesgos cognitivos y falta de autoridad mediante el uso de algoritmos de calibración de calificación22.  
La plataforma automatiza la asignación de revisores cruzados asegurando que cada envío reciba al menos un número mínimo de revisiones independientes25. No obstante, el sistema distingue entre la calificación asignada por un alumno y el peso relativo de su dictamen en la nota definitiva de su par24. Este peso se denomina Poder de Calificación (Grading Power) y se calcula en función de la precisión con la que el estudiante aplica las rúbricas institucionales24.

| Fase de Evaluación por Pares | Mecánica de Funcionamiento | Rol de la Algoritmia y la IA |
| :---- | :---- | :---- |
| **1\. Fase de Calibración** | El estudiante califica trabajos de control pre-calificados de forma experta por el docente de la asignatura24. | El sistema calcula la varianza e introduce la puntuación inicial de exactitud de revisión24. |
| **2\. Fase de Creación** | El estudiante redacta y carga en la plataforma su propio proyecto o respuesta al reactivo abierto24. | El motor asigna de forma anónima el entregable a múltiples pares evaluadores en función de sus roles24. |
| **3\. Fase de Evaluación** | Cada alumno aplica la rúbrica de evaluación sobre las entregas anónimas de sus compañeros asignados24. | El peso de la nota otorgada se pondera dinámicamente mediante el Grading Power de cada revisor24. |
| **4\. Fase de Feedback** | Los estudiantes evalúan la utilidad de los comentarios cualitativos recibidos por parte de sus pares24. | El sistema ejecuta micro-calibraciones continuas sobre el poder de calificación de cada evaluador24. |

Los algoritmos de calibración de mínimos cuadrados (LSC) y los sistemas de análisis bayesiano modelan de manera matemática el sesgo de indulgencia o severidad de cada estudiante para normalizar las notas crudas asignadas, logrando índices de concordancia inter-juez estables en asignaciones masivas de forma consistente26.

### **Gamificación Práctica: Arquitectura del Sistema de Rachas Diarias**

El diseño de dinámicas lúdicas basadas en el comportamiento de habituación tiene su máximo exponente en el sistema de rachas diarias (Daily Streaks)27. Este sistema aprovecha el sesgo cognitivo de la aversión a la pérdida: una vez que el usuario acumula un número significativo de días consecutivos activos, la motivación interna de perder su racha de progreso supera el esfuerzo requerido para realizar una sesión diaria corta de aprendizaje27.  
Para soportar de manera confiable este comportamiento en el transporte público o bajo entornos de movilidad continua, la persistencia de datos de la aplicación debe estructurarse de acuerdo con un modelo relacional bien diseñado29:

| Colección / Tabla | Atributos Críticos del Modelo de Datos | Propósito en el Ecosistema Gamificado |
| :---- | :---- | :---- |
| **Users** | id (UUID), total\_xp (int), current\_streak (int), longest\_streak (int), last\_activity\_date (datetime), timezone (varchar)29. | Persistir de forma global las métricas de rendimiento del alumno y su huso horario local actual29. |
| **UserProgress** | id (UUID), user\_id (UUID), completion\_date (datetime), score (int), xp\_earned (int), hearts\_lost (int)29. | Registrar el historial de lecciones o pruebas completadas con éxito para auditar el cumplimiento del hábito diario29. |
| **Achievements** | id (UUID), badge\_name (varchar), xp\_required (int), is\_earned (bool), earned\_date (datetime)29. | Almacenar las insignias y metas acumuladas por el usuario al alcanzar ciertos hitos operativos29. |
| **UserAnswers** | id (UUID), user\_id (UUID), question\_id (UUID), is\_correct (bool), time\_taken (int), answered\_date (datetime)29. | Almacenar el registro detallado de rendimiento por reactivo para realimentar el motor de analítica y adaptabilidad29. |

La lógica que evalúa la racha diaria del estudiante debe ejecutarse de forma explícita considerando la diferencia horaria entre el servidor de base de datos y el dispositivo del cliente para evitar desajustes temporales injustos30. El sistema utiliza funciones de zonificación temporal para evaluar las transiciones a la medianoche del usuario30:

JavaScript  
// Cálculo de estado de racha en la zona horaria del dispositivo del cliente  
function evalDailyStreakUpdate(userRecord, clientCurrentTime) {  
  const userTimezone \= userRecord.timezone;  
  const localToday \= startOfDayInZone(clientCurrentTime, userTimezone);  
  const localYesterday \= subtractDays(localToday, 1);  
    
  const lastActiveLocal \= startOfDayInZone(userRecord.last\_activity\_date, userTimezone);

  if (isSameDay(lastActiveLocal, localToday)) {  
    // Actividad recurrente en el mismo día: No se altera la racha pero se registra el progreso  
    return { action: "IGNORE", newStreak: userRecord.current\_streak };  
  } else if (isSameDay(lastActiveLocal, localYesterday)) {  
    // Continuidad en el día posterior: Incrementar racha de forma exitosa  
    const updatedStreak \= userRecord.current\_streak \+ 1;  
    return { action: "INCREMENT", newStreak: updatedStreak };  
  } else {  
    // Ruptura del patrón diario continuo: Se requiere evaluar el uso de un Streak Freeze  
    return { action: "BREAK\_STREAK", newStreak: 0 };  
  }  
}

La monetización de la plataforma y la retención a largo plazo deben equilibrarse cuidadosamente27. Permitir que los usuarios compren "congeladores de racha" (Streak Freezes) de forma ilimitada devalúa la experiencia lúdica de constancia27. Por ello, se restringe la acumulación activa de estos recursos de apoyo a un número máximo (por ejemplo, dos protectores activos por cuenta), resguardando el principio de esfuerzo que hace valioso el progreso diario del usuario27.

### **Casos de Estudio Interactivos y Branching Scenarios en Simuladores**

La transición desde un aprendizaje memorístico hacia el pensamiento crítico se materializa mediante el uso de simuladores estructurados basados en escenarios ramificados (Branching Scenarios)31. Estos simuladores colocan al alumno en el rol de un tomador de decisiones expuesto a dilemas del mundo real donde las respuestas de opción múltiple fijas no bastan para caracterizar la idoneidad del criterio31.  
A nivel técnico, la simulación se modela a través de un grafo de proceso semántico donde cada nodo interactivo contiene un conjunto de parámetros físicos, material audiovisual y alternativas de resolución33. Las transiciones entre los estados del grafo representan la aplicación de criterios técnicos, guiando al alumno por trayectorias divergentes que simulan consecuencias realistas33:

* **Nodo Inicial**: Descripción de la crisis organizativa o el reto técnico con apoyo de medios integrados31.  
* **Decisión Crítica**: El usuario elige una acción inicial entre alternativas complejas y no evidentes31.  
* **Bifurcación de Consecuencia**: El sistema procesa la elección y desplaza al estudiante a un nodo de daño recuperable o daño catastrófico irreversible, alterando las variables físicas del caso33.  
* **Fase de Retroalimentación**: Un análisis detallado y animaciones explican el impacto físico de las acciones tomadas para asegurar la asimilación conceptual33.

## **Arquitectura Tecnológica, Integración de IA y Analítica de Datos**

### **Estándares de Interoperabilidad en EdTech: SCORM, xAPI, cmi5 y LTI Advantage**

El diseño arquitectónico de una aplicación educativa sólida debe evitar el acoplamiento a formatos de datos cerrados y propietarios1. El uso coordinado de estándares internacionales del consorcio 1EdTech (antes IMS) y del organismo ADL garantiza la portabilidad de los contenidos y la recolección masiva de analíticas de aprendizaje a gran escala35.

| Estándar de Interoperabilidad | Ámbito de Aplicación Primario | Fortalezas Técnicas | Limitaciones Clave |
| :---- | :---- | :---- | :---- |
| **SCORM (1.2 / 2004\)** | Empaquetado estático e importación directa de contenidos interactivos en LMS tradicionales36. | Amplia compatibilidad en sistemas corporativos clásicos e independencia de servidores externos36. | Comunicación síncrona exclusiva de navegador, incapacidad de seguimiento móvil/offline y datos limitados a "los cuatro grandes" (completado, aprobado/reprobado, tiempo total, puntuación)35. |
| **xAPI (Tin Can API)** | Registro de actividades y experiencias asíncronas detalladas en cualquier entorno36. | Gran volumen de metadatos, soporte multiplataforma nativo (aplicaciones, VR, campo físico) y almacenamiento robusto descentralizado36. | No define el mecanismo estándar de empaquetado, lanzamiento u organización del contenido académico dentro de un curso36. |
| **cmi5** | Perfil moderno de xAPI para el empaquetado y lanzamiento de cursos interactivos35. | Combina las reglas de lanzamiento controlado de SCORM con la potencia de recopilación y flexibilidad analítica de xAPI35. | Requiere sistemas de visualización y gestión modernos que admitan la especificación completa de forma nativa35. |
| **LTI 1.3 Advantage** | Integración de herramientas externas asíncronas con inicio seguro y comunicación de datos bidireccional36. | SSO unificado con protección OpenID Connect, intercambio seguro de datos de roster (NRPS) y envío confiable de notas finales (AGS)37. | Requiere infraestructura servidora redundante en línea para ambos extremos de la integración; configuración inicial manual compleja36. |

Para solventar las limitaciones geográficas y contractuales en el sector de la distribución de contenidos, los proveedores de capacitación corporativa recurren habitualmente a la distribución controlada o "SCORM Dispatch"43. Mediante esta técnica, los archivos multimedia pesados y la lógica crítica se mantienen alojados de forma protegida en los servidores propios del proveedor (por ejemplo, a través de soluciones tipo scormPROXY), y se comparte únicamente un conector o archivo envoltura liviano a las plataformas de los clientes, facilitando las actualizaciones de contenido centralizadas y el control de licencias en tiempo real43.  
En el ecosistema LTI 1.3 Advantage, el flujo de conexión utiliza protocolos de seguridad robustos que eliminan la necesidad de almacenar contraseñas compartidas propensas a intercepciones en el lado del cliente44. El inicio de sesión se gestiona a través del flujo de autorización OIDC (OpenID Connect) empleando tokens firmados con criptografía asimétrica mediante pares de claves públicas (JWKS) y autenticación OAuth 2.0 para el acceso restringido a las APIs del LMS44.  
Además, para mitigar las limitaciones de los navegadores modernos que restringen el uso de cookies de terceros en el lanzamiento de herramientas integradas en marcos (iframes), el estándar incorpora la especificación de Almacenamiento de la Plataforma (Platform Storage / Cookieless Launch), que utiliza mensajería postMessage segura para intercambiar variables de sesión directamente con el LMS anfitrión37.

### **Integración de Inteligencia Artificial para la Calificación y Generación de Preguntas**

La adopción de inteligencia artificial generativa integrada de manera nativa en el backend agiliza las operaciones docentes de la plataforma47. Esta integración se materializa en dos flujos automatizados clave:

#### **1\. Calificación Automatizada de Entregas Abiertas**

Aprovechando el modelo de evaluación LLM-as-a-Judge, el backend de la aplicación realiza la pre-calificación instantánea de tareas complejas contrastando el texto del estudiante contra la rúbrica JSON de evaluación15. La automatización segura de esta función requiere implementar validaciones deterministas previas (como confirmaciones de longitud de caracteres, validación sintáctica de formatos y detección de lenguaje abusivo) antes de remitir la carga del estudiante al modelo de lenguaje48.  
El flujo de integración emplea aserciones estructuradas y marcos de evaluación automatizados (como promptfoo) para asegurar que la retroalimentación cualitativa sea empática, constructiva y coherente, mitigando las desviaciones y asegurando la correspondencia estadística con los criterios de los expertos17.

YAML  
\# Configuración técnica de aserción de rúbrica empleando promptfoo para evaluar respuestas abiertas  
assert:  
  \- type: llm-rubric  
    value: |  
      Evalúa la respuesta del estudiante a la pregunta clínica.  
      El alumno debe describir con precisión las funciones del biofilm oral en estado de salud y enfermedad.  
      Asigna una puntuación normalizada de 0 a 1 basada exclusivamente en los siguientes criterios de la rúbrica:  
      \- Nivel Excelente (1.0): Describe explícitamente la homeostasis bacteriana en salud y la disbiosis en periodontitis.  
      \- Nivel Suficiente (0.5): Nombra las funciones protectoras en salud pero omite los mecanismos de daño tisular en enfermedad.  
      \- Requiere Mejora (0.1): Presenta conceptos generales erróneos o confusos respecto al microbioma oral.  
    threshold: 0.8

#### **2\. Generación Automatizada de Bancos de Preguntas (Quiz Generation)**

Los modelos generativos asisten a los creadores de cursos analizando los documentos fuente, transcripciones de vídeo o guiones instruccionales cargados en el sistema para proponer bancos de preguntas estructurados automáticamente1.  
Esta función de apoyo reduce el tiempo de diseño instruccional hasta en tres veces47. No obstante, el sistema debe estructurar los prompts de generación restringiendo las opciones incorrectas o distractores de manera que resulten plausibles y desafiantes, evitando respuestas incorrectas evidentes o absurdas que invaliden el poder de discriminación del ítem en las analíticas psicométricas posteriores50.

### **Dashboards de Analítica de Aprendizaje (Learning Analytics)**

La recopilación sistemática de eventos de interacción provee los cimientos para alimentar dos tipos de tableros analíticos orientados a distintos usuarios del sistema7:

#### **Tablero del Estudiante (Student Dashboard)**

Diseñado bajo un enfoque de refuerzo positivo y reducción del estrés cognitivo, este tablero muestra de manera clara el nivel de progreso del alumno y proporciona recomendaciones de contenido personalizadas para fortalecer sus competencias clave7.

\+------------------------------------------------------------+  
|            INTERFAZ DE ANALÍTICA DEL ESTUDIANTE            |  
\+------------------------------------------------------------+  
|                                                            |  
|  \[ PROGRESO GENERAL: 68% \]   | racha activa: \[ 12 días 🔥 \] |  
|  \=======================\>    | freezes disp: \[ ❄️ ❄️ \]       |  
|                                                            |  
|  \[ METAS DE APRENDIZAJE DIARIO \]                           |  
|  \- Módulo 3: Completa la prueba de vocabulario (10 XP)     |  
|                                                            |  
|  \[ ÁREAS SUGERIDAS DE REFUERZO \]                           |  
|  \* Biomecánica Tisular Periodontal:                        |  
|    \- Se detectó debilidad en el reactivo de inserción.     |  
|    \- \[ VER VÍDEO EXPLICATIVO (Timestamp 04:12) 📺 \]        |  
|                                                            |  
\+------------------------------------------------------------+

#### **Tablero del Administrador e Instructor (Admin Dashboard)**

Esta pantalla secundaria ofrece herramientas cuantitativas sofisticadas para auditar la calidad pedagógica y el rendimiento del curso en tiempo real7. El backend procesa las respuestas agregadas de los estudiantes para calcular indicadores de calidad estadística por reactivo6:

* **Índice de Dificultad (![][image34]\-value)**: Mide el porcentaje de examinados que responden de manera correcta al reactivo50. Valores de ![][image35] a ![][image36] denotan preguntas sanas que aportan diversidad de rendimiento; p-values inferiores a ![][image37] delatan preguntas excesivamente difíciles o con errores de diseño instruccional50.  
* **Índice de Discriminación de Subgrupos**: Evalúa el contraste de aciertos de un reactivo comparando el rendimiento obtenido por el veintisiete por ciento superior de los alumnos del curso frente al veintisiete por ciento del segmento inferior50. Si el grupo de bajo rendimiento acierta la pregunta con mayor frecuencia que el grupo superior, el reactivo debe reescribirse o eliminarse inmediatamente de la base de datos de la plataforma6.  
* **Métricas de Retención Predictiva (Algoritmo DFWI)**: Modelos predictivos estiman la probabilidad de deserción escolar basándose en el historial de calificaciones formativas, historial académico del estudiante y variables sociodemográficas complejas52. La plataforma utiliza estas estimaciones para alertar a los tutores de forma preventiva, sugiriendo intervenciones antes de que ocurra una baja voluntaria52.

## **Psicología y Diseño de Interfaces de Usuario Móviles (Mobile-First UI/UX)**

### **Mitigación de la Ansiedad Evaluativa y Retroalimentación Constructiva**

La palabra "examen" suscita de forma universal altos niveles de estrés cognitivo y cansancio mental, lo que altera negativamente el rendimiento académico real de los usuarios2. El diseño de interfaces (UI/UX) moderno debe enfocar la evaluación como un proceso colaborativo y continuo que minimice la ansiedad a través de prácticas de diseño empáticas2:

* **Sustitución de Cronómetros Intrusivos**: Debe evitarse el uso de temporizadores de cuenta regresiva grandes y parpadeantes de color rojo en la cabecera de la interfaz54. El tiempo límite para la resolución de los reactivos debe procesarse de manera discreta o mediante el uso de barras de progreso visuales suaves8.  
* **Retroalimentación Constructiva de Error**: Si el alumno falla un reactivo, el sistema no debe limitarse a mostrar una alerta estática de error8. La aplicación debe ofrecer una explicación detallada del fallo cognitivo directamente debajo del reactivo e incorporar un enlace profundo o marca de tiempo exacta que sugiera repasar la sección específica del vídeo del curso8.  
* **Fraccionamiento Microlearning**: Los exámenes de gran extensión deben segmentarse en bloques de evaluación más pequeños (de tres a cinco preguntas por sesión formativa), promoviendo interacciones rápidas y reducidas que encajen de forma natural en los hábitos diarios de ocio y traslados del estudiante8.

### **Patrones de Interacción Móvil y Ergonomía del Toque**

El diseño centrado en movilidad requiere considerar la ergonomía del pulgar, garantizando que todos los elementos interactivos críticos se ubiquen en zonas de fácil acceso sobre la pantalla del terminal inteligente1. Las dimensiones mínimas para todos los targets de toque interactivos deben respetar estrictamente el tamaño recomendado de ![][image38] píxeles para pantallas de alta resolución, manteniendo un espaciado periférico suficiente que evite las pulsaciones accidentales de elementos contiguos8.  
Al integrar mecánicas interactivas ágiles, como los deslizamientos laterales (swipe) o arrastrar y soltar (drag and drop), el equipo de diseño debe apegarse a lineamientos que eviten confusiones operativas en el usuario7:

* **Evitar Destrucción de Datos sin Confirmación**: No se debe completar la eliminación o el descarte definitivo de elementos a través de deslizamientos accidentales sin solicitar previamente confirmación visual mediante diálogos rápidos o proveer una opción visible de deshacer (undo) instantáneo en pantalla55.  
* **Mantener Consistencia Semántica**: El significado de los gestos debe conservarse de forma idéntica en toda la aplicación; un deslizamiento hacia la izquierda no debe actuar como eliminación en una pantalla y como avance en otra, dado que la incoherencia sobrecarga la memoria operativa del usuario55.  
* **Preservar la Navegación Global**: Los controles de gestos de los reactivos nunca deben entrar en conflicto ni superponerse con los gestos universales del sistema operativo del dispositivo móvil (tales como volver a la pantalla anterior o desplegar paneles laterales colapsables)55.

### **Estrategias de Integridad Académica: Proctoring Intrusivo vs. Evaluaciones de Libro Abierto**

Para proteger la validez del proceso evaluativo, los arquitectos de software se enfrentan a la decisión metodológica de integrar herramientas de control biométrico invasivo o replantear el diseño instruccional del curso1.

\+--------------------------------------------------------------------------+  
|                         SISTEMAS DE INTEGRIDAD                           |  
\+--------------------------------------------------------------------------+  
|                                                                          |  
|       \[ PROCTORING INTRUSIVO \]             \[ DISEÑO DE LIBRO ABIERTO \]   |  
|                                                                          |  
|      \- Monitorización facial activa       \- Casos de estudio complejos   |  
|      \- Bloqueo rígido de pestañas         \- Planteamiento de dilemas     |  
|      \- Alta fricción y ansiedad           \- Pensamiento crítico aplicado |  
|      \- Vulnerabilidad de privacidad       \- Experiencia de bajo estrés   |  
|                                                                          |  
|              (Control Físico)                    (Estructura Lógica)     |  
|                      |                                    |              |  
|                      v                                    v              |  
|            \[ Alta Resistencia \]                 \[ Mayor Autenticidad \]   |  
|                                                                          |  
\+--------------------------------------------------------------------------+

El proctoring automatizado mediante monitorización de cámara web, reconocimiento de rostro e inhabilitación temporal de pestañas del navegador web reduce las opciones de copia rápida en exámenes tradicionales1. Sin embargo, estas soluciones aumentan notablemente el estrés del estudiante, imponen barreras de accesibilidad técnica significativas en zonas con baja conectividad de datos y generan susceptibilidades éticas relacionadas con la privacidad de los datos personales recopilados1.  
Frente al control punitivo del proctoring, el diseño de evaluaciones prácticas de libro abierto se presenta como la aproximación recomendada en plataformas educativas modernas1. Este modelo se fundamenta en la presentación de casos de estudio complejos, dilemas éticos situacionales y simulaciones que evalúan la síntesis y aplicación práctica del conocimiento1. Al centrarse en la resolución creativa de problemas y la toma de decisiones, las respuestas no pueden extraerse mediante búsquedas directas en la web, de modo que se neutraliza el fraude académico de forma orgánica y respetuosa, promoviendo una experiencia de usuario de baja ansiedad y alta autenticidad1.

## **Ecosistema de Herramientas para el Desarrollo de Aplicaciones Educativas**

El desarrollo exitoso de una aplicación e-learning demanda una decisión técnica clave: ¿conviene programar el backend completamente desde cero, o es preferible construir sobre un núcleo de servicios headless de código abierto con APIs completamente documentadas?5. Para los equipos de desarrollo orientados a lanzar un producto escalable en tiempos acotados, el uso de frameworks headless y modulares representa la aproximación más eficiente56.

                                  \+-----------------------+  
                                  |   Aplicación Móvil /  |  
                                  |    Frontend React     |  
                                  \+-----------------------+  
                                              |  
                                              | (Llamadas API REST / JSON)  
                                              v  
                                  \+-----------------------+  
                                  |     Headless API      |  
                                  |   (Laravel / Laravel  |  
                                  |  Horizon Queue / Cron)|  
                                  \+-----------------------+  
                                              |  
                     \+------------------------+------------------------+  
                     |                                                 |  
                     v                                                 v  
       \+----------------------------+                    \+----------------------------+  
       |     Base de Datos SQL      |                    |     Servidor Redis Cache   |  
       |       (PostgreSQL)         |                    |     (Sesiones y Colas)     |  
       \+----------------------------+                    \+----------------------------+  
                     |                                                 |  
                     \+------------------------+------------------------+  
                                              |  
                                              v  
                                  \+-----------------------+  
                                  | Almacenamiento en S3  |  
                                  |   (Assets H5P / CDN)  |  
                                  \+-----------------------+

### **Wellms (EscolaLMS): Estructura del Core y Capacidades de Integración**

Wellms (antes EscolaLMS) se posiciona como una de las mejores soluciones de código abierto bajo licencia MIT para la creación ágil de plataformas educativas headless56. Su arquitectura, basada en Laravel 9+ (PHP 8\) y React para el panel de administración, está diseñada bajo un enfoque modular desacoplado que expone APIs REST robustas y completamente documentadas57.  
El backend de Wellms se estructura mediante paquetes independientes de Laravel (disponibles en Packagist) que gestionan de forma nativa la lógica de negocio de la aplicación59:

* escolalms/courses: Control integral del catálogo, estructura temática del curso e inscripciones de alumnos.  
* escolalms/topic-types: Permite añadir tipos de contenidos interactivos altamente personalizados en los módulos del curso58.  
* escolalms/h5p: Integración nativa del estándar H5P, permitiendo almacenar recursos interactivos en librerías asíncronas que se ajustan de manera automática a los estilos visuales del frontend que los consume57.  
* escolalms/recommender: Motor inteligente que sugiere contenidos y refuerzos formativos en función del desempeño registrado por el usuario57.

Wellms cuenta con soporte nativo para almacenamiento en la nube S3 e integración integrada con redes de distribución de contenido (CloudFront CDN), garantizando un rendimiento óptimo de los recursos audiovisuales del curso60. Al ser un backend stateless y desacoplado, Wellms facilita el escalado horizontal de sus instancias mediante arquitecturas Docker y despliegues automáticos sobre entornos de orquestación Kubernetes (K8s)60.

### **LearnHouse: Arquitectura Moderna de Alta Velocidad**

Como alternativa de nueva generación, LearnHouse destaca en el ecosistema de código abierto por su propuesta de pila tecnológica moderna basada en Python y TypeScript62. Su arquitectura desacoplada distribuye el trabajo en tres servidores independientes para garantizar una alta velocidad de respuesta62:

* **Backend API**: Desarrollado con FastAPI, Python, SQLModel y Alembic para migraciones, ofrece un rendimiento ágil para tareas lógicas, pasarelas de pago integradas y llamadas a servicios de inteligencia artificial asíncronas62.  
* **Servidor Colaborativo (Collab)**: Construido sobre Node.js, WebSockets, Hocuspocus y Yjs, maneja la sincronización en tiempo real de pizarras compartidas y edición interactiva de contenidos sin retrasos en la interfaz62.  
* **Web Frontend**: Desarrollado en Next.js, React, TailwindCSS y Tiptap, proporciona un panel integrado y un visor de lecciones optimizado para ordenadores y navegadores móviles62.

LearnHouse se distribuye bajo una licencia libre AGPL-3.0 y cuenta con una interfaz de línea de comandos (CLI) que agiliza la gestión de copias de seguridad de datos, la monitorización de servicios mediante un diagnóstico integrado y la automatización de actualizaciones62.

### **Alternativas Headless Enterprise y Gestores de Contenido Componibles**

Para proyectos con requerimientos empresariales avanzados de comercio electrónico o necesidades de marca blanca múltiple (multitenancy), existen alternativas robustas47:

* **Absorb Infuse**: Suite empresarial que permite integrar las capacidades de administración, progreso y cumplimiento del LMS Absorb directamente en aplicaciones empresariales nativas mediante su SDK y API REST integrada63.  
* **Helium Framework**: Framework React interactivo de código abierto para la creación de experiencias e-learning personalizadas consumiendo el motor headless de Thought Industries mediante APIs GraphQL de alto rendimiento63.  
* **Storyblok / Payload CMS**: Gestores de contenido desacoplados (Headless CMS) con editores visuales potentes que permiten definir tipos de datos personalizados para cursos, reactivos de examen y simulaciones complejas, delegando la visualización a aplicaciones nativas iOS/Android optimizadas para movilidad64.

## **Directrices Estratégicas para el Desarrollo de la Aplicación**

Para asegurar que el desarrollo de la aplicación e-learning resulte exitoso, escalable y mantenga un alto nivel de engagement desde su lanzamiento inicial, se aconseja estructurar la hoja de ruta del proyecto bajo las siguientes directrices técnicas:

1. **Adoptar un Enfoque API-First Sólido**: Se aconseja iniciar el desarrollo del backend empleando un framework headless educativo robusto de código abierto como Wellms o LearnHouse56. Esto permitirá delegar las tareas comunes de administración, inscripciones y base de datos a un núcleo estable de servicios, permitiendo al equipo de ingeniería focalizar los recursos en el desarrollo del frontend de la aplicación móvil y las experiencias adaptativas diferenciadoras1.  
2. **Modelar una Infraestructura de Datos Unificada con xAPI**: Es indispensable integrar un almacén de datos LRS (Learning Record Store) asíncrono para estructurar las analíticas bajo la sintaxis estandarizada de xAPI40. Registrar de manera inmutable interacciones finas como el tiempo de respuesta detallado de las preguntas de examen, los retrocesos en simulaciones o las pausas en material de estudio permitirá alimentar de manera eficiente motores de recomendación y optimizar la validez pedagógica de las evaluaciones35.  
3. **Integrar Repetición Espaciada y Modelos Adaptativos**: La consolidación cognitiva a largo plazo debe asegurarse mediante implementaciones optimizadas de repetición espaciada basadas en variaciones de SM-2 o el algoritmo FSRS10. Además, estructurar las evaluaciones diagnósticas iniciales mediante Tests Adaptativos Computarizados basados en la Teoría de Respuesta al Ítem (IRT 3-PL) garantizará un diagnóstico preciso del nivel competencial reduciendo la duración media de los exámenes a la mitad4.  
4. **Optimizar el Diseño UX para Entornos de Movilidad Continua**: El desarrollo de la interfaz de la aplicación debe concebirse bajo criterios Mobile-First y de baja ansiedad evaluativa8. Diseñar zonas de toque con un área mínima de ![][image38] píxeles, emplear deslizamientos laterales ergonómicos y consistentes con confirmación automática ante acciones destructivas, y favorecer evaluaciones de libro abierto de aplicación práctica frente a proctorings invasivos asegurará una alta retención y finalización exitosa del curso1.

#### **Fuentes citadas**

1. Top 20 Education App Development Companies: A Research-Backed Guide, [https://techtidesolutions.com/blog/education-app-development-companies/](https://techtidesolutions.com/blog/education-app-development-companies/)  
2. E-Learning Website UI/UX Project Report | PDF | Educational Technology | Usability \- Scribd, [https://www.scribd.com/document/864744535/final-report](https://www.scribd.com/document/864744535/final-report)  
3. Headless LMS: why the UI is becoming a side door \- Valamis, [https://www.valamis.com/blog/headless-lms](https://www.valamis.com/blog/headless-lms)  
4. Survey of Computerized Adaptive Testing: A Machine Learning Perspective \- arXiv, [https://arxiv.org/html/2404.00712v4](https://arxiv.org/html/2404.00712v4)  
5. How to Build an LMS from Scratch: Features and Must-Haves (2026 Guide), [https://ambsandigital.com/how-to-build-an-lms/](https://ambsandigital.com/how-to-build-an-lms/)  
6. Is Your Exam a Good Candidate for Computer-Based Testing? \- ExamSoft, [https://examsoft.com/resources/is-your-exam-a-good-candidate-for-computer-based-testing/](https://examsoft.com/resources/is-your-exam-a-good-candidate-for-computer-based-testing/)  
7. The Future of LMS UI/UX: Emerging Trends and Innovations | Blog | Workast, [https://www.workast.com/blog/the-future-of-lms-ui-ux-emerging-trends-and-innovations/](https://www.workast.com/blog/the-future-of-lms-ui-ux-emerging-trends-and-innovations/)  
8. 7 Ways To Make Your LMS Perfect For Mobile Users \- GO-Globe, [https://www.go-globe.com/ways-to-make-your-lms-perfect-for-mobile-users/](https://www.go-globe.com/ways-to-make-your-lms-perfect-for-mobile-users/)  
9. Full article: Double-blind multiple peer reviews to change students' reading behaviour and help them develop their writing skills \- Taylor & Francis, [https://www.tandfonline.com/doi/full/10.1080/03098265.2021.1901265](https://www.tandfonline.com/doi/full/10.1080/03098265.2021.1901265)  
10. Spaced Repetition Algorithms Explained: FSRS vs SM-2 vs Leitner (2026) \- StudyGlen, [https://studyglen.com/guides/best-spaced-repetition-apps](https://studyglen.com/guides/best-spaced-repetition-apps)  
11. SM-2 Algorithm Explained: The Science Behind Spaced Repetition \- Tegaru, [https://tegaru.app/en/blog/sm2-algorithm-explained](https://tegaru.app/en/blog/sm2-algorithm-explained)  
12. how spaced repetition actually works: the sm-2 algorithm \- DEV Community, [https://dev.to/umangsinha12/how-spaced-repetition-actually-works-the-sm-2-algorithm-1ge3](https://dev.to/umangsinha12/how-spaced-repetition-actually-works-the-sm-2-algorithm-1ge3)  
13. FSRS vs SM2 Spaced Repetition Algorithm \- Mindomax, [https://www.mindomax.com/fsrs-vs-sm2-spaced-repetition-algorithm](https://www.mindomax.com/fsrs-vs-sm2-spaced-repetition-algorithm)  
14. The Anki SM-2 Spaced Repetition Algorithm \- RemNote Help Center, [https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm](https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm)  
15. LLM as a Judge prompts: templates, rubrics, and best practices | Galtea Blog, [https://galtea.ai/blog/llm-as-a-judge-prompts-templates-rubrics-and-best-practices](https://galtea.ai/blog/llm-as-a-judge-prompts-templates-rubrics-and-best-practices)  
16. Rubric-Based Evaluations & LLM-as-a-Judge — Methodologies, Biases, and Empirical Validation in Domain-Specific Contexts. | by Adnan Masood, PhD. | Medium, [https://medium.com/@adnanmasood/rubric-based-evals-llm-as-a-judge-methodologies-and-empirical-validation-in-domain-context-71936b989e80](https://medium.com/@adnanmasood/rubric-based-evals-llm-as-a-judge-methodologies-and-empirical-validation-in-domain-context-71936b989e80)  
17. LLM Rubric | Promptfoo, [https://www.promptfoo.dev/docs/configuration/expected-outputs/model-graded/llm-rubric/](https://www.promptfoo.dev/docs/configuration/expected-outputs/model-graded/llm-rubric/)  
18. AI-assisted JSON Schema Creation and Mapping Deutsche Forschungsgemeinschaft (DFG) under project numbers 528693298 (preECO), 358283783 (SFB1333), and 390740016 (EXC2075) \- arXiv, [https://arxiv.org/html/2508.05192v2](https://arxiv.org/html/2508.05192v2)  
19. Computer Adaptive Testing and IRT Overview | PDF \- Scribd, [https://www.scribd.com/doc/85811628/irtNew](https://www.scribd.com/doc/85811628/irtNew)  
20. Developing Computerized Adaptive Testing for a National Health Professionals Exam: An Attempt from Psychometric Simulations \- PMC, [https://pmc.ncbi.nlm.nih.gov/articles/PMC10624130/](https://pmc.ncbi.nlm.nih.gov/articles/PMC10624130/)  
21. Optimizing Educational Assessment: The Practicality of Computer Adaptive Testing (CAT) with an Item Response Theory (IRT) Approach | Huda | JOIV : International Journal on Informatics Visualization, [https://joiv.org/index.php/joiv/article/view/2217](https://joiv.org/index.php/joiv/article/view/2217)  
22. Calibration of AI large language models with human subject matter experts for grading of clinical short-answer responses in dental education \- PMC, [https://pmc.ncbi.nlm.nih.gov/articles/PMC12896245/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12896245/)  
23. Scaling Success: A Systematic Review of Peer Grading Strategies for Accuracy, Efficiency, and Learning in Contemporary Education \- arXiv, [https://arxiv.org/html/2508.11677v1](https://arxiv.org/html/2508.11677v1)  
24. How Kritik Ensures Accountability in Peer Assessment, [https://www.kritik.io/blog-post/how-kritik-ensures-accountability-in-peer-assessment](https://www.kritik.io/blog-post/how-kritik-ensures-accountability-in-peer-assessment)  
25. Using Peer Review in Canvas LMS: Embracing and Leveraging Existing Features, [https://extensionhelpcenter.ucsd.edu/hc/en-us/articles/45303673169165-Using-Peer-Review-in-Canvas-LMS-Embracing-and-Leveraging-Existing-Features](https://extensionhelpcenter.ucsd.edu/hc/en-us/articles/45303673169165-Using-Peer-Review-in-Canvas-LMS-Embracing-and-Leveraging-Existing-Features)  
26. Least Square Calibration for Peer Reviews | OpenReview, [https://openreview.net/forum?id=rTxCRLXRtk9](https://openreview.net/forum?id=rTxCRLXRtk9)  
27. Duolingo — Streak System Detailed Breakdown & Design\! \- Medium, [https://medium.com/@salamprem49/duolingo-streak-system-detailed-breakdown-design-flow-886f591c953f](https://medium.com/@salamprem49/duolingo-streak-system-detailed-breakdown-design-flow-886f591c953f)  
28. The habit-building research behind your Duolingo streak, [https://blog.duolingo.com/how-duolingo-streak-builds-habit/](https://blog.duolingo.com/how-duolingo-streak-builds-habit/)  
29. Step-by-Step Guide: Building a Duolingo Clone | Adalo, [https://www.adalo.com/posts/step-by-step-guide-building-a-duolingo-clone-with-adalo/](https://www.adalo.com/posts/step-by-step-guide-building-a-duolingo-clone-with-adalo/)  
30. Implementing a Daily Streak System: A Practical Guide \- Tiger's Place, [https://tigerabrodi.blog/implementing-a-daily-streak-system-a-practical-guide](https://tigerabrodi.blog/implementing-a-daily-streak-system-a-practical-guide)  
31. How To Create A Branching Scenario For Impactful Training \- Elucidat, [https://www.elucidat.com/blog/simple-branching-scenarios/](https://www.elucidat.com/blog/simple-branching-scenarios/)  
32. 15 Best Scenario-Based Learning Software Tools to Build Skills \- Docebo, [https://www.docebo.com/learning-network/blog/best-scenario-based-learning-software/](https://www.docebo.com/learning-network/blog/best-scenario-based-learning-software/)  
33. Externalizing Tacit Craft Knowledge Through Semantic Graphs and Real-Time VR Simulation \- MDPI, [https://www.mdpi.com/2079-9292/15/6/1294](https://www.mdpi.com/2079-9292/15/6/1294)  
34. Showcase | Elearning Examples \- Elucidat, [https://www.elucidat.com/showcase/](https://www.elucidat.com/showcase/)  
35. eLearning Standards: SCORM, xAPI, cmi5, LTI, OneRoster and Ed-Fi Explained, [https://aristeksystems.com/blog/elearning-standards/](https://aristeksystems.com/blog/elearning-standards/)  
36. SCORM vs xAPI vs LTI: Which Standard Do You Need? \- Of Ash and Fire, [https://www.ofashandfire.com/blog/scorm-vs-xapi-vs-lti-elearning-standards-guide](https://www.ofashandfire.com/blog/scorm-vs-xapi-vs-lti-elearning-standards-guide)  
37. LTI Vocabulary \- Instructure Community, [https://community.instructure.com/en/kb/articles/637146-lti-vocabulary](https://community.instructure.com/en/kb/articles/637146-lti-vocabulary)  
38. SCORM vs. LTI: what's the difference? \- Rustici Software, [https://rusticisoftware.com/blog/scorm-vs-lti/](https://rusticisoftware.com/blog/scorm-vs-lti/)  
39. Start with SCORM and LTI 1.3: Connecting Genially to Your LMS, [https://help.genially.com/en\_us/start-with-scorm-and-lti-1-3-connecting-genially-to-your-lms-SkoS6G951x](https://help.genially.com/en_us/start-with-scorm-and-lti-1-3-connecting-genially-to-your-lms-SkoS6G951x)  
40. xAPI — Open edX Aspects latest documentation, [https://docs.openedx.org/projects/openedx-aspects/en/latest/technical\_documentation/concepts/xapi\_concepts.html](https://docs.openedx.org/projects/openedx-aspects/en/latest/technical_documentation/concepts/xapi_concepts.html)  
41. What Is xAPI? Tracking Learner Data—Wherever It Goes, [https://www.articulate.com/blog/what-is-xapi/](https://www.articulate.com/blog/what-is-xapi/)  
42. Learning Record Store (LRS) \- xAPI.com, [https://xapi.com/learning-record-store/](https://xapi.com/learning-record-store/)  
43. SCORM Dispatch vs LTI: Best Option for Course Distribution, [https://welcomenext.com/lti-alternative-for-training-providers/](https://welcomenext.com/lti-alternative-for-training-providers/)  
44. Kaltura's support for the Learning Tools Interoperability (LTI) standard, [https://knowledge.kaltura.com/help/kalturas-support-for-the-learning-tools-interoperability-lti-standard](https://knowledge.kaltura.com/help/kalturas-support-for-the-learning-tools-interoperability-lti-standard)  
45. Understanding LTI 1.3 vs. SCORM: Reed's LTIxcellent adventure \- Rustici Software, [https://rusticisoftware.com/blog/understanding-lti-13-vs-scorm-reeds-ltixcellent-adventure/](https://rusticisoftware.com/blog/understanding-lti-13-vs-scorm-reeds-ltixcellent-adventure/)  
46. Learning Tools Interoperability (LTI) \- 1EdTech, [https://www.1edtech.org/standards/lti](https://www.1edtech.org/standards/lti)  
47. 10 iSpring Alternatives Worth Attention in 2026, [https://www.educate-me.co/blog/ispring-alternatives](https://www.educate-me.co/blog/ispring-alternatives)  
48. AI LLM Test Prompts \+ Model Evaluation 2026 \- Future AGI, [https://futureagi.com/blog/ai-llm-prompts-model-evaluation-2025/](https://futureagi.com/blog/ai-llm-prompts-model-evaluation-2025/)  
49. LLM-as-Judge: A Practical Guide to Automating Prompt Evaluation (2026) | SurePrompts, [https://sureprompts.com/blog/llm-as-judge-prompting-guide](https://sureprompts.com/blog/llm-as-judge-prompting-guide)  
50. Understanding Exam Question Performance via Assessment Software \- ExamSoft, [https://examsoft.com/resources/item-analysis-with-examsoft/](https://examsoft.com/resources/item-analysis-with-examsoft/)  
51. Blended Learning in Practice Autumn 2022 \- University of Hertfordshire Research Archive, [https://uhra.herts.ac.uk/id/eprint/9993/1/BLIP\_Autumn\_2022\_Final\_XLV\_1.pdf](https://uhra.herts.ac.uk/id/eprint/9993/1/BLIP_Autumn_2022_Final_XLV_1.pdf)  
52. Identifying Courses for Targeted Review Using GAP Analysis and Machine Learning \- MDPI, [https://www.mdpi.com/2227-7102/16/5/806](https://www.mdpi.com/2227-7102/16/5/806)  
53. Learning Analytics Platform Guide, [https://www.teachingandlearning.ie/wp-content/uploads/LA\_Platform\_Guide\_proof03.pdf](https://www.teachingandlearning.ie/wp-content/uploads/LA_Platform_Guide_proof03.pdf)  
54. Ultimate Guide to Onboarding UX Design for Higher User Retention \- Hashbyt, [https://hashbyt.com/blog/onboarding-ux-best-practices](https://hashbyt.com/blog/onboarding-ux-best-practices)  
55. Using Swipe to Trigger Contextual Actions \- NN/G, [https://www.nngroup.com/articles/contextual-swipe/](https://www.nngroup.com/articles/contextual-swipe/)  
56. Commerce Layer vs. Wellms Comparison \- SourceForge, [https://sourceforge.net/software/compare/Commerce-Layer-vs-Wellms/](https://sourceforge.net/software/compare/Commerce-Layer-vs-Wellms/)  
57. Wellms \- GitHub, [https://github.com/EscolaLMS](https://github.com/EscolaLMS)  
58. Wellms LMS docs, [https://docs.wellms.io/](https://docs.wellms.io/)  
59. GitHub \- EscolaLMS/API: Laravel REST API. Main module that compose all Laravel packages, [https://github.com/EscolaLMS/API](https://github.com/EscolaLMS/API)  
60. Wellms \- Future of e-learning starts today, [https://tech.wellms.io/](https://tech.wellms.io/)  
61. EscolaLMS/Create-LMS-App: Bash script to install WellmsLMS with oneliner \- GitHub, [https://github.com/EscolaLMS/Create-LMS-App](https://github.com/EscolaLMS/Create-LMS-App)  
62. learnhouse/learnhouse: The Next-gen Open Source learning platform for everyone \- GitHub, [https://github.com/learnhouse/learnhouse](https://github.com/learnhouse/learnhouse)  
63. TopClass LMS: Top Alternative Solutions in 2026, [https://www.d2l.com/blog/topclass-lms/](https://www.d2l.com/blog/topclass-lms/)  
64. Top Kuroco Alternatives in 2026 \- Slashdot, [https://slashdot.org/software/p/Kuroco/alternatives](https://slashdot.org/software/p/Kuroco/alternatives)  
65. Are there services that offer a sort of "Headless LMS", to avoid building everything from scratch? \- Reddit, [https://www.reddit.com/r/webdev/comments/1jq6ott/are\_there\_services\_that\_offer\_a\_sort\_of\_headless/](https://www.reddit.com/r/webdev/comments/1jq6ott/are_there_services_that_offer_a_sort_of_headless/)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAaCAYAAABPY4eKAAABg0lEQVR4Xu2UzyuEQRjHRyhaCinJQevmROSgHF3cNqWUPVOOLvwDcnGRg5SS3OSqHPwH/gaF5LDKQTj4Ed/vzjO7z455d97bHsynPu0788yz7848z6wxif/OAvzJ6YbkkLx5b3BacjI5gZ9wzptvg1PwDi56MZKV1w5X4SMc92IN9MNreAtHGkM1juC8N+fybuCQFyOD8AIO+wHNBHyB57BD5vg5CTtlvCfrNKE8nlRBnvnyA9gj4yArxtZnU83xBLhb90U88r56uIrL073AI9419kdw/ZI8Z8KXfMGSsUc0Cg/htl4UgHm63qzzDlyrrYjg6vYNH+A9rMjYr7HG5XHnbKpXeX6HM2pdU3gNeB103XrhGRyTMXfEOU0oj0d+ZWytcxGqGzt3H3bJeBmu18NVQn2i6x2Fi45N+J462KmnsKjmsvJ4M1yDRondU1I29hT0bvLkRQnVzcEdbMEnOOvFmuVFYRezQ93/r+50+qFil7Dbpv3Jo8+yZkDWJBKJROv4Bc43aCqwXUgBAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAZCAYAAAAv3j5gAAABnElEQVR4Xu2UzSsGURSHj1BEFKXY+EjKQhSRoqyUhZJSykZKdoQiysI/oOxkJ71lYaFERNayULZKPiI7C0VZiN+vc6+5d2beeSUbep96aubeM3PunHvuiGT5S1TCJbgOl2G9P52WJjgEK2AOLIbdcMQNsrTDI9GAZrgHP+Cs6MNJDIvGut7BFjeIFMIdOAZzzVg5PIMvsNWMpaMfXhlP4RQs8SIMLNktfBb9Gsui6OpmnLE4mGg+PBhHPlyFh6JJLXyYiTK95NuJ4siD2/Ad9vhTEZhoAx6Ilu8ajkuwDYl0iO4PO5BfnAQTncAyc89uvYdzkqGRSuEx3IRFobk4CowWvjwlmqzWGffg6tfgimg3/hSWkvvbF54gNsmCBPVthL1fEVEa4APcFX9hNhHL6sHP5eGcNteWCTjo3LOsVRLE8IxxL91EtnSRM8iJUfgqWleeausT7DJxPMQX8A12mjEm5ktrzD3hNbsv0kj2wIZ/I/QR1pk4/sP24SWsNmOkDZ6LHvBJeAO3RBfx67A7uZcDol+U2NZZsvwzPgF9AU4DLVsEwwAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAaCAYAAAC+aNwHAAABT0lEQVR4Xu2TvytGURjHH2EQMhApo8WPRWGSwaDUa2MQFoOU0SCbksHAIKX8AyaDySZlkZkJoWRRTCaFz+M5h3vPPYd3MMmnPt17z/f0vOc95zkif55GHMYx7MDKfBynAgfxFA9w0nmIl9j3NbVINa7htRQnaraDT9gTZB/ohG18xP4g83SLFdgSW2mOOXx1zxSteIvn2JQN2vEez7A5GwT4Aqq+f7KMb+75HW14J0GBOjzCFxzwgwk013nHWO8Hk8uKsCiRlfoCuaoRGvAEH7ArG+hu6q5eYUs2CJgSO6WFMKjCXbHz1XPWflgR67p19619obk2kn4X0M7yEyZw3I1P4zze4AbWuPEo2roXYru8Ktb/+2IrGRLrPL1M0RV4NOwVu32jOCtWzFNyednM4LPYxm3invzwN0JGxM5d1T1KXbIktbgk9uudQfbPb/EO1Mw/xHP0yeAAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAaCAYAAACO5M0mAAAAw0lEQVR4Xu3RPwtBURzG8Z9BUUomMwPZlKwmi4EUE96HssriDSibF2EyMCozdovJxmLhezp/Opxu3VV56tPtPue5dzkiv5U0BlhijvLnsU4WG0yRQRUn9PyRyhgH5LxuiDPytlCHarSyhUkdd3RsUcFNwmEND8y+i6ih69t4+YVJMGxJzGFQRPVBEdUXcfULEzuc2ELdxA5rpGxJmniap8sIFxTMe0L0de5FX69LEgts0TWjo+g7D6L+UkIfDdEf/xMvb7M7LHVni9rlAAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAaCAYAAACO5M0mAAAA2ElEQVR4Xu3SsQpBURzH8VMoMhiUUorBYjIYxOAFlMlkVR7AoiwyGy0yegEvYKIUBgbJYOEdDCa+f+dcjnsNjMqvPt1z/vc3nE5Hqd9JCjUk4EMQWTTM+pEiLrhazijbJUkOO+yxQRfxl4aJFPvu4bt8VRxjhANO6CBklyRSXCBt9lEsMUTAKUlkE7YHpK30TRRcc09aSl9T0/3DHU9RzrPCFjFnqJ5F+d4jF3tU3qKcUYoVZ+DHAHlnQCKYYmLWjyQxQw91rDFX+pF4IldUQhUZpV/RP5/lBpYrJYu4OfEYAAAAAElFTkSuQmCC>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAaCAYAAACO5M0mAAAAlklEQVR4XmNgGLqAH4jnA7EuugQyYATiSiD+CsTGaHIowByI3zEQUAiycjYQz2LAoxBkZREQBwNxOQMehWZA3AvErAx4FIKsBFmnAOVjVQiyshCIQ5HEsCo0ZEBYCQOUKcwA4kdo+AsQ/wfiV0B8GIjF4KrRAFYTsYEqIP4GxKboEjDgwgCxDmQtCP8F4mMMeKweBaQBAN/xJYSnECG/AAAAAElFTkSuQmCC>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAaCAYAAACO5M0mAAAA70lEQVR4Xu3SoWsCYRjH8WcMQZg6xFXrUBjosA+bWJYW1g2ziRjMiwaL0aSI4D+wPrC5P0EtCzaRCRZhuO9z73OTO3Vd2A8+cO9zP+6991TkvJJADV284hYXgQbJ4R1FJPGCLRoSKnfwjUdba/kDS2T9kqaNHSq2jmOMtbjdfhPBDS5tfYeVuNeJ2ewgeqghPpEP3fNyhZG4whwl2e9wMhksMBD3gJPRT6Lb6wGroXuBHC3qietGr/00xRX7/qCAjdFrP1rQov4YXtKYoodrm6UwEfct723mpYwZWnjGG75sfpCouD/FEx4k+L7/+Ts/3d0o22ISDHYAAAAASUVORK5CYII=>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAaCAYAAACO5M0mAAAA1UlEQVR4XmNgGFpAEohrgXgWEDcCsQqqNASYAfFuILYFYn0g3grE/4G4GIgZYYo4gXgDECcBMTNUTBiITwHxVyA2hoqBrXwIxJ8YIKbBQBUDxNQimAArEE8E4p0MEE0wUM4AUQiicQIWIF4DxH+B2AFVChWYM0DcBwoBkI1YAT8Q7wHixUDMjSYHByDdM4C4jwESGjgBUQphiioZEOGpCcRucBUMkNAHxUIhlA0D6UAcBOOAJBKA+BsQPwHiR0j4HRDbwBTCYgYUuOj4ORArwRSOAsoBAOCsJ6IkC06cAAAAAElFTkSuQmCC>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAaCAYAAACO5M0mAAAAVklEQVR4XmNgGJpAAYgj0AVhQBOIs4B4HxD/BeKFqNIIAFIYAMRWQPyEAY9CGJAE4ocMowpxANopXArEjGhyYODCAIk6UDz/h+IvQHwJiHWR1I0CCgEAejIbyUtdBmMAAAAASUVORK5CYII=>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAaCAYAAAAwspV7AAABvElEQVR4Xu2VTSsGURTHj1CEvKQkC7FiRWShLC1YKCmlWFOysuELyMZGFlJKspOtstDzBXwAK4VkQVkICy/x/zv3PnOf684Yk5KaX/0yM+eeMffec+4jkvM/KIfNsNIP/CVD8AWO+QGXUfie0kWTY0mb+wj7TQ7fcQU7zH0iu6Iz4ExcymAfvIATXswSl8utmoXXsBtWwAO4I/reRBrhCTyHbaWhIttw2H8oUe4ZbPFihPVzCFtF46dwpGREDD3wXnQWnA3h316JCnLdjPMJ5XIVasw1P2oT1oquZAHWm1gi06J7v+Q844pxdezLuXUNUbiIzXXrjVu1JvpxzJk013NwwRmXCP/5KxwXXeZ2uAVX3EExMNetJ9bRqugH+HTBJv9hCFsTb6JdcQlvzH2ohlxsLleKxfxgrp/ggDPux7BV2bJuTdTBfdhp7jl7PvMJ5XLrjkVrKTOhmmCXbMAqcz8F56NwkVAtuvWUCSbyzAidMRZ2zZ58Pezictmttjky8d0ZQ2ZEV82feZrcTIRqwsLZLsNbOOjFSFJuJthV7Bb72+R2Hn12YkewWtM+8XPpnRmXqt1zcnJycn6JD1Urb93JYxVXAAAAAElFTkSuQmCC>

[image11]: <data:image/png;base64,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>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAxCAYAAABnGvUlAAAEeUlEQVR4Xu3cS6h2UxgH8CWXXENEovAhIZciAxkoUQrJiAwMDBhIIZTL5JMYoMhQyUCEMhJJOWWGiWIiBiRCMcGAXNa/tbd3ne2c93Iu5eT3q6e999r7vGft/Z7aT89a65QCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADA/8iHNV6cNrJtB9V4vcaR0xMAwN50QI0bapw37J+9/vSu+qnGTdNGtu3EGl9MGwGAvSkJ2qvd8Wc11ob9v7r9jVxX2jW9fNZLk7ZfSqv2jE6p8eyw/1xpfdgp95dWtXtgemKQytMzpfXhrBqfrD/9n3Fxac8s/R09XuOo7jjWauzrjg+r8WmNe2q83bVvV77rPLd8l5tJNe/OGieUliwevf40ALBVSQwe647z8n+5O57n3RrfdsfHl/ZiT7LQ+73G5cP+IcM2151TWoKxiodrXDZtnMg9bZawpXr4XY3jhuNpwrmTnp82rCA/Oz6zk2ucWtp9TfX9P3zYPlXjtdKqbDttXsJ2RY03ahxa48Hy778DAGCLkmTlJXzwcJztucP20tJewptJsrY27KdKdmGNi4YYHVtatWVMHvYP2zNK+93LOqm0atyiZC3mJWxxzLBNn//sT+ywG8vWq4epEiZRi/tqXFPjtH/OzvQJ293D9urSvovdMC9hy70mWYtU9zZKMAGALcowVl78iR9qXDK0Z2hzbdjfSK7/vsbXNf6YnBvdUuPnGt+Udv10uHSRVIoSq1iUsMVXpfV9maTxzNKu30p8WeOusro8q/Ez3iyzRKi3r7Tn/ltp12eYdxnTPvbxUXfdRuYlbHFHaZ/zyPQEALB9qXjdXtqL/4OhLas318YLJjJfKRW2JA2RIbDIHKsDh/14ocyG9p4s7XcsI9Wat2qcPj2xhGUStkg/s+hhN+U+ri1tUcdYxVwkP5Nh5NE4ZH1E1xbXl9m5q8rGSd1OW5SwjTL/LkPeAMAOmA5bJbkak4V5CVufLPSmKz7zgh8nzk+TuUUuKK0Pq65anZew5TPHBQ+RCtj0GUylzxmS3Urks1MhXGVodFxwMPVQt5+Eea3MEuZVkrVpH/tYNO9tXsJ2ZZlV+XIPebb5TABgm/Ji7SfHP1rjnWF/XsK2VtavTkxS83l3HNNK0XZk/tp7ZbnEJ/c0VvxiXGiQal0SuQz7jlJR7Fdi7qQsFFh1pWTur69KRpLMVD37fiZh3s0FE5v5dXJ8W2mLVNK3/B2lr5G/o3vHiwCA7Ulys7+0f9lwa42PS0s0zi+zeW3ZH+VfNrw/tGcOWOYr/Tgc98OLr5Q2dy3tmeN2c3duq7KyM797XpVunCuXyLXpb6o+ua8kT4kkGEk0klCkn7vliWnDAhnyHJ9ZnmmebZ5xjvvFEZknNt5jzo8rb3dTntP4PecZPz20Z7Vv/pVK5Dmnmph5i5lXt+wQMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAnvY3d+PBGKj50uUAAAAASUVORK5CYII=>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAZCAYAAADnstS2AAAAc0lEQVR4XmNgGPogEojfAfF/JPwFiDOQFSEDRiCeD8T/gNgFTQ4DCALxaSB+AMTSqFKYwBiIvwLxGiBmQZPDANEMELcWoUugA5h7fwOxDZocBoC59y4Qi6PJYQDauJf6QRYLxM8YUKP4FRAnIysaBYMUAAD9Px2F6V8OKAAAAABJRU5ErkJggg==>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAbCAYAAABIpm7EAAAA10lEQVR4Xu3RrQ9BURjH8bNhY/MS2EwQaDKaYmMjKJIiois2CknX/AMUTVA0RRU0xaYKApspvufec66zO0Ui+G2f3Z3nuffc8yLEP7+UMKpIqrEPOdQQ1y/pBDHFCCc0sUQbA1xQct4mFXSQxRVrRFQvgSN6amylhQzqeKBo9GT9jK5RczLBHjGj1sAdBaPm5KMPQthgAa+qyeccW/Hak5N3a00J+9SGCGCMqG7qDZu/lndwQx5l9I2eNctOGDOQNA5YYSZcy/IL+wLdkTcuD8Hjbvzz3TwBLFQieXz1O1wAAAAASUVORK5CYII=>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAxCAYAAABnGvUlAAAFaUlEQVR4Xu3cS4gs1RkH8CM+UDRKfKIoPohvRcXXRvQuJCSIWUiCirpRRBE3ekFBcCUuBBUUQZBg1GBMjBsxiQuFXHRhICEoJLhQ4RqMgosIomAQjedPVaVr6lZ3T9+pUeb6+8HHdFdVd1dXN5w/3zk9pQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAbsO9wQ89Bww0AwOY7qtaVtfav9aNaB6zdvVAG9jNr/Xi4gy3rirI4sB3f1nftsLJreBzeB4A9wq2lGfjikFrv1zq61vm1Pm9vjzm31jtlbbj7pNbjvfsbtaPWtlq31Npea6/+zj3cW7VurvXTWhcN9k3lV7W+Hmx7sdY17e1Da11dms8134u+x2rdPdi2EfkePVLr36X57q3Hx2V2Dnn8S7VOn+0GgD1DwlgG4n16215oty9yZK1/tH/7Mnj+b7BtkVNr/abWEcMdrTzXTbV+UOvTWues3T2ZG4cbvmMnlbVhKMF5vSFmFXnefN6dBOJHe/c7T5ddA9sPa/11sG0Ked/rfa85p+46JVyu0hkGgC0jU6B/rHVnezvOKM10WMLYWWV8ELyvNJ25ofUGtgSDi0vTpVnk8Fp7l+Y8dpTNm+5KZ3HVKb6E2q4zua00zzGVy8vawJZrel3v/lTyvPnsO7neV/Xud8YCW/yyTN/1XBbY8n34eWk6aV1gy/c1Xchts8PKpbVuq3VKbxsAbFkZcDO1lME71R+w7ynj3bYc1+/KddKtWRTYMtj+pdbBwx1zHFjrt7XeK81jl7m31r82UCeU9ckU7U9K816faLelW5V1gEPXll1fp6u/lWbN4FBCyDCwTTn9GOmQ5boe1duW8z+pd78zL7Dl+LHvx7LPId2weRYFtoTi53v3+1Oiz5Ym1EeOy3uLfE4/a28DwJaW0HZMrVdqfVhmISKD4diAPC+U7az1wXBjK+ui/l6aELaq02r9uuzeY1eRNV1jU4JDuS7pQCYwnNxu+6o0682mkK7XZge2hKIE7H7wnhfAFgW2sYC3EYsCW4JXv9PYnxLNOe6Y7fp/NzbPNfW1A4BvVQbnDHR9H5XZALdKYMv04Nu1jh3uaGXaKqHtruGOOXL8He3fyGsOz3Uog3TOd3cq5/1QWX/3L8ff395OR+e5Mt51zFTz8LW6Sndr7NeYl5RdA9vYVOXuSkBPOM3r9O1OYBs7ftnnsKhbuiiwZV+/izkvsOU1uvV1AhsAW14Gtgx6/Smqf5ZZ6JoX2B4vzb/xSMBJ6Miatp39A5a4uNafy/hzd46r9VRpwlDCYH6peF7/gAklwPxiuHGJTBd33aVcp1yzTJVOIeeTqeO89wS6LgzmBxjzpqNX0f0CePg8WReW9XNDCUNjndNcg27t41RyLS8cbmxlPeVr7e1co/zCtQvN/cCWz6GbBs1ayzyn0AbAlpXAlGCwszTh6JlaF7T73ihNOPisvd+XgfPLWm+WZtBOVy6dqf3K+heh57iXa5043NHzbq0HSvPDiKmmG8ckCI51uuZJh+h3ZRZW0qn6Q2kC7FT+VJrXeLLMAnS6S1+UxUF3mRvKbL1ipnQTAjvpjPVDZ6Z9Xy+z4/uhLWGv/wvTjcp093/K7LUyNT8ma9iybjDfiW7t5WXt39TZpQm6Cfi5frfX+m+t3+fBAPB9le5X/mdYtxCfzZWAO+yMTSkhPL/KXeb60gQiAGALSGfk1dJ0N1bpUrG6dPYeHG6c2PZaDw83jkgHcLP+oS8AAEskhC/69WfWL6536hsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgOt8ADeLeR/iqL/cAAAAASUVORK5CYII=>

[image16]: <data:image/png;base64,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>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAZCAYAAAC2JufVAAACSElEQVR4Xu2VT6hNURSHl1CEJP8iEpkYIUWKkiKlN5GBMiADygxFT6knz1QxkKQkmSkmlBg8zCgyQInk9SIKpei9Ac/vs/a+Z+9937kuMTu/+rrnrrP3XmuvvfY6Zo0a/T/NE8fEeXFcLM1fd1Q695BYmL/+pXFijTgjzoqtYnw2otBqcVusF8vFDTFq7oDFOqlH3DSfN1ucEMNiWzKGNQ6Lu2KxmCmumG9iYjKupcniuthjVeRMeiC+ilXBNpYmmW/gs1gZbEvEO/FUzAo21ngv1oX/iHFvxJbE1hKp5+UX891GHTXP1sHEVoqgronvYkOwLRBD4pWYG2wnzX3gK2qauC8u2hinQfpOi1uWTzpiHhS/nURgZDYuzM5/iAtiQnhPNsugpooB8VDMSOy1YrGrlmegG5Gle+aOeEbReV1Qpb1W3BLqqbYQC80xPwqO7ZF5GcTMxfIonf9RUNPFHXFZTCnedaON4pvoM98QdUV9lc67DopFzolT5rfybxQLmKPfZPXO6+yZYkC9VrWGZWJza0S7yGqf2Gn5Dbpk1SWJ9Vk6j0GxATbSJhakUR4Iz1H7LG+CBDHfqjE0TpynDqMz7MxHBPfRfJNR9DB6GR2+TTjYbV4HFOpgwierGh7X/okYEWuDjabImH6rLgSfp7fiuVU3EBtr7wj/EV+PD1atlSneDnZWQmem8yIywOfkhVgUbGxov/mOabYc42PxUqwIY6LI+GuxV+wSz8znpifzT8WxUnvbzbNX96El2xw58NyoUaNGv9NP4mV6D9HhKa0AAAAASUVORK5CYII=>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAZCAYAAAB3oa15AAADNklEQVR4Xu2WSciNYRTHj1CEjJEiQ4ZsUMIGWRgXJFPCQiwUK74kYiFkSDJP2ciCDEWyMJQvNmIhZVhYEQmhhIUy/H/fec/3vvf57r3ux8LC/devd3ie+zznnPc851yzuv5vdRM9RZt0oKD2olP68l8LgxvEZbFbHLfyRnYUh8XsdKCc+orN4oTYIoaUDjeJjceLA+KIWGCVN15svhYGDi8dtjHiiRhsvuZW8UqsFgNEP/O1H4ijop3/rLLGiRtiohglroqf5lGKz8si+8V28w2Gitvikfmmoa7ma2FUZzHa3Nh5hTlrxR3RJXueINaJEWKRWCIWikvme1UV0WLictE2e0de3hNfzKOFWPy9uG5uGGIjHOWLhNaL+6J74R3znoo+2fMp0Wj5OuxxMLtHBG2XtSJ1notP5tEPbTQ3jmgh0uCNeGjuIJqbzTmZPWM0xmNgUWPFZ8sNYu1Gyx1gfFt2j6aKfVZD6iBOOalxzdyZEJHEOK4hqkZsSpQOiR/mjqD4SqkDRJivSfqhyeKZ5emxynLneotzhbE/Ep5fEN/NN0uF8dPFB7HHPAgoDK3kQLxnPofzvPnBPWseGPYl8jWlTjVRadiQKhLGhaaIF+KtefnrVRibZf7VfucAIgikLOnCOUQYHqkTFW+vmJE91ySqyE1x2sqXyBAHfof4aO4Ummm1O5CKlLmYXRFVCzuodpssT9OqItrHzL2OqFQTh++reSkldysZWul9KE0dgnjXvHohqhd2xfkrqzB+g+XllEM5LbsfaV4uuYaigkW5pTG9tpaGhgNUn3Iqpg4itaiKpCQifXZaaZEpERMaxJrsPrTS8k+HUWl6hGFUHpwlQo3mjbBDPq0pxb5l11Rp6qBYNxxAOFBsmM3C4GXmqfDS/IAGVBm6JKKcvjM/UKGl5k4V2z3v+O2g7Jn16cqkBKlRVKQOB7konMGWcIDAsEexYDQr0gBDUkgH0gKx+Rnzg7XC/IvRnCiBRcOiRN4Sc8yNf2z+lyIVqUPHTSsMjtEcY4y/ODS6dF6rxQIDzQ2D/iWjuZg3TMwXk6xlKUZ0c4yMrp6qh3nAaLBX7C8bW1111VVXXWX1C5hVpS+AtHVOAAAAAElFTkSuQmCC>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAZCAYAAAAv3j5gAAABQklEQVR4Xu2TsSuFURiHX8mmJIMokZQMomSgmCwGdWPgb7AYlPkOJpPZIoPRyGgxGsSiSHGTsjNQ4vl1zvnud77v5t7r3kV9Tz3L+57v/rrnvK9ZwX9kBDeyxTqM4x4e4DYOxO0qE7iJ5/iFR3H7V9bwBKdwAa/wE1fThwIKKuE8PlvjQf14gUvY4Wtj+IL3OORrOfSXn6zxoBl8xwdzoUKBx/iNy76Wo9mgHnPXdojdqbq+V9BKqhbRbFAtevESX80NSU3aEbRubqB2rPpuOVoNGsZbLGNX3IppJUjvdYpb2Jnp5fhrUAjRtYXrWsTp5ESGekH6wUGL715XtG/5Bd3F2UwtIQRpD7IP2YfX+IFzvqaQsq9VUmrpH3HUn0vQZqupadH8yze8wUl/RntyhnfmHl2EhQ3fpNWIa9QLCgraxA/M5UShshTIvQAAAABJRU5ErkJggg==>

[image20]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAZCAYAAAAv3j5gAAABMUlEQVR4Xu2UMStFYRjHH4OilHSLsoiBbFeSLCYp6kox4QP4BJRVFl9A2XwIFgNlUSYDymi4JiYGFn5P73n1nPd6vHeQUudXv27n/77n+XfOueeIVPwnunEND3Efx8rLbTGB82lo6cVT3MUerOMtrthNDtO4hVf4gdvl5TK6qBv7TLaOdzhgsu/QogYu4qv8UKTDteQoyafwBZeS3GNSMkXj+CStRfHEvST3yBbFDV5Rmntki/T+6kNMB/560YL8UZE30Ms9skUj+CitA+OJO0nukS3SF/Qcj7HL5HP4XvxG9MUexA6TRbJFygY+4HBxrIP0K3EpYbhSw2t8w5kis7R1BzrxAM9wWULJjYRPUUSv/ATvccjkm9iU8IeKPuMF9pt9X+hVjOIqzkoor6ioyPMJWhRHKUL/noMAAAAASUVORK5CYII=>

[image21]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAZCAYAAABzVH1EAAACeElEQVR4Xu2WT0hVQRTGvyihMBRpEZFRhiguoqA/kESrCFoYUi0k3UogQhBUEARBuMilmyBCaBFRtC2Cwly0kFoVVFCLNAJX7mqRYvV9nDl279x730vf42FwP/jxnLlz7j3fzHhmgFKlSq1We8hA3LkKbSHnyR0yTrrTj1ekfj3XOI1XXKwWchE25jrZkX6cVQ8ZIVNkmdxLP/5ntZLn5CbZSg6QD+RsclBoq1/PNU7jFad4127ylgyTzeQU+USOJMZkJCP9pJd8w9qNXCVvSFuib5B8JNtDexf5HPpdGq+40dDeRO6Sx+Fv1xh5hvzVS0lLN4e1GfFk4tjD5Ds5Hdoy8IMcXBkBbCD3yTRshfaSedjEJHUG2dhc1WJEq7qAbKw+qo9rNqWJ0I6TUZySl4kT5BeyRvrIb6RXM1e1GPGE49i4X79FRrzfEy4yEvdnVIsR/0gcmzSibTMd2pWMKNG8hBtiRFWlmpFm8iK0Kxm5hPyEG2Ik3kJF/et+a3mliWPdyLXQ1j99kRGV/nZyjCwhm7AbUfWqqGpGtMe3wcplLN//T2AHmEsVaDH8SirDOnS9LWm84jx2J5mFVbikLsAqoypkRbkR1fQ4WRnQSfuTHI2euYbIV9IR2nqHTu0Z/D219Z7X5EZoS52w1fCrUV5cE3lEHiB9SKak2dGLNFNaOqFD7B3ZF8Zoxp/C6vvl0BdLH7tNXsJuCkrmPewqktQh8oVcIedgB+ktWLxLBvS9h7BCMklewbZeXSTTfpXIk2azC5bgcaSTS0oV7CTMsK4tedoI+1/Su/Srdt2kWSzaWv+N9sMuc1UvbetdKn9126OlSpVqnP4Aq76bxjJjvwQAAAAASUVORK5CYII=>

[image22]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAZCAYAAABdEVzWAAACpElEQVR4Xu2WzatNURjGH6HIVxIlJF+JFIWBia5CJiQUUaYmSihyKSIDXyUjycTARD6SlDC4UYQBBgxQulLyBxiK59e71zl7rbuPewyUwfnV091nr7X3etb7vuvdV+rxfzDSmmaNLwcKxlmjy5v/iknWHeucdcPabY3IZgTzFfNmlgMlY62d1hXrrLVYzS9cqBhnHvN5rs5h66Y1yppiPbeeWBus6dYCq9/6bm2qnukIu7yt2B0PL1W87KByc1ut99YyRZpOWY8UzwOpeaxYOHHEWm31WbusHdY+65LC/B/Zq/xlsMR6bc2pfs+yPipenphsvVI8D2xqUBG1BNcba7+pPVI8bArhmnVGeXRYBGNEDzD0w1remhHzr1sDighOsJ4qN3bIWltdM591hk1h4rT1SxFe0gHbrftqnyzGSmPApr5Zc6vfFxRmMUH9XbZmVGPrrIvqIoWJ2dYHhblPCqPsnPsJDHQyVr/PM6T3qMLEgeo+qbtV/f0rFllfFOYQC06sxojagLozBkSK6FAGRI4IYTKlMHUATve86l4j7III7VGcTBbC3DPFkU+nrTQATcZKMJRSSEOl1RxXBOOq8sy0wP095QWL0bsKc+nEdTLQ6X6iTOEqxelONUl/219dZxBu6gv3dTD8QLEwUHdNBhj/qubaKVMI1Nyg4tQDz/HuIbAQTTPtoA69jdMIvPyn2kcfxihOLuK6pJ7CBJmpG+PvecX3NYPCfqjo0BRqYqqi4Ak9UGsvrRPVb+B7R7To5iVEgkZKQ62zRbkxAnOyPZzDAm8VBmmkROqdhn6AV1ifFU1zm6It0DDL/xBSCjmZJXxB3lhrFO8+puZ5LQgl7llwvdqNtoT7jG9WLNJEn2LB+qbqrLReKGqY+io31qNHjx7d8hsZ5X9MKbVZ5AAAAABJRU5ErkJggg==>

[image23]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAZCAYAAABdEVzWAAAChklEQVR4Xu2VTYhOURjH/2IWQkbkI6aRj4WVJKSkV6GZGhZsRFkpq0kUMqamlIWvkiwkNVlYEGZhY2ExMxZIyQYLCqU0yWZqFjb4/+c5j3vuec+deVPK4v7q1/vee8699znP89xzgZr/g5l0MZ2bDiTMoW3pyX/FfDpEL9F79DCdUZphrIHNW5EOpMymB+lNeh7NF2j1g/RQGFuW2B7mnab36Sy6kD6jo7QrzFtL++gY3RuuqWQpHaFXYQ/toR/ptmiObvqZ/qrwGqw0T2APds7Q7bQBW9QBegw2X8FXosFb9B1dEp1X1p7DSiM20lewjMY+om9oJ4rglTVH//dEx+o9lTitSBPr6Hc6jHKz6mY/6c7o+GgxPIka9wbdFY7n0acoB3YKxT3UaxfQQgmFMjGBfGAqkT9EC1heDE+iQE+i3NxX6J1wTn2rwP06LUDtMmUJnekCU5lzbKAPUZTaUUlf0rOwIE6E8yrdg/DbErqxekklUCkc9ZgCux2dc1TCu7BGzqFMKTvrYZlThhSkl9B3gIt0dTiXZT/9RreE45Wwl6EqsK30E6y8raCAvIRalF6aAdj1qoiynEWr0hbxAfZWaeNT/8Q95mjudVi5FiRjOdISalHv6apwrP3tePjfEgosfiudRbDtYRjTf3LSEgr1nBavrUUoYLVNll5Yj3lKlZVBlPcxR30zjmJ3n4q4hI4qEAem38uw72sT6qMfsDSLzfQr8vuNMqhM5novRpnQRqoNNWYfyoFpVzhXDJdRAG/pEdpPv6D649uN6pfC8RL6xhvTQV/THbD763m5eX/Q50h7127YN68KvVUNFCvO0YA9MLcwsYm+oI9h/aV71tTU1PwNvwF5F3bdqONAPwAAAABJRU5ErkJggg==>

[image24]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAaCAYAAAAjZdWPAAAC4ElEQVR4Xu2WT6hNURTGl3hFeBKR/HtkopS/KcWAJJ5IpBRloEgxYaCMbsnQ64WRlAwkZcCAAeq9YkBKDDBSSBShxEAK32ft/ay97t7nvPvCK92vfp171jp3n7XXXnudLdLW/6EJoMMbKzQOjPbGf6mN4ISUg54ENoCZxjYbXA7XQWs1eAN+GD6At+H3Z9ALOuMfCloM+sAU74BGgO3gNtgN7oDNxr8KXBFdpZZ0FnwDK519iegEboguZU5jwFWwwzuCtoHHoCvc7wP98ns8Tuo0OBLuB6Xxoll4BqY6HwfuB9/B2tQ1oPXgkTT/l+oSHfeAsW0Fr8AMY1sBnoI5xlap+eC9aG2Ncr6J4L7kV4Fils6Bk94h6jsmGqANhhn9ApYaW3zPTmOrFOuL9XvIO0Qz8BXclXzNTRZdembPi4Ey4IuSJuN8sNtMUyzRC6KTrRWzlMskg7wF3oFlzhfFbL0MVy/WOJNhsxdLkRPlhK24AvTxmUrFmmU2OcszAWbjtejS+4xYbRLtPnO9QzRzDJrjcGIkdqVcKXKsF2Caszcp1vNN0V7JP0R802fm94drVOlFMRk+o8w6g2YH8apKQKJYz0e9I6OFoq3Jtr5S0Lyn3WaUV9a335hRHOuT6HsqxXquamd1qgvaJiNuTHaU3GYrjZUobornYHrqSsQXbAHXwSLn4+ZlzfrsxBZmPxjs1ezFpT3C0sl9KxItAB/BNWmuXyvWPc8MzFojdf3yMWi/UpwoS+l4uOeknoDlA080i+MXY+G3nsvgzxt77ENGPE/MEs20b4txw+U2Fjf2PdE6fgDWpO5ErHfWf0uf8jrxI8MOk/vANCTfwiie+Ng9RnqHE+udpcP3/DFxwzIL3aJlZTUPPMzYW9EucEnKx9ohiefkU+Cg5Hf+YdAjeV+deM5m6VXV+5DEYNhtSkExQ5wUj6GtiOM1RCddGvuvaqxoD679ohmtA3tlmAJuq63h0k/JYI+uwnHAtwAAAABJRU5ErkJggg==>

[image25]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAaCAYAAAB7GkaWAAAAnElEQVR4XmNgGHjADcSFQKyGLgECRUD8H4jT0SVAQASIHYCYFU0cN2AGYmMgtoGy4QBkxAQgrgXi00DciyzpCsQ1QMwHxAeAeCUDku5MINYHYksg/gbEETAJZNAAxE+AWBFNHOyFq0A8BYgZ0eQYPID4FxC7ALE6A8QUOJjBAHGpMAMklECOhAM/Boh9G4C4gAGL0TxALIAuOBIAANr5E9moi3bFAAAAAElFTkSuQmCC>

[image26]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAbCAYAAABFuB6DAAAA/ElEQVR4Xu3RMUuCQRzH8X+gkBQoOFTQUkMQtIWbrW5ODQm+hZx7Hy1BBE3R0hoELm5BtPQCGgxBHNzSoUH9/p6707tnCxoa/MEHz//zv3vunjP7V9nAERrYyj1bpoQb3KGDV+wnHaSIW9z78SaecRU3KRcY4cT/1xYePI2zVPGGRxR8bRs9T+MsLcz8b8ge+hatqBW00hCHqz6rYYrrUNjBJ37wFfnGHO3QeIqJRTPNveUJYxyHYtNyM8kBBpYe7neN2rQ2H6LTq3YW1axu7kNrr4qu8cXcVS5XU3Tqd3MT9L0u0UU5bgo5x4e5k+p+d9PHaXRNlXxxnb/NAniLLenUuJJVAAAAAElFTkSuQmCC>

[image27]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAA+CAYAAACWTEfwAAAE90lEQVR4Xu3dW6jlUxwH8CWU2+RaKEIRcp0wLrkUxhMSEpGmFIoXhPKgEZ5cymUSKfHiEsmDCMmtKPLghZIHkpJ4EA/I5feb//7PXmfN3vtcZuucfebzqW9n7bX+58ycmZdf6/YvBQAAAAAAAAAAAAAAAAAAAAAAAAAAAACYOWvbDgAAVoZTI3dE/m0HAABYWX5vOwAAWFmmXbDtHLkkcnA7AADA0kyrYNshcltkXeTKYqkVAGBqxhVsu0Rujzw1JtcNH93s0chfTV/aKbK+7QQAYOHGFWyL9V7km7YTAIBtN62C7c7I54P27pEnIxsiJ0QOGfQDAGxlz7ajsmPp9l1tr26M/FC6vWa/RD6cO7xo+W/9QumWS9+OnB05InJx6ZZFAYDtwG6RP0tXYPxdtc8tWxdeWSBsavr2ibwWuTuyx6DvuchlW55g2o6OfBK5vh0AAFavS8vWpw/z8+tN35uRm6vPWdB9Gdk/siZy16A/C7vn+4eWWS4dPth2rgJ5eAEA2I6MOomYBdvLTd/XpZvd6R0e2ThoHxh5djhUro7sXX1eLidFHms7AQBmzc9lbnGWy5lPlO6y1lpdkOXeqlyW64uynKW7YTi8uYDLvmn6OHJ56Qqwhe7fUrABAKtCzqZ9VrqN7e+V7hqJPDyQzht8zf1p9w/aKZcaf418N0jufTuzGs/n84RjK2fl+u8ZlauGj85xcune0XlY5PvIfoP+vEx2EgUbADDzsrDKAuigdqDRFmDZrpdR/6jaKZ9/uulbqvMj/7SdEzxQhhfRvhr5qvqcAQCYKblsOWombEOZe9dXLkHWBVjuUft20M5DB/n6pFould7a9KW8SyyXNcel3iPXy5/T3muWf+8TI6c3/S0zbADAzHu8dDNYrVF3feWp0f504rGRL0q3dJoFUbvfLWfsRv3cpcii68dBO0+mXhs5LnJamf9gw2oq2K4ow6XqtFfVXoz8v22vbAEAZtCou75yabHep5b6u9daG8vCDwYsVB5k6AuN3MP2UeSm4fBISynYLmg7VoB6r97ayCul+90m/RtnMft+2zkwreVqAGAZHRl5N3JU1Xdv6Wbk5rNv6b73/5R/xjuRs9qBRhZ5F7adY+Shhk/L6CXi5fZM1X6xdAVczmCOK5hTLmmPe9NC/l8CAKvUujL51VTpjTK777nMWauFFmwXtR3bKGfDDijdTGYrr1np5encfPanqm+UvF8vD1nkfr92CTR/T5fvAgAzadoF2zmlW5LNAxUPN2O1nAk8ZdB+qR4YqJcw+/vt3qr6Rsl76/JASBZurfw9J83OAQCsWNMs2HL8t+pzLmWOkwVbv0cvT8UeX4av+kq5Z62XPzcPecy3HJxXmmRR9kFkfene8drLvYjtrBsAwEyYVLCdUebe55YzXH37kcihW57s5IXEWbDlXrt7mrFR8sqTLMTyax4meCiy62As75br5VLmQpYzsyDrT9FmgVZfs7KpagMAzJRJBVtrvhm2LNjme2acPAWbS6j9KdBjqvZSXBO5pfp8X9UGAJgpWbDVS5GTzFeM5Rsk8oLhlLNd2zqrtaZMZxlzIbNzAACrwnwFW8olzryCZBqFFgAAizTqNVoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwQvwH9SGl5TjiFC8AAAAASUVORK5CYII=>

[image28]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAZCAYAAABHLbxYAAAB3UlEQVR4Xu2WzytmYRTHvzKKjCSGpkwhZYn4AyQ0m5mEhfgDlOwUpZTCgh1L2VhYW7Fh8cZupmaaxbBgkhLZsCIbP75f5948Xs+9yFVq7qc+dTv3Pu89nec8575ASsr/wWc6ThfoMP3y8HYsdXQWtraPFjy8nRzf6Bqtp5/oJL2kXe5DEXTTbdpAP8LWrtNi96EkyKer9Iw2BrEaekz/0rIg5kNV36X9TqyE/qRDTiwRlOgKvaItQaySHtJ/tCKI+VCC57TJieXQZZqBVThRlGwp7CXiK72mi/RD+JCHeTxOVCzBdkQ782aompuw7dN1HEooKlFfPBHK6RZsy3/BDlZYYR/a1gz8CcUmmgfrJ42Zp1RSubbMSyu9oBOw3/VRSDfgTyg2UY0HzbHnOEer7lb5KYJVVwesPeueS1RCUfFXoXk3ATvB7lbrZTd01IllMw1/QlqrFnqqx1+Ehr0SOoC1hQj7T/GBICbUWpoOId9hVW9zYuFclrpODFXjlE7hvh9r6RHdwX1V9Jk8gVWqOogp6R+wHQnRWj3T68QSQds9CPsKjcFa4Dfdg/V9iBL+AztA7uexme7TEdoDG2sziD6Er0Yv74C9TFWOmwrZaAJobSde9mcmJSUl5T1wC5lRW7R6xFnNAAAAAElFTkSuQmCC>

[image29]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAZCAYAAABHLbxYAAACEklEQVR4Xu2Wv0tWURzGH7FAscjIHwQ2JIJjSf4BIiYtiqRB1OggiFtgUAhCOejoKII4NDU06WKD6KZQNKSDRQRRuOhktJQ9j997X899Pee+R9DJ+4EPvHzPPe953vPrvkBBwcXgJp2gc/QZvZVtzqWdzsD6PqG12eazo48u0zu0kb6if+hD96EAg3SL3qVXYH1X6DX3oUo0w35lXXmDQw1dovu0I6m10l/0M21Iaj406zv0qVO7TjfpmFOriJZzEfZLQyjoO/qXdiW1FvqDfoX92BAKeEDvObUq+oauIn/cDDFBhcLegA0iHtB/dJ5eSh/yMIuTQYXG1IpoZaKIDeqi2VyDLZ8+56HvDgX11YOcJmgTXYct+QfYwUpn2Ie+cxX+QLlB62HBXDXYW9rmacsL301/00l6OdtUQgf0PfyBgkHV6SXshLtqU3+jC5624aOefq7CZlcH7H5Zm0soUKgeJGbpdd9Nwk6wu9Tqd0ifO7VypuAPpL7aQpX2eImYoLrsFeg77HmR7j/VR5Ka0FWl2yGlHzbrPU4tvZelPkcRE1SzsUdf43g/ak//pNs4nhW9JndhM3U7qSn0BmxFUtRXzzx2ahWJCarlHoW9hV7AtsBH+gX2WkxR4E+wA+S+Hjth52CcDsGutWmED6GXmKApGrwXNphmuTrbnIsOs/oO4HR/Zkoo4CPkv10KCgoKzon/T0Jljl2AWl8AAAAASUVORK5CYII=>

[image30]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAaCAYAAABRqrc5AAABGklEQVR4Xu3TsUtCURTH8RPVEAkRSY3ioCCICC0JuUXQoGBTIDgqoott0VI0NLW0lv9Be0QNDg2tglPQFm6NTQ31PZ738PqIh775/eCDvHPPvd579YnEibN4lpHDIdYDY3Mlizdco4EBxjh1ekKTwjvOsOTV6vhF1W8Kywru8Ym0U9cdfIkdz00BJzL9skm0SZsfxBbU6Kc+D5Dwan7aaAZqUhHbdsup7eADt04tNP4iR05tHz84Rgk9sV/rEnfYmLZa8mLH8S9QG17wjV2c4wA1FPEotvBM9IK6GKKPZ7EJIzzhBqvIYM8b35zM/Cd6gdtifziNTkw6z5oLT+Togq9iu+lgbXZ4vmyJ3dUVyoGxhaJHjPROxYmQP4tzJ53ZsXAfAAAAAElFTkSuQmCC>

[image31]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAZCAYAAAC2JufVAAACOElEQVR4Xu2VT0hVQRTGPzEhMQ3/UNTG9yISF4JgEUG1CikiCS2IElrlwoXuFNyKm5YtDNqEi6BFOzGCwBI3QRC0yCAINYooaFeL2tj3vXPHN3fum/sUcXc/+PHeOzNvzjd35pwLFCq0f2omt8kjcp/0pIej6iM3yRHSQA6RC+SOPykZO0sekHlylTSmZgQ6TF6SWdii/WSNjPiTIrpFtgK+wNZwkqEpskLKpJM8gT2AJm9eStPkLWn3YtrpR3LUi9XSNfI54Q2ZJG2pGcAA+UHOe7ETZJNc9mLbkhEZWgjiZ8hvMhTEQ8mUNpWnOZiBY16slaySx7AnmVIv+YWsKe3uD2zBPNUzdZAsIWtK1+Q1sidUkUseMxXGQ8mU5ryAHeE6uYfqJXbJY6bCeEVaVJczTL4bU8ukI/l9knyFXWwdixIqcZg819QV7M2Ujkc4yYgqS8bKsELREwyT55qKJY/FdyL9RxvVhmPJY/GKVJrfkU3uTM0EcV+nyDeyCGu+Ts6UjvYAeYZscmdKFahKTMkNqkL8Y7hE/iWfTmqyx1EtYWfcN+WOT3GNS6pOVbgq3amLfIB1+JoahXVh3QFJC6u7qxnKiKQu/J78JeeSmMZkoJT8lvRdd8jv1u7yq/s76VX0E9W1MtKfH5JX5DrMkHbhvyr0RJ+TT6Tbi58m72DHPEE2yFNUN+M0DGsXY+Qu7DU2jhqN05cGdUdukIvIeSfVUAsZhG2ohHgiPW3dM6HvhQoVKlRP/wGCSXlSZXeIjQAAAABJRU5ErkJggg==>

[image32]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAaCAYAAABozQZiAAABLElEQVR4Xu3Tu0sDQRDH8ZFEiCioRBCxCAoKNiLYRNDOWnw0+QuCr1orQQlibysWVmlsxSIpLOxirwQEtbGytFDw8Z3s3rG3mtwFKyE/+BBuZ5bbWS4i/z5dyGLAL8RlD+/4wqFXS5RFfGDJLyTJLp4x7hfiksEFrtAXLcVnFA84wiSWMeI2tIrO+4lHlLCOOlbdpmbRefWy1py1M0kwRhrn8rNRN+tJguNPoyDmewgTzHvsrA2ihnsM27UNFMMOm1m8SnS+KbygLOZkTaObn+xvkG28YQG9OMAJ+p2eRsZwh3n7nMMtdsTMt4IZXGLO9oTRhk3c4FTMRn1zytYnkEdFzF38Gv3K9HK6/QLZt9rOEK7FvH0LPdFy6+h/vCrmy9MLbDs6it56J3/JN/t2LPlKl2o5AAAAAElFTkSuQmCC>

[image33]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAaCAYAAABozQZiAAAA9UlEQVR4XmNgGAUjFYgDsS8Q2wExK5ocTiABxGuAeD0QRwBxHRDvAmJ+ZEXYgDwQXwHiWQwQ20AaTgDxWyDWRFKHAViAeA4QPwFiRSSxJCAOAGJGqBjIwEwoDQcgk0E2gJwM0oQL6APxFCDmQRYEBc5/IC5CFiQWeDJANIMMQQdcDBDXgJy/DYgNUKUZGGSB+DYQJ6CJOwHxOiC2ZIBYUAXEDcgKYAAkCQqw1QyQED8AxO1AzAfEYkAsxwCx2QaqHgOAogiUQECKmdHkQLbvZiAizrGBSUBcDsReQKyDJkcQ9ALxZCDOZUDEO9EApIEXSo8CcgEAyJ4eTfEHE78AAAAASUVORK5CYII=>

[image34]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAbCAYAAABFuB6DAAAA5UlEQVR4XmNgGAXUBHxA7AnEslA+NxC7AbExEDPDFHEC8VQgrgLiZ0DcAcRrgDgaSs8CYlaQQhcgrgZiTSB+C8RzoJpBwBSI30PVMCQAsRkQ+wHxX5ggFNgA8W8gLkISY2gF4gdALI0klg7E/4E4CEmMOIUgX+5hgDieBSoGokF8kLtB7gcDJSB+DsTlMAEgUATiJ0A8nQGhGewRkBUNUD4jEDcD8RUgloeKgQHIfaBgOAHEq4H4IAPEWglkRTxAfACItzJAwk8YKoYBsLkPK0hjgLgvDogF0ORQACguYTgCTW54AgD8LykjBVdY8AAAAABJRU5ErkJggg==>

[image35]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAZCAYAAAC2JufVAAACR0lEQVR4Xu2VTahOURSGl1AUSf4iEomMkCSFJEQiYSCUGWWqKHXrFiaGBpSUDMyUERMDfxOlyAAlEokoTBDKz/t8ay/fPvvcc26S2Xnr6TvfOvvs9e6/tc06dfp/Git2i7PipFhQfd2q6WLA/NtDYlb1dU8jxHJxSpwWm8XISotCE8Q1cUyME4vFI7Ejb9SgLeKqWCSmmPfxVWzP2mDosLgp5ohJ4qL5IEZn7So6Iu6KiVlsj3gspmWxUmPEFfFRLEmxueKNeCgmp9hS8VasTP8R7V6IjVnsjzCCoQtFfJn4JLYW8VyYuix+iDUpNlO8Es+sP6AT5gZY5tB4cVucN5/JihaK91Y3xeg+m3fYJoyxHNExI/8pzolR6T2zWZpim9yw+gr1FMmbTJXxNjFLt8wT8YwieZOpMt4TG/WX1ZP/jamp5kvBst0z3/QxcyQkcZm81dQm+3dTudaKL2LQ/GSxr9hfZfJWU03Jm+LDKTYwm3+9NSdvivcUR7hMHqaOFvFc1LdB8/IRy4Xoi9mn1LDZL1k9eZhiAAykonjJCeGkhNaJ7+k3hIkZ1jcQ+zFPGP0RP5BimOOEc9JD1DBqGRV+SO0VL82rLSIplfmOuRHEsX8gvokVKcZsfhDHrV+Z54nX5oU3TiAxDsGu9B+tEu+s31dNdHhGXBfbzA0xCq6bEDPAdfJEzE4xzB80b8sys4z3xVOrfou4dp6L/WKf+TXGt/my18TL+WKnWG0td9IQYjY3mH/L7DVdtMw2Sw48d+rUqdNw+g3TdnyEHyg2cQAAAABJRU5ErkJggg==>

[image36]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAZCAYAAAC2JufVAAACCUlEQVR4Xu2VTShEURTHj1CE5CNiI/KRJCJJYWVBIqEIZUcpW8pWSuwsKBss2LBlQxnZKCsLlJJIibJjwYb/f+7cmTv3zX1K7N6vfo0575pz7se5TyQg4P9IhyNwHS7BqvjHTqbhIqyARZYFMDkyLgk2wxW4CruNZwnJhodwHmbCengFB8xBDrbgl8NLmC+qoBl4AkthHtwWtQCp4mAWnsMcIzYKr2GhEbPhBPYllkC7CZ8kNqlG+AxbI99JGbyHnUYsCgthQZyxSRN8g71W3IRbxK1Is+JDcFnUCpEFUQVwvCYLnsINiY2LUg1fxVsUZ/cu6gdd5MIGK1YDd0QdCcKCuZp2UVzlkHh3KIxO7irKjvvBRLuiDrQZC4m7KDsepkfUobST/6aoMVGrlGLEmJCJ7eS+RXXJ3xTF7TqDk1acjXIr3uS+RbmSu+Iu2EUcb3YYcSV3xcOwNdm+dnJd1JwVd8FLkeP5fybcyj3xJtdFsQPZiXHoh+wQs7U74GfkU8MtKhZvC2fAI1GT4yRteA+yw9npGl6qvFw5mYTwgD6Ium0Jk/J25xnRrc1b+AJ+wJZITKMT2KuhKYePcNiItcEX8f5WFF71a/AY9okqiEn4utFwRQ/gDSwx4sR1mE364R2cgOOiXmNT4l31OPiwEg7CdvF5JzmohXXin4SrzSuI8u+AgICAn/gGZY5zAo5nw70AAAAASUVORK5CYII=>

[image37]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAZCAYAAAC2JufVAAAB1UlEQVR4Xu2VzStFQRiHX0kRQopI+ViQsiAhG1mgKFIUIXbyF/haKVmQ7KRsfOwsLCwoUW7ZkJXyUcpGYYUNConfa87cOzP3zJDu3Z2nng7vvHfmd++ZM4coICB+pMA+uAznYJk+/CeqYItZBMlwEFZ4fyfCAjgMiyJtOhlwD07DNFgJL2CX2mShDo7CE/gFx/ThHzLhMYlx1XmYpPRp8EQ8aZZS64eXMFep+cGh2mEbfCH/UPxFt+EZvIarJD6XoPRocBAOtGbUa+Az7DDqNqrJHYrnzzMHbJTDB4oOJReZMeo2YhpKTmYLZdZt/BZqAy6QuIW3cIscm5z3A286c/FYh9qFPST2EcsP1RUsVPrCtFL8Q3GIdO8q4T37CqeUWhjb4ra6DVcoP2T/Pkw1xqgE3lP04vJDk0bdhivULPyAzUpN9odI3F4NLoRInCN82kqa4Lt3lfAhm0/+54srFH/hT9JDydu3Qv7z0QC8gcXe/3IjHpEIwmTDU/gG672aiuuX7YXjFFmcrxPwCdbKJhM+6pfgAewkEeicxOtGwr/oDkU/MSPwjvTXxyM8hDleD8+/CDfhEFwncTbyQ+aE05fCbthAjnfSP1HnbyR9qwQEBATY+AYmIWrQjzO/aAAAAABJRU5ErkJggg==>

[image38]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAZCAYAAACFHfjcAAABuklEQVR4Xu2WTSsGURTHj7BhYaGUUmajUIq8lbUPoOQ7PCtFSSRrefkCKFkoH4CFtfItLEgWFlZYKPH/P3duxnnmTvfizur+6tc0c+9znjNnzr0zIolEIhFODzyBY3pAsQB39cWaiZZrG9yAr3BSjRXJ4C08VdfrJGqus/BZqoN3wmP4KYHB/5loubLNjuChVAdfggfwQfyC88ll+dFFL+zWFyuIlWszyVW4CNfFHTwT8+fD8E78gnfATbgi5cUYgZdwUA84iJmrzIipHFvJFZxj+2Jasl8Cgov57R5ck5/FCC0CiZYr24yVy/JzV3A+AT4J3oh38AK6GL8pQrRcOZEty7VkKQvOZLkmmQjxCl6CLQZjhRYhaq4T8t1mFh2ca3xHTJtZvII7mIKPcEvK9wwXUXNtwHvli5jXzRO8hqP5sTiHN8I57/k54/gwDq/gENyW1j2jirpzbalyGV5VVtgi2OXAJxtaDE2sXJvwVfcGp/VAgQEx7+Yz8bsJFuFCWveEvxYjRq4yL6bF2Eb0A97AvsIcfvSci2kzO49fd1Xt1iVmg9RFsLTDZTinByqIlWsikUgkEolEEF+Rvp1OkDuNCQAAAABJRU5ErkJggg==>