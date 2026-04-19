import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { interactiveRoleRule } from '../../src/rules/interactiveRole'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for button with onClick', () => {
  const issues = interactiveRoleRule(parseJSX(`<button onClick={fn}>Click</button>`))
  assert.equal(issues.length, 0)
})

test('no issue for div with onClick, role, onKeyDown, and tabIndex', () => {
  const issues = interactiveRoleRule(parseJSX(
    `<div onClick={fn} role="button" onKeyDown={fn} tabIndex={0}>Click</div>`
  ))
  assert.equal(issues.length, 0)
})

test('no issue for div with no onClick', () => {
  const issues = interactiveRoleRule(parseJSX(`<div>Content</div>`))
  assert.equal(issues.length, 0)
})

test('error for div with onClick and no role, keyHandler, or tabIndex', () => {
  const issues = interactiveRoleRule(parseJSX(`<div onClick={fn}>Click</div>`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'interactive-role')
  assert.equal(issues[0].severity, 'error')
  assert.match(issues[0].message, /not keyboard accessible/)
})

test('error for span with onClick', () => {
  const issues = interactiveRoleRule(parseJSX(`<span onClick={fn}>Click</span>`))
  assert.equal(issues.length, 1)
})

test('error for div with onClick and role but missing keyHandler and tabIndex', () => {
  const issues = interactiveRoleRule(parseJSX(
    `<div onClick={fn} role="button">Click</div>`
  ))
  assert.equal(issues.length, 1)
  assert.match(issues[0].suggestion, /onKeyDown/)
  assert.match(issues[0].suggestion, /tabIndex/)
})

test('error for div with onClick and onKeyDown but missing role and tabIndex', () => {
  const issues = interactiveRoleRule(parseJSX(
    `<div onClick={fn} onKeyDown={fn}>Click</div>`
  ))
  assert.equal(issues.length, 1)
  assert.match(issues[0].suggestion, /role/)
})

test('error for li with onClick', () => {
  const issues = interactiveRoleRule(parseJSX(`<li onClick={fn}>Item</li>`))
  assert.equal(issues.length, 1)
})

test('filePath is attached to issue', () => {
  const issues = interactiveRoleRule(parseJSX(`<div onClick={fn}>x</div>`, 'src/Card.tsx'))
  assert.equal(issues[0].filePath, 'src/Card.tsx')
})
