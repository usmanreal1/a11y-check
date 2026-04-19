import { test } from 'node:test'
import assert from 'node:assert/strict'
import { applyIgnoreComments, applyConfigRules } from '../src/filter'
import type { Issue } from '../src/rules/altText'

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    rule: 'alt-text',
    severity: 'error',
    message: 'test issue',
    suggestion: 'fix it',
    wcag: 'WCAG 1.1.1 (Level A)',
    line: 3,
    column: 0,
    filePath: 'test.tsx',
    ...overrides,
  }
}

// ─── applyIgnoreComments ────────────────────────────────────────────────────

test('keeps issue when no ignore comment above', () => {
  const source = `const x = 1\n<img src="x.jpg" />`
  const issues = [makeIssue({ line: 2 })]
  assert.equal(applyIgnoreComments(issues, source).length, 1)
})

test('suppresses issue with // a11y-ignore-next-line (all rules)', () => {
  const source = `// a11y-ignore-next-line\n<img src="x.jpg" />`
  const issues = [makeIssue({ line: 2 })]
  assert.equal(applyIgnoreComments(issues, source).length, 0)
})

test('suppresses issue with JSX comment {/* a11y-ignore-next-line */}', () => {
  const source = `{/* a11y-ignore-next-line */}\n<img src="x.jpg" />`
  const issues = [makeIssue({ line: 2 })]
  assert.equal(applyIgnoreComments(issues, source).length, 0)
})

test('suppresses only the named rule', () => {
  const source = `// a11y-ignore-next-line alt-text\n<img src="x.jpg" />`
  const issues = [makeIssue({ line: 2, rule: 'alt-text' })]
  assert.equal(applyIgnoreComments(issues, source).length, 0)
})

test('keeps issue when named rule does not match', () => {
  const source = `// a11y-ignore-next-line button-label\n<img src="x.jpg" />`
  const issues = [makeIssue({ line: 2, rule: 'alt-text' })]
  assert.equal(applyIgnoreComments(issues, source).length, 1)
})

test('suppresses multiple named rules in one comment', () => {
  const source = `// a11y-ignore-next-line alt-text, button-label\n<line />`
  const altIssue = makeIssue({ line: 2, rule: 'alt-text' })
  const btnIssue = makeIssue({ line: 2, rule: 'button-label' })
  const result = applyIgnoreComments([altIssue, btnIssue], source)
  assert.equal(result.length, 0)
})

test('only suppresses the line directly after the comment', () => {
  const source = `// a11y-ignore-next-line\n<img src="a.jpg" />\n<img src="b.jpg" />`
  const issues = [makeIssue({ line: 2 }), makeIssue({ line: 3 })]
  const result = applyIgnoreComments(issues, source)
  assert.equal(result.length, 1)
  assert.equal(result[0].line, 3)
})

test('issue on line 1 is never suppressed (no line above)', () => {
  const source = `<img src="x.jpg" />`
  const issues = [makeIssue({ line: 1 })]
  assert.equal(applyIgnoreComments(issues, source).length, 1)
})

// ─── applyConfigRules ───────────────────────────────────────────────────────

test('keeps all issues when rules config is empty', () => {
  const issues = [makeIssue(), makeIssue({ rule: 'button-label' })]
  assert.equal(applyConfigRules(issues, {}).length, 2)
})

test('removes issues for rules set to "off"', () => {
  const issues = [makeIssue({ rule: 'alt-text' }), makeIssue({ rule: 'button-label' })]
  const result = applyConfigRules(issues, { 'alt-text': 'off' })
  assert.equal(result.length, 1)
  assert.equal(result[0].rule, 'button-label')
})

test('overrides severity from error to warning', () => {
  const issues = [makeIssue({ rule: 'heading-order', severity: 'error' })]
  const result = applyConfigRules(issues, { 'heading-order': 'warning' })
  assert.equal(result[0].severity, 'warning')
})

test('overrides severity from warning to error', () => {
  const issues = [makeIssue({ rule: 'heading-order', severity: 'warning' })]
  const result = applyConfigRules(issues, { 'heading-order': 'error' })
  assert.equal(result[0].severity, 'error')
})

test('does not mutate original issue object', () => {
  const original = makeIssue({ rule: 'heading-order', severity: 'warning' })
  applyConfigRules([original], { 'heading-order': 'error' })
  assert.equal(original.severity, 'warning')
})
