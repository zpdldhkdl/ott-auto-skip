import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceSvgPath = resolve(rootDir, 'images/logo.svg');
const outputDirPath = resolve(rootDir, 'images/icons');
const iconSizes = [16, 32, 48, 128];

function commandExists(command) {
  return spawnSync('which', [command], { stdio: 'ignore' }).status === 0;
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`Failed to run command: ${command} ${args.join(' ')}`);
  }
}

async function generateWithSharp() {
  let sharp;
  try {
    ({ default: sharp } = await import('sharp'));
  } catch {
    return false;
  }

  await Promise.all(
    iconSizes.map(async (size) => {
      const outputPath = resolve(outputDirPath, `icon-${size}.png`);
      await sharp(sourceSvgPath).resize(size, size).png().toFile(outputPath);
    }),
  );

  return true;
}

function generateWithSips() {
  iconSizes.forEach((size) => {
    const outputPath = resolve(outputDirPath, `icon-${size}.png`);
    run('sips', ['-s', 'format', 'png', '-z', String(size), String(size), sourceSvgPath, '--out', outputPath]);
  });
}

function generateWithRsvgConvert() {
  iconSizes.forEach((size) => {
    const outputPath = resolve(outputDirPath, `icon-${size}.png`);
    run('rsvg-convert', ['-w', String(size), '-h', String(size), sourceSvgPath, '-o', outputPath]);
  });
}

function generateWithImageMagick() {
  iconSizes.forEach((size) => {
    const outputPath = resolve(outputDirPath, `icon-${size}.png`);
    run('magick', [sourceSvgPath, '-background', 'none', '-resize', `${size}x${size}`, outputPath]);
  });
}

function generateWithInkscape() {
  iconSizes.forEach((size) => {
    const outputPath = resolve(outputDirPath, `icon-${size}.png`);
    run('inkscape', [
      sourceSvgPath,
      '--export-type=png',
      `--export-width=${size}`,
      `--export-height=${size}`,
      `--export-filename=${outputPath}`,
    ]);
  });
}

async function main() {
  if (!existsSync(sourceSvgPath)) {
    throw new Error(`Source SVG not found: ${sourceSvgPath}`);
  }

  mkdirSync(outputDirPath, { recursive: true });

  if (await generateWithSharp()) {
    console.log(`Generated Chrome extension icons in ${outputDirPath}`);
    return;
  }

  if (commandExists('sips')) {
    generateWithSips();
  } else if (commandExists('rsvg-convert')) {
    generateWithRsvgConvert();
  } else if (commandExists('magick')) {
    generateWithImageMagick();
  } else if (commandExists('inkscape')) {
    generateWithInkscape();
  } else {
    throw new Error('No supported image conversion tool found. Install one of: sips, rsvg-convert, magick, inkscape.');
  }

  console.log(`Generated Chrome extension icons in ${outputDirPath}`);
}

main().catch((error) => {
  if (error instanceof Error) {
    console.error(error.message);
    process.exit(1);
  }
});
