import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

export function tabIndexRule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      const attrs = path.node.attributes

      const tabIndexAttr = attrs.find(
        (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'tabIndex'
      )
      if (!tabIndexAttr || !t.isJSXAttribute(tabIndexAttr)) return

      let value: number | null = null

      if (t.isStringLiteral(tabIndexAttr.value)) {
        const parsed = parseInt(tabIndexAttr.value.value, 10)
        if (!isNaN(parsed)) value = parsed
      } else if (t.isJSXExpressionContainer(tabIndexAttr.value)) {
        const expr = tabIndexAttr.value.expression
        if (t.isNumericLiteral(expr)) {
          value = expr.value
        } else if (
          t.isUnaryExpression(expr) &&
          expr.operator === '-' &&
          t.isNumericLiteral(expr.argument)
        ) {
          value = -expr.argument.value
        }
      }

      if (value === null || value <= 0) return

      const name = path.node.name
      const tagName = t.isJSXIdentifier(name) ? name.name : 'element'

      issues.push({
        rule: 'tab-index',
        severity: 'warning',
        message: `<${tagName}> uses tabIndex={${value}}, which overrides natural tab order`,
        suggestion:
          'Use tabIndex={0} to include the element in natural tab order, or tabIndex={-1} for programmatic focus only. Positive tabIndex values create a separate, unpredictable tab sequence.',
        wcag: 'WCAG 2.4.3 (Level A)',
        line: path.node.loc?.start.line ?? 0,
        column: path.node.loc?.start.column ?? 0,
        filePath: parsed.filePath,
      })
    },
  })

  return issues
}
