import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

// Elements that are natively focusable
const FOCUSABLE_TAGS = new Set(['a', 'button', 'input', 'select', 'textarea', 'summary', 'details'])

export function ariaHiddenFocusRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      const name = path.node.name
      if (!t.isJSXIdentifier(name) || !FOCUSABLE_TAGS.has(name.name)) return

      const attrs = path.node.attributes

      const ariaHiddenAttr = attrs.find(
        (a) =>
          t.isJSXAttribute(a) &&
          t.isJSXIdentifier(a.name) &&
          a.name.name === 'aria-hidden'
      )
      if (!ariaHiddenAttr || !t.isJSXAttribute(ariaHiddenAttr)) return

      const val = ariaHiddenAttr.value
      const isHiddenTrue =
        (t.isStringLiteral(val) && val.value === 'true') ||
        (t.isJSXExpressionContainer(val) &&
          t.isBooleanLiteral(val.expression) &&
          val.expression.value === true)

      if (!isHiddenTrue) return

      issues.push({
        rule: 'aria-hidden-focus',
        severity: 'error',
        message: `<${name.name}> is focusable but has aria-hidden="true"`,
        suggestion:
          'Remove aria-hidden="true" from focusable elements. Screen readers will still encounter the element via keyboard navigation, creating a confusing experience. To hide from all users, use the hidden attribute or CSS display:none.',
        wcag: 'WCAG 4.1.2 (Level A)',
        line: path.node.loc?.start.line ?? 0,
        column: path.node.loc?.start.column ?? 0,
        filePath: parsed.filePath,
      })
    },
  })

  return issues
}
