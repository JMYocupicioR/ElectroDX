declare module 'url' {
  export function parse(urlStr: string, parseQueryString?: boolean): URL;
  export function format(url: URL): string;
  export function resolve(from: string, to: string): string;
} 