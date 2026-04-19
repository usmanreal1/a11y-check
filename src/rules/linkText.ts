import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

const NON_DESCRIPTIVE = new Set([
  'click here', 'here', 'read more', 'more', 'link', 'this',
  'learn more', 'click', 'tap here', 'go', 'continue', 'details',
  'info', 'information', 'see more', 'view more', 'view', 'open',
])

function hasDynamicContent(children: t.JSXElement['children']): boolean {
  for (const child of children) {
    if (t.isJSXExpressionContainer(child) && !t.isJSXEmptyExpression(child.expression)) return true
    if (t.isJSXElement(child) && hasDynamicContent(child.children)) return true
  }
  return false
}

function extractText(children: t.JSXElement['children']): string {
  let text = ''
  for (const child of children) {
    if (t.isJSXText(child)) {
      text += child.value.trim()
    } else if (t.isJSXElement(child)) {
      const name = child.openingElement.name
      if (t.isJSXIdentifier(name) && name.name === 'img') {
        const altAttr = child.openingElement.attributes.find(
          (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'alt'
        )
        if (altAttr && t.isJSXAttribute(altAttr) && t.isStringLiteral(altAttr.value)) {
          text += altAttr.value.value.trim()
        }
      } else {
        text += extractText(child.children)
      }
    }
  }
  return text
}

export function linkTextRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      const name = path.node.name
      if (!t.isJSXIdentifier(name) || name.name !== 'a') return

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
      if (hasDynamicContent(element.children)) return

      const text = extractText(element.children).toLowerCase()

      if (text.length === 0) {
        issues.push({
          rule: 'link-text',
          severity: 'error',
          message: '<a> has no accessible text',
          suggestion: 'Add descriptive text content or aria-label="..." to the link',
          wcag: 'WCAG 2.4.6 (Level AA)',
          line: path.node.loc?.start.line ?? 0,
          column: path.node.loc?.start.column ?? 0,
          filePath: parsed.filePath,
        })
        return
      }

      if (NON_DESCRIPTIVE.has(text)) {
        issues.push({
          rule: 'link-text',
          severity: 'warning',
          message: `<a> has non-descriptive text: "${text}"`,
          suggestion:
            'Use text that describes the destination or purpose, e.g. "Read our accessibility guide"',
          wcag: 'WCAG 2.4.6 (Level AA)',
          line: path.node.loc?.start.line ?? 0,
          column: path.node.loc?.start.column ?? 0,
          filePath: parsed.filePath,
        })
      }
    },
  })

  return issues
}
