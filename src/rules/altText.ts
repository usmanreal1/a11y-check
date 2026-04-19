import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'

export interface Issue {
  rule: string
  severity: 'error' | 'warning'
  message: string
  suggestion: string
  wcag: string
  line: number
  column: number
  filePath: string
}

export function altTextRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      const name = path.node.name

      // only check <img> elements
      if (!t.isJSXIdentifier(name) || name.name !== 'img') return

      const attrs = path.node.attributes

      const altAttr = attrs.find(
        (attr) =>
          t.isJSXAttribute(attr) &&
          t.isJSXIdentifier(attr.name) &&
          attr.name.name === 'alt'
      )

      // no alt attribute at all
      if (!altAttr) {
        issues.push({
          rule: 'alt-text',
          severity: 'error',
          message: '<img> is missing an alt attribute',
          suggestion:
            'Add alt="" for decorative images, or alt="description" for informative ones',
          wcag: 'WCAG 1.1.1 (Level A)',
          line: path.node.loc?.start.line ?? 0,
          column: path.node.loc?.start.column ?? 0,
          filePath: parsed.filePath,
        })
        return
      }

      // alt attribute exists but value is undefined (alt with no value)
      if (
        t.isJSXAttribute(altAttr) &&
        altAttr.value === null
      ) {
        issues.push({
          rule: 'alt-text',
          severity: 'error',
          message: '<img> has alt attribute with no value',
          suggestion:
            'Use alt="" for decorative images or provide a meaningful description',
          wcag: 'WCAG 1.1.1 (Level A)',
          line: path.node.loc?.start.line ?? 0,
          column: path.node.loc?.start.column ?? 0,
          filePath: parsed.filePath,
        })
      }
    },
  })

  return issues
}