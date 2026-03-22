declare module 'worker_threads' {
  import * as WorkerThreads from 'worker_threads';
  export = WorkerThreads;
  export as namespace WorkerThreads;
} 