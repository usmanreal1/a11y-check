import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

export function textareaLabelRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      const name = path.node.name
      if (!t.isJSXIdentifier(name) || name.name !== 'textarea') return

      const attrs = path.node.attributes

      const hasAriaLabel = attrs.some(
        (a) =>
          t.isJSXAttribute(a) &&
          t.isJSXIdentifier(a.name) &&
          (a.name.name === 'aria-label' || a.name.name === 'aria-labelledby') &&
          a.value !== null
      )
      if (hasAriaLabel) return

      // An id attribute means a <label htmlFor> may exist elsewhere
      const hasId = attrs.some(
        (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'id'
      )
      if (hasId) return

      issues.push({
        rule: 'textarea-label',
        severity: 'error',
        message: '<textarea> has no associated label',
        suggestion:
          'Add aria-label="...", aria-labelledby="id", or a <label htmlFor="id"> linked via an id attribute',
        wcag: 'WCAG 1.3.1 (Level A)',
        line: path.node.loc?.start.line ?? 0,
        column: path.node.loc?.start.column ?? 0,
        filePath: parsed.filePath,
      })
    },
  })

  return issues
}
