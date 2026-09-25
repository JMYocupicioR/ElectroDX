import {
  AlignmentType,
  convertMillimetersToTwip,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type FileChild,
} from 'docx';
import { formatReference, type TextbookLesson, type TextbookModel } from './buildTextbookModel';
import { contributorRoleLabel, type TextbookContributor } from './textbookCredits';
import { parseLessonBlocks, splitInlineMarks } from './parseLessonBlocks';
import { textbookFont, textbookPageHeightMm, textbookPageWidthMm, type TextbookTheme } from './textbookTheme';
import { fetchImageAsDataUrl } from './inlineBookImages';

function slug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'libro-temario';
}

function runs(text: string, font: string, sizePt: number, extra?: { bold?: boolean; italics?: boolean }): TextRun[] {
  return splitInlineMarks(text).map(
    (part) =>
      new TextRun({
        text: part.text,
        bold: extra?.bold || part.bold,
        italics: extra?.italics,
        font,
        size: Math.round(sizePt * 2),
      })
  );
}

function para(text: string, font: string, sizePt: number, spacingAfter: number, extra?: { bold?: boolean; italics?: boolean }): Paragraph {
  return new Paragraph({
    spacing: { after: spacingAfter },
    children: runs(text, font, sizePt, extra),
  });
}

function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel], font: string, sizePt: number, spacingAfter: number): Paragraph {
  return new Paragraph({
    heading: level,
    spacing: { after: spacingAfter, before: 160 },
    children: [new TextRun({ text, bold: true, font, size: Math.round(sizePt * 2) })],
  });
}

function dataUrlToImage(dataUrl: string): { type: 'png' | 'jpg'; data: Uint8Array } | null {
  const match = dataUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/i);
  if (!match) return null;
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return { type: match[1].toLowerCase() === 'png' ? 'png' : 'jpg', data: bytes };
}

async function lessonImageParagraphs(lesson: TextbookLesson, font: string, bodyPt: number): Promise<Paragraph[]> {
  const out: Paragraph[] = [];
  for (const image of lesson.images) {
    try {
      const dataUrl = await fetchImageAsDataUrl(image.src);
      const parsed = dataUrlToImage(dataUrl);
      if (!parsed) throw new Error('formato');
      out.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new ImageRun({
              type: parsed.type,
              data: parsed.data,
              transformation: { width: 480, height: 320 },
              altText: { title: image.alt, description: image.caption || image.alt, name: image.alt },
            }),
          ],
        })
      );
      if (image.caption || image.alt) {
        out.push(para(image.caption || image.alt, font, bodyPt - 1, 160, { italics: true }));
      }
    } catch {
      out.push(para(`${image.alt}${image.caption ? ` — ${image.caption}` : ''} (${image.src})`, font, bodyPt - 1, 160, { italics: true }));
    }
  }
  return out;
}

function contentParagraphs(text: string, font: string, bodyPt: number, gap: number): FileChild[] {
  const children: FileChild[] = [];
  for (const block of parseLessonBlocks(text)) {
    if (block.kind === 'heading') {
      children.push(heading(block.text, HeadingLevel.HEADING_3, font, bodyPt + 1, gap));
      continue;
    }
    if (block.kind === 'paragraph') {
      children.push(para(block.text, font, bodyPt, gap));
      continue;
    }
    if (block.kind === 'bullet' || block.kind === 'ordered') {
      block.items.forEach((item, index) => {
        children.push(
          new Paragraph({
            spacing: { after: Math.round(gap / 2) },
            children: [
              new TextRun({
                text: `${block.kind === 'ordered' ? `${index + 1}. ` : '• '}`,
                font,
                size: Math.round(bodyPt * 2),
              }),
              ...runs(item, font, bodyPt),
            ],
          })
        );
      });
      continue;
    }
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: block.rows.map(
          (row) =>
            new TableRow({
              children: row.map(
                (cell) =>
                  new TableCell({
                    children: [para(cell, font, bodyPt - 0.5, 40)],
                  })
              ),
            })
        ),
      })
    );
  }
  return children;
}

function creditLine(people: TextbookContributor[], kicker: string, lang: TextbookModel['lang']): string {
  return `${kicker}: ${people.map((person) => `${person.label} (${contributorRoleLabel(person.role, lang)})`).join('; ')}`;
}

export async function buildTextbookDocx(model: TextbookModel, theme: TextbookTheme): Promise<Blob> {
  const font = textbookFont(theme.fontId).word;
  const gap = Math.round(theme.paragraphGapEm * 240);
  const children: FileChild[] = [];
  const es = model.lang !== 'en';

  children.push(para(model.cover.institution, font, theme.bodyPt, 80, { bold: true }));
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
      children: [new TextRun({ text: model.cover.title, bold: true, font, size: Math.round(theme.coverTitlePt * 2) })],
    })
  );
  if (model.cover.subtitle) children.push(para(model.cover.subtitle, font, theme.subtitlePt, 200));
  for (const author of model.authors) children.push(para(author, font, theme.bodyPt, 80));
  if (model.editorialAuthors.length) {
    children.push(para(es ? 'Edición y revisión' : 'Editorial contributors', font, theme.bodyPt, 80, { bold: true }));
    for (const person of model.editorialAuthors) {
      children.push(para(`${person.label} · ${contributorRoleLabel(person.role, model.lang)}`, font, theme.bodyPt, 60));
    }
  }
  children.push(para(`${es ? 'Generado' : 'Generated'} · ${model.generatedAtLabel}`, font, theme.bodyPt - 1, 200, { italics: true }));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  children.push(heading(es ? 'Índice' : 'Contents', HeadingLevel.HEADING_1, font, theme.chapterTitlePt, gap));
  for (const chapter of model.chapters) {
    children.push(para(`${String(chapter.number).padStart(2, '0')}. ${chapter.title}`, font, theme.bodyPt, 80));
  }
  children.push(new Paragraph({ children: [new PageBreak()] }));

  for (const chapter of model.chapters) {
    children.push(heading(`${es ? 'Módulo' : 'Module'} ${String(chapter.number).padStart(2, '0')}`, HeadingLevel.HEADING_1, font, theme.chapterTitlePt, 80));
    children.push(heading(chapter.title, HeadingLevel.HEADING_1, font, theme.chapterTitlePt, gap));
    if (chapter.contributors.length) {
      children.push(para(creditLine(chapter.contributors, es ? 'Edición del capítulo' : 'Chapter editors', model.lang), font, theme.bodyPt - 1, 80, { italics: true }));
    }
    if (chapter.description) children.push(para(chapter.description, font, theme.subtitlePt, gap, { italics: true }));

    for (const lesson of chapter.lessons) {
      children.push(heading(lesson.title, HeadingLevel.HEADING_2, font, theme.lessonTitlePt, 80));
      if (lesson.editedAtLabel) {
        children.push(para(`${es ? 'Última revisión editorial' : 'Last editorial revision'} · ${lesson.editedAtLabel}`, font, theme.bodyPt - 1, 40, { italics: true }));
      }
      if (lesson.contributors.length) {
        children.push(para(creditLine(lesson.contributors, es ? 'Edición de este tema' : 'Lesson editors', model.lang), font, theme.bodyPt - 1, 60, { italics: true }));
      }
      if (lesson.description) children.push(para(lesson.description, font, theme.subtitlePt, gap, { italics: true }));
      if (lesson.content) children.push(...contentParagraphs(lesson.content, font, theme.bodyPt, gap));
      if (lesson.clinicalPearls.length) {
        children.push(para(es ? 'Perlas clínicas' : 'Clinical pearls', font, theme.bodyPt, 40, { bold: true }));
        lesson.clinicalPearls.forEach((pearl) => children.push(para(`• ${pearl}`, font, theme.bodyPt, 60)));
      }
      children.push(...(await lessonImageParagraphs(lesson, font, theme.bodyPt)));
      if (lesson.keyPoints.length) {
        children.push(para(es ? 'Puntos clave' : 'Key points', font, theme.bodyPt, 40, { bold: true }));
        lesson.keyPoints.forEach((point) => children.push(para(`• ${point}`, font, theme.bodyPt, 60)));
      }
      if (lesson.teachingPdfs.length) {
        children.push(para(es ? 'Material de apoyo' : 'Supporting documents', font, theme.bodyPt, 40, { bold: true }));
        lesson.teachingPdfs.forEach((pdf) => {
          children.push(para(`${pdf.title}${pdf.author ? ` — ${pdf.author}` : ''}. ${pdf.url}`, font, theme.bodyPt, 60));
        });
      }
      if (lesson.sectionBibliography.length) {
        children.push(para(es ? 'Bibliografía de la sección' : 'References for this section', font, theme.bodyPt, 40, { bold: true }));
        lesson.sectionBibliography.forEach((ref) => children.push(para(formatReference(ref), font, theme.bodyPt - 0.5, 60)));
      }
    }
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  if (model.appendix.length) {
    children.push(heading(es ? 'Bibliografía general' : 'Collected bibliography', HeadingLevel.HEADING_1, font, theme.chapterTitlePt, gap));
    model.appendix.forEach((ref) => children.push(para(formatReference(ref), font, theme.bodyPt, 80)));
  }

  const doc = new Document({
    creator: model.authors.join(', ') || model.cover.institution,
    title: model.cover.title,
    description: model.cover.subtitle,
    styles: {
      default: {
        document: {
          run: { font, size: Math.round(theme.bodyPt * 2) },
          paragraph: { spacing: { line: Math.round(theme.lineHeight * 240) } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertMillimetersToTwip(textbookPageWidthMm(theme.pageSize)),
              height: convertMillimetersToTwip(textbookPageHeightMm(theme.pageSize)),
            },
            margin: {
              top: convertMillimetersToTwip(theme.marginTopMm),
              right: convertMillimetersToTwip(theme.marginSideMm),
              bottom: convertMillimetersToTwip(theme.marginBottomMm),
              left: convertMillimetersToTwip(theme.marginSideMm),
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export async function downloadTextbookDocx(model: TextbookModel, theme: TextbookTheme): Promise<void> {
  const blob = await buildTextbookDocx(model, theme);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slug(model.cover.title)}.docx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
