import * as React from 'react';

declare global {
  namespace React {
    interface FC<P = {}> {
      (props: P & { children?: ReactNode }, context?: any): ReactElement<any, any> | null;
    }
  }
}

export = React;
export as namespace React;

declare module 'react' {
  export = React;
  export as namespace React;
} 