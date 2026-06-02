import fs from "node:fs";
import path from "node:path";
import { standardizeImage } from "../src/services/gemini";

function usage(): never {
  console.error(
    [
      "Usage:",
      "  npx ts-node --transpile-only scripts/test-gemini-standardize.ts <input-image> [output-image]",
      "",
      "Examples:",
      "  npx ts-node --transpile-only scripts/test-gemini-standardize.ts ../samples/shirt.jpg",
      "  npx ts-node --transpile-only scripts/test-gemini-standardize.ts shirt.png out.jpg",
      "",
      "Notes:",
      "  - Requires GEMINI_API_KEY in your server environment (e.g. server/.env).",
      "  - There must be an existing image within the root of the server folder.",
    ].join("\n"),
  );
  process.exit(1);
}

async function main() {
  const inputArg = process.argv[2];
  const outputArg = process.argv[3];
  if (!inputArg) usage();

  const inputPath = path.resolve(process.cwd(), inputArg);
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const outputPath = outputArg
    ? path.resolve(process.cwd(), outputArg)
    : path.resolve(process.cwd(), "out_standardized.jpg");

  const inputBuffer = fs.readFileSync(inputPath);
  const inputBase64 = inputBuffer.toString("base64");

  console.log(`Standardizing: ${inputPath}`);
  const outputBase64 = await standardizeImage(inputBase64);

  fs.writeFileSync(outputPath, Buffer.from(outputBase64, "base64"));
  console.log(`Wrote: ${outputPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
