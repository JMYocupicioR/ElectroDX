declare module 'tesseract.js' {
  interface RecognizeResult {
    data: {
      text: string;
    };
  }

  class TesseractWorker {
    constructor();
    recognize(file: File): Promise<RecognizeResult>;
    terminate(): Promise<void>;
  }

  export { TesseractWorker };
} 