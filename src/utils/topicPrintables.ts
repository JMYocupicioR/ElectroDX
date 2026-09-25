import type { Topic } from '../types/content';

export interface TopicPdf {
  title: string;
  url: string;
  description?: string;
  author?: string;
}

function legacyPdfRe(): RegExp {
  return />\s*📄\s*\*\*Recurso Clínico Docente:\*\*\s*\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)(?:\s*>\s*\*Aportado por ([^*]+)\*)?(?:\s*>\s*([^\n\r]+))?/gi;
}

export function stripLegacyPdfMarkdown(text?: string | null): string {
  if (!text) return '';
  return text.replace(legacyPdfRe(), '').trim();
}

export function topicPdfList(topic: Topic): TopicPdf[] {
  const list: TopicPdf[] = [];
  if (topic.pdfUrls && topic.pdfUrls.length > 0) {
    list.push(...topic.pdfUrls);
  }
  if (topic.content) {
    const legacyRe = legacyPdfRe();
    let match: RegExpExecArray | null;
    while ((match = legacyRe.exec(topic.content)) !== null) {
      const url = match[2];
      if (!list.some((pdf) => pdf.url === url)) {
        list.push({
          title: match[1].trim(),
          url,
          author: match[3]?.trim(),
          description: match[4]?.trim(),
        });
      }
    }
  }
  return list;
}
