// ⚠️ DEPRECATED: Este archivo está obsoleto
// ============================================
// Este archivo ha sido reemplazado por:
// - src/services/enhanced-file-converter.ts (Sistema principal)
// - src/services/fileToJsonConverter.ts (Sistema alternativo)
// 
// Por favor usa: import { createConverter } from '../services/enhanced-file-converter';
// ============================================

import { SupportedFileFormat, FileConversionResult, MedicalReport } from '../types/medical';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export class MedicalFileConverter {
  private static instance: MedicalFileConverter;

  private constructor() {
    // Constructor vacío - este archivo está obsoleto
  }

  public static getInstance(): MedicalFileConverter {
    if (!MedicalFileConverter.instance) {
      MedicalFileConverter.instance = new MedicalFileConverter();
    }
    return MedicalFileConverter.instance;
  }

  private async validateFile(file: File): Promise<boolean> {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 50MB limit');
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !['rtf', 'docx', 'pdf', 'xml'].includes(extension)) {
      throw new Error('Unsupported file format');
    }

    return true;
  }

  private async extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ');
    }

    return text;
  }

  private async performOCR(file: File): Promise<string> {
    const result = await this.tesseractWorker.recognize(file);
    return result.data.text;
  }

  private async parseXML(xmlString: string): Promise<MedicalReport> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    
    // Extract data from XML using XPath or similar
    const patientNode = doc.getElementsByTagName('patient')[0];
    const testsNode = doc.getElementsByTagName('tests')[0];
    
    if (!patientNode || !testsNode) {
      throw new Error('Invalid XML format: missing required elements');
    }

    // Convert XML to MedicalReport format
    return this.textProcessor.processText(xmlString);
  }

  private async parseRTF(rtfString: string): Promise<string> {
    try {
      // Dynamically import the RTF parser
      const rtfjs = await import('rtf.js');
      
      // Parse the RTF content
      const doc = await rtfjs.parse(rtfString);
      
      // Extract text content
      let textContent = '';
      
      // Process the document structure
      const processNode = (node: any) => {
        if (node.type === 'text') {
          textContent += node.value;
        } else if (node.children) {
          node.children.forEach(processNode);
        }
      };
      
      if (doc.content) {
        doc.content.forEach(processNode);
      }
      
      // Clean up the extracted text
      return textContent
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
        .trim();
    } catch (error) {
      console.error('Error parsing RTF:', error);
      // Fallback to basic regex parsing if the parser fails
      return rtfString
        .replace(/\\[a-z]+\d*|\\'[0-9a-f]{2}|\\[{}]|\\\n/g, '')
        .replace(/\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g, '')
        .trim();
    }
  }

  public async convertFile(file: File): Promise<FileConversionResult> {
    const result: FileConversionResult = {
      success: false,
      report: null,
      errors: [
        '⚠️ DEPRECATED: MedicalFileConverter está obsoleto.',
        '🚀 Por favor usa el nuevo sistema:',
        '',
        'import { createConverter } from "../services/enhanced-file-converter";',
        '',
        'const converter = createConverter();',
        'const result = await converter.convert(file);',
        '',
        'El nuevo sistema es más robusto y no tiene dependencias problemáticas.'
      ],
      warnings: [],
      processingTime: 0
    };

    return result;
  }
} 