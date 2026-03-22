declare module 'vite' {
  import { UserConfig } from 'vite';
  
  export function defineConfig(config: UserConfig): UserConfig;
  export function loadEnv(mode: string, root: string): Record<string, string>;
} 