import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

export function iframeTitleRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      const name = path.node.name
      if (!t.isJSXIdentifier(name) || name.name !== 'iframe') return

      const attrs = path.node.attributes

      const titleAttr = attrs.find(
        (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'title'
      )

      if (!titleAttr) {
        issues.push({
          rule: 'iframe-title',
          severity: 'error',
          message: '<iframe> is missing a title attribute',
          suggestion: 'Add title="..." describing the iframe content, e.g. title="Google Maps"',
          wcag: 'WCAG 4.1.2 (Level A)',
          line: path.node.loc?.start.line ?? 0,
          column: path.node.loc?.start.column ?? 0,
          filePath: parsed.filePath,
        })
        return
      }

      if (
        t.isJSXAttribute(titleAttr) &&
        t.isStringLiteral(titleAttr.value) &&
        titleAttr.value.value.trim().length === 0
      ) {
        issues.push({
          rule: 'iframe-title',
          severity: 'error',
          message: '<iframe> has an empty title attribute',
          suggestion: 'Provide a meaningful title that describes the iframe content',
          wcag: 'WCAG 4.1.2 (Level A)',
          line: path.node.loc?.start.line ?? 0,
          column: path.node.loc?.start.column ?? 0,
          filePath: parsed.filePath,
        })
      }
    },
  })

  return issues
}
