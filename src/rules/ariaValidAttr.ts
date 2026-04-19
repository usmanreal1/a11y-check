import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

const VALID_ARIA_ATTRS = new Set([
  'aria-activedescendant', 'aria-atomic', 'aria-autocomplete', 'aria-busy',
  'aria-checked', 'aria-colcount', 'aria-colindex', 'aria-colspan',
  'aria-controls', 'aria-current', 'aria-describedby', 'aria-details',
  'aria-disabled', 'aria-dropeffect', 'aria-errormessage', 'aria-expanded',
  'aria-flowto', 'aria-grabbed', 'aria-haspopup', 'aria-hidden',
  'aria-invalid', 'aria-keyshortcuts', 'aria-label', 'aria-labelledby',
  'aria-level', 'aria-live', 'aria-modal', 'aria-multiline',
  'aria-multiselectable', 'aria-orientation', 'aria-owns', 'aria-placeholder',
  'aria-posinset', 'aria-pressed', 'aria-readonly', 'aria-relevant',
  'aria-required', 'aria-roledescription', 'aria-rowcount', 'aria-rowindex',
  'aria-rowspan', 'aria-selected', 'aria-setsize', 'aria-sort',
  'aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext',
])

export function ariaValidAttrRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      for (const attr of path.node.attributes) {
        if (!t.isJSXAttribute(attr)) continue
        if (!t.isJSXIdentifier(attr.name)) continue

        const attrName = attr.name.name
        if (!attrName.startsWith('aria-')) continue

        if (!VALID_ARIA_ATTRS.has(attrName)) {
          issues.push({
            rule: 'aria-valid-attr',
            severity: 'error',
            message: `"${attrName}" is not a valid ARIA attribute`,
            suggestion: `Check the ARIA spec for the correct attribute name. Valid attributes include aria-label, aria-labelledby, aria-hidden, etc.`,
            wcag: 'WCAG 4.1.2 (Level A)',
            line: attr.loc?.start.line ?? 0,
            column: attr.loc?.start.column ?? 0,
            filePath: parsed.filePath,
          })
        }
      }
    },
  })

  return issues
}
