import { describe, expect, it } from 'vitest';
import {
  TEACHING_IMAGE_MAX_BYTES,
  TEACHING_PDF_MAX_BYTES,
  teachingFileError,
} from './teachingStorage';

function file(name: string, type: string, size: number): File {
  const blob = new Blob([new Uint8Array(1)], { type });
  const result = new File([blob], name, { type });
  Object.defineProperty(result, 'size', { value: size });
  return result;
}

describe('teachingFileError', () => {
  it('acepta un PDF dentro de 20 MB', () => {
    expect(teachingFileError('pdf', file('guia.pdf', 'application/pdf', 1024))).toBeNull();
  });

  it('rechaza un PDF mayor al límite del bucket', () => {
    expect(teachingFileError('pdf', file('guia.pdf', 'application/pdf', TEACHING_PDF_MAX_BYTES + 1))).toMatch(/20 MB/);
  });

  it('rechaza un video aunque se disfraze de PDF', () => {
    expect(teachingFileError('pdf', file('clase.mp4', 'video/mp4', 1024))).toMatch(/PDF/);
  });

  it('acepta JPG, PNG y WebP dentro de 5 MB', () => {
    expect(teachingFileError('image', file('trazo.jpg', 'image/jpeg', 2048))).toBeNull();
    expect(teachingFileError('image', file('trazo.png', 'image/png', 2048))).toBeNull();
    expect(teachingFileError('image', file('trazo.webp', 'image/webp', TEACHING_IMAGE_MAX_BYTES))).toBeNull();
  });

  it('rechaza GIF, SVG y archivos grandes', () => {
    expect(teachingFileError('image', file('a.gif', 'image/gif', 100))).toMatch(/JPG/);
    expect(teachingFileError('image', file('a.svg', 'image/svg+xml', 100))).toMatch(/JPG/);
    expect(teachingFileError('image', file('a.png', 'image/png', TEACHING_IMAGE_MAX_BYTES + 1))).toMatch(/5 MB/);
  });
});
