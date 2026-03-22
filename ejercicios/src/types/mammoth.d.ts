declare module 'mammoth' {
  interface ExtractRawTextOptions {
    arrayBuffer: ArrayBuffer;
  }

  interface ExtractRawTextResult {
    value: string;
  }

  export function extractRawText(options: ExtractRawTextOptions): Promise<ExtractRawTextResult>;
} 