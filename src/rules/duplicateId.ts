import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

export function duplicateIdRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []
  const seen = new Map<string, { line: number; column: number }[]>()

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      const idAttr = path.node.attributes.find(
        (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'id'
      )
      if (!idAttr || !t.isJSXAttribute(idAttr)) return
      if (!t.isStringLiteral(idAttr.value)) return

      const id = idAttr.value.value
      if (!seen.has(id)) seen.set(id, [])
      seen.get(id)!.push({
        line: path.node.loc?.start.line ?? 0,
        column: path.node.loc?.start.column ?? 0,
      })
    },
  })

  for (const [id, locations] of seen) {
    if (locations.length < 2) continue
    for (const loc of locations) {
      issues.push({
        rule: 'duplicate-id',
        severity: 'error',
        message: `Duplicate id="${id}" — id values must be unique within a document`,
        suggestion:
          'Give each element a unique id. If rendering a list, append the item index or a unique key.',
        wcag: 'WCAG 4.1.1 (Level A)',
        line: loc.line,
        column: loc.column,
        filePath: parsed.filePath,
      })
    }
  }

  return issues
}
