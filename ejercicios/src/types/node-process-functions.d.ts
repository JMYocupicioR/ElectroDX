declare module 'process' {
  export const env: NodeJS.ProcessEnv;
  export const cwd: () => string;
  export const exit: (code?: number) => never;
  export const platform: string;
  export const version: string;
} 