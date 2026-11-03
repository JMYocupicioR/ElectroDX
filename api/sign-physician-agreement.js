// server/signPhysicianAgreementHandler.ts
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// src/content/legal/party.ts
var LEGAL_PARTY = {
  legalName: "",
  rfc: "",
  address: "",
  privacyEmail: "",
  academicEmail: "",
  city: ""
};
var PARTY_PLACEHOLDERS = {
  legalName: "[RAZ\xD3N SOCIAL]",
  rfc: "[RFC]",
  address: "[DOMICILIO]",
  privacyEmail: "[CORREO DE PRIVACIDAD]",
  academicEmail: "[CORREO ACAD\xC9MICO]",
  city: "[CIUDAD]"
};
var PARTY_KEYS = Object.keys(PARTY_PLACEHOLDERS);
function partyFromRecord(value) {
  const row = value && typeof value === "object" ? value : {};
  return {
    legalName: typeof row.legalName === "string" ? row.legalName : "",
    rfc: typeof row.rfc === "string" ? row.rfc : "",
    address: typeof row.address === "string" ? row.address : "",
    privacyEmail: typeof row.privacyEmail === "string" ? row.privacyEmail : "",
    academicEmail: typeof row.academicEmail === "string" ? row.academicEmail : "",
    city: typeof row.city === "string" ? row.city : ""
  };
}

// src/content/legal/agreements.ts
var STUDENT_AGREEMENT_BUNDLE_VERSION = "1.0";
var STUDENT_AGREEMENT_META = {
  contrato: {
    title: "Contrato de prestaci\xF3n de servicios educativos",
    stepLabel: "Contrato",
    fileName: "contrato-prestacion-servicios-educativos.md",
    includesPrivacy: true
  },
  reglamento: {
    title: "Reglamento acad\xE9mico",
    stepLabel: "Reglamento",
    fileName: "reglamento-academico.md",
    includesPrivacy: false
  },
  normas: {
    title: "Normas de pr\xE1ctica, bioseguridad y confidencialidad",
    stepLabel: "Normas cl\xEDnicas",
    fileName: "normas-practica-confidencialidad.md",
    includesPrivacy: false
  }
};
function isPartyComplete(party = LEGAL_PARTY) {
  return PARTY_KEYS.every((key) => party[key].trim().length > 0);
}
function fillPartyPlaceholders(markdown, party = LEGAL_PARTY) {
  let filled = markdown;
  for (const key of PARTY_KEYS) {
    filled = filled.split(PARTY_PLACEHOLDERS[key]).join(party[key].trim());
  }
  return filled;
}
function hasUnresolvedPartyPlaceholders(markdown) {
  return PARTY_KEYS.some((key) => markdown.includes(PARTY_PLACEHOLDERS[key]));
}
var CHECKBOX_HEADING = "Texto de la casilla de aceptaci\xF3n";
function parseAgreementMarkdown(type, markdown, fallbackTitle = "") {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  const titleMatch = normalized.match(/^#\s+(.+)$/m);
  const versionMatch = normalized.match(/^Versión\s+(.+)$/m);
  const parts = normalized.split(/^## /m).slice(1);
  const sections = [];
  let checkboxText = "";
  for (const part of parts) {
    const newline = part.indexOf("\n");
    const heading = (newline === -1 ? part : part.slice(0, newline)).trim();
    const body = (newline === -1 ? "" : part.slice(newline + 1)).trim();
    if (heading === CHECKBOX_HEADING) {
      checkboxText = body;
      continue;
    }
    sections.push({ title: heading, content: body });
  }
  const studentTitle = STUDENT_AGREEMENT_META[type]?.title;
  return {
    type,
    title: titleMatch?.[1]?.trim() || studentTitle || fallbackTitle,
    version: versionMatch?.[1]?.trim() || STUDENT_AGREEMENT_BUNDLE_VERSION,
    sections,
    checkboxText
  };
}

// src/content/legal/ceo.ts
var CEO_EMAIL = "jmyocupicior@gmail.com";
function isCeoEmail(email) {
  return email?.trim().toLowerCase() === CEO_EMAIL;
}

// src/content/legal/physicianAgreements.ts
var PHYSICIAN_AGREEMENT_TYPES = ["contrato", "anexo", "reglamento"];
var PHYSICIAN_AGREEMENT_META = {
  contrato: {
    title: "Contrato de prestaci\xF3n de servicios profesionales independientes",
    stepLabel: "Contrato",
    includesPrivacy: true
  },
  anexo: {
    title: "Anexo de participaci\xF3n",
    stepLabel: "Anexo",
    includesPrivacy: false
  },
  reglamento: {
    title: "Reglamento editorial y del libro",
    stepLabel: "Reglamento",
    includesPrivacy: false
  }
};
var PHYSICIAN_SIGN_PLACEHOLDERS = {
  name: "[NOMBRE]",
  license: "[C\xC9DULA]",
  rfc: "[RFC DEL M\xC9DICO]",
  email: "[CORREO]",
  clabe: "[CLABE]",
  bank: "[BANCO]"
};
var REQUIRED_GENERATION_PLACEHOLDERS = [
  "[NOMBRE DE LA GENERACI\xD3N]",
  "[IDENTIFICADOR DE LA EDICI\xD3N]",
  "[TASA DOCENCIA]",
  "[TASA OBRA]",
  "[TASA EDITORIAL]"
];
var ROLE_LINES = {
  profesor: {
    empty: "- [ ] Profesor. Abre docencia. Cierra obra y labor editorial.",
    marked: "- [x] Profesor. Abre docencia. Cierra obra y labor editorial.",
    label: "Profesor"
  },
  editor: {
    empty: "- [ ] Editor. Abre obra y labor editorial. Cierra docencia.",
    marked: "- [x] Editor. Abre obra y labor editorial. Cierra docencia.",
    label: "Editor"
  },
  ambos: {
    empty: "- [ ] Profesor y editor. Abre las tres.",
    marked: "- [x] Profesor y editor. Abre las tres.",
    label: "Profesor y editor"
  }
};
var PHYSICIAN_ROLE_OPTIONS = [
  { id: "profesor", label: ROLE_LINES.profesor.label },
  { id: "editor", label: ROLE_LINES.editor.label },
  { id: "ambos", label: ROLE_LINES.ambos.label }
];
var CHECKBOX_HEADING2 = "Texto de la casilla de aceptaci\xF3n";
function physicianPartyFromRecord(value) {
  const base = partyFromRecord(value);
  const row = value && typeof value === "object" ? value : {};
  return {
    ...base,
    settlementEmail: typeof row.settlementEmail === "string" ? row.settlementEmail : ""
  };
}
function isPhysicianPartyComplete(party) {
  return isPartyComplete(party) && party.settlementEmail.trim().length > 0;
}
function fillPhysicianPartyPlaceholders(markdown, party) {
  const filled = fillPartyPlaceholders(markdown, party);
  return filled.split("[CORREO DE LIQUIDACIONES]").join(party.settlementEmail.trim());
}
function hasUnresolvedPhysicianPartyPlaceholders(markdown) {
  if (hasUnresolvedPartyPlaceholders(markdown)) return true;
  return markdown.includes("[CORREO DE LIQUIDACIONES]");
}
function markPhysicianRole(markdown, role) {
  let filled = markdown;
  for (const option of Object.keys(ROLE_LINES)) {
    filled = filled.split(ROLE_LINES[option].empty).join(
      option === role ? ROLE_LINES[option].marked : ROLE_LINES[option].empty
    );
  }
  return filled;
}
function fillPhysicianSignerFields(markdown, fields) {
  let filled = markdown;
  filled = filled.split(PHYSICIAN_SIGN_PLACEHOLDERS.name).join(fields.fullName.trim());
  filled = filled.split(PHYSICIAN_SIGN_PLACEHOLDERS.license).join(fields.license.trim() || "\u2014");
  filled = filled.split(PHYSICIAN_SIGN_PLACEHOLDERS.rfc).join(fields.rfc.trim());
  filled = filled.split(PHYSICIAN_SIGN_PLACEHOLDERS.email).join(fields.email.trim());
  filled = filled.split(PHYSICIAN_SIGN_PLACEHOLDERS.clabe).join(fields.clabe.trim());
  filled = filled.split(PHYSICIAN_SIGN_PLACEHOLDERS.bank).join(fields.bank.trim());
  return markPhysicianRole(filled, fields.role);
}
function physicianRoleLabel(role) {
  if (!role) return "";
  return ROLE_LINES[role].label;
}
function isPhysicianMarkedRole(value) {
  return value === "profesor" || value === "editor" || value === "ambos";
}
var CLABE_PATTERN = /^\d{18}$/;
var RFC_PATTERN = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;
function validatePhysicianAnnexFields(fields) {
  if (!RFC_PATTERN.test(fields.rfc.trim())) {
    return "Escribe un RFC de 12 o 13 caracteres.";
  }
  if (!CLABE_PATTERN.test(fields.clabe.trim())) {
    return "La CLABE debe tener 18 d\xEDgitos.";
  }
  if (fields.bank.trim().length < 3) {
    return "Escribe el banco de la cuenta.";
  }
  if (!isPhysicianMarkedRole(fields.role)) {
    return "Marca el papel: profesor, editor, o ambos.";
  }
  return null;
}
function mergePhysicianPrivacyNotice(contract, privacyMarkdown) {
  const privacy = parseAgreementMarkdown("aviso", privacyMarkdown, "Aviso de privacidad");
  return {
    ...contract,
    sections: [
      ...contract.sections,
      {
        title: "Aviso de privacidad",
        content: `El M\xE9dico acepta el aviso de privacidad versi\xF3n ${contract.version}, que forma parte de este contrato.`
      },
      ...privacy.sections
    ]
  };
}
function documentsFromPhysicianEdition(edition, signer) {
  const built = {};
  for (const type of PHYSICIAN_AGREEMENT_TYPES) {
    let source = fillPhysicianPartyPlaceholders(edition[type], edition.party);
    if (type === "anexo" && signer) {
      source = fillPhysicianSignerFields(source, signer);
    }
    const parsed = {
      ...parseAgreementMarkdown(type, source, PHYSICIAN_AGREEMENT_META[type].title),
      version: edition.bundleVersion
    };
    built[type] = type === "contrato" ? mergePhysicianPrivacyNotice(
      parsed,
      fillPhysicianPartyPlaceholders(edition.aviso, edition.party)
    ) : parsed;
  }
  return built;
}
function validatePhysicianEditionForPublish(edition) {
  if (!isPhysicianPartyComplete(edition.party)) {
    return "Completa raz\xF3n social, RFC, domicilio, correos, ciudad y correo de liquidaciones.";
  }
  for (const type of PHYSICIAN_AGREEMENT_TYPES) {
    const filled = fillPhysicianPartyPlaceholders(edition[type], edition.party);
    if (hasUnresolvedPhysicianPartyPlaceholders(filled)) {
      return `Qued\xF3 un corchete del prestador sin sustituir en ${PHYSICIAN_AGREEMENT_META[type].stepLabel}.`;
    }
    if (type === "anexo") {
      const missing = REQUIRED_GENERATION_PLACEHOLDERS.filter((token) => filled.includes(token));
      if (missing.length > 0) {
        return `Abre la pesta\xF1a Anexo y, en el texto, cambia ${missing.join(", ")} por el nombre, la edici\xF3n y las tasas de esta generaci\xF3n.`;
      }
    }
    const parsed = parseAgreementMarkdown(type, filled, PHYSICIAN_AGREEMENT_META[type].title);
    if (parsed.sections.length === 0) {
      return `${PHYSICIAN_AGREEMENT_META[type].stepLabel} no tiene secciones. Usa t\xEDtulos ##.`;
    }
    if (!parsed.checkboxText.trim()) {
      return `${PHYSICIAN_AGREEMENT_META[type].stepLabel} necesita la secci\xF3n "${CHECKBOX_HEADING2}".`;
    }
  }
  const aviso = fillPhysicianPartyPlaceholders(edition.aviso, edition.party);
  if (!aviso.trim()) return "Falta el aviso de privacidad.";
  if (hasUnresolvedPhysicianPartyPlaceholders(aviso)) {
    return "Qued\xF3 un corchete sin sustituir en el aviso de privacidad.";
  }
  return null;
}
function physicianFolioPrefix(type) {
  if (type === "contrato") return "CON";
  if (type === "anexo") return "ANX";
  return "REG";
}

// server/stampStudentAgreement.ts
import { createHash } from "node:crypto";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

// src/content/legal/agreementBody.ts
function isHeading(line) {
  return /^#{2,4}\s+\S/.test(line.trim());
}
function isListItem(line) {
  return /^[-*]\s+\S/.test(line.trim());
}
function isTableRow(line) {
  return line.trim().startsWith("|");
}
function stripCheckbox(text) {
  return text.replace(/\[( |x|X)\]\s*/g, "").trim();
}
function stripBold(text) {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1");
}
function parseTable(lines) {
  const cells = lines.map(
    (line) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => stripBold(stripCheckbox(cell)))
  ).filter((row) => !row.every((cell) => /^:?-+:?$/.test(cell.replace(/\s/g, ""))));
  if (cells.length === 0) return null;
  const [headers, ...rows] = cells;
  return { type: "table", headers, rows };
}
function parseAgreementBody(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let index = 0;
  while (index < lines.length) {
    const raw = lines[index];
    const line = raw.trim();
    if (!line) {
      index += 1;
      continue;
    }
    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length >= 4 ? 4 : 3;
      blocks.push({ type: "heading", level, text: stripBold(stripCheckbox(heading[2])) });
      index += 1;
      continue;
    }
    if (isTableRow(line)) {
      const tableLines = [];
      while (index < lines.length && isTableRow(lines[index])) {
        tableLines.push(lines[index]);
        index += 1;
      }
      const table = parseTable(tableLines);
      if (table) blocks.push(table);
      continue;
    }
    if (isListItem(line)) {
      const items = [];
      while (index < lines.length && isListItem(lines[index])) {
        items.push(stripCheckbox(lines[index].trim().replace(/^[-*]\s+/, "")));
        index += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }
    const paragraph = [];
    while (index < lines.length && lines[index].trim() && !isHeading(lines[index]) && !isListItem(lines[index]) && !isTableRow(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", text: stripCheckbox(paragraph.join(" ")) });
  }
  return blocks;
}

// server/stampStudentAgreement.ts
function toWinAnsi(text) {
  return text.replace(/[—–−]/g, "-").replace(/[“”«»]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, "...").replace(/×/g, "x").replace(/[^\u0009\u000A\u000D\u0020-\u007E\u00A0-\u00FF]/g, " ");
}
function wrapText(text, font, size, maxWidth) {
  const paragraphs = toWinAnsi(text).replace(/\r\n/g, "\n").split("\n");
  const lines = [];
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        current = next;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}
function plainInline(text) {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:]|$)/g, "$1$2").replace(/`([^`]+)`/g, "$1").trim();
}
function wrapFitted(text, font, size, maxWidth) {
  const lines = wrapText(plainInline(text), font, size, Math.max(8, maxWidth));
  const fitted = [];
  for (const line of lines) {
    if (!line || font.widthOfTextAtSize(line, size) <= maxWidth) {
      fitted.push(line);
      continue;
    }
    let chunk = "";
    for (const char of line) {
      const next = chunk + char;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) chunk = next;
      else {
        if (chunk) fitted.push(chunk);
        chunk = char;
      }
    }
    if (chunk) fitted.push(chunk);
  }
  return fitted.length ? fitted : [""];
}
function columnWidths(headers, rows, total, font) {
  const weights = headers.map((header, index) => {
    const cells = [header, ...rows.map((row) => row[index] ?? "")];
    return cells.reduce((max, cell) => {
      const width = font.widthOfTextAtSize(toWinAnsi(plainInline(cell) || " "), 8) + 12;
      return Math.max(max, Math.min(width, 240));
    }, 36);
  });
  const sum = weights.reduce((totalWidth, width) => totalWidth + width, 0) || 1;
  const scaled = weights.map((width) => width / sum * total);
  const used = scaled.reduce((totalWidth, width) => totalWidth + width, 0);
  if (used !== total && scaled.length > 0) scaled[scaled.length - 1] += total - used;
  return scaled;
}
function drawLines(page, lines, opts) {
  let y = opts.y;
  for (const line of lines) {
    if (line) {
      page.drawText(line, {
        x: opts.x,
        y,
        size: opts.size,
        font: opts.font,
        color: opts.color
      });
    }
    y -= opts.gap;
  }
  return y;
}
async function stampStudentAgreement(input) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 50;
  const maxWidth = pageWidth - margin * 2;
  const ink = rgb(0.07, 0.09, 0.15);
  const muted = rgb(0.32, 0.36, 0.42);
  const addPage = () => {
    const page2 = pdf.addPage([pageWidth, pageHeight]);
    return { page: page2, y: pageHeight - 56 };
  };
  let { page, y } = addPage();
  const ensureSpace = (needed) => {
    if (y - needed < 60) {
      const next = addPage();
      page = next.page;
      y = next.y;
    }
  };
  page.drawText("ElectroDx Diplomado", {
    x: margin,
    y,
    size: 9,
    font: bold,
    color: rgb(0.15, 0.35, 0.72)
  });
  y -= 18;
  const titleLines = wrapText(input.agreement.title, bold, 14, maxWidth);
  y = drawLines(page, titleLines, { x: margin, y, font: bold, size: 14, color: ink, gap: 18 });
  y -= 4;
  page.drawText(`Versi\xF3n ${input.agreement.version}`, {
    x: margin,
    y,
    size: 9,
    font,
    color: muted
  });
  y -= 22;
  const grid = rgb(0.73, 0.77, 0.84);
  const headerBg = rgb(0.91, 0.94, 0.98);
  const cellSize = 8;
  const cellGap = 10;
  const cellPadX = 5;
  const cellPadY = 4;
  const drawParagraph = (text, indent = 0) => {
    const lines = wrapFitted(text, font, 9, maxWidth - indent);
    for (const line of lines) {
      ensureSpace(14);
      if (line) page.drawText(line, { x: margin + indent, y, size: 9, font, color: muted });
      y -= 12;
    }
  };
  const drawTable = (headers, rows) => {
    const colCount = Math.max(headers.length, ...rows.map((row) => row.length), 1);
    const head = Array.from({ length: colCount }, (_, index) => headers[index] ?? "");
    const body = rows.map((row) => Array.from({ length: colCount }, (_, index) => row[index] ?? ""));
    const widths = columnWidths(head, body, maxWidth, bold);
    y -= 6;
    ensureSpace(56);
    const paintRow = (cells, isHeader) => {
      const rowFont = isHeader ? bold : font;
      const columns = cells.map(
        (cell, index) => wrapFitted(cell, rowFont, cellSize, Math.max(8, widths[index] - cellPadX * 2))
      );
      const lineCount = Math.max(1, ...columns.map((lines) => lines.length));
      const height = cellPadY * 2 + lineCount * cellGap;
      const fitsFreshPage = height < pageHeight - 140;
      if (y - height < 60 && fitsFreshPage) {
        const next = addPage();
        page = next.page;
        y = next.y;
        if (!isHeader) paintRow(head, true);
      }
      let x = margin;
      columns.forEach((lines, index) => {
        const width = widths[index];
        page.drawRectangle({
          x,
          y: y - height,
          width,
          height,
          color: isHeader ? headerBg : rgb(1, 1, 1),
          borderColor: grid,
          borderWidth: 0.6
        });
        let textY = y - cellPadY - cellSize;
        for (const line of lines) {
          if (line) {
            page.drawText(line, {
              x: x + cellPadX,
              y: textY,
              size: cellSize,
              font: rowFont,
              color: ink
            });
          }
          textY -= cellGap;
        }
        x += width;
      });
      y -= height;
    };
    paintRow(head, true);
    for (const row of body) paintRow(row, false);
    y -= 8;
  };
  const drawBlocks = (blocks) => {
    for (const block of blocks) {
      if (block.type === "heading") {
        const size = block.level >= 4 ? 9.5 : 10;
        ensureSpace(26);
        y -= 6;
        const lines = wrapFitted(block.text, bold, size, maxWidth);
        y = drawLines(page, lines, { x: margin, y, font: bold, size, color: ink, gap: size + 3 });
        y -= 2;
        continue;
      }
      if (block.type === "list") {
        for (const item of block.items) {
          const marker = "\xB7 ";
          const markerWidth = font.widthOfTextAtSize(marker, 9);
          const lines = wrapFitted(item, font, 9, maxWidth - 16 - markerWidth);
          lines.forEach((line, index) => {
            ensureSpace(14);
            if (index === 0) {
              page.drawText(marker, { x: margin + 12, y, size: 9, font, color: ink });
            }
            if (line) {
              page.drawText(line, { x: margin + 12 + markerWidth, y, size: 9, font, color: muted });
            }
            y -= 12;
          });
        }
        y -= 4;
        continue;
      }
      if (block.type === "table") {
        drawTable(block.headers, block.rows);
        continue;
      }
      drawParagraph(block.text);
      y -= 4;
    }
  };
  for (const section of input.agreement.sections) {
    ensureSpace(48);
    const heading = wrapText(section.title, bold, 11, maxWidth);
    y = drawLines(page, heading, { x: margin, y, font: bold, size: 11, color: ink, gap: 14 });
    y -= 4;
    drawBlocks(parseAgreementBody(section.content));
    y -= 6;
  }
  const signatureImage = await pdf.embedPng(input.signaturePng);
  const verifyPath = input.verificationPath || "/verificar-acuerdo";
  const verificationUrl = `${input.appBaseUrl.replace(/\/$/, "")}${verifyPath}?folio=${encodeURIComponent(input.verificationFolio)}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 160 });
  const qrImage = await pdf.embedPng(Buffer.from(qrDataUrl.replace(/^data:image\/\w+;base64,/, ""), "base64"));
  ensureSpace(250);
  const boxX = 45;
  const boxY = Math.max(48, y - 230);
  const boxW = pageWidth - boxX * 2;
  const boxH = 220;
  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxW,
    height: boxH,
    borderColor: rgb(0.15, 0.35, 0.72),
    borderWidth: 1.2,
    color: rgb(0.97, 0.98, 1)
  });
  page.drawRectangle({
    x: boxX,
    y: boxY + boxH - 24,
    width: boxW,
    height: 24,
    color: rgb(0.15, 0.35, 0.72)
  });
  page.drawText("CONSTANCIA DE ACEPTACI\xD3N \u2014 FIRMA ELECTR\xD3NICA SIMPLE", {
    x: boxX + 10,
    y: boxY + boxH - 16,
    size: 8,
    font: bold,
    color: rgb(1, 1, 1)
  });
  const sigW = 210;
  const sigH = 70;
  const scale = Math.min(sigW / signatureImage.width, sigH / signatureImage.height);
  page.drawImage(signatureImage, {
    x: boxX + 16,
    y: boxY + 88,
    width: signatureImage.width * scale,
    height: signatureImage.height * scale
  });
  page.drawLine({
    start: { x: boxX + 16, y: boxY + 82 },
    end: { x: boxX + 230, y: boxY + 82 },
    thickness: 0.7,
    color: rgb(0.4, 0.4, 0.45)
  });
  page.drawText(toWinAnsi(input.signerName.toUpperCase()), {
    x: boxX + 16,
    y: boxY + 68,
    size: 9,
    font: bold,
    color: ink
  });
  if (input.professionalLicense) {
    page.drawText(toWinAnsi(`Cedula: ${input.professionalLicense}`), {
      x: boxX + 16,
      y: boxY + 56,
      size: 8,
      font,
      color: muted
    });
  }
  const extraLines = (input.extraSignerLines ?? []).filter((line) => line.trim());
  let extraY = input.professionalLicense ? boxY + 46 : boxY + 56;
  for (const line of extraLines.slice(0, 3)) {
    extraY -= 8;
    page.drawText(toWinAnsi(line), {
      x: boxX + 16,
      y: extraY,
      size: 7,
      font,
      color: muted
    });
  }
  const disclaimer = "El firmante acepta este instrumento con una firma electr\xF3nica simple. Produce efectos entre las partes conforme a los art\xEDculos 89, 90, 93 y 97 del C\xF3digo de Comercio. No es la e.firma ni una firma electr\xF3nica avanzada.";
  let discY = extraLines.length ? extraY - 10 : input.professionalLicense ? boxY + 42 : boxY + 54;
  for (const line of wrapText(disclaimer, italic, 6, 230)) {
    page.drawText(line, { x: boxX + 16, y: discY, size: 6, font: italic, color: muted });
    discY -= 8;
  }
  const qrSize = 58;
  page.drawImage(qrImage, {
    x: boxX + boxW - qrSize - 14,
    y: boxY + boxH - 26 - qrSize - 10,
    width: qrSize,
    height: qrSize
  });
  const signedAt = new Date(input.signedAtIso);
  const cdmx = signedAt.toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  const meta = [
    ["Folio", input.verificationFolio],
    ["Fecha CDMX", `${cdmx} hrs`],
    ["UTC", signedAt.toISOString()],
    ["IP", input.ipAddress],
    ["Estado", "Aceptado"],
    [
      "Navegador",
      input.userAgent.length > 42 ? `${input.userAgent.slice(0, 40)}\u2026` : input.userAgent
    ]
  ];
  let metaY = boxY + boxH - 42;
  for (const [label, value] of meta) {
    page.drawText(toWinAnsi(label), { x: boxX + 250, y: metaY, size: 7, font: bold, color: ink });
    page.drawText(toWinAnsi(value), { x: boxX + 318, y: metaY, size: 7, font, color: muted });
    metaY -= 12;
  }
  const pdfBytes = await pdf.save();
  const stamped = Buffer.from(pdfBytes);
  return {
    pdf: stamped,
    sha256: createHash("sha256").update(stamped).digest("hex")
  };
}

// server/signPhysicianAgreementHandler.ts
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};
var JSON_HEADERS = {
  ...CORS,
  "Content-Type": "application/json; charset=utf-8"
};
var MIN_SIGNATURE_BYTES = 100;
var DOWNLOAD_TTL_SECONDS = 60 * 30;
function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
function isPhysicianType(value) {
  return PHYSICIAN_AGREEMENT_TYPES.includes(value);
}
function clientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-real-ip") || "0.0.0.0";
}
function appBaseUrl(req) {
  const configured = process.env.PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:5173";
  const proto = host.includes("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}
function adminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Falta configurar SUPABASE_SERVICE_ROLE_KEY o SUPABASE_URL en las variables de entorno del servidor (Vercel)."
    );
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
async function userFromRequest(req) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { error: "Sesi\xF3n no v\xE1lida. Inicia sesi\xF3n de nuevo." };
  const supabase = adminClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { error: "Sesi\xF3n no v\xE1lida o expirada." };
  return { supabase, user: data.user };
}
async function loadRoles(supabase, userId) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((row) => row.role);
  return {
    roles,
    isStaff: roles.includes("admin") || roles.includes("editor"),
    isCollaborator: roles.includes("admin") || roles.includes("editor") || roles.includes("contributor")
  };
}
function decodePng(signatureBase64) {
  if (!signatureBase64.includes("data:image/")) return null;
  const raw = signatureBase64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(raw, "base64");
  if (buffer.length < MIN_SIGNATURE_BYTES) return null;
  return buffer;
}
async function loadPublishedEdition(supabase) {
  const { data, error } = await supabase.from("physician_agreement_editions").select("*").eq("status", "published").maybeSingle();
  if (error || !data) return null;
  return {
    bundleVersion: data.bundle_version,
    party: physicianPartyFromRecord(data.party),
    contrato: data.contrato_markdown,
    anexo: data.anexo_markdown,
    reglamento: data.reglamento_markdown,
    aviso: data.aviso_markdown
  };
}
async function handleSign(req, body) {
  const auth = await userFromRequest(req);
  if ("error" in auth) return json(401, { success: false, error: auth.error });
  const { supabase, user } = auth;
  if (isCeoEmail(user.email)) {
    return json(403, { success: false, error: "La cuenta de Direcci\xF3n no firma este expediente." });
  }
  const { isCollaborator } = await loadRoles(supabase, user.id);
  if (!isCollaborator) {
    return json(403, {
      success: false,
      error: "Solo un colaborador, editor o administrador firma estos instrumentos."
    });
  }
  if (!isPhysicianType(body.documentType)) {
    return json(400, { success: false, error: "Tipo de documento no v\xE1lido." });
  }
  const name = body.fullNameTyped?.trim() ?? "";
  if (name.length < 3) {
    return json(400, { success: false, error: "Escribe tu nombre legal completo." });
  }
  const signature = body.signatureBase64 ? decodePng(body.signatureBase64) : null;
  if (!signature) {
    return json(400, { success: false, error: "La firma manuscrita es obligatoria." });
  }
  const edition = await loadPublishedEdition(supabase);
  if (!edition || validatePhysicianEditionForPublish(edition)) {
    return json(503, { success: false, error: "El contrato institucional a\xFAn no est\xE1 publicado." });
  }
  let signer;
  let markedRole = null;
  if (body.documentType === "anexo") {
    markedRole = isPhysicianMarkedRole(body.markedRole) ? body.markedRole : null;
    const annexError = validatePhysicianAnnexFields({
      rfc: body.rfc ?? "",
      clabe: body.clabe ?? "",
      bank: body.bank ?? "",
      role: markedRole ?? "profesor"
    });
    if (!markedRole || annexError) {
      return json(400, { success: false, error: annexError || "Completa RFC, CLABE, banco y papel." });
    }
    signer = {
      fullName: name,
      license: body.professionalLicense?.trim() || "",
      email: user.email ?? "",
      rfc: body.rfc.trim(),
      clabe: body.clabe.trim(),
      bank: body.bank.trim(),
      role: markedRole
    };
  }
  const agreement = documentsFromPhysicianEdition(edition, signer)[body.documentType];
  const filledCheck = agreement.sections.map((section) => section.content).join("\n");
  if (hasUnresolvedPartyPlaceholders(filledCheck) || hasUnresolvedPhysicianPartyPlaceholders(agreement.title) || hasUnresolvedPhysicianPartyPlaceholders(filledCheck)) {
    return json(503, { success: false, error: "El contrato institucional a\xFAn no est\xE1 publicado." });
  }
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const folio = `MED-${physicianFolioPrefix(body.documentType)}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const extraSignerLines = body.documentType === "anexo" && signer ? [
    `RFC: ${signer.rfc}`,
    `Banco: ${signer.bank}`,
    `Papel: ${physicianRoleLabel(signer.role)}`
  ] : [];
  const { pdf, sha256 } = await stampStudentAgreement({
    agreement,
    signaturePng: signature,
    signerName: name,
    professionalLicense: body.professionalLicense?.trim() || null,
    extraSignerLines,
    signedAtIso: nowIso,
    ipAddress: clientIp(req),
    userAgent: req.headers.get("user-agent") || "Navegador",
    verificationFolio: folio,
    appBaseUrl: appBaseUrl(req),
    verificationPath: "/verificar-acuerdo-medico"
  });
  const signaturePath = `${user.id}/physician/signatures/${body.documentType}_${Date.now()}.png`;
  const pdfPath = `${user.id}/physician/agreements/${body.documentType}_v${edition.bundleVersion}.pdf`;
  const { error: pdfErr } = await supabase.storage.from("student-dossiers").upload(pdfPath, pdf, {
    contentType: "application/pdf",
    upsert: true
  });
  if (pdfErr) {
    return json(500, { success: false, error: "No se pudo archivar el PDF firmado." });
  }
  await supabase.storage.from("student-dossiers").upload(signaturePath, signature, {
    contentType: "image/png",
    upsert: true
  });
  const { error: dbError } = await supabase.from("physician_agreements").upsert(
    {
      user_id: user.id,
      document_type: body.documentType,
      document_version: edition.bundleVersion,
      document_sha256: sha256,
      full_name_typed: name,
      professional_license: body.professionalLicense?.trim() || null,
      rfc: signer?.rfc ?? null,
      clabe: signer?.clabe ?? null,
      bank: signer?.bank ?? null,
      marked_role: markedRole,
      signature_image_path: signaturePath,
      pdf_signed_path: pdfPath,
      verification_folio: folio,
      ip_address: clientIp(req),
      user_agent: req.headers.get("user-agent") || "Navegador",
      signed_at: nowIso
    },
    { onConflict: "user_id,document_type,document_version" }
  );
  if (dbError) {
    return json(500, { success: false, error: dbError.message });
  }
  const { data: allRows } = await supabase.from("physician_agreements").select("document_type").eq("user_id", user.id).eq("document_version", edition.bundleVersion);
  const signedTypes = (allRows ?? []).map((row) => row.document_type);
  const hasCompletedAll = PHYSICIAN_AGREEMENT_TYPES.every((type) => signedTypes.includes(type));
  if (hasCompletedAll) {
    await supabase.from("profiles").update({
      physician_agreements_signed: true,
      physician_agreement_bundle_version: edition.bundleVersion
    }).eq("id", user.id);
  }
  return json(200, {
    success: true,
    folio,
    hasCompletedAll,
    sha256
  });
}
async function handleDownload(req, body) {
  const auth = await userFromRequest(req);
  if ("error" in auth) return json(401, { success: false, error: auth.error });
  const { supabase, user } = auth;
  const { isStaff } = await loadRoles(supabase, user.id);
  if (!isPhysicianType(body.documentType)) {
    return json(400, { success: false, error: "Tipo de documento no v\xE1lido." });
  }
  const targetId = body.physicianId && body.physicianId !== user.id ? body.physicianId : user.id;
  if (targetId !== user.id && !isStaff) {
    return json(403, { success: false, error: "No autorizado para este expediente." });
  }
  const { data: agreement, error: agreementError } = await supabase.from("physician_agreements").select("pdf_signed_path, full_name_typed").eq("user_id", targetId).eq("document_type", body.documentType).order("signed_at", { ascending: false }).limit(1).maybeSingle();
  if (agreementError) {
    return json(500, { success: false, error: "No se pudo leer el expediente firmado." });
  }
  if (!agreement?.pdf_signed_path) {
    return json(404, { success: false, error: "El documento firmado a\xFAn no est\xE1 disponible." });
  }
  const safeName = agreement.full_name_typed.replace(/\s+/g, "_");
  const fileName = `${body.documentType}_medico_firmado_${safeName}.pdf`;
  const { data, error } = await supabase.storage.from("student-dossiers").createSignedUrl(agreement.pdf_signed_path, DOWNLOAD_TTL_SECONDS, { download: fileName });
  if (error || !data?.signedUrl) {
    return json(500, { success: false, error: "No se pudo generar el enlace de descarga." });
  }
  return json(200, { success: true, downloadUrl: data.signedUrl, fileName });
}
async function handleSignPhysicianAgreementRequest(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (req.method !== "POST") {
    return json(405, { success: false, error: "M\xE9todo no permitido." });
  }
  let body = {};
  try {
    body = await req.json();
  } catch {
    return json(400, { success: false, error: "Cuerpo JSON no v\xE1lido." });
  }
  try {
    if (body.action === "download") return await handleDownload(req, body);
    return await handleSign(req, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al procesar el acuerdo.";
    return json(500, { success: false, error: message });
  }
}

// server/nodeWebHandler.ts
function headerValue(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ");
  return void 0;
}
async function readBody(req) {
  const method = (req.method || "GET").toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return void 0;
  if (typeof req.body === "string") return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString("utf8");
  if (req.body != null && typeof req.body === "object") return JSON.stringify(req.body);
  if (typeof req[Symbol.asyncIterator] !== "function") return void 0;
  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    if (chunks.length === 0) return void 0;
    return Buffer.concat(chunks).toString("utf8");
  } catch {
    return void 0;
  }
}
async function invokeWebHandler(req, res, handle) {
  try {
    const method = (req.method || "GET").toUpperCase();
    const host = headerValue(req.headers["x-forwarded-host"]) || headerValue(req.headers.host) || "localhost";
    const proto = headerValue(req.headers["x-forwarded-proto"]) || (host.includes("localhost") ? "http" : "https");
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers || {})) {
      const normalized = headerValue(value);
      if (normalized) {
        try {
          headers.set(key, normalized);
        } catch {
        }
      }
    }
    headers.delete("content-length");
    headers.delete("transfer-encoding");
    const body = await readBody(req);
    const request = new Request(new URL(req.url || "/", `${proto}://${host}`), {
      method,
      headers,
      body: method === "GET" || method === "HEAD" ? void 0 : body
    });
    const response = await handle(request);
    if (typeof res.status === "function") res.status(response.status);
    else res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      try {
        res.setHeader(key, value);
      } catch {
      }
    });
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (err) {
    console.error("[nodeWebHandler] Error no controlado en funci\xF3n de acuerdos:", err);
    const message = err instanceof Error ? err.message : "Error interno al procesar el acuerdo.";
    if (typeof res.status === "function") res.status(500);
    else res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.end(JSON.stringify({ success: false, error: message }));
  }
}

// server/apiSignPhysicianAgreement.ts
var config = {
  maxDuration: 20
};
async function handler(req, res) {
  try {
    return await invokeWebHandler(req, res, handleSignPhysicianAgreementRequest);
  } catch (err) {
    console.error("[api/sign-physician-agreement] Unhandled error:", err);
    const message = err instanceof Error ? err.message : "Error interno al procesar el acuerdo.";
    if (typeof res.status === "function") res.status(500);
    else res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.end(JSON.stringify({ success: false, error: message }));
  }
}
export {
  config,
  handler as default
};
