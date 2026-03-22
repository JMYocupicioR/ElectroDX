declare module 'querystring' {
  export function parse(str: string, sep?: string, eq?: string, options?: any): any;
  export function stringify(obj: any, sep?: string, eq?: string, options?: any): string;
  export function escape(str: string): string;
  export function unescape(str: string): string;
} 