import { glob } from 'glob'
import path from 'path'
import fs from 'fs'

export async function resolveFiles(
  inputPath: string,
  exclude: string[] = []
): Promise<string[]> {
  const normalized = path.resolve(inputPath)

  // single file passed directly
  if (fs.existsSync(normalized) && fs.statSync(normalized).isFile()) {
    if (!/\.(jsx|tsx)$/.test(normalized)) {
      throw new Error(`File must be a .jsx or .tsx file: ${inputPath}`)
    }
    return [normalized]
  }

  const files = await glob(`${normalized}/**/*.{jsx,tsx}`, {
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.test.*',
      '**/*.spec.*',
      ...exclude,
    ],
  })

  if (files.length === 0) {
    throw new Error(`No JSX/TSX files found in: ${inputPath}`)
  }

  return files.sort()
}