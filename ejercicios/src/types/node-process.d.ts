declare module 'process' {
  import * as Process from 'process';
  export = Process;
  export as namespace Process;
} 