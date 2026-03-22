declare module 'worker_threads' {
  export class Worker {
    constructor(filename: string, options?: any);
    postMessage(value: any): void;
    terminate(): Promise<number>;
    ref(): void;
    unref(): void;
  }
  
  export const isMainThread: boolean;
  export const parentPort: any;
  export const threadId: number;
} 