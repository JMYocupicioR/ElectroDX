import { Font } from '@react-pdf/renderer';
import inter400 from '@fontsource/inter/files/inter-latin-400-normal.woff?url';
import inter600 from '@fontsource/inter/files/inter-latin-600-normal.woff?url';
import inter700 from '@fontsource/inter/files/inter-latin-700-normal.woff?url';
import inter800 from '@fontsource/inter/files/inter-latin-800-normal.woff?url';

let registered = false;

export function registerBrochureFonts(): void {
  if (registered) return;

  Font.register({
    family: 'Inter',
    fonts: [
      { src: inter400, fontWeight: 400 },
      { src: inter600, fontWeight: 600 },
      { src: inter700, fontWeight: 700 },
      { src: inter800, fontWeight: 800 },
    ],
  });

  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}
