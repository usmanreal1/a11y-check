import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

export function langAttributeRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      const name = path.node.name
      if (!t.isJSXIdentifier(name) || name.name !== 'html') return

      const attrs = path.node.attributes

      const langAttr = attrs.find(
        (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'lang'
      )

      if (!langAttr) {
        issues.push({
          rule: 'lang-attribute',
          severity: 'error',
          message: '<html> is missing a lang attribute',
          suggestion: 'Add lang="en" (or the appropriate language code) to the <html> element',
          wcag: 'WCAG 3.1.1 (Level A)',
          line: path.node.loc?.start.line ?? 0,
          column: path.node.loc?.start.column ?? 0,
          filePath: parsed.filePath,
        })
        return
      }

      if (
        t.isJSXAttribute(langAttr) &&
        t.isStringLiteral(langAttr.value) &&
        langAttr.value.value.trim().length === 0
      ) {
        issues.push({
          rule: 'lang-attribute',
          severity: 'error',
          message: '<html> has an empty lang attribute',
          suggestion: 'Provide a valid BCP 47 language tag, e.g. lang="en" or lang="en-US"',
          wcag: 'WCAG 3.1.1 (Level A)',
          line: path.node.loc?.start.line ?? 0,
          column: path.node.loc?.start.column ?? 0,
          filePath: parsed.filePath,
        })
      }
    },
  })

  return issues
}
