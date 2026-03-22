declare module 'punycode' {
  export function encode(string: string): string;
  export function decode(string: string): string;
  export function toASCII(domain: string): string;
  export function toUnicode(domain: string): string;
} 