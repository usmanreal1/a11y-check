import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

function hasDirectCaption(children: t.JSXElement['children']): boolean {
  for (const child of children) {
    if (!t.isJSXElement(child)) continue
    const name = child.openingElement.name
    if (t.isJSXIdentifier(name) && name.name === 'caption') return true
  }
  return false
}

export function tableCaptionsRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      const name = path.node.name
      if (!t.isJSXIdentifier(name) || name.name !== 'table') return

      const attrs = path.node.attributes

      const hasAriaLabel = attrs.some(
        (a) =>
          t.isJSXAttribute(a) &&
          t.isJSXIdentifier(a.name) &&
          (a.name.name === 'aria-label' || a.name.name === 'aria-labelledby') &&
          a.value !== null
      )
      if (hasAriaLabel) return

      if (!t.isJSXElement(path.parent)) return

      if (hasDirectCaption(path.parent.children)) return

      issues.push({
        rule: 'table-captions',
        severity: 'warning',
        message: '<table> has no caption or accessible label',
        suggestion:
          'Add a <caption> as the first child of <table>, or use aria-label="..." / aria-labelledby="id" on the <table> element to describe its purpose.',
        wcag: 'WCAG 1.3.1 (Level A)',
        line: path.node.loc?.start.line ?? 0,
        column: path.node.loc?.start.column ?? 0,
        filePath: parsed.filePath,
      })
    },
  })

  return issues
}
