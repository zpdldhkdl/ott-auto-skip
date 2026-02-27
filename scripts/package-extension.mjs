import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(rootDir, 'dist');
const releaseDir = resolve(rootDir, 'release/unpacked');

if (!existsSync(distDir)) {
  throw new Error('dist directory does not exist. Run npm run build first.');
}

rmSync(releaseDir, { recursive: true, force: true });
mkdirSync(dirname(releaseDir), { recursive: true });
cpSync(distDir, releaseDir, { recursive: true });

console.log(`Packaged extension to ${releaseDir}`);
