import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

function findJSXByTag(
  children: t.JSXElement['children'],
  tagName: string
): boolean {
  for (const child of children) {
    if (!t.isJSXElement(child)) continue
    const name = child.openingElement.name
    if (t.isJSXIdentifier(name) && name.name === tagName) return true
    if (findJSXByTag(child.children, tagName)) return true
  }
  return false
}

export function tableHeadersRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      const name = path.node.name
      if (!t.isJSXIdentifier(name) || name.name !== 'table') return
      if (!t.isJSXElement(path.parent)) return

      const children = path.parent.children

      // Only flag tables that have data cells — layout tables may have neither
      const hasTd = findJSXByTag(children, 'td')
      if (!hasTd) return

      const hasTh = findJSXByTag(children, 'th')
      if (hasTh) return

      issues.push({
        rule: 'table-headers',
        severity: 'error',
        message: '<table> has data cells (<td>) but no header cells (<th>)',
        suggestion:
          'Add <th> elements in the first row or column with appropriate scope="col" or scope="row" so screen readers can associate data cells with their headers.',
        wcag: 'WCAG 1.3.1 (Level A)',
        line: path.node.loc?.start.line ?? 0,
        column: path.node.loc?.start.column ?? 0,
        filePath: parsed.filePath,
      })
    },
  })

  return issues
}
