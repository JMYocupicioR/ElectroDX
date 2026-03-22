import * as ReactRouter from 'react-router-dom';

declare module 'react-router-dom' {
  export = ReactRouter;
  export as namespace ReactRouter;
} 