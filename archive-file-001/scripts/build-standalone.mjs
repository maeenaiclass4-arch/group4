#!/usr/bin/env node
/**
 * Produces a single, fully self-contained HTML file (JS + CSS inlined, no
 * external requests, no ES module script tag) that can be opened directly
 * from disk. See vite.standalone.config.js for why IIFE instead of ESM.
 *
 * Usage: node scripts/build-standalone.mjs
 * Output: dist-standalone/ARCHIVE-FILE-001.html
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

execSync('npx vite build --config vite.standalone.config.js', { cwd: root, stdio: 'inherit' });

const rawDir = path.join(root, 'dist-standalone-raw');
const html = readFileSync(path.join(rawDir, 'index.html'), 'utf8');
const bundle = readFileSync(path.join(rawDir, 'bundle.js'), 'utf8');
const css = readFileSync(path.join(root, 'styles/ui.css'), 'utf8');

// Replacement *functions* (not strings) — the minified bundle almost
// certainly contains literal "$&"/"$'"/"$`" sequences somewhere in ~500KB
// of code, which String.replace's string form would reinterpret as special
// match patterns and silently corrupt the output.
let out = html
  .replace(/<link rel="stylesheet"[^>]*>/, () => `<style>\n${css}\n</style>`)
  .replace(/<script type="module"[^>]*src="[^"]*"><\/script>/, () => `<script>\n${bundle}\n</script>`);

const outDir = path.join(root, 'dist-standalone');
mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'ARCHIVE-FILE-001.html');
writeFileSync(outPath, out);

console.log(`\nWrote self-contained standalone build: ${outPath} (${(out.length / 1024).toFixed(1)} KB)`);
