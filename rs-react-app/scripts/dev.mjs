#!/usr/bin/env node
// Wrapper that starts Vite with the Node flags needed on this machine:
//   --dns-result-order=ipv4first  → avoids IPv6 timeouts to api.restcountries.com
//   --use-system-ca               → trusts the Windows certificate store for TLS
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const viteBin = resolve(__dirname, '../node_modules/vite/bin/vite.js');

const child = spawn(
  process.execPath,
  [
    '--dns-result-order=ipv4first',
    '--use-system-ca',
    viteBin,
    ...process.argv.slice(2),
  ],
  { stdio: 'inherit', shell: false }
);

child.on('exit', (code) => process.exit(code ?? 0));
