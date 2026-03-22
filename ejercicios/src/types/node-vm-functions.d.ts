declare module 'vm' {
  export function runInContext(code: string, contextifiedSandbox: any, options?: any): any;
  export function runInNewContext(code: string, sandbox?: any, options?: any): any;
  export function runInThisContext(code: string, options?: any): any;
  export function createContext(sandbox?: any): any;
} 