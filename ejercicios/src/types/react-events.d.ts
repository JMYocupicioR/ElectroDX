import { SyntheticEvent } from 'react';

declare global {
  namespace React {
    interface DragEvent<T = Element> extends SyntheticEvent<T> {
      dataTransfer: DataTransfer;
    }

    interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
      target: EventTarget & T;
    }
  }
}

export {}; 