declare module 'util' {
  export function promisify(fn: Function): (...args: any[]) => Promise<any>;
  export function format(format: any, ...param: any[]): string;
  export function inspect(object: any, options?: any): string;
  export function isDeepStrictEqual(val1: any, val2: any): boolean;
} 