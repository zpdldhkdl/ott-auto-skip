import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const rootDir = dirname(fileURLToPath(import.meta.url));
const sourceManifestPath = resolve(rootDir, 'src/manifest.json');
const outputManifestPath = resolve(rootDir, 'dist/manifest.json');
const sourceLocalesPath = resolve(rootDir, '_locales');
const outputLocalesPath = resolve(rootDir, 'dist/_locales');
const sourceIconsPath = resolve(rootDir, 'images/icons');
const outputIconsPath = resolve(rootDir, 'dist/icons');

function copyManifestPlugin() {
  return {
    name: 'copy-manifest-plugin',
    writeBundle() {
      if (!existsSync(sourceManifestPath)) {
        throw new Error('Missing required manifest: src/manifest.json');
      }

      mkdirSync(dirname(outputManifestPath), { recursive: true });
      copyFileSync(sourceManifestPath, outputManifestPath);

      if (existsSync(sourceLocalesPath)) {
        rmSync(outputLocalesPath, { recursive: true, force: true });
        cpSync(sourceLocalesPath, outputLocalesPath, { recursive: true });
      }

      if (!existsSync(sourceIconsPath)) {
        throw new Error('Missing extension icons directory: images/icons. Run npm run icons first.');
      }

      rmSync(outputIconsPath, { recursive: true, force: true });
      cpSync(sourceIconsPath, outputIconsPath, { recursive: true });
    },
  };
}

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(rootDir, 'src/popup/index.html'),
        options: resolve(rootDir, 'src/options/index.html'),
        background: resolve(rootDir, 'src/background/index.js'),
        content: resolve(rootDir, 'src/content/index.js'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  },
  plugins: [copyManifestPlugin()]
});
