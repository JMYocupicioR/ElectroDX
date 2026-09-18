/** Stubs image/css imports so Node can load Vite content modules. */
export async function resolve(specifier, context, nextResolve) {
  const clean = specifier.split('?')[0];
  if (/\.(png|jpe?g|gif|webp|svg|css)$/i.test(clean)) {
    return {
      shortCircuit: true,
      url: new URL('./empty-asset.mjs', import.meta.url).href,
    };
  }
  return nextResolve(specifier, context);
}
