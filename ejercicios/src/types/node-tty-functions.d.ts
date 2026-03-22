declare module 'tty' {
  export function isatty(fd: number): boolean;
  export class ReadStream {
    isTTY: boolean;
    setRawMode(mode: boolean): void;
  }
  export class WriteStream {
    isTTY: boolean;
    columns: number;
    rows: number;
  }
} 