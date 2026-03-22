declare module 'stream' {
  import { Readable, Writable, Duplex, Transform } from 'stream';
  
  export function pipeline(...streams: any[]): Promise<void>;
  export function finished(stream: any, callback: (err?: Error) => void): () => void;
} 