import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

export function headingOrderRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []
  const headings: { level: number; line: number; column: number }[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      const name = path.node.name
      if (!t.isJSXIdentifier(name)) return

      const match = name.name.match(/^h([1-6])$/)
      if (!match) return

      headings.push({
        level: parseInt(match[1]),
        line: path.node.loc?.start.line ?? 0,
        column: path.node.loc?.start.column ?? 0,
      })
    },
  })

  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1]
    const curr = headings[i]
    if (curr.level > prev.level + 1) {
      issues.push({
        rule: 'heading-order',
        severity: 'warning',
        message: `Heading level skipped: <h${prev.level}> followed by <h${curr.level}>`,
        suggestion: `Use <h${prev.level + 1}> next to maintain a logical heading hierarchy`,
        wcag: 'WCAG 1.3.1 (Level A)',
        line: curr.line,
        column: curr.column,
        filePath: parsed.filePath,
      })
    }
  }

  return issues
}
