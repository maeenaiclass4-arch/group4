import { defineConfig } from 'vite';

/**
 * Produces a classic (non-module) IIFE bundle rather than an ES module —
 * `<script type="module">` is blocked by browsers when a file is opened
 * directly via file://, which is exactly how this build is meant to be
 * used (a locally-opened file gets real, unrestricted pointer lock; a
 * sandboxed preview iframe cannot reliably grant it). scripts/build-standalone.mjs
 * inlines this bundle plus the CSS into one self-contained HTML file.
 */
export default defineConfig({
  root: '.',
  base: './',
  build: {
    target: 'es2022',
    outDir: 'dist-standalone-raw',
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
