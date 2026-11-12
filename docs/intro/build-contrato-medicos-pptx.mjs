import PptxGenJS from 'pptxgenjs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const root = dirname(fileURLToPath(import.meta.url));
const logo = join(root, '../../public/icons/icon-192x192.png');
const out = join(root, 'ElectroDX-Contrato-y-Pagos-Medicos.pptx');

const C = {
  navy: '0B1329',
  slateDark: '1E293B',
  blue: '2563EB',
  cyan: '06B6D4',
  white: 'FFFFFF',
  ink: '0F172A',
  muted: '475569',
  lightMuted: '94A3B8',
  line: 'CBD5E1',
  card: 'F1F5F9',
  cardAlt: 'F8FAFC',
  indigoSoft: 'EEF2FF',
  amber: 'B45309',
  rose: 'BE123C',
  emerald: '047857',
};

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'WIDE';
pptx.author = 'ElectroDx Diplomado';
pptx.title = 'ElectroDx · Contrato de Médicos, Pagos y Gestión Administrativa';
pptx.subject = 'Marco Contractual v1.0, Esquema de Pagos y Gobernanza Editorial';

let slideNum = 0;
const TOTAL_SLIDES = 14;

function bar(slide) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.25, w: 13.333, h: 0.25, fill: { color: C.navy },
  });
  slide.addText('ElectroDx Diplomado  ·  Contrato de Médicos v1.0  ·  Pagos, Gobernanza Editorial y Administración', {
    x: 0.45, y: 7.25, w: 11.2, h: 0.25, fontSize: 10, color: C.lightMuted, fontFace: 'Calibri', valign: 'middle',
  });
  slideNum += 1;
  slide.addText(`${slideNum} / ${TOTAL_SLIDES}`, {
    x: 11.8, y: 7.25, w: 1.1, h: 0.25, fontSize: 10, color: C.lightMuted, align: 'right', fontFace: 'Consolas', valign: 'middle',
  });
}

function kicker(slide, text, y = 0.28) {
  slide.addText(text.toUpperCase(), {
    x: 0.45, y, w: 12.4, h: 0.26, fontSize: 11, bold: true, color: C.blue, fontFace: 'Calibri',
    charSpacing: 1.3,
  });
}

function title(slide, text, y = 0.52) {
  slide.addText(text, {
    x: 0.45, y, w: 12.4, h: 0.5, fontSize: 25, bold: true, color: C.ink, fontFace: 'Calibri',
  });
}

function notes(slide, text) {
  slide.addNotes(text);
}

// ─── SLIDE 1: Portada ────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.navy } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: C.cyan } });

  if (existsSync(logo)) {
    s.addImage({ path: logo, x: 0.55, y: 0.48, w: 0.55, h: 0.55 });
  }
  s.addText('ELECTRODX DIPLOMADO  ·  VERSIÓN 1.0 (29 OCT 2026)', {
    x: 1.22, y: 0.56, w: 11.2, h: 0.36, fontSize: 13, bold: true, color: C.cyan, fontFace: 'Calibri', charSpacing: 2,
  });

  s.addText('Contrato de Médicos,\nPagos y Gestión\nAdministrativa', {
    x: 0.55, y: 1.55, w: 11.8, h: 2.4, fontSize: 40, bold: true, color: C.white, fontFace: 'Calibri',
  });

  s.addText('Marco Contractual, Esquema de Pagos y Gobernanza Editorial del Diplomado', {
    x: 0.55, y: 4.15, w: 11.5, h: 0.45, fontSize: 18, color: C.lightMuted, fontFace: 'Calibri',
  });

  const pills = [
    ['PROFESORES Y EDITORES', 'Fórmulas, bolsas y plazos de pago'],
    ['COMITÉ EDITORIAL', 'Palabras de obra, unidades y Acta'],
    ['ADMINISTRACIÓN', 'Cláusulas 1–20 y firma digital'],
  ];
  pills.forEach((p, i) => {
    const x = 0.55 + i * 4.1;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 5.05, w: 3.9, h: 1.2, fill: { color: C.slateDark }, line: { color: '334155', pt: 1 }, rectRadius: 0.08,
    });
    s.addText(p[0], { x: x + 0.2, y: 5.22, w: 3.5, h: 0.28, fontSize: 11, bold: true, color: C.cyan, fontFace: 'Consolas' });
    s.addText(p[1], { x: x + 0.2, y: 5.56, w: 3.5, h: 0.48, fontSize: 14, color: C.white, fontFace: 'Calibri' });
  });

  notes(s, 'Portada ejecutiva. Dirigida a profesores participantes, comité editorial y personal administrativo de ElectroDx. Basada íntegramente en docs/legal/medicos/ y src/content/legal/physicianAgreements.ts.');
  slideNum += 1;
}

// ─── SLIDE 2: Mapa General del Marco Legal de Médicos ────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.white } });
  kicker(s, '01 · Arquitectura Legal (Declaración III)');
  title(s, 'Cuatro instrumentos forman un solo acuerdo');

  const docs = [
    ['PASO 1 · FOLIO CON-', 'Contrato Principal', 'contrato-prestacion-servicios-medicos.md', 'Relación civil, 20 cláusulas, fórmulas de pago, licencia exclusiva y salida.', C.blue],
    ['PASO 2 · FOLIO ANX-', 'Anexo de Participación', 'anexo-participacion.md', 'Cohorte, edición, RFC, CLABE, papel elegido y tasas de la generación.', C.emerald],
    ['PASO 3 · FOLIO REG-', 'Reglamento Editorial', 'reglamento-editorial-y-libro.md', '17 artículos: palabras de obra, unidades editoriales y Acta de Créditos.', C.amber],
    ['INTEGRADO AL PASO 1', 'Aviso de Privacidad', 'aviso-de-privacidad-medicos.md', 'Datos fiscales, firma IP/SHA-256, créditos públicos y derechos ARCO.', C.navy],
  ];

  docs.forEach((d, i) => {
    const x = 0.45 + i * 3.14;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.35, w: 2.98, h: 4.5, fill: { color: C.card }, line: { color: C.line, pt: 1 }, rectRadius: 0.08,
    });
    s.addShape(pptx.ShapeType.rect, { x, y: 1.35, w: 2.98, h: 0.1, fill: { color: d[4] } });
    s.addText(d[0], { x: x + 0.18, y: 1.6, w: 2.62, h: 0.28, fontSize: 10.5, bold: true, color: d[4], fontFace: 'Consolas' });
    s.addText(d[1], { x: x + 0.18, y: 1.95, w: 2.62, h: 0.55, fontSize: 18, bold: true, color: C.ink, fontFace: 'Calibri' });
    s.addText(d[2], { x: x + 0.18, y: 2.55, w: 2.62, h: 0.35, fontSize: 9.5, color: C.muted, fontFace: 'Consolas' });
    s.addShape(pptx.ShapeType.line, { x: x + 0.18, y: 3.0, w: 2.62, h: 0, line: { color: C.line, pt: 1 } });
    s.addText(d[3], { x: x + 0.18, y: 3.2, w: 2.62, h: 2.3, fontSize: 14, color: C.ink, fontFace: 'Calibri' });
  });

  s.addShape(pptx.ShapeType.roundRect, { x: 0.45, y: 6.05, w: 12.43, h: 0.9, fill: { color: C.navy }, rectRadius: 0.08 });
  s.addText('Regla base: Firmar no paga por sí solo; paga la participación validada en sesiones, palabras o unidades.', {
    x: 0.7, y: 6.15, w: 11.9, h: 0.7, fontSize: 15, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle',
  });

  notes(s, 'Declaración III del Contrato: el contrato, el anexo de participación y el reglamento editorial forman un solo acuerdo. El aviso de privacidad v1.0 se fusiona al Contrato en el Paso 1 mediante mergePhysicianPrivacyNotice(). El borrador-01.md se conserva como antecedente y no se firma.');
  bar(s);
}

// ─── SLIDE 3: Partes Contratantes, Roles y Alcance ───────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.white } });
  kicker(s, '02 · Partes, Roles y Alcance (Cláusulas 1–3 y Anexo §1–3)');
  title(s, 'Tres papeles definen qué bolsas se abren');

  // Left card: Parties
  s.addShape(pptx.ShapeType.roundRect, { x: 0.45, y: 1.35, w: 4.3, h: 5.6, fill: { color: C.navy }, rectRadius: 0.08 });
  s.addText('PARTES CONTRATANTES', { x: 0.7, y: 1.6, w: 3.8, h: 0.3, fontSize: 11, bold: true, color: C.cyan, fontFace: 'Consolas' });
  s.addText('La Plataforma (party.ts)', { x: 0.7, y: 2.0, w: 3.8, h: 0.35, fontSize: 16, bold: true, color: C.white, fontFace: 'Calibri' });
  s.addText('• [RAZÓN SOCIAL], [RFC], [DOMICILIO], [CIUDAD].\n• 3 correos: privacidad, académico y liquidaciones.\n• Titular del software, marca y obra colectiva.', {
    x: 0.7, y: 2.4, w: 3.8, h: 1.6, fontSize: 13, color: 'CBD5E1', fontFace: 'Calibri',
  });
  s.addText('El Médico (Cláusula 3)', { x: 0.7, y: 4.2, w: 3.8, h: 0.35, fontSize: 16, bold: true, color: C.white, fontFace: 'Calibri' });
  s.addText('• Cédula vigente, RFC, CLABE (18 dígitos) y CFDI.\n• Relación civil: sin jornada, horario ni exclusividad médica.', {
    x: 0.7, y: 4.6, w: 3.8, h: 1.6, fontSize: 13, color: 'CBD5E1', fontFace: 'Calibri',
  });

  // Right table: 3 Roles
  const headers = ['Papel en Anexo', 'Encargos (Cláusula 1)', 'Docencia', 'Obra', 'Editorial'];
  const colW = [1.85, 2.75, 1.1, 1.1, 1.1];
  let cx = 5.0;
  s.addShape(pptx.ShapeType.roundRect, { x: 5.0, y: 1.35, w: 7.9, h: 0.5, fill: { color: C.navy }, rectRadius: 0.04 });
  headers.forEach((h, i) => {
    s.addText(h, { x: cx + 0.08, y: 1.38, w: colW[i] - 0.16, h: 0.44, fontSize: 11.5, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle' });
    cx += colW[i];
  });

  const rows = [
    ['Profesor', 'Sesiones de clase o taller', 'ABIERTA', 'CERRADA', 'CERRADA'],
    ['Editor', 'Texto de temas, reactivos, casos, config', 'CERRADA', 'ABIERTA', 'ABIERTA'],
    ['Profesor y editor', 'Docencia + Obra + Labor editorial', 'ABIERTA', 'ABIERTA', 'ABIERTA'],
  ];
  rows.forEach((r, idx) => {
    const ry = 1.98 + idx * 1.12;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 5.0, y: ry, w: 7.9, h: 0.98, fill: { color: idx % 2 === 0 ? C.card : C.cardAlt }, line: { color: C.line, pt: 1 }, rectRadius: 0.04,
    });
    let rx = 5.0;
    r.forEach((cell, cIdx) => {
      const isBag = cIdx >= 2;
      const open = cell === 'ABIERTA';
      s.addText(cell, {
        x: rx + 0.08, y: ry + 0.1, w: colW[cIdx] - 0.16, h: 0.78,
        fontSize: isBag ? 11.5 : 13.5,
        bold: cIdx === 0 || isBag,
        color: isBag ? (open ? C.emerald : C.rose) : C.ink,
        fontFace: isBag ? 'Consolas' : 'Calibri',
        valign: 'middle',
      });
      rx += colW[cIdx];
    });
  });

  s.addShape(pptx.ShapeType.roundRect, { x: 5.0, y: 5.45, w: 7.9, h: 1.5, fill: { color: C.indigoSoft }, line: { color: C.blue, pt: 1 }, rectRadius: 0.06 });
  s.addText('CANDADO DE BOLSAS (CLÁUSULA 2)', { x: 5.2, y: 5.62, w: 7.5, h: 0.28, fontSize: 11, bold: true, color: C.blue, fontFace: 'Consolas' });
  s.addText('Una bolsa cerrada no se paga. Para abrirla, el Anexo debe modificarse antes de que Dirección acepte el trabajo. Sin bolsa de Obra abierta, el texto no entra al libro.', {
    x: 5.2, y: 5.95, w: 7.5, h: 0.85, fontSize: 13, color: C.ink, fontFace: 'Calibri',
  });

  notes(s, 'Cláusulas 1, 2 y 3 + Anexo §3. El Médico no está obligado a aceptar todo encargo; cada pieza aceptada fija su fecha compromiso. En party.ts, mientras LEGAL_PARTY esté vacío, el candado de redirección no bloquea la plataforma.');
  bar(s);
}

// ─── SLIDE 4: Esquema Completo de Pagos en la Plataforma ─────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.white } });
  kicker(s, '03 · Esquema Completo de Pagos (Cláusulas 4–9 y Anexo §4–5)');
  title(s, 'Dos bases separadas y cinco vías de remuneración');

  // 2 Base cards
  const bases = [
    ['BASE 1 · INGRESO DEL DIPLOMADO', 'Cobrado a la cohorte − comisión de pasarela (sin restar ISR).', C.navy],
    ['BASE 2 · INGRESO DEL LIBRO', 'Ventas de la edición − impresión, distribución y tienda (sin restar ISR).', C.slateDark],
  ];
  bases.forEach((b, i) => {
    const bx = 0.45 + i * 6.32;
    s.addShape(pptx.ShapeType.roundRect, { x: bx, y: 1.25, w: 6.1, h: 0.98, fill: { color: b[2] }, rectRadius: 0.06 });
    s.addText(b[0], { x: bx + 0.18, y: 1.35, w: 5.74, h: 0.26, fontSize: 10.5, bold: true, color: C.cyan, fontFace: 'Consolas' });
    s.addText(b[1], { x: bx + 0.18, y: 1.65, w: 5.74, h: 0.45, fontSize: 12.5, color: C.white, fontFace: 'Calibri' });
  });

  // Table
  const th = ['Concepto / Cláusula', 'Tasa Propuesta', 'Fórmula Exacta en Contrato', 'Regla Operativa'];
  const tw = [2.4, 2.1, 4.7, 3.23];
  let tx = 0.45;
  s.addShape(pptx.ShapeType.roundRect, { x: 0.45, y: 2.4, w: 12.43, h: 0.44, fill: { color: C.blue }, rectRadius: 0.04 });
  th.forEach((h, i) => {
    s.addText(h, { x: tx + 0.08, y: 2.42, w: tw[i] - 0.16, h: 0.4, fontSize: 11, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle' });
    tx += tw[i];
  });

  const rows = [
    ['Docencia Variable (Cl. 6)', '15% Diplomado', 'Ingreso × Tasa × (Sesiones validadas ÷ Sesiones computables)', 'Sesiones de Plataforma quedan en casa'],
    ['Docencia Fija (Anexo §5)', 'Monto fijo MXN', '[MONTO] bruto × Sesiones impartidas y validadas', 'Excluye a ese médico de la Cláusula 6'],
    ['Obra Diplomado (Cl. 7)', '15% Diplomado', 'Ingreso × Tasa × (Palabras en Acta ÷ Palabras edición)', 'Paga en cada cohorte que use la edición'],
    ['Labor Editorial (Cl. 8)', '5% Diplomado', 'Ingreso × Tasa × (Unidades médico ÷ Unidades cohorte)', 'Reactivo=1u · Caso=2u · Config=1u'],
    ['Libro Edición (Cl. 9)', '60% Autores / 40% Plat.', 'Ingreso Libro × 0.60 × (Palabras en Acta ÷ Palabras edición)', '0 palabras en Acta = $0 en el libro'],
  ];

  rows.forEach((r, idx) => {
    const ry = 2.92 + idx * 0.8;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.45, y: ry, w: 12.43, h: 0.72, fill: { color: idx % 2 === 0 ? C.card : C.cardAlt }, line: { color: C.line, pt: 0.5 }, rectRadius: 0.04,
    });
    let rx = 0.45;
    r.forEach((cell, cIdx) => {
      s.addText(cell, {
        x: rx + 0.08, y: ry + 0.06, w: tw[cIdx] - 0.16, h: 0.6,
        fontSize: cIdx === 2 ? 10.5 : 11.5,
        bold: cIdx === 0 || cIdx === 1,
        color: cIdx === 2 ? C.blue : C.ink,
        fontFace: cIdx === 1 || cIdx === 2 ? 'Consolas' : 'Calibri',
        valign: 'middle',
      });
      rx += tw[cIdx];
    });
  });

  notes(s, 'Cláusulas 4 a 9 y Anexo §4–7. Si las 3 tasas del diplomado (15% + 15% + 5%) se devengan al 100%, los médicos reciben 35% y la Plataforma conserva 65%. Cualquier porcentaje no devengado permanece en la Plataforma. Un trato especial (Anexo §7) sale del 65% de la Plataforma sin reducir a los demás.');
  bar(s);
}

// ─── SLIDE 5: Ejemplo Numérico Oficial (README.md) ───────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.white } });
  kicker(s, '04 · Simulación Numérica Oficial (docs/legal/medicos/README.md)');
  title(s, 'Ejemplo del repositorio: Diplomado $1M + Libro $200k');

  const kpis = [
    ['DIPLOMADO NETO', '$1,000,000', 'Tasas: 15% / 15% / 5%'],
    ['EDICIÓN CONGELADA', '100,000 pal.', '40 sesiones · 100 unidades'],
    ['LIBRO NETO', '$200,000', '60% autores ($120,000)'],
  ];
  kpis.forEach((k, i) => {
    const kx = 0.45 + i * 4.2;
    s.addShape(pptx.ShapeType.roundRect, { x: kx, y: 1.25, w: 4.03, h: 1.05, fill: { color: C.navy }, rectRadius: 0.06 });
    s.addText(k[0], { x: kx + 0.18, y: 1.35, w: 3.6, h: 0.24, fontSize: 10, bold: true, color: C.cyan, fontFace: 'Consolas' });
    s.addText(k[1], { x: kx + 0.18, y: 1.6, w: 2.0, h: 0.4, fontSize: 18, bold: true, color: C.white, fontFace: 'Consolas' });
    s.addText(k[2], { x: kx + 2.1, y: 1.65, w: 1.8, h: 0.35, fontSize: 11, color: C.lightMuted, fontFace: 'Calibri', align: 'right' });
  });

  const cols = ['Perfil', 'Aporte Validado', 'Pago Diplomado', 'Pago Libro (60%)', 'Total'];
  const cw = [2.2, 2.9, 3.8, 2.1, 1.43];
  let cx = 0.45;
  s.addShape(pptx.ShapeType.roundRect, { x: 0.45, y: 2.5, w: 12.43, h: 0.46, fill: { color: C.slateDark }, rectRadius: 0.04 });
  cols.forEach((h, i) => {
    s.addText(h, { x: cx + 0.08, y: 2.52, w: cw[i] - 0.16, h: 0.42, fontSize: 11, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle' });
    cx += cw[i];
  });

  const sim = [
    ['Doctora A (Editora)', '20,000 palabras (20%)', 'Obra: $1M × 0.15 × 0.20 = $30,000', '$120k × 0.20 = $24,000', '$54,000'],
    ['Doctor B (Ambos)', '5k pal · 10/40 ses · 10/100 u', '$7,500 + $37,500 + $5,000 = $50,000', '$120k × 0.05 = $6,000', '$56,000'],
    ['Profesor C (Profesor)', '4/40 sesiones (10%) · 0 pal', 'Docencia: $1M × 0.15 × 0.10 = $15,000', '$0 (sin palabras)', '$15,000'],
    ['Plataforma (Resto)', '75k pal · 26/40 ses · 90/100 u', '65% base ($650k) + no devengado ($255k)', '40% ($80k) + 75% ($90k)', '$1,075,000'],
  ];

  sim.forEach((r, idx) => {
    const ry = 3.06 + idx * 0.96;
    const isPlat = idx === 3;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.45, y: ry, w: 12.43, h: 0.86,
      fill: { color: isPlat ? C.indigoSoft : (idx % 2 === 0 ? C.card : C.cardAlt) },
      line: { color: isPlat ? C.blue : C.line, pt: isPlat ? 1 : 0.5 },
      rectRadius: 0.04,
    });
    let rx = 0.45;
    r.forEach((cell, cIdx) => {
      s.addText(cell, {
        x: rx + 0.08, y: ry + 0.08, w: cw[cIdx] - 0.16, h: 0.7,
        fontSize: 11.5,
        bold: cIdx === 0 || cIdx === 4,
        color: cIdx === 4 ? (isPlat ? C.blue : C.emerald) : C.ink,
        fontFace: cIdx >= 2 ? 'Consolas' : 'Calibri',
        valign: 'middle',
      });
      rx += cw[cIdx];
    });
  });

  notes(s, 'Caso numérico documentado en docs/legal/medicos/README.md. Las 26 sesiones no impartidas por médicos externos no aumentan la parte del Doctor B ni del Profesor C; su porcentaje permanece en la Plataforma.');
  bar(s);
}

// ─── SLIDE 6: Condiciones, Entregables y Calendario de Pago ──────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.white } });
  kicker(s, '05 · Condiciones, Entregables y Plazos (Cláusulas 10–11)');
  title(s, 'De la validación académica a la transferencia en 15 días hábiles');

  const delivs = [
    ['DOCENCIA VALIDADA', 'Sesión impartida y validada por Dirección. Cancelar sin aviso no cuenta.', C.blue],
    ['PALABRAS EN ACTA', 'Texto clínico aceptado con bolsa de Obra abierta. Borradores no cobran.', C.emerald],
    ['UNIDADES CERRADAS', 'Reactivos (1u), casos EMG (2u) y configuración escrita (1u) publicados.', C.amber],
  ];
  delivs.forEach((d, i) => {
    const dx = 0.45 + i * 4.2;
    s.addShape(pptx.ShapeType.roundRect, { x: dx, y: 1.35, w: 4.03, h: 2.0, fill: { color: C.card }, line: { color: C.line, pt: 1 }, rectRadius: 0.08 });
    s.addShape(pptx.ShapeType.rect, { x: dx, y: 1.35, w: 4.03, h: 0.09, fill: { color: d[2] } });
    s.addText(d[0], { x: dx + 0.18, y: 1.55, w: 3.67, h: 0.3, fontSize: 12, bold: true, color: d[2], fontFace: 'Consolas' });
    s.addText(d[1], { x: dx + 0.18, y: 1.95, w: 3.67, h: 1.2, fontSize: 13.5, color: C.ink, fontFace: 'Calibri' });
  });

  // Flowchart with arrows
  const flow = [
    ['1. ACTA', 'Publicación', 'Al congelar edición del libro'],
    ['2. OBJECIÓN', '10 días hábiles', 'Por escrito; luego queda firme'],
    ['3. CORTE', 'Estado de cuenta', 'Por cohorte y trimestral (libro)'],
    ['4. AUDITORÍA', '10 días hábiles', 'Entrega de desglose a petición'],
    ['5. PAGO SPEI', '15 días hábiles', 'Con estado cerrado + CFDI válido'],
  ];

  flow.forEach((f, i) => {
    const fx = 0.45 + i * 2.54;
    s.addShape(pptx.ShapeType.roundRect, { x: fx, y: 3.85, w: 2.22, h: 2.9, fill: { color: C.navy }, rectRadius: 0.08 });
    s.addText(f[0], { x: fx + 0.12, y: 4.05, w: 1.98, h: 0.28, fontSize: 10.5, bold: true, color: C.cyan, fontFace: 'Consolas' });
    s.addText(f[1], { x: fx + 0.12, y: 4.45, w: 1.98, h: 0.45, fontSize: 15, bold: true, color: C.white, fontFace: 'Calibri' });
    s.addText(f[2], { x: fx + 0.12, y: 5.05, w: 1.98, h: 1.4, fontSize: 12.5, color: 'CBD5E1', fontFace: 'Calibri' });
    if (i < 4) {
      s.addShape(pptx.ShapeType.rightArrow, {
        x: fx + 2.26, y: 5.15, w: 0.24, h: 0.24, fill: { color: C.cyan },
      });
    }
  });

  notes(s, 'Cláusulas 10 y 11. Requisitos indispensables para dispersar el pago: nombre legal, cédula, RFC, CLABE de 18 dígitos, estado de cuenta cerrado y CFDI emitido por el médico con las retenciones de ley.');
  bar(s);
}

// ─── SLIDE 7: Desglose del Contrato (I): Declaraciones y Cláusulas 1 a 5 ─────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.white } });
  kicker(s, '06 · Guía para Administradores · Segmento 1 de 4');
  title(s, 'Contrato: Declaraciones y Cláusulas 1 a 5');

  const rows = [
    ['Declaraciones I–III', 'Titularidad ElectroDx, cédula/CFDI del médico y unión de los 4 documentos.', 'Completar party.ts antes de publicar; verificar cédula.'],
    ['Cláusula 1 · Objeto', 'Docencia, Obra y Labor editorial por encargo voluntario; sin jornada.', 'Registrar cada encargo y fecha compromiso por escrito.'],
    ['Cláusula 2 · Papeles', 'Profesor, Editor o Ambos. Bolsa cerrada no se paga ni entra al libro.', 'Re-firmar Anexo ANTES de aceptar texto de un Profesor.'],
    ['Cláusula 3 · Independencia', 'Relación civil sin subordinación. Médico emite CFDI; retención de ley.', 'Aplicar retenciones al CFDI, nunca a la colegiatura general.'],
    ['Cláusula 4 · Ingresos', 'Dos bases separadas: Diplomado (menos pasarela) y Libro (menos costos).', 'Llevar contabilidad separada; no descontar ISR de la empresa.'],
    ['Cláusula 5 · Tasas', 'Tasas iguales por cohorte; remanente queda en casa; opción monto fijo.', 'Trato especial (Anexo §7) sale del porcentaje de Plataforma.'],
  ];

  const ch = ['Apartado', 'Regla en el Contrato', 'Control Administrativo'];
  const cw = [2.6, 5.4, 4.43];
  let cx = 0.45;
  s.addShape(pptx.ShapeType.roundRect, { x: 0.45, y: 1.25, w: 12.43, h: 0.45, fill: { color: C.navy }, rectRadius: 0.04 });
  ch.forEach((h, i) => {
    s.addText(h, { x: cx + 0.1, y: 1.28, w: cw[i] - 0.2, h: 0.4, fontSize: 11.5, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle' });
    cx += cw[i];
  });

  rows.forEach((r, idx) => {
    const ry = 1.8 + idx * 0.86;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.45, y: ry, w: 12.43, h: 0.78, fill: { color: idx % 2 === 0 ? C.card : C.cardAlt }, line: { color: C.line, pt: 0.5 }, rectRadius: 0.04,
    });
    let rx = 0.45;
    r.forEach((cell, cIdx) => {
      s.addText(cell, {
        x: rx + 0.1, y: ry + 0.06, w: cw[cIdx] - 0.2, h: 0.66,
        fontSize: 12,
        bold: cIdx === 0,
        color: cIdx === 0 ? C.blue : C.ink,
        fontFace: 'Calibri',
        valign: 'middle',
      });
      rx += cw[cIdx];
    });
  });

  notes(s, 'Desglose operativo de Declaraciones I-III y Cláusulas 1 a 5 de contrato-prestacion-servicios-medicos.md.');
  bar(s);
}

// ─── SLIDE 8: Desglose del Contrato (II): Cláusulas 6 a 11 ───────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.white } });
  kicker(s, '07 · Guía para Administradores · Segmento 2 de 4');
  title(s, 'Contrato: Cláusulas 6 a 11 (Reparto, Acta y Liquidación)');

  const rows = [
    ['Cláusula 6 · Docencia', 'Proporción de sesiones impartidas y validadas sobre sesiones computables.', 'Validar asistencia docente; sesiones propias no inflan bolsa.'],
    ['Cláusula 7 · Obra Diplomado', 'Proporción de palabras en el Acta por cada cohorte que use esa edición.', 'Vincular cada generación con la versión exacta de la edición.'],
    ['Cláusula 8 · Labor Editorial', 'Proporción de unidades editoriales de la generación; no da palabras.', 'Contabilizar reactivos (1u), casos (2u) y config escrita (1u).'],
    ['Cláusula 9 · Libro', '60% autores con palabras en Acta; 40% Plataforma (obra colectiva).', 'Separar ventas del libro; 0 palabras en Acta = $0 en libro.'],
    ['Cláusula 10 · Acta Créditos', 'Se publica al cerrar edición; 10 días hábiles para objetar por escrito.', 'Pasados 10 días queda firme; cambios van a la siguiente edición.'],
    ['Cláusula 11 · Liquidación', 'Corte por cohorte y trimestral en libro. Pago en 15 días hábiles.', 'Entregar desglose en ≤10 días hábiles cuando el médico lo pida.'],
  ];

  const ch = ['Cláusula', 'Regla en el Contrato', 'Control Administrativo'];
  const cw = [2.6, 5.4, 4.43];
  let cx = 0.45;
  s.addShape(pptx.ShapeType.roundRect, { x: 0.45, y: 1.25, w: 12.43, h: 0.45, fill: { color: C.navy }, rectRadius: 0.04 });
  ch.forEach((h, i) => {
    s.addText(h, { x: cx + 0.1, y: 1.28, w: cw[i] - 0.2, h: 0.4, fontSize: 11.5, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle' });
    cx += cw[i];
  });

  rows.forEach((r, idx) => {
    const ry = 1.8 + idx * 0.86;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.45, y: ry, w: 12.43, h: 0.78, fill: { color: idx % 2 === 0 ? C.card : C.cardAlt }, line: { color: C.line, pt: 0.5 }, rectRadius: 0.04,
    });
    let rx = 0.45;
    r.forEach((cell, cIdx) => {
      s.addText(cell, {
        x: rx + 0.1, y: ry + 0.06, w: cw[cIdx] - 0.2, h: 0.66,
        fontSize: 12,
        bold: cIdx === 0,
        color: cIdx === 0 ? C.blue : C.ink,
        fontFace: 'Calibri',
        valign: 'middle',
      });
      rx += cw[cIdx];
    });
  });

  notes(s, 'Desglose operativo de las Cláusulas 6 a 11 de contrato-prestacion-servicios-medicos.md.');
  bar(s);
}

// ─── SLIDE 9: Desglose del Contrato (III): Cláusulas 12 a 16 ─────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.white } });
  kicker(s, '08 · Guía para Administradores · Segmento 3 de 4');
  title(s, 'Contrato: Cláusulas 12 a 16 (Propiedad Intelectual y Datos)');

  const boxes = [
    ['CLÁUSULA 12 · PROPIEDAD DE PLATAFORMA', 'Software, código, BD, marca ElectroDx, alumnos y compilación colectiva son 100% de la Plataforma.', C.navy],
    ['CLÁUSULA 13 · LICENCIA EXCLUSIVA Y CLASES', 'Médico conserva derecho moral. Otorga licencia exclusiva mundial por todo el plazo patrimonial sobre el texto aceptado. Grabaciones: productora es la Plataforma (autoriza imagen y voz).', C.blue],
    ['CLÁUSULA 14 · ORIGINALIDAD Y PACIENTES', 'Texto original o citado. Prohibido incluir nombres, rostros, CURP o datos que identifiquen pacientes.', C.emerald],
    ['CLÁUSULAS 15 Y 16 · ALUMNOS Y RESERVA', 'Uso acotado de datos de alumnos (sin exportar). Reserva sobre tasas y estados de cuenta; permitido citar autoría en CV.', C.amber],
  ];

  boxes.forEach((b, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.45 + col * 6.32;
    const y = 1.35 + row * 2.82;
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: 6.1, h: 2.6, fill: { color: C.card }, line: { color: C.line, pt: 1 }, rectRadius: 0.08 });
    s.addShape(pptx.ShapeType.rect, { x, y, w: 6.1, h: 0.1, fill: { color: b[2] } });
    s.addText(b[0], { x: x + 0.2, y: y + 0.22, w: 5.7, h: 0.3, fontSize: 11.5, bold: true, color: b[2], fontFace: 'Consolas' });
    s.addText(b[1], { x: x + 0.2, y: y + 0.65, w: 5.7, h: 1.75, fontSize: 14, color: C.ink, fontFace: 'Calibri' });
  });

  notes(s, 'Cláusulas 12 a 16. La exclusividad recae sobre la expresión aceptada, no sobre el conocimiento médico: el médico puede seguir dando clases y ejerciendo, pero no publicar ni licenciar a terceros el mismo texto aceptado.');
  bar(s);
}

// ─── SLIDE 10: Desglose del Contrato (IV): Cláusulas 17 a 20 ─────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.white } });
  kicker(s, '09 · Guía para Administradores · Segmento 4 de 4');
  title(s, 'Contrato: Cláusulas 17 a 20 (Salida, Rescisión y Firma)');

  // Left: Clause 18
  s.addShape(pptx.ShapeType.roundRect, { x: 0.45, y: 1.35, w: 6.1, h: 5.55, fill: { color: C.navy }, rectRadius: 0.08 });
  s.addText('CLÁUSULA 18 · VIGENCIA Y SALIDA', { x: 0.7, y: 1.6, w: 5.6, h: 0.3, fontSize: 11.5, bold: true, color: C.cyan, fontFace: 'Consolas' });
  s.addText('Salida voluntaria: aviso de 30 días', { x: 0.7, y: 2.0, w: 5.6, h: 0.35, fontSize: 16, bold: true, color: C.white, fontFace: 'Calibri' });
  s.addText('• Termina encargos nuevos.\n• Mantiene viva la licencia del texto ya aceptado y el derecho de cobro en ediciones activas (Cl. 7 y 9).', {
    x: 0.7, y: 2.45, w: 5.6, h: 1.3, fontSize: 13.5, color: 'CBD5E1', fontFace: 'Calibri',
  });

  s.addShape(pptx.ShapeType.roundRect, { x: 0.7, y: 3.95, w: 5.6, h: 2.7, fill: { color: '2D1225' }, line: { color: C.rose, pt: 1 }, rectRadius: 0.06 });
  s.addText('3 CAUSAS DE RESCISIÓN INMEDIATA', { x: 0.9, y: 4.15, w: 5.2, h: 0.3, fontSize: 11.5, bold: true, color: 'FDA4AF', fontFace: 'Consolas' });
  s.addText('1. Plagio de material ajeno o de otro colaborador.\n2. Revelar datos de alumnos o de pacientes.\n3. No impartir sesión aceptada sin aviso razonable.\n\nSe liquida lo devengado; lo no aceptado no se paga.', {
    x: 0.9, y: 4.55, w: 5.2, h: 1.95, fontSize: 13, color: C.white, fontFace: 'Calibri',
  });

  // Right: Clauses 17, 19, 20
  const right = [
    ['CLÁUSULA 17 · PRIVACIDAD Y ARCO', 'Aviso v1.0. Derechos ARCO: 20 días hábiles respuesta + 15 ejecución (LFPDPPP). Datos fiscales no se cancelan mientras exista obligación de pago o fiscal.', C.blue],
    ['CLÁUSULA 19 · FIRMA ELECTRÓNICA SIMPLE', 'Nombre, trazo, fecha, IP y folio (Arts. 89, 90, 93 y 97 del Código de Comercio). No requiere e.firma.', C.emerald],
    ['CLÁUSULA 20 · LEY Y TRIBUNALES', 'Leyes federales de México y tribunales competentes de [CIUDAD].', C.amber],
  ];

  right.forEach((r, i) => {
    const y = 1.35 + i * 1.9;
    s.addShape(pptx.ShapeType.roundRect, { x: 6.75, y, w: 6.13, h: 1.72, fill: { color: C.card }, line: { color: C.line, pt: 1 }, rectRadius: 0.08 });
    s.addShape(pptx.ShapeType.rect, { x: 6.75, y, w: 6.13, h: 0.09, fill: { color: r[2] } });
    s.addText(r[0], { x: 6.95, y: y + 0.18, w: 5.73, h: 0.28, fontSize: 11, bold: true, color: r[2], fontFace: 'Consolas' });
    s.addText(r[1], { x: 6.95, y: y + 0.52, w: 5.73, h: 1.08, fontSize: 13, color: C.ink, fontFace: 'Calibri' });
  });

  notes(s, 'Cláusulas 17 a 20 y Aviso de Privacidad del Médico v1.0. La firma electrónica simple queda respaldada con trazo base64, IP, timestamp y hash SHA-256 del PDF sellado.');
  bar(s);
}

// ─── SLIDE 11: Reglamento Editorial, Autoría y Derechos de Obra ──────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.white } });
  kicker(s, '10 · Reglamento Editorial y del Libro (Artículos 1–17)');
  title(s, 'Qué genera palabras, qué suma unidades y quién es autor');

  const cols = [
    {
      tag: 'CAP. II · PALABRAS DE OBRA',
      head: 'Sí cuenta vs. No cuenta',
      color: C.emerald,
      body: 'SÍ GENERA PALABRAS (Art. 5):\n• Texto nuevo o reescritura clínica aceptada con bolsa de Obra abierta.\n\nNO GENERA PALABRAS (Art. 6):\n• Ortografía, puntuación o formato.\n• Reordenar módulos o menús.\n• Fechas, enlaces o permisos.\n• Comentarios sin incorporar.',
    },
    {
      tag: 'CAP. III · UNIDADES EDITORIALES',
      head: 'Tabulador Oficial (Art. 10)',
      color: C.amber,
      body: '• Reactivo publicado = 1 unidad\n• Caso clínico EMG = 2 unidades\n• Configuración escrita = 1 unidad\n\nLÍMITES (Art. 11–12):\n• Configurar no da autoría del libro.\n• Si un caso/reactivo se imprime después en el libro, ahí sí genera palabras.',
    },
    {
      tag: 'CAP. I Y II · CRÉDITOS Y ACTA',
      head: 'Autoría y Congelamiento',
      color: C.blue,
      body: '• Manda el Acta, NO el campo last_edited_by de la app (Art. 3).\n• Crédito en tema: tener palabras en el Acta.\n• Autor Principal del tema: >50% de las palabras del tema (Art. 8).\n• Portada del libro: Plataforma.\n• Coautoría: no se duplica el conteo del mismo pasaje (Art. 7).',
    },
  ];

  cols.forEach((c, i) => {
    const x = 0.45 + i * 4.2;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.35, w: 4.03, h: 5.55, fill: { color: C.card }, line: { color: C.line, pt: 1 }, rectRadius: 0.08 });
    s.addShape(pptx.ShapeType.rect, { x, y: 1.35, w: 4.03, h: 0.1, fill: { color: c.color } });
    s.addText(c.tag, { x: x + 0.2, y: 1.6, w: 3.63, h: 0.28, fontSize: 10.5, bold: true, color: c.color, fontFace: 'Consolas' });
    s.addText(c.head, { x: x + 0.2, y: 1.95, w: 3.63, h: 0.4, fontSize: 17, bold: true, color: C.ink, fontFace: 'Calibri' });
    s.addShape(pptx.ShapeType.line, { x: x + 0.2, y: 2.45, w: 3.63, h: 0, line: { color: C.line, pt: 1 } });
    s.addText(c.body, { x: x + 0.2, y: 2.6, w: 3.63, h: 4.1, fontSize: 13, color: C.ink, fontFace: 'Calibri' });
  });

  notes(s, 'Reglamento Editorial y del Libro (Artículos 1 a 17). El Comité Editorial congela la edición, calcula palabras de cada colaborador por tema (evitando contar dos veces un pasaje reescrito por dos médicos) y publica el Acta.');
  bar(s);
}

// ─── SLIDE 12: Flujo Administrativo en el Portal ElectroDX ───────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.white } });
  kicker(s, '11 · Operación en el Portal ElectroDx (Componentes React + API)');
  title(s, 'Ciclo de vida digital del contrato en la plataforma');

  const steps = [
    ['1. PUBLICAR EDICIÓN', 'physicianAgreementEditionService', 'Llenar PhysicianParty (7 campos) + 5 corchetes del Anexo y publicar bundle_version.', C.blue],
    ['2. CANDADO ACTIVO', 'shouldRedirectToPhysicianAgreements', 'Redirige a /acuerdos-medico a todo colaborador sin la versión actual firmada.', C.amber],
    ['3. FIRMA 3 PASOS', 'PhysicianAgreementsPage.tsx', 'Scroll completo obligatorio + Cédula + RFC/CLABE validados + trazo en SignaturePad.', C.emerald],
    ['4. AUDITORÍA PDF', 'AdminPhysicianAgreementsPanel', 'Sella PDF con SHA-256, IP y folios CON / ANX / REG. Descarga en panel admin (3/3).', C.navy],
  ];

  steps.forEach((st, i) => {
    const x = 0.45 + i * 3.16;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.4, w: 2.9, h: 4.35, fill: { color: C.card }, line: { color: C.line, pt: 1 }, rectRadius: 0.08 });
    s.addShape(pptx.ShapeType.rect, { x, y: 1.4, w: 2.9, h: 0.1, fill: { color: st[3] } });
    s.addText(st[0], { x: x + 0.16, y: 1.65, w: 2.58, h: 0.3, fontSize: 11, bold: true, color: st[3], fontFace: 'Consolas' });
    s.addText(st[1], { x: x + 0.16, y: 2.0, w: 2.58, h: 0.35, fontSize: 10, bold: true, color: C.muted, fontFace: 'Consolas' });
    s.addShape(pptx.ShapeType.line, { x: x + 0.16, y: 2.45, w: 2.58, h: 0, line: { color: C.line, pt: 1 } });
    s.addText(st[2], { x: x + 0.16, y: 2.65, w: 2.58, h: 2.8, fontSize: 14, color: C.ink, fontFace: 'Calibri' });
    if (i < 3) {
      s.addShape(pptx.ShapeType.rightArrow, {
        x: x + 2.94, y: 3.4, w: 0.18, h: 0.22, fill: { color: C.blue },
      });
    }
  });

  s.addShape(pptx.ShapeType.roundRect, { x: 0.45, y: 6.0, w: 12.43, h: 0.95, fill: { color: C.navy }, rectRadius: 0.08 });
  s.addText('Validaciones en código: RFC (/^[A-ZÑ&]{3,4}\\d{6}[A-Z0-9]{3}$/i)  ·  CLABE (/^\\d{18}$/)  ·  Verificación RPC: verify_physician_agreement(p_folio)', {
    x: 0.68, y: 6.12, w: 12.0, h: 0.7, fontSize: 12.5, bold: true, color: C.cyan, fontFace: 'Consolas', valign: 'middle',
  });

  notes(s, 'Flujo técnico real en src/content/legal/physicianAgreements.ts, src/components/agreements/PhysicianAgreementsPage.tsx y AdminPhysicianAgreementsPanel.tsx.');
  bar(s);
}

// ─── SLIDE 13: Reglas Anti-Conflicto y Qué Queda Fuera (README.md) ───────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.white } });
  kicker(s, '12 · Claridad Institucional (docs/legal/medicos/README.md)');
  title(s, 'Reglas anti-conflicto y qué queda fuera del contrato');

  // Left: Anti-conflict
  s.addShape(pptx.ShapeType.roundRect, { x: 0.45, y: 1.35, w: 6.1, h: 5.55, fill: { color: C.card }, line: { color: C.line, pt: 1 }, rectRadius: 0.08 });
  s.addShape(pptx.ShapeType.rect, { x: 0.45, y: 1.35, w: 6.1, h: 0.1, fill: { color: C.emerald } });
  s.addText('REGLAS QUE EVITAN CONFLICTOS', { x: 0.7, y: 1.6, w: 5.6, h: 0.3, fontSize: 11.5, bold: true, color: C.emerald, fontFace: 'Consolas' });
  s.addText(
    [
      '• Hora ≠ Palabra: dar clase paga docencia; escribir paga obra y libro.',
      '• Base limpia: retenciones del CFDI no se restan doble a la colegiatura.',
      '• Acta firme: tras 10 días hábiles no se recalcula la edición.',
      '• Trato especial: se paga de la bolsa de la Plataforma (Anexo §7).',
      '• Sin mínimo garantizado, salvo pacto de monto fijo por sesión.',
    ].map((t) => ({ text: t, options: { breakLine: true } })),
    { x: 0.7, y: 2.1, w: 5.6, h: 4.5, fontSize: 14.5, color: C.ink, fontFace: 'Calibri', paraSpaceAfter: 12 }
  );

  // Right: Excluded on purpose
  s.addShape(pptx.ShapeType.roundRect, { x: 6.75, y: 1.35, w: 6.13, h: 5.55, fill: { color: C.navy }, rectRadius: 0.08 });
  s.addText('QUÉ QUEDA FUERA A PROPÓSITO', { x: 7.0, y: 1.6, w: 5.6, h: 0.3, fontSize: 11.5, bold: true, color: C.cyan, fontFace: 'Consolas' });
  s.addText(
    [
      '✕ Comisiones por cupones o referidos (van en anexo comercial aparte).',
      '✕ Repartos fijos 70/30 o 55/25/20 del borrador antiguo (no se firma).',
      '✕ Retiro unilateral de textos ya incluidos en una edición o cohorte.',
      '✕ Exclusividad de consulta médica o cátedras externas.',
      '✕ Derechos sobre el código por configurar menús o fechas.',
    ].map((t) => ({ text: t, options: { breakLine: true } })),
    { x: 7.0, y: 2.1, w: 5.6, h: 4.5, fontSize: 14.5, color: C.white, fontFace: 'Calibri', paraSpaceAfter: 12 }
  );

  notes(s, 'Síntesis de docs/legal/medicos/README.md ("Crítica del borrador", "Reglas que evitan el conflicto" y "Qué queda fuera a propósito").');
  bar(s);
}

// ─── SLIDE 14: Checklist de Cumplimiento y Cierre ────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.white } });
  kicker(s, '13 · Cierre Operativo');
  title(s, 'Checklist de responsabilidades por perfil');

  const cols = [
    [
      'PROFESORES Y EDITORES',
      C.blue,
      '☑ Confirmar Papel y bolsas abiertas en Anexo.\n☑ Registrar RFC, Banco y CLABE (18 dígitos).\n☑ Cero datos de pacientes en casos/texto.\n☑ Revisar Acta en ≤10 días hábiles.\n☑ Emitir CFDI al cierre para cobro en ≤15 días.',
    ],
    [
      'COMITÉ EDITORIAL',
      C.emerald,
      '☑ Asignar encargos por escrito con fecha.\n☑ Verificar bolsa de Obra abierta antes de editar.\n☑ Validar sesiones impartidas y unidades.\n☑ Congelar edición y publicar Acta de Créditos.\n☑ Responder objeciones por escrito.',
    ],
    [
      'ADMINISTRACIÓN',
      C.amber,
      '☑ Completar PhysicianParty y tasas del Anexo.\n☑ Auditar estatus 3/3 en panel de acuerdos.\n☑ Separar ingresos de Diplomado y de Libro.\n☑ Emitir estados de cuenta por corte/trimestre.\n☑ Validar CFDI y dispersar SPEI en ≤15 días.',
    ],
  ];

  cols.forEach((c, i) => {
    const x = 0.45 + i * 4.2;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.35, w: 4.03, h: 5.55, fill: { color: C.navy }, rectRadius: 0.08 });
    s.addShape(pptx.ShapeType.rect, { x, y: 1.35, w: 4.03, h: 0.1, fill: { color: c[1] } });
    s.addText(c[0], { x: x + 0.22, y: 1.65, w: 3.6, h: 0.35, fontSize: 14, bold: true, color: C.cyan, fontFace: 'Consolas' });
    s.addShape(pptx.ShapeType.line, { x: x + 0.22, y: 2.15, w: 3.6, h: 0, line: { color: '334155', pt: 1 } });
    s.addText(c[2], { x: x + 0.22, y: 2.35, w: 3.6, h: 4.3, fontSize: 14, color: C.white, fontFace: 'Calibri', paraSpaceAfter: 10 });
  });

  notes(s, 'Checklist de cierre para operar el ciclo completo entre Profesores/Editores, Comité Editorial y Administración.');
  bar(s);
}

await pptx.writeFile({ fileName: out });
console.log(`wrote ${out} (${slideNum} slides)`);
