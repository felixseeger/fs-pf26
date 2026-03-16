#!/usr/bin/env node
/**
 * Full deploy: prepare live env → clear cache → build → FTP upload
 * Cross-platform (works on Windows PowerShell)
 */

import { spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { rmSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function run(cmd, args = [], opts = {}) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    cwd: rootDir,
    shell: true,
    ...opts,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// 1. Prepare live env from conf/start.md
run('node', ['scripts/prepare-live-env.mjs']);

// 2. Clear Next.js cache so build always fetches fresh WordPress data
const nextDir = join(rootDir, '.next');
if (existsSync(nextDir)) {
  rmSync(nextDir, { recursive: true });
  console.log('Cleared .next cache');
}

// 3. Build (use node directly to avoid PATH issues with next binary)
run('node', [join(rootDir, 'node_modules/next/dist/bin/next'), 'build']);

// 4. FTP upload
run('node', ['scripts/deploy-ftp.mjs']);
