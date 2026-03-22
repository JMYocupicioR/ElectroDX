declare module 'timers' {
  export function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): NodeJS.Timeout;
  export function clearTimeout(timeoutId: NodeJS.Timeout): void;
  export function setInterval(callback: (...args: any[]) => void, ms: number, ...args: any[]): NodeJS.Timeout;
  export function clearInterval(intervalId: NodeJS.Timeout): void;
  export function setImmediate(callback: (...args: any[]) => void, ...args: any[]): NodeJS.Immediate;
  export function clearImmediate(immediateId: NodeJS.Immediate): void;
} 