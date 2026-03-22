declare module 'globals' {
  interface Global {
    process: typeof import('process');
    console: typeof import('console');
    setTimeout: typeof import('timers').setTimeout;
    clearTimeout: typeof import('timers').clearTimeout;
    setInterval: typeof import('timers').setInterval;
    clearInterval: typeof import('timers').clearInterval;
    setImmediate: typeof import('timers').setImmediate;
    clearImmediate: typeof import('timers').clearImmediate;
  }
} 