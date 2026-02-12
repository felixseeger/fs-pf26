#!/usr/bin/env node
/**
 * FTP deploy script – uploads out/ to remote server
 * Usage: pnpm deploy:ftp
 * Requires: .env.ftp with FTP_HOST, FTP_USER, FTP_PASSWORD, FTP_PATH
 */

import { Client } from 'basic-ftp';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const outDir = join(rootDir, 'out');

function loadEnvFtp() {
  // 1. .env.ftp or conf/ftp.env (KEY=value)
  const envPaths = [
    join(rootDir, '.env.ftp'),
    join(rootDir, 'conf', 'ftp.env'),
  ];
  for (const p of envPaths) {
    if (existsSync(p)) {
      const content = readFileSync(p, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eq = trimmed.indexOf('=');
          if (eq > 0) {
            const key = trimmed.slice(0, eq).trim();
            const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
            process.env[key] = val;
          }
        }
      }
      console.log(`Loaded config from ${p}`);
      return;
    }
  }
  // 2. conf/start.md (key: on one line, value on next non-comment line)
  const startMd = join(rootDir, 'conf', 'start.md');
  if (existsSync(startMd)) {
    const content = readFileSync(startMd, 'utf8').replace(/\r\n/g, '\n');
    const keyToEnv = { 'host': 'FTP_HOST', 'ftp-username': 'FTP_USER', 'password': 'FTP_PASSWORD', 'path': 'FTP_PATH' };
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (/^(host|ftp-username|password|path):\s*$/.test(line)) {
        const k = line.replace(/:.*/, '').trim().toLowerCase();
        const envKey = keyToEnv[k];
        const keyLines = ['host:', 'ftp-username:', 'password:', 'path:'];
        for (let j = i + 1; j < lines.length; j++) {
          const v = lines[j].trim();
          if (!v || v.startsWith('#')) continue;
          if (keyLines.includes(v.toLowerCase())) break;
          if (envKey) process.env[envKey] = v;
          break;
        }
      }
    }
    console.log('Loaded config from conf/start.md');
  }
}

loadEnvFtp();

const FTP_HOST = process.env.FTP_HOST || process.env.FTP_HOSTNAME;
const FTP_USER = process.env.FTP_USER || process.env.FTP_USERNAME;
const FTP_PASSWORD = process.env.FTP_PASSWORD || process.env.FTP_PASS;
const FTP_PATH = (process.env.FTP_PATH || process.env.FTP_REMOTE_PATH || '/').replace(/\/$/, '') || '/';

if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) {
  console.error('Missing FTP credentials. Create .env.ftp with:');
  console.error('  FTP_HOST=your-ftp-host');
  console.error('  FTP_USER=your-username');
  console.error('  FTP_PASSWORD=your-password');
  console.error('  FTP_PATH=/remote/path (optional, default /)');
  process.exit(1);
}

if (!existsSync(outDir)) {
  console.error('out/ folder not found. Run "pnpm build" first.');
  process.exit(1);
}

async function deploy() {
  const client = new Client(60_000);
  client.ftp.verbose = process.env.FTP_VERBOSE === '1';

  const port = parseInt(process.env.FTP_PORT || '21', 10);
  const useSecure = process.env.FTP_SECURE !== 'false';

  try {
    console.log('Connecting to', FTP_HOST, 'port', port, useSecure ? '(FTPS)' : '(FTP)', '...');
    await client.access({
      host: FTP_HOST,
      port,
      user: FTP_USER,
      password: FTP_PASSWORD,
      secure: useSecure ? (port === 990 ? 'implicit' : true) : false,
      secureOptions: { rejectUnauthorized: false },
    });

    const remotePath = FTP_PATH || '/';
    console.log('Uploading out/ to', remotePath, '...');
    await client.uploadFromDir(outDir, remotePath);
    console.log('Deploy complete.');
  } catch (err) {
    console.error('Deploy failed:', err.message);
    if (err.message?.includes('ECONNREFUSED') || err.message?.includes('ETIMEDOUT')) {
      console.error('Tip: Try FTP_PORT=21 and secure: false if FTPS fails.');
    }
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
