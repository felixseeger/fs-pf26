#!/usr/bin/env node
/**
 * Full deploy: prepare live env → build → FTP upload
 * Cross-platform (works on Windows PowerShell)
 */

import { spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

// 2. Build
run('pnpm', ['build']);

// 3. FTP upload
run('node', ['scripts/deploy-ftp.mjs']);
