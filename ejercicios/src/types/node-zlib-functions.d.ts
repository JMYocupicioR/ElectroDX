declare module 'zlib' {
  export function gzip(buffer: Buffer): Promise<Buffer>;
  export function gunzip(buffer: Buffer): Promise<Buffer>;
  export function deflate(buffer: Buffer): Promise<Buffer>;
  export function inflate(buffer: Buffer): Promise<Buffer>;
} 