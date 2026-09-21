import PptxGenJS from 'pptxgenjs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const root = dirname(fileURLToPath(import.meta.url));
const shot = (name) => join(root, 'screenshots', name);
const logo = join(root, '../../public/icons/icon-192x192.png');
const out = join(root, 'ElectoDX-Introduccion-Profesor.pptx');

const C = {
  navy: '0B1329',
  blue: '2563EB',
  cyan: '06B6D4',
  white: 'FFFFFF',
  ink: '0F172A',
  muted: '475569',
  line: 'E2E8F0',
  card: 'F1F5F9',
  amber: 'B45309',
  rose: 'BE123C',
  emerald: '047857',
};

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'WIDE';
pptx.author = 'ElectroDx Diplomado';
pptx.title = 'ElectroDx · Cómo el profesor planea, publica y evalúa';
pptx.subject = 'Guía de inducción docente';

let n = 0;
const TOTAL_HINT = 34;

function bar(slide) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.28, w: 13.333, h: 0.22, fill: { color: C.navy },
  });
  slide.addText('ElectroDx Diplomado  ·  Guía del profesor  ·  Del temario a la calificación', {
    x: 0.35, y: 7.28, w: 10.4, h: 0.22, fontSize: 10, color: '94A3B8', fontFace: 'Calibri', valign: 'middle',
  });
  n += 1;
  slide.addText(String(n), {
    x: 12.15, y: 7.28, w: 0.9, h: 0.22, fontSize: 10, color: '94A3B8', align: 'right', fontFace: 'Calibri', valign: 'middle',
  });
}

function kicker(slide, text, y = 0.28) {
  slide.addText(text.toUpperCase(), {
    x: 0.45, y, w: 12.4, h: 0.28, fontSize: 11, bold: true, color: C.blue, fontFace: 'Calibri',
    charSpacing: 1.2,
  });
}

function title(slide, text, y = 0.52) {
  slide.addText(text, {
    x: 0.45, y, w: 12.4, h: 0.55, fontSize: 26, bold: true, color: C.ink, fontFace: 'Calibri',
  });
}

function bullets(slide, items, box) {
  slide.addText(
    items.map((t) => ({ text: t, options: { bullet: false, breakLine: true } })),
    {
      x: box.x, y: box.y, w: box.w, h: box.h,
      fontSize: box.size || 15, color: C.muted, fontFace: 'Calibri', valign: 'top',
      paraSpaceAfter: 8,
    }
  );
}

function addShot(slide, file, box) {
  const p = shot(file);
  if (!existsSync(p)) return false;
  slide.addImage({ path: p, x: box.x, y: box.y, w: box.w, h: box.h, rounding: true });
  return true;
}

function notes(slide, text) {
  slide.addNotes(text);
}

// ─── 1 Portada ─────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.navy } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: C.cyan } });
  if (existsSync(logo)) s.addImage({ path: logo, x: 0.55, y: 0.45, w: 0.55, h: 0.55 });
  s.addText('ELECTRODX DIPLOMADO', {
    x: 1.2, y: 0.52, w: 8, h: 0.4, fontSize: 14, bold: true, color: C.cyan, fontFace: 'Calibri', charSpacing: 2,
  });
  s.addText('Cómo el profesor planea,\npublica y evalúa', {
    x: 0.55, y: 2.1, w: 12, h: 2.1, fontSize: 40, bold: true, color: C.white, fontFace: 'Calibri',
  });
  s.addText('Del temario a la calificación, en el orden en que se enseña.', {
    x: 0.55, y: 4.35, w: 11, h: 0.4, fontSize: 18, color: '94A3B8', fontFace: 'Calibri',
  });
  s.addText('Sesión docente  ·  45–60 min de explicación + 20–30 min de recorrido en vivo', {
    x: 0.55, y: 6.55, w: 12, h: 0.3, fontSize: 13, color: '64748B', fontFace: 'Calibri',
  });
  notes(s, 'Presentarse. No es un tour de botones: es el ciclo semanal. Pedir que anoten fricciones: bloquea / confunde / se puede vivir.');
  n += 1;
}

// ─── 2 Agenda ──────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.white } });
  kicker(s, 'Contrato de la sesión');
  title(s, 'Diez bloques, una sola secuencia');
  const blocks = [
    ['01', 'Qué ve el médico cursista'],
    ['02', 'Mapa mental del profesor'],
    ['03', 'Cómo se planea la semana'],
    ['04', 'Cómo se toca el temario'],
    ['05', 'Casos EMG y simulador'],
    ['06', 'Cómo se evalúa (Capa A)'],
    ['07', 'Recorrido en vivo'],
    ['08', 'Qué sí / qué no puede el titular'],
  ];
  blocks.forEach((item, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i % 4;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.45 + col * 6.4, y: 1.35 + row * 1.25, w: 6.1, h: 1.1,
      fill: { color: C.card }, rectRadius: 0.12,
    });
    s.addText(item[0], {
      x: 0.65 + col * 6.4, y: 1.5 + row * 1.25, w: 1.1, h: 0.8,
      fontSize: 22, bold: true, color: C.blue, fontFace: 'Calibri', valign: 'middle',
    });
    s.addText(item[1], {
      x: 1.85 + col * 6.4, y: 1.5 + row * 1.25, w: 4.4, h: 0.8,
      fontSize: 18, color: C.ink, fontFace: 'Calibri', valign: 'middle',
    });
  });
  notes(s, 'Mitad 1 = explicación (bloques 1–6). Mitad 2 = el profesor maneja (7). Cierre = permisos (8). No abras roles al inicio.');
  bar(s);
}

// ─── 3 Objetivo ────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Para qué estamos aquí');
  title(s, 'Tres frases. Una regla.');
  const cards = [
    ['1', 'Ver el sistema como lo vive el cursista.', 'Si no ves el destino, no puedes diseñar la clase.'],
    ['2', 'Recorrer el ciclo: planear → publicar → asignar → calificar.', 'El ancla es /admin/calendario, no cinco menús sueltos.'],
    ['3', 'Anotar fricciones y decidir permisos del titular.', 'bloquea / confunde / se puede vivir'],
  ];
  cards.forEach((c, i) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.45 + i * 4.2, y: 1.4, w: 4.0, h: 4.4, fill: { color: C.card }, rectRadius: 0.14,
    });
    s.addText(c[0], { x: 0.7 + i * 4.2, y: 1.65, w: 3.5, h: 0.6, fontSize: 28, bold: true, color: C.blue, fontFace: 'Calibri' });
    s.addText(c[1], { x: 0.7 + i * 4.2, y: 2.4, w: 3.5, h: 1.6, fontSize: 18, bold: true, color: C.ink, fontFace: 'Calibri' });
    s.addText(c[2], { x: 0.7 + i * 4.2, y: 4.2, w: 3.5, h: 1.2, fontSize: 14, color: C.muted, fontFace: 'Calibri' });
  });
  notes(s, 'Regla: no es demo de todas las pantallas. Si el profesor pregunta “¿dónde subo el video de ayer?”, el sistema falló — anótalo.');
  bar(s);
}

// ─── 4 Qué es + landing ────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Bloque 1 · Ojo del alumno');
  title(s, 'Qué es ElectroDx, en una frase');
  s.addText('Plataforma de posgrado en electrodiagnóstico: temario clínico + simulador EMG + evaluaciones + kárdex de cohorte.', {
    x: 0.45, y: 1.15, w: 12.4, h: 0.55, fontSize: 16, color: C.muted, fontFace: 'Calibri',
  });
  addShot(s, '01-landing.png', { x: 0.45, y: 1.8, w: 12.4, h: 5.2 });
  notes(s, 'Pantalla real de inicio (localhost). El profesor debe poder abrir / y /temario sin cuenta para ver “qué vende” el diplomado.');
  bar(s);
}

// ─── 5 Tres capas ──────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Arquitectura que el profesor debe memorizar');
  title(s, 'Tres capas. No las mezcles.');
  const layers = [
    [C.blue, 'CAPA A — Aprender', 'Módulos → temas → subtemas\nPerlas, videos, puntos clave\nPesa 20 % del kárdex (temario)'],
    [C.emerald, 'CAPA B — Practicar', 'Simulador de casos EMG\nNCS, aguja, RNS, F/H, trampas\nEl profesor califica el dictamen'],
    [C.amber, 'CAPA C — Demostrar', 'Quiz del tema · examen asignado\nTarea / caso · asistencia\nCapa A oficial: 30 / 30 / 20 / 20'],
  ];
  layers.forEach((L, i) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.45 + i * 4.2, y: 1.45, w: 4.0, h: 4.5, fill: { color: C.navy }, rectRadius: 0.14,
    });
    s.addShape(pptx.ShapeType.rect, { x: 0.45 + i * 4.2, y: 1.45, w: 4.0, h: 0.12, fill: { color: L[0] } });
    s.addText(L[1], { x: 0.7 + i * 4.2, y: 1.85, w: 3.5, h: 1.1, fontSize: 20, bold: true, color: C.white, fontFace: 'Calibri' });
    s.addText(L[2], { x: 0.7 + i * 4.2, y: 3.1, w: 3.5, h: 2.4, fontSize: 16, color: 'CBD5E1', fontFace: 'Calibri' });
  });
  notes(s, 'El kárdex oficial (Capa A) no es “avance del temario”. Es exámenes 30 + tareas 30 + asistencia 20 + currículum 20. Mínimo 80. Honores ≥95 + cédula.');
  bar(s);
}

// ─── 6 Temario ─────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'El alumno no ve el repositorio');
  title(s, '17 módulos. Un árbol de lecciones.');
  addShot(s, '02-temario.png', { x: 0.4, y: 1.25, w: 7.6, h: 5.7 });
  const mods = [
    '1 Fundamentos', '2 Conducción', '3 Aguja', '4 Tardías',
    '5 ENR', '6 Evocados', '7 Especiales', '8 Anatomía',
    '9 Patologías', '10 Criterios', '11 Referencia', '12 Bibliografía',
    '13 Seguridad', '14 Síndrome', '15 Informe', '16 Casos complejos',
    '17 Actualizaciones',
  ];
  s.addText(mods.map((m, i) => ({ text: m, options: { breakLine: i < mods.length - 1 } })), {
    x: 8.2, y: 1.3, w: 4.7, h: 5.5, fontSize: 13, color: C.ink, fontFace: 'Calibri',
  });
  notes(s, 'Pantalla real de /temario. Mensaje: el alumno ve lecciones, no archivos TypeScript. Nunca cambiar el id de un tema si ya hay quiz o progreso.');
  bar(s);
}

// ─── 7 Lección ─────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Anatomía de una hoja  ·  /modulo/…');
  title(s, 'Así se ve (y se cierra) una lección');
  const bits = [
    ['Título + badges', 'Completado / Pendiente · Evaluación · Offline'],
    ['Cuerpo clínico', 'Texto, perlas, puntos clave, videos, figuras'],
    ['Candado de evaluación', 'Si hay quiz publicado, no se marca completo sin aprobar'],
    ['Descarga offline', 'Un clic guarda el módulo; el avance se sube al volver en línea'],
  ];
  bits.forEach((b, i) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.45, y: 1.35 + i * 1.35, w: 12.4, h: 1.2, fill: { color: i % 2 ? C.card : 'EEF2FF' }, rectRadius: 0.1,
    });
    s.addText(b[0], { x: 0.7, y: 1.5 + i * 1.35, w: 12, h: 0.4, fontSize: 18, bold: true, color: C.ink, fontFace: 'Calibri' });
    s.addText(b[1], { x: 0.7, y: 1.95 + i * 1.35, w: 12, h: 0.4, fontSize: 15, color: C.muted, fontFace: 'Calibri' });
  });
  notes(s, 'El badge Evaluación es el QuizGate. Offline es copia del módulo, no de un tema suelto. Las evaluaciones oficiales siguen pidiendo red.');
  bar(s);
}

// ─── 8 Portal ──────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Portal del alumno  ·  /portal');
  title(s, 'Si el profesor no asigna, el alumno solo ve temario y quizzes');
  const tabs = ['Resumen', 'Desempeño', 'Clases', 'Quizzes', 'Tareas', 'Avisos', 'Constancia', 'Estudio'];
  tabs.forEach((t, i) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.45 + (i % 4) * 3.2, y: 1.5 + Math.floor(i / 4) * 2.4, w: 3.0, h: 2.1,
      fill: { color: C.card }, rectRadius: 0.12,
    });
    s.addText(t, {
      x: 0.6 + (i % 4) * 3.2, y: 2.15 + Math.floor(i / 4) * 2.4, w: 2.7, h: 0.7,
      fontSize: 18, bold: true, color: C.ink, align: 'center', fontFace: 'Calibri',
    });
  });
  notes(s, 'Desempeño = Capa A (oficial vs en curso). Constancia exige dictamen oficial + cédula verificada. Tareas y avisos se alimentan de lo que el profesor asigna.');
  bar(s);
}

// ─── 9 Semana alumno ───────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Qué “cierra” una semana para el cursista');
  title(s, 'Todo lo que sigue existe para alimentar esto');
  const steps = ['Leer el tema', 'Quiz del tema\n(si hay)', 'Caso EMG\nasignado', 'Clase / grabación', 'Examen de corte', 'Aparece\nen kárdex'];
  steps.forEach((t, i) => {
    s.addShape(pptx.ShapeType.ellipse, {
      x: 0.45 + i * 2.15, y: 2.3, w: 1.7, h: 1.7, fill: { color: C.navy },
    });
    s.addText(String(i + 1), {
      x: 0.45 + i * 2.15, y: 2.55, w: 1.7, h: 0.4, fontSize: 14, color: C.cyan, align: 'center', fontFace: 'Calibri',
    });
    s.addText(t, {
      x: 0.45 + i * 2.15, y: 3.0, w: 1.7, h: 0.8, fontSize: 12, bold: true, color: C.white, align: 'center', fontFace: 'Calibri',
    });
    if (i < 5) {
      s.addShape(pptx.ShapeType.rightArrow, {
        x: 2.05 + i * 2.15, y: 2.95, w: 0.35, h: 0.22, fill: { color: C.cyan },
      });
    }
  });
  s.addText('Cierra el bloque: el calendario, el temario y la bandeja no son “admin”. Son esta semana, vista desde el otro lado.', {
    x: 0.45, y: 4.6, w: 12.4, h: 1.4, fontSize: 18, color: C.muted, fontFace: 'Calibri',
  });
  notes(s, 'Transición: “ahora vamos a ver las pantallas que fabrican cada uno de esos pasos”.');
  bar(s);
}

// ─── 10 Mapa profesor ──────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Bloque 2 · Dónde entra el profesor');
  title(s, 'Inicio docente: bandeja + esta semana + 7 atajos');
  addShot(s, '06-admin.png', { x: 0.35, y: 1.2, w: 12.6, h: 5.8 });
  notes(s, 'Ruta: /admin. El editor (profesor) ya entra aquí; el badge dice Profesor o Administrador. Pestaña Gestión Operativa solo la ve admin. Recreación fiel de la UI actual con los textos reales del dashboard.');
  bar(s);
}

// ─── 11 Menú ───────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Menú que ya existe');
  title(s, 'Una página ancla por tarea. No cuatro sitios.');
  const rows = [
    ['Inicio  /admin', 'Bandeja, reintentos, riesgo, atajos', 'Profesor y dirección'],
    ['Calendario  /admin/calendario', 'Hub de la semana: clase, examen, caso, corte', 'Profesor y dirección'],
    ['Alumnos  /admin/alumnos', 'Cohorte, rúbricas, kárdex, pase de lista', 'Profesor y dirección'],
    ['Temario  /admin/temario', 'Ordenar, ocultar, crear, vista previa', 'Profesor y dirección'],
    ['Quizzes / Ejercicios / Talleres', 'Banco de preguntas, casos EMG, clases', 'Profesor y dirección'],
    ['Admisiones / Usuarios / Acceso / Auditoría', 'Lista de espera, roles, premium, bitácora', 'Solo dirección'],
  ];
  s.addShape(pptx.ShapeType.roundRect, { x: 0.4, y: 1.25, w: 12.5, h: 0.45, fill: { color: C.navy }, rectRadius: 0.06 });
  s.addText('Pantalla', { x: 0.55, y: 1.28, w: 4.2, h: 0.4, fontSize: 12, bold: true, color: C.white, fontFace: 'Calibri' });
  s.addText('Para qué', { x: 4.9, y: 1.28, w: 4.6, h: 0.4, fontSize: 12, bold: true, color: C.white, fontFace: 'Calibri' });
  s.addText('Quién', { x: 9.7, y: 1.28, w: 3, h: 0.4, fontSize: 12, bold: true, color: C.white, fontFace: 'Calibri' });
  rows.forEach((r, i) => {
    const y = 1.8 + i * 0.8;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.4, y, w: 12.5, h: 0.72, fill: { color: i % 2 ? C.card : 'F8FAFC' }, rectRadius: 0.06,
    });
    s.addText(r[0], { x: 0.55, y, w: 4.2, h: 0.72, fontSize: 14, bold: true, color: C.ink, fontFace: 'Calibri', valign: 'middle' });
    s.addText(r[1], { x: 4.9, y, w: 4.6, h: 0.72, fontSize: 14, color: C.muted, fontFace: 'Calibri', valign: 'middle' });
    s.addText(r[2], { x: 9.7, y, w: 3, h: 0.72, fontSize: 13, color: C.blue, fontFace: 'Calibri', valign: 'middle' });
  });
  notes(s, 'El rol en código se llama editor, no profesor. El layout ya dice Profesor. Dirección = admin. No abrir /colaborador en esta sesión salvo para mostrar el salto visual.');
  bar(s);
}

// ─── 12 Ciclo ──────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Bloque 3 · La semana del profesor');
  title(s, 'Siete pasos. En este orden.');
  const steps = [
    ['1', 'Calendarizar', 'Corte + clase + examen + caso en /admin/calendario'],
    ['2', 'Visibilidad', 'Mostrar / ocultar los temas de esa semana'],
    ['3', 'Encuentro', 'Clase en vivo o presencial + grabación después'],
    ['4', 'Asignar', 'Examen y/o caso EMG a la cohorte'],
    ['5', 'Pase de lista', 'Asistencia que cuenta al kárdex'],
    ['6', 'Calificar', 'Bandeja de entregas y reintentos'],
    ['7', 'Tutorizar', 'Alumnos en riesgo → kárdex'],
  ];
  steps.forEach((st, i) => {
    const x = 0.4 + i * 1.84;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.55, w: 1.72, h: 4.9, fill: { color: C.navy }, rectRadius: 0.1 });
    s.addText(st[0], { x, y: 1.75, w: 1.72, h: 0.5, fontSize: 22, bold: true, color: C.cyan, align: 'center', fontFace: 'Calibri' });
    s.addText(st[1], { x: x + 0.08, y: 2.35, w: 1.56, h: 1.1, fontSize: 15, bold: true, color: C.white, align: 'center', fontFace: 'Calibri' });
    s.addText(st[2], { x: x + 0.1, y: 3.55, w: 1.52, h: 2.5, fontSize: 12, color: 'CBD5E1', align: 'center', fontFace: 'Calibri' });
  });
  notes(s, 'Repite: planeación = calendario + visibilidad + encuentro + evidencia. Si saltan al quiz editor, se pierden.');
  bar(s);
}

// ─── 13 Calendario ─────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Paso 1  ·  /admin/calendario');
  title(s, 'El tablero no es un Google Calendar');
  addShot(s, '07-calendario.png', { x: 0.35, y: 1.2, w: 12.6, h: 5.8 });
  notes(s, 'Es el contrato de la semana. Mes / semana / agenda. Clic en día vacío: Clase en vivo, Examen, Caso EMG, Corte académico. Clic en un evento: inspector (editar, pase de lista, entregas). Rúbrica Capa A arriba: 30/30/20/20, mínimo 80.');
  bar(s);
}

// ─── 14 Crear ──────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Clic en un día vacío');
  title(s, 'Un menú. Cuatro cosas que sí existen.');
  const opts = [
    ['Clase en vivo', 'Taller o sesión que cuenta a asistencia', C.rose],
    ['Examen', 'Asignar evaluación a la cohorte', C.blue],
    ['Caso EMG', 'Tarea clínica del simulador', C.emerald],
    ['Corte académico', 'Checklist de temas y fecha de corte', C.amber],
  ];
  opts.forEach((o, i) => {
    s.addShape(pptx.ShapeType.roundRect, { x: 0.45, y: 1.4 + i * 1.3, w: 12.4, h: 1.15, fill: { color: C.card }, rectRadius: 0.1 });
    s.addShape(pptx.ShapeType.roundRect, { x: 0.65, y: 1.65 + i * 1.3, w: 0.55, h: 0.55, fill: { color: o[2] }, rectRadius: 0.08 });
    s.addText(o[0], { x: 1.45, y: 1.5 + i * 1.3, w: 11, h: 0.45, fontSize: 20, bold: true, color: C.ink, fontFace: 'Calibri' });
    s.addText(o[1], { x: 1.45, y: 1.95 + i * 1.3, w: 11, h: 0.4, fontSize: 15, color: C.muted, fontFace: 'Calibri' });
  });
  notes(s, 'La fecha del clic ya va prellenada. No reenviar al profesor a /admin/talleres para “crear la clase”: puede hacerlo desde el calendario o desde Acciones rápidas.');
  bar(s);
}

// ─── 15 Rúbrica ────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Paso 2  ·  Cómo se evalúa el curso');
  title(s, 'Capa A: si no suma 100, el promedio miente');
  const buckets = [
    ['Exámenes', '30 %', 'Quizzes oficiales y exámenes asignados'],
    ['Tareas / casos', '30 %', 'Solo entregas aprobadas con nota'],
    ['Asistencia', '20 %', 'Sesiones auditadas (pase de lista)'],
    ['Temario', '20 %', 'Cobertura real de temas hoja'],
  ];
  buckets.forEach((b, i) => {
    s.addShape(pptx.ShapeType.roundRect, { x: 0.45 + i * 3.2, y: 1.5, w: 3.05, h: 3.4, fill: { color: C.navy }, rectRadius: 0.12 });
    s.addText(b[1], { x: 0.6 + i * 3.2, y: 1.8, w: 2.75, h: 0.8, fontSize: 32, bold: true, color: C.cyan, fontFace: 'Calibri' });
    s.addText(b[0], { x: 0.6 + i * 3.2, y: 2.7, w: 2.75, h: 0.7, fontSize: 18, bold: true, color: C.white, fontFace: 'Calibri' });
    s.addText(b[2], { x: 0.6 + i * 3.2, y: 3.5, w: 2.75, h: 1.1, fontSize: 14, color: '94A3B8', fontFace: 'Calibri' });
  });
  s.addText('Mínimo para acreditar: 80. Honores: ≥ 95 + cédula verificada. Una cubeta vacía no inventa 85: se ve “sin calificar”.', {
    x: 0.45, y: 5.15, w: 12.4, h: 1.3, fontSize: 16, color: C.muted, fontFace: 'Calibri',
  });
  notes(s, 'Editar pesos: riel del calendario → Editar, o Alumnos → Configurar Rúbricas. El alumno ve el mismo número en /portal?tab=performance.');
  bar(s);
}

// ─── 16 Clase ──────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Paso 3  ·  Programar el encuentro');
  title(s, 'Clase en vivo / grabación');
  addShot(s, '09-talleres.png', { x: 0.35, y: 1.2, w: 8.3, h: 5.75 });
  s.addText([
    { text: 'Campos que importan', options: { bold: true, breakLine: true, color: C.ink } },
    { text: 'Título, módulo, fecha, duración', options: { breakLine: true } },
    { text: 'En línea o presencial', options: { breakLine: true } },
    { text: 'URL de stream', options: { breakLine: true } },
    { text: 'Cuenta para kárdex', options: { breakLine: true } },
    { text: 'Grabación (después)', options: { breakLine: true } },
    { text: '', options: { breakLine: true } },
    { text: 'Se crea desde el calendario, Inicio o /admin/talleres. El profesor editor ya puede guardar.', options: { color: C.muted } },
  ], { x: 8.85, y: 1.3, w: 4.1, h: 5.5, fontSize: 15, color: C.muted, fontFace: 'Calibri' });
  notes(s, 'Después de la clase: Pase de lista (no dejarlo para el viernes). Luego pegar la grabación para quien faltó.');
  bar(s);
}

// ─── 17 Examen ─────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Paso 4  ·  Asignar examen');
  title(s, 'El alumno lo ve en Tareas. Si reprueba, pide reintento.');
  const items = [
    'Alumnos (uno, varios o cohorte)',
    'Módulo / temas y banco de preguntas',
    'Intentos, tiempo, mezclar preguntas y opciones',
    'Integridad: al agotar intentos se bloquea',
    'El profesor aprueba o rechaza el desbloqueo en la bandeja',
  ];
  items.forEach((t, i) => {
    s.addShape(pptx.ShapeType.roundRect, { x: 0.45, y: 1.4 + i * 1.05, w: 12.4, h: 0.92, fill: { color: C.card }, rectRadius: 0.1 });
    s.addText(`${i + 1}`, { x: 0.65, y: 1.55 + i * 1.05, w: 0.6, h: 0.6, fontSize: 20, bold: true, color: C.blue, fontFace: 'Calibri' });
    s.addText(t, { x: 1.4, y: 1.55 + i * 1.05, w: 11.1, h: 0.6, fontSize: 18, color: C.ink, fontFace: 'Calibri', valign: 'middle' });
  });
  notes(s, 'Modal Asignar Examen desde Inicio, calendario o Alumnos. No es el quiz curricular del final de la lección.');
  bar(s);
}

// ─── 18 Caso ───────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Paso 5  ·  Asignar caso EMG');
  title(s, 'El profesor califica el dictamen, no un score automático');
  addShot(s, '12-ejercicios.png', { x: 0.35, y: 1.2, w: 8.3, h: 5.75 });
  s.addText('Uso del caso\n\n• Práctica\n• Solo examen\n• Ambos\n\nEl caso no aparece en el portal solo porque existe en el banco.', {
    x: 8.85, y: 1.4, w: 4.1, h: 5.3, fontSize: 16, color: C.ink, fontFace: 'Calibri',
  });
  notes(s, 'Ejemplo de la semana: STC → tema visible → caso entrapment asignado → (opcional) examen del módulo 2.');
  bar(s);
}

// ─── 19 Día de clase ───────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Paso 6  ·  Checklist del día');
  title(s, 'Cuatro clics. Si pides más, la UI falló.');
  const clicks = [
    ['1', 'Abrir el taller / stream'],
    ['2', 'Pase de lista (cuenta a kárdex)'],
    ['3', 'Confirmar que el tema de la semana está visible'],
    ['4', 'Recordar caso o examen con fecha'],
  ];
  clicks.forEach((c, i) => {
    s.addShape(pptx.ShapeType.roundRect, { x: 0.45, y: 1.45 + i * 1.3, w: 12.4, h: 1.15, fill: { color: C.navy }, rectRadius: 0.1 });
    s.addText(c[0], { x: 0.7, y: 1.65 + i * 1.3, w: 1.1, h: 0.75, fontSize: 32, bold: true, color: C.cyan, fontFace: 'Calibri' });
    s.addText(c[1], { x: 2.0, y: 1.65 + i * 1.3, w: 10.5, h: 0.75, fontSize: 22, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle' });
  });
  notes(s, 'Cierra bloque 3: planeación = calendario + visibilidad + encuentro + evidencia.');
  bar(s);
}

// ─── 20 Tres palancas ──────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Bloque 4 · Cómo se toca el contenido');
  title(s, 'Tres palancas. No “el editor”.');
  const p = [
    ['1. Organizar', '/admin/temario\nOrdenar, ocultar, crear tema o subtema, vista previa del alumno.'],
    ['2. Reescribir', 'Lápiz → revisión editorial\nBorrador → cola → aprobar. Admin/editor puede publicar al instante.'],
    ['3. Enriquecer', 'Desde la lección\nVideo, PDF, imagen o perla. Para “sube la clase de ayer” no hace falta el editor largo.'],
  ];
  p.forEach((item, i) => {
    s.addShape(pptx.ShapeType.roundRect, { x: 0.45 + i * 4.2, y: 1.45, w: 4.0, h: 4.6, fill: { color: C.navy }, rectRadius: 0.14 });
    s.addText(item[0], { x: 0.7 + i * 4.2, y: 1.75, w: 3.5, h: 0.8, fontSize: 22, bold: true, color: C.cyan, fontFace: 'Calibri' });
    s.addText(item[1], { x: 0.7 + i * 4.2, y: 2.7, w: 3.5, h: 2.9, fontSize: 16, color: 'E2E8F0', fontFace: 'Calibri' });
  });
  notes(s, 'Regla de oro: nunca cambiar el id de un tema si ya hay quiz, progreso o revisión. Hay un árbol TypeScript + una capa editorial en Supabase.');
  bar(s);
}

// ─── 21 Temario admin ──────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Palanca 1  ·  /admin/temario');
  title(s, 'Ocultar no borra. Reordenar no reescribe.');
  addShot(s, '10-temario-admin.png', { x: 0.35, y: 1.2, w: 12.6, h: 5.8 });
  notes(s, 'Demo de 3 minutos: ocultar un tema → vista previa alumno → volver a mostrar → lápiz de una frase → abrir /modulo y confirmar.');
  bar(s);
}

// ─── 22 Árbol decisión ─────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'La slide más útil del bloque');
  title(s, '¿Qué quieres hacer?');
  const rows = [
    ['Que el alumno NO vea un tema esta semana', 'Temario → Ojo (ocultar)'],
    ['Cambiar el orden de la clase', 'Temario → flechas'],
    ['Crear un subtema nuevo', 'Temario → + Subtema'],
    ['Corregir un valor o un párrafo', 'Lápiz → revisión → (aprobar)'],
    ['Subir video / imagen / perla', 'Abrir la lección → material rápido'],
    ['Evaluar ese tema', 'Quizzes; el tema solo no crea examen'],
  ];
  rows.forEach((r, i) => {
    s.addShape(pptx.ShapeType.roundRect, { x: 0.4, y: 1.3 + i * 0.9, w: 12.5, h: 0.8, fill: { color: i % 2 ? C.card : 'EEF2FF' }, rectRadius: 0.08 });
    s.addText(r[0], { x: 0.6, y: 1.3 + i * 0.9, w: 7.2, h: 0.8, fontSize: 16, color: C.ink, fontFace: 'Calibri', valign: 'middle' });
    s.addText(r[1], { x: 7.9, y: 1.3 + i * 0.9, w: 4.8, h: 0.8, fontSize: 15, bold: true, color: C.blue, fontFace: 'Calibri', valign: 'middle' });
  });
  notes(s, 'Si este camino pide 3 logins o se pierde el menú, eso es el hallazgo de la sesión.');
  bar(s);
}

// ─── 23 Ejercicios ─────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Bloque 5 · El simulador no es el temario');
  title(s, 'Banco de patrones. El motor sortea valores.');
  const cats = ['Atrapamiento', 'Axonal', 'Desmielinizante', 'Radiculopatía', 'Plexopatía', 'NMJ', 'Motoneurona', 'Trampas'];
  cats.forEach((c, i) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.45 + (i % 4) * 3.2, y: 1.5 + Math.floor(i / 4) * 2.5, w: 3.05, h: 2.25,
      fill: { color: C.navy }, rectRadius: 0.12,
    });
    s.addText(c, {
      x: 0.6 + (i % 4) * 3.2, y: 2.2 + Math.floor(i / 4) * 2.5, w: 2.75, h: 0.8,
      fontSize: 18, bold: true, color: C.white, align: 'center', fontFace: 'Calibri',
    });
  });
  notes(s, '/admin/ejercicios: crear, editar, duplicar, filtrar, asignar. Fricción: esta página a veces se siente “fuera” del cascarón admin. Anótalo si el profesor se pierde.');
  bar(s);
}

// ─── 24 Instrumentos ───────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Bloque 6 · Evaluar  ·  no mezclar nombres');
  title(s, 'Tres instrumentos distintos');
  s.addShape(pptx.ShapeType.roundRect, { x: 0.4, y: 1.25, w: 12.5, h: 0.5, fill: { color: C.navy }, rectRadius: 0.06 });
  ['Instrumento', 'Dónde se crea', 'Dónde lo ve el alumno', 'Quién califica'].forEach((h, i) => {
    s.addText(h, { x: 0.55 + i * 3.1, y: 1.28, w: 3.0, h: 0.44, fontSize: 13, bold: true, color: C.white, fontFace: 'Calibri' });
  });
  const table = [
    ['Quiz del tema', '/admin/quizzes', 'Final de la lección hoja', 'Automático (p. ej. 70)'],
    ['Examen asignado', 'Modal Asignar Examen', 'Portal / sesión de examen', 'Automático + integridad'],
    ['Caso / tarea', 'Banco + asignar', 'Simulador + entrega', 'El profesor (bandeja)'],
    ['Asistencia', 'Pase de lista', 'Cuenta en Desempeño', 'Lista del día'],
  ];
  table.forEach((row, r) => {
    const y = 1.9 + r * 1.15;
    s.addShape(pptx.ShapeType.roundRect, { x: 0.4, y, w: 12.5, h: 1.05, fill: { color: r % 2 ? C.card : 'F8FAFC' }, rectRadius: 0.06 });
    row.forEach((cell, i) => {
      s.addText(cell, { x: 0.55 + i * 3.1, y, w: 3.0, h: 1.05, fontSize: 14, color: C.ink, fontFace: 'Calibri', valign: 'middle' });
    });
  });
  notes(s, 'Si dicen “el quiz” por todo, corrige en voz alta. El kárdex oficial no se llena con el quiz curricular solo.');
  bar(s);
}

// ─── 25 Quizzes ────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Quizzes curriculares  ·  /admin/quizzes');
  title(s, 'Se ligan al tema hoja. Sin preguntas, no hay badge.');
  addShot(s, '11-quizzes.png', { x: 0.35, y: 1.2, w: 12.6, h: 5.8 });
  notes(s, 'Tipos: única, múltiple, V/F, imagen. Enseña solo /admin/quizzes. Hay un segundo editor en /colaborador/cuestionario: no lo uses en la inducción.');
  bar(s);
}

// ─── 26 Bandeja ────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Bandeja del Inicio');
  title(s, 'Por calificar · reintentos · en riesgo');
  const cards = [
    ['Por calificar', 'Dictamen + nota del caso o tarea. No dejes la bandeja para el corte.'],
    ['Reintentos', '+1 intento o rechazo con motivo. El alumno lo pidió desde el portal.'],
    ['En riesgo', 'Abre kárdex de esos 5. No busques Excel.'],
  ];
  cards.forEach((c, i) => {
    s.addShape(pptx.ShapeType.roundRect, { x: 0.45 + i * 4.2, y: 1.5, w: 4.0, h: 4.5, fill: { color: C.navy }, rectRadius: 0.14 });
    s.addText(c[0], { x: 0.7 + i * 4.2, y: 1.85, w: 3.5, h: 1.2, fontSize: 22, bold: true, color: C.cyan, fontFace: 'Calibri' });
    s.addText(c[1], { x: 0.7 + i * 4.2, y: 3.2, w: 3.5, h: 2.3, fontSize: 16, color: 'E2E8F0', fontFace: 'Calibri' });
  });
  notes(s, 'Si la bandeja está vacía y hay entregas, recargar. El editor ya ve Inicio; no mandarlo a Usuarios.');
  bar(s);
}

// ─── 27 Alumnos ────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Expediente  ·  /admin/alumnos');
  title(s, 'La cohorte, no una hoja de cálculo');
  addShot(s, '08-alumnos.png', { x: 0.35, y: 1.2, w: 12.6, h: 5.8 });
  notes(s, 'Desde la fila: kárdex, exámenes, tareas, asistencias. Semáforo: al corriente / en riesgo / rezagado. “Sin calificar” es honesto: no hay 85 fantasma.');
  bar(s);
}

// ─── 28 Login ──────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Cómo entra el profesor');
  title(s, 'Contraseña o enlace mágico. Luego cae en /admin.');
  addShot(s, '03-login.png', { x: 2.1, y: 1.2, w: 9.1, h: 5.75 });
  notes(s, 'Pantalla real de /auth/login. Un editor o admin aterriza en /admin, no en el portal del alumno. Si alguien entra como alumno, no verá el panel.');
  bar(s);
}

// ─── 29 Recorrido ──────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Bloque 7 · El profesor maneja. Tú no.');
  title(s, 'Guion de 12 páginas, en este orden');
  const urls = [
    '1. /  o  /temario  — vista pública',
    '2. /portal  — así entra el alumno',
    '3. /modulo/{id}/{tema}  — video + quiz + offline',
    '4. /ejercicios  — simulador como alumno',
    '5. /admin  — Inicio docente',
    '6. /admin/calendario  — crear la semana',
    '7. Crear o editar una clase',
    '8. /admin/temario  — ocultar, reordenar, vista previa',
    '9. Lápiz de un tema → volver',
    '10. /admin/quizzes  — abrir uno existente',
    '11. /admin/ejercicios  — duplicar y asignar',
    '12. /admin/alumnos/{alumno}  — ¿se ve la tarea?',
  ];
  urls.forEach((u, i) => {
    const col = i < 6 ? 0 : 1;
    const row = i % 6;
    s.addText(u, {
      x: 0.45 + col * 6.45, y: 1.3 + row * 0.9, w: 6.25, h: 0.8,
      fontSize: 15, color: C.ink, fontFace: 'Calibri', valign: 'middle',
    });
  });
  notes(s, 'Rúbrica por pantalla: ¿la acción en <10 s? ¿sé si guardó? ¿puedo deshacer? ¿el menú sigue? ¿vocabulario clínico? ¿tablet del aula?');
  bar(s);
}

// ─── 30 Permisos ───────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Bloque 8 · Permisos');
  title(s, 'Sí · con aviso · no');
  const cols = [
    [C.emerald, 'SÍ — trabajo del titular', 'Inicio y bandeja\nCalendario y clases\nTemario de su curso\nQuizzes y casos\nCalificar y asistencia\nAdmisión de su lista'],
    [C.amber, 'SÍ CON AVISO', 'Publicar al instante\nOcultar un módulo entero\nBorrar un caso custom\nCambiar pesos de rúbrica\nVista previa como alumno'],
    [C.rose, 'NO — dirección', 'Crear administradores\nBorrar cuentas\nPrecios y pasarela\nAuditoría técnica\nImpersonar sin marca de agua'],
  ];
  cols.forEach((c, i) => {
    s.addShape(pptx.ShapeType.roundRect, { x: 0.4 + i * 4.25, y: 1.35, w: 4.1, h: 5.5, fill: { color: C.navy }, rectRadius: 0.14 });
    s.addShape(pptx.ShapeType.rect, { x: 0.4 + i * 4.25, y: 1.35, w: 4.1, h: 0.1, fill: { color: c[0] } });
    s.addText(c[1], { x: 0.6 + i * 4.25, y: 1.65, w: 3.7, h: 1.1, fontSize: 18, bold: true, color: C.white, fontFace: 'Calibri' });
    s.addText(c[2], { x: 0.6 + i * 4.25, y: 2.85, w: 3.7, h: 3.6, fontSize: 15, color: 'CBD5E1', fontFace: 'Calibri' });
  });
  notes(s, 'Hoy editor ya tiene Inicio, calendario y talleres. Admisiones, usuarios, acceso premium y auditoría siguen en admin. El rol se llama Editor en el sistema; el badge dice Profesor.');
  bar(s);
}

// ─── 31 Cierre ─────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Bloque 9 · Tres decisiones de la reunión');
  title(s, 'No salgan sin contestar esto');
  const qs = [
    ['1', '¿El titular entra siempre por Inicio docente aunque no sea admin?', 'Hoy: sí, si tiene rol editor.'],
    ['2', '¿Editar un tema se queda en /admin/temario o seguimos saltando a /colaborador?', 'El salto visual es la fricción #1 de contenido.'],
    ['3', '¿Qué entra al panel de ajustes docentes v1?', 'Yo priorizaría: cohorte, defaults de examen, rúbrica, notificaciones, vista previa.'],
  ];
  qs.forEach((q, i) => {
    s.addShape(pptx.ShapeType.roundRect, { x: 0.45, y: 1.35 + i * 1.8, w: 12.4, h: 1.65, fill: { color: C.card }, rectRadius: 0.12 });
    s.addText(q[0], { x: 0.7, y: 1.55 + i * 1.8, w: 0.7, h: 1.25, fontSize: 28, bold: true, color: C.blue, fontFace: 'Calibri' });
    s.addText(q[1], { x: 1.55, y: 1.5 + i * 1.8, w: 11, h: 0.7, fontSize: 18, bold: true, color: C.ink, fontFace: 'Calibri' });
    s.addText(q[2], { x: 1.55, y: 2.2 + i * 1.8, w: 11, h: 0.55, fontSize: 15, color: C.muted, fontFace: 'Calibri' });
  });
  notes(s, 'No abras esta discusión al minuto 5. Primero el ciclo de clase.');
  bar(s);
}

// ─── 32 URLs ───────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  kicker(s, 'Anexo · Handout');
  title(s, 'URLs para tenerlas a la mano');
  const urls = [
    ['/auth/login', 'Entrada del profesor'],
    ['/admin', 'Inicio · bandeja'],
    ['/admin/calendario', 'Plan de la semana'],
    ['/admin/alumnos', 'Cohorte y kárdex'],
    ['/admin/temario', 'Árbol y visibilidad'],
    ['/admin/quizzes', 'Evaluaciones de tema'],
    ['/admin/ejercicios', 'Banco de casos'],
    ['/admin/talleres', 'Clases y grabaciones'],
    ['/portal', 'Lo que ve el alumno'],
    ['/temario', 'Vista pública del programa'],
  ];
  urls.forEach((u, i) => {
    const col = i < 5 ? 0 : 1;
    const row = i % 5;
    s.addText(u[0], { x: 0.5 + col * 6.4, y: 1.35 + row * 1.05, w: 6.1, h: 0.45, fontSize: 16, bold: true, color: C.blue, fontFace: 'Consolas' });
    s.addText(u[1], { x: 0.5 + col * 6.4, y: 1.75 + row * 1.05, w: 6.1, h: 0.35, fontSize: 14, color: C.muted, fontFace: 'Calibri' });
  });
  notes(s, 'Imprimir o dejar en el chat del grupo docente. Capturas de / , /temario y /auth/login son del sistema en vivo. Las de /admin son recreaciones fieles de la UI (mismos menús y textos) para esta sesión; se pueden sustituir iniciando sesión y corriendo docs/intro/capture-profesor-screens.mjs.');
  bar(s);
}

await pptx.writeFile({ fileName: out });
console.log(`wrote ${out} (${n} slides)`);
