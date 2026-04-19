import { parse, type ParseResult } from '@babel/parser'
import type { File } from '@babel/types'
import fs from 'fs'

export interface ParsedFile {
  filePath: string
  ast: ParseResult<File>
  source: string
}

export function parseFile(filePath: string): ParsedFile {
  const source = fs.readFileSync(filePath, 'utf-8')

  const ast = parse(source, {
    sourceType: 'module',
    plugins: [
      'jsx',
      'typescript',
      'decorators-legacy',
      'classProperties',
    ],
    errorRecovery: true,
  })

  return { filePath, ast, source }
}