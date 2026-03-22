export async function extractPlainTextFromRTF(rtfContent: string): Promise<string> {
  // Import rtf-parser dynamically to avoid increasing bundle size if not used
  const parseRTF: any = await import('rtf-parser');

  // The library exposes a callback-based API; wrap it in a Promise for cleaner async/await usage
  return new Promise((resolve, reject) => {
    try {
      // Some ESM/CommonJS interop quirks – the default export may be under .default
      const parser = (parseRTF?.default ?? parseRTF) as any;

      if (typeof parser.string !== 'function') {
        return reject(new Error('rtf-parser: método "string" no disponible'));
      }

      parser.string(rtfContent, (err: any, doc: any) => {
        if (err) return reject(err);

        // Recorrer recursivamente los nodos del documento y concatenar los valores de texto
        const traverse = (node: any): string => {
          if (!node) return '';
          if (typeof node.value === 'string') {
            return node.value;
          }
          if (Array.isArray(node.children)) {
            return node.children.map(traverse).join('');
          }
          return '';
        };

        try {
          const plainText = Array.isArray(doc?.content)
            ? doc.content.map(traverse).join('\n').trim()
            : '';
          resolve(plainText);
        } catch (innerErr) {
          reject(innerErr);
        }
      });
    } catch (importErr) {
      reject(importErr);
    }
  });
} 