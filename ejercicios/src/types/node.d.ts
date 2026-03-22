declare module 'path' {
  import * as Path from 'path';
  export = Path;
  export as namespace Path;
}

declare module 'node:*' {
  import * as Node from 'node:*';
  export = Node;
  export as namespace Node;
} 