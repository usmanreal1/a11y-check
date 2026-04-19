import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

function hasAccessibleText(children: t.JSXElement['children']): boolean {
  for (const child of children) {
    if (t.isJSXText(child) && child.value.trim().length > 0) return true
    if (t.isJSXExpressionContainer(child) && !t.isJSXEmptyExpression(child.expression)) return true
    if (t.isJSXElement(child)) {
      const name = child.openingElement.name
      // img with non-empty alt counts as accessible text
      if (t.isJSXIdentifier(name) && name.name === 'img') {
        const altAttr = child.openingElement.attributes.find(
          (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'alt'
        )
        if (
          altAttr &&
          t.isJSXAttribute(altAttr) &&
          t.isStringLiteral(altAttr.value) &&
          altAttr.value.value.trim().length > 0
        ) return true
      } else {
        if (hasAccessibleText(child.children)) return true
      }
    }
  }
  return false
}

export function buttonLabelRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      const name = path.node.name
      if (!t.isJSXIdentifier(name) || name.name !== 'button') return

      const attrs = path.node.attributes

      const hasAriaLabel = attrs.some(
        (a) =>
          t.isJSXAttribute(a) &&
          t.isJSXIdentifier(a.name) &&
          (a.name.name === 'aria-label' || a.name.name === 'aria-labelledby') &&
          a.value !== null
      )
      if (hasAriaLabel) return

      const element = path.parent as t.JSXElement
      if (!hasAccessibleText(element.children)) {
        issues.push({
          rule: 'button-label',
          severity: 'error',
          message: '<button> has no accessible label',
          suggestion:
            'Add visible text content, aria-label="...", or aria-labelledby="id"',
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
