/// <reference types="node" />

import 'dotenv/config';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { removeBackground } from '../services/removebg';

function printUsage(): void {
  console.log('Usage: npx ts-node src/scripts/test-removebg.ts <input-file> [output-file]');
  console.log('Input can be an image file or a text file containing raw base64 / data URL.');
}

async function buildBase64Input(inputPath: string): Promise<string> {
  const fileBuffer = await readFile(inputPath);
  const text = fileBuffer.toString('utf8').trim();

  if (text.startsWith('data:') || /^[A-Za-z0-9+/=\s]+$/.test(text)) {
    return text;
  }

  const extension = path.extname(inputPath).toLowerCase();
  const mimeType =
    extension === '.png'
      ? 'image/png'
      : extension === '.webp'
        ? 'image/webp'
        : 'image/jpeg';

  return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
}

async function main(): Promise<void> {
  const inputPath = process.argv[2];
  const outputPath =
    process.argv[3] ??
    path.join(
      path.dirname(inputPath ?? '.'),
      `${path.parse(inputPath ?? 'output').name}.removebg.png`
    );

  if (!inputPath) {
    printUsage();
    process.exit(1);
  }

  const base64Input = await buildBase64Input(inputPath);
  const result = await removeBackground(base64Input);
  const outputBase64 = result.replace(/^data:image\/png;base64,/, '');

  await writeFile(outputPath, Buffer.from(outputBase64, 'base64'));

  console.log(`Saved output to ${outputPath}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`remove.bg test failed: ${message}`);
  process.exit(1);
});
