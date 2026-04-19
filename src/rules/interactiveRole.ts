import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

const NON_INTERACTIVE = new Set([
  'div', 'span', 'p', 'section', 'article', 'aside',
  'main', 'header', 'footer', 'nav', 'li', 'td', 'th',
  'tr', 'table', 'ul', 'ol', 'dl', 'dt', 'dd', 'figure',
  'figcaption', 'blockquote', 'pre', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6',
])

function hasAttr(attrs: t.JSXOpeningElement['attributes'], attrName: string): boolean {
  return attrs.some(
    (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === attrName
  )
}

export function interactiveRoleRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      const name = path.node.name
      if (!t.isJSXIdentifier(name) || !NON_INTERACTIVE.has(name.name)) return

      const attrs = path.node.attributes
      if (!hasAttr(attrs, 'onClick')) return

      const hasRole = hasAttr(attrs, 'role')
      const hasKeyHandler =
        hasAttr(attrs, 'onKeyDown') ||
        hasAttr(attrs, 'onKeyUp') ||
        hasAttr(attrs, 'onKeyPress')
      const hasTabIndex = hasAttr(attrs, 'tabIndex')

      if (!hasRole || !hasKeyHandler || !hasTabIndex) {
        const missing: string[] = []
        if (!hasRole) missing.push('role="button" (or appropriate role)')
        if (!hasKeyHandler) missing.push('onKeyDown handler')
        if (!hasTabIndex) missing.push('tabIndex={0}')

        issues.push({
          rule: 'interactive-role',
          severity: 'error',
          message: `<${name.name}> has onClick but is not keyboard accessible`,
          suggestion: `Add ${missing.join(', ')}. Or replace with a <button> element.`,
          wcag: 'WCAG 2.1.1 (Level A)',
          line: path.node.loc?.start.line ?? 0,
          column: path.node.loc?.start.column ?? 0,
          filePath: parsed.filePath,
        })
      }
    },
  })

  return issues
}
