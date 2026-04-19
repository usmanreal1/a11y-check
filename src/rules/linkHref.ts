import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

export function linkHrefRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      const name = path.node.name
      if (!t.isJSXIdentifier(name) || name.name !== 'a') return

      const attrs = path.node.attributes

      const hrefAttr = attrs.find(
        (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'href'
      )

      if (!hrefAttr) {
        issues.push({
          rule: 'link-href',
          severity: 'error',
          message: '<a> is missing an href attribute',
          suggestion: 'Add href="..." with a valid URL, or use a <button> if this is a click action',
          wcag: 'WCAG 2.4.1 (Level A)',
          line: path.node.loc?.start.line ?? 0,
          column: path.node.loc?.start.column ?? 0,
          filePath: parsed.filePath,
        })
        return
      }

      if (!t.isJSXAttribute(hrefAttr) || !t.isStringLiteral(hrefAttr.value)) return

      const href = hrefAttr.value.value.trim()

      if (href === '') {
        issues.push({
          rule: 'link-href',
          severity: 'error',
          message: '<a> has an empty href attribute',
          suggestion: 'Provide a valid URL or use a <button> for in-page actions',
          wcag: 'WCAG 2.4.1 (Level A)',
          line: path.node.loc?.start.line ?? 0,
          column: path.node.loc?.start.column ?? 0,
          filePath: parsed.filePath,
        })
        return
      }

      if (href === '#') {
        issues.push({
          rule: 'link-href',
          severity: 'warning',
          message: '<a href="#"> does not navigate anywhere',
          suggestion: 'Use a real URL, an anchor id (href="#section"), or replace with a <button>',
          wcag: 'WCAG 2.4.1 (Level A)',
          line: path.node.loc?.start.line ?? 0,
          column: path.node.loc?.start.column ?? 0,
          filePath: parsed.filePath,
        })
      }
    },
  })

  return issues
}
