export type LessonBlock =
  | { kind: 'heading'; text: string; level: number }
  | { kind: 'paragraph'; text: string }
  | { kind: 'bullet'; items: string[] }
  | { kind: 'ordered'; items: string[] }
  | { kind: 'table'; rows: string[][] };

const HEADING_RE = /^(#{1,6})\s+(.+)$/;
const BULLET_RE = /^[•\-\*]\s+/;
const ORDERED_RE = /^(\d+)[.)]\s+/;

function classify(line: string): 'empty' | 'heading' | 'bullet' | 'ordered' | 'table' | 'paragraph' {
  const trimmed = line.trim();
  if (!trimmed) return 'empty';
  if (HEADING_RE.test(trimmed)) return 'heading';
  if (BULLET_RE.test(trimmed)) return 'bullet';
  if (ORDERED_RE.test(trimmed)) return 'ordered';
  if (trimmed.startsWith('|')) return 'table';
  return 'paragraph';
}

function tableRows(lines: string[]): string[][] {
  return lines
    .filter((line) => line.trim().startsWith('|'))
    .map((line) => {
      const parts = line.trim().split('|');
      if (parts[0] === '') parts.shift();
      if (parts[parts.length - 1] === '') parts.pop();
      return parts.map((cell) => cell.trim());
    })
    .filter((row) => !row.every((cell) => /^[\s-:]+$/.test(cell)));
}

export function parseLessonBlocks(text: string): LessonBlock[] {
  const blocks: LessonBlock[] = [];
  const groups = text.replace(/\r\n/g, '\n').split(/\n\n+/);

  for (const group of groups) {
    const lines = group.split('\n');
    let i = 0;
    while (i < lines.length) {
      const kind = classify(lines[i]);
      if (kind === 'empty') {
        i += 1;
        continue;
      }
      if (kind === 'heading') {
        const match = lines[i].trim().match(HEADING_RE);
        if (match) blocks.push({ kind: 'heading', text: match[2].trim(), level: match[1].length });
        i += 1;
        continue;
      }
      if (kind === 'bullet') {
        const items: string[] = [];
        while (i < lines.length && classify(lines[i]) === 'bullet') {
          items.push(lines[i].trim().replace(BULLET_RE, ''));
          i += 1;
        }
        blocks.push({ kind: 'bullet', items });
        continue;
      }
      if (kind === 'ordered') {
        const items: string[] = [];
        while (i < lines.length && classify(lines[i]) === 'ordered') {
          items.push(lines[i].trim().replace(ORDERED_RE, ''));
          i += 1;
        }
        blocks.push({ kind: 'ordered', items });
        continue;
      }
      if (kind === 'table') {
        const raw: string[] = [];
        while (i < lines.length && classify(lines[i]) === 'table') {
          raw.push(lines[i]);
          i += 1;
        }
        const rows = tableRows(raw);
        if (rows.length) blocks.push({ kind: 'table', rows });
        continue;
      }
      const paragraph: string[] = [];
      while (i < lines.length && classify(lines[i]) === 'paragraph') {
        paragraph.push(lines[i].trim());
        i += 1;
      }
      if (paragraph.length) blocks.push({ kind: 'paragraph', text: paragraph.join(' ') });
    }
  }

  return blocks;
}

export function splitInlineMarks(text: string): { text: string; bold: boolean }[] {
  const parts: { text: string; bold: boolean }[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), bold: false });
    parts.push({ text: match[1], bold: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), bold: false });
  return parts.filter((part) => part.text.length > 0);
}
