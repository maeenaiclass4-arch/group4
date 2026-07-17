import { defineConfig } from 'vite';

/**
 * vite.artifact.config.js
 * NOT part of the production build (see vite.config.js for that — ES
 * modules are the right choice for real hosting, GDD §15). This variant
 * only exists to produce a single classic (non-module) script for
 * embedding as a share-friendly, fully self-contained preview page, since
 * some sandboxed embed contexts are stricter about <script type="module">
 * than a plain inline <script>.
 */
export default defineConfig({
  root: '.',
  base: './',
  build: {
    target: 'es2022',
    outDir: 'dist-artifact',
    sourcemap: false,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: 'bundle.js',
      },
    },
  },
});
