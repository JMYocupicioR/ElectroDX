declare module 'pagedjs' {
  export class Previewer {
    preview(
      content?: HTMLElement | string,
      stylesheets?: Array<string | Record<string, string>>,
      renderTo?: HTMLElement
    ): Promise<{ total: number }>;
  }
}
