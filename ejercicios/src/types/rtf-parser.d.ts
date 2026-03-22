declare module 'rtf-parser' {
  interface RTFNode {
    type: string;
    value?: string;
    children?: RTFNode[];
  }

  interface RTFDocument {
    content: RTFNode[];
  }

  class RTFParser {
    parse(rtfString: string): Promise<RTFDocument>;
  }

  export { RTFParser, RTFNode, RTFDocument };
} 