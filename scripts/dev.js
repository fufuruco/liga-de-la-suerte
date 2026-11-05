import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const children = [];
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => child.kill('SIGTERM'));
  setTimeout(() => process.exit(code), 100);
}

function start(label, args) {
  const child = spawn(process.execPath, args, {
    cwd: projectRoot,
    env: process.env,
    stdio: 'inherit',
  });
  children.push(child);
  child.once('error', (error) => {
    console.error(`${label} no pudo iniciar:`, error.message);
    stop(1);
  });
  child.once('exit', (code) => {
    if (!stopping) stop(code || 0);
  });
}

start('API', [join(projectRoot, 'server', 'index.js')]);
start('Vite', [join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js'), '--host', '127.0.0.1']);
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));