import { ReactElement } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: string): ReactElement;
  export function jsxs(type: any, props: any, key?: string): ReactElement;
  export function Fragment(props: { children?: React.ReactNode }): ReactElement;
} 