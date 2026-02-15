#!/usr/bin/env node
/**
 * Vectorize a PNG/bitmap image to SVG using Potrace.
 * Usage: node scripts/vectorize.mjs [input] [output]
 */

import { createRequire } from 'module';
import { writeFileSync } from 'fs';

const require = createRequire(import.meta.url);
const potrace = require('potrace');
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const input = process.argv[2] || resolve(root, 'public', 'felix.png');
const output = process.argv[3] || input.replace(/\.(png|jpg|jpeg|bmp)$/i, '.svg');

const params = {
  threshold: 128,
  color: 'currentColor',
  background: 'transparent',
  turnPolicy: 'minority',
};

potrace.trace(input, params, (err, svg) => {
  if (err) {
    console.error('Potrace error:', err);
    process.exit(1);
  }
  writeFileSync(output, svg, 'utf8');
  console.log('Vectorized:', input, '→', output);
});
