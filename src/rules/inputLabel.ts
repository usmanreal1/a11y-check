import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

const SKIP_TYPES = new Set(['hidden', 'button', 'submit', 'reset', 'image'])

export function inputLabelRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      const name = path.node.name
      if (!t.isJSXIdentifier(name) || name.name !== 'input') return

      const attrs = path.node.attributes

      const typeAttr = attrs.find(
        (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'type'
      )
      if (typeAttr && t.isJSXAttribute(typeAttr) && t.isStringLiteral(typeAttr.value)) {
        if (SKIP_TYPES.has(typeAttr.value.value)) return
      }

      const hasAriaLabel = attrs.some(
        (a) =>
          t.isJSXAttribute(a) &&
          t.isJSXIdentifier(a.name) &&
          (a.name.name === 'aria-label' || a.name.name === 'aria-labelledby') &&
          a.value !== null
      )
      if (hasAriaLabel) return

      // id attribute means a <label htmlFor> may exist elsewhere in the tree
      const hasId = attrs.some(
        (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'id'
      )
      if (hasId) return

      issues.push({
        rule: 'input-label',
        severity: 'error',
        message: '<input> has no associated label',
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
