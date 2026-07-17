#!/usr/bin/env node
/**
 * build-preview.mjs
 * Produces a single, fully self-contained HTML file (no external requests,
 * no separate JS/CSS files) for sharing a quick playable preview — e.g. as
 * a claude.ai Artifact — outside of the normal dev-server or hosted-dist
 * workflow. Not the production build (see vite.config.js / npm run build
 * for that); this uses vite.artifact.config.js to force a classic IIFE
 * script instead of an ES module, since some sandboxed embed contexts are
 * stricter about <script type="module"> than a plain inline <script>.
 *
 * Usage: node scripts/build-preview.mjs
 * Output: dist-artifact/preview.html
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

execSync('npx vite build --config vite.artifact.config.js', { cwd: root, stdio: 'inherit' });

const html = readFileSync(path.join(root, 'dist-artifact/index.html'), 'utf8');
const bundle = readFileSync(path.join(root, 'dist-artifact/bundle.js'), 'utf8');

const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/);
if (!bodyMatch) throw new Error('Could not find <body> in dist-artifact/index.html');

const merged = `${bodyMatch[1].trim()}\n<script>\n${bundle}\n</script>\n`;
const outPath = path.join(root, 'dist-artifact/preview.html');
writeFileSync(outPath, merged);

console.log(`\nWrote self-contained preview: ${outPath} (${(merged.length / 1024).toFixed(1)} KB)`);
