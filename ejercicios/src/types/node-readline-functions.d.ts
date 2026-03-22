declare module 'readline' {
  export interface Interface {
    question(query: string, callback: (answer: string) => void): void;
    close(): void;
    pause(): void;
    resume(): void;
    write(data: string | Buffer, key?: any): void;
  }
  
  export function createInterface(options: any): Interface;
} 