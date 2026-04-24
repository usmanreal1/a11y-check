import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { ariaHiddenFocusRule } from '../../src/rules/ariaHiddenFocus'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for non-focusable element with aria-hidden', () => {
  const issues = ariaHiddenFocusRule(parseJSX(`<div aria-hidden="true">icon</div>`))
  assert.equal(issues.length, 0)
})

test('no issue for button without aria-hidden', () => {
  const issues = ariaHiddenFocusRule(parseJSX(`<button>Submit</button>`))
  assert.equal(issues.length, 0)
})

test('no issue for aria-hidden="false" on button', () => {
  const issues = ariaHiddenFocusRule(parseJSX(`<button aria-hidden="false">Submit</button>`))
  assert.equal(issues.length, 0)
})

test('no issue for aria-hidden={false} on input', () => {
  const issues = ariaHiddenFocusRule(parseJSX(`<input aria-hidden={false} />`))
  assert.equal(issues.length, 0)
})

test('error for button with aria-hidden="true"', () => {
  const issues = ariaHiddenFocusRule(parseJSX(`<button aria-hidden="true">X</button>`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'aria-hidden-focus')
  assert.equal(issues[0].severity, 'error')
})

test('error for input with aria-hidden="true"', () => {
  const issues = ariaHiddenFocusRule(parseJSX(`<input type="text" aria-hidden="true" />`))
  assert.equal(issues.length, 1)
})

test('error for a with aria-hidden="true"', () => {
  const issues = ariaHiddenFocusRule(parseJSX(`<a href="/" aria-hidden="true">Home</a>`))
  assert.equal(issues.length, 1)
})

test('error for select with aria-hidden="true"', () => {
  const issues = ariaHiddenFocusRule(parseJSX(`<select aria-hidden="true"><option>A</option></select>`))
  assert.equal(issues.length, 1)
})

test('error for textarea with aria-hidden="true"', () => {
  const issues = ariaHiddenFocusRule(parseJSX(`<textarea aria-hidden="true" />`))
  assert.equal(issues.length, 1)
})

test('error for button with aria-hidden={true}', () => {
  const issues = ariaHiddenFocusRule(parseJSX(`<button aria-hidden={true}>X</button>`))
  assert.equal(issues.length, 1)
})

test('filePath is attached to issue', () => {
  const issues = ariaHiddenFocusRule(
    parseJSX(`<button aria-hidden="true">X</button>`, 'src/Modal.tsx')
  )
  assert.equal(issues[0].filePath, 'src/Modal.tsx')
})

test('line is a positive integer', () => {
  const issues = ariaHiddenFocusRule(parseJSX(`<button aria-hidden="true">X</button>`))
  assert.ok(issues[0].line > 0)
})
