declare module 'pdfjs-dist' {
  interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }

  interface TextContent {
    items: TextItem[];
  }

  interface TextItem {
    str: string;
  }

  interface GetDocumentOptions {
    data: ArrayBuffer;
  }

  export function getDocument(options: GetDocumentOptions): Promise<PDFDocumentProxy>;
} 