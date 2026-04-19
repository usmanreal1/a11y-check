import type { Issue } from './rules/altText'
import type { RuleSeverity } from './config'

// Matches both styles:
//   // a11y-ignore-next-line
//   // a11y-ignore-next-line alt-text, button-label
//   {/* a11y-ignore-next-line */}
//   {/* a11y-ignore-next-line alt-text, button-label */}
function parseIgnoreComment(line: string): { ignore: boolean; rules: string[] } {
  const trimmed = line.trim()

  const jsMatch = trimmed.match(/^\/\/\s*a11y-ignore-next-line(.*)$/)
  const jsxMatch = trimmed.match(/^\{\/\*\s*a11y-ignore-next-line(.*?)\*\/\s*\}$/)

  const match = jsMatch ?? jsxMatch
  if (!match) return { ignore: false, rules: [] }

  const rest = match[1].trim()
  const rules = rest.length > 0
    ? rest.split(',').map((r) => r.trim()).filter(Boolean)
    : []

  return { ignore: true, rules }
}

export function applyIgnoreComments(issues: Issue[], source: string): Issue[] {
  const lines = source.split('\n')

  return issues.filter((issue) => {
    // issue.line is 1-based; the line above is at index issue.line - 2
    const lineAbove = lines[issue.line - 2] ?? ''
    const { ignore, rules } = parseIgnoreComment(lineAbove)

    if (!ignore) return true
    if (rules.length === 0) return false           // suppress all rules
    return !rules.includes(issue.rule)             // suppress only named rules
  })
}

export function applyConfigRules(
  issues: Issue[],
  rules: Record<string, RuleSeverity>
): Issue[] {
  return issues
    .filter((issue) => rules[issue.rule] !== 'off')
    .map((issue) => {
      const override = rules[issue.rule]
      if (!override || override === 'off') return issue
      return { ...issue, severity: override }
    })
}
