declare module 'string_decoder' {
  export class StringDecoder {
    constructor(encoding?: string);
    write(buffer: Buffer): string;
    end(buffer?: Buffer): string;
  }
} 