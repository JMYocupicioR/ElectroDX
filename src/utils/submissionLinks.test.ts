import { describe, expect, it } from 'vitest';
import { submissionFileError, submissionLinkError } from './submissionLinks';

describe('submissionLinkError', () => {
  it('acepta Drive, Docs, OneDrive y Dropbox por https', () => {
    expect(submissionLinkError('https://drive.google.com/file/d/abc/view')).toBeNull();
    expect(submissionLinkError('https://docs.google.com/document/d/abc/edit')).toBeNull();
    expect(submissionLinkError('https://1drv.ms/b/s!abc')).toBeNull();
    expect(submissionLinkError('https://contoso.sharepoint.com/sites/curso/doc')).toBeNull();
    expect(submissionLinkError('https://www.dropbox.com/s/abc/reporte.pdf?dl=0')).toBeNull();
    expect(submissionLinkError('https://app.box.com/s/abc')).toBeNull();
  });

  it('rechaza http, otros hosts y texto vacío', () => {
    expect(submissionLinkError('http://drive.google.com/file/d/abc')).toMatch(/https/);
    expect(submissionLinkError('https://evil.example/drive.google.com')).toMatch(/Drive/);
    expect(submissionLinkError('')).toMatch(/enlace/i);
  });
});

describe('submissionFileError', () => {
  it('rechaza tipos y tamaños fuera de la política del bucket', () => {
    const video = new File([new Uint8Array(8)], 'clase.mp4', { type: 'video/mp4' });
    expect(submissionFileError(video)).toMatch(/Word/);

    const huge = new File([new Uint8Array(15 * 1024 * 1024 + 1)], 'trazo.pdf', {
      type: 'application/pdf',
    });
    expect(submissionFileError(huge)).toMatch(/15 MB/);
  });

  it('acepta un PDF o un Word dentro del límite', () => {
    const pdf = new File([new Uint8Array(32)], 'reporte.pdf', { type: 'application/pdf' });
    expect(submissionFileError(pdf)).toBeNull();
    const word = new File([new Uint8Array(32)], 'ensayo.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    expect(submissionFileError(word)).toBeNull();
  });
});
