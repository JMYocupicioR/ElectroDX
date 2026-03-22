declare module 'rtf.js' {
  interface RTFNode {
    type: string;
    value?: string;
    children?: RTFNode[];
  }

  interface RTFDocument {
    content?: RTFNode[];
  }

  interface RTFModule {
    parse(rtfString: string): Promise<RTFDocument>;
  }

  const rtf: RTFModule;
  export = rtf;
} 