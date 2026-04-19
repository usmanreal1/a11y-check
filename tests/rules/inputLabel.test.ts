import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { inputLabelRule } from '../../src/rules/inputLabel'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for input with aria-label', () => {
  const issues = inputLabelRule(parseJSX(`<input type="text" aria-label="Email address" />`))
  assert.equal(issues.length, 0)
})

test('no issue for input with aria-labelledby', () => {
  const issues = inputLabelRule(parseJSX(`<input type="text" aria-labelledby="email-label" />`))
  assert.equal(issues.length, 0)
})

test('no issue for input with id (label may be linked via htmlFor)', () => {
  const issues = inputLabelRule(parseJSX(`<input type="text" id="email" />`))
  assert.equal(issues.length, 0)
})

test('no issue for hidden input', () => {
  const issues = inputLabelRule(parseJSX(`<input type="hidden" name="csrf" />`))
  assert.equal(issues.length, 0)
})

test('no issue for submit input', () => {
  const issues = inputLabelRule(parseJSX(`<input type="submit" value="Send" />`))
  assert.equal(issues.length, 0)
})

test('no issue for button input', () => {
  const issues = inputLabelRule(parseJSX(`<input type="button" value="Click" />`))
  assert.equal(issues.length, 0)
})

test('no issue for reset input', () => {
  const issues = inputLabelRule(parseJSX(`<input type="reset" />`))
  assert.equal(issues.length, 0)
})

test('error for unlabelled text input', () => {
  const issues = inputLabelRule(parseJSX(`<input type="text" />`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'input-label')
  assert.equal(issues[0].severity, 'error')
})

test('error for input with no type and no label', () => {
  const issues = inputLabelRule(parseJSX(`<input />`))
  assert.equal(issues.length, 1)
})

test('error for email input with no label', () => {
  const issues = inputLabelRule(parseJSX(`<input type="email" />`))
  assert.equal(issues.length, 1)
})

test('filePath is attached to issue', () => {
  const issues = inputLabelRule(parseJSX(`<input type="text" />`, 'src/forms/Login.tsx'))
  assert.equal(issues[0].filePath, 'src/forms/Login.tsx')
})

test('non-input elements are ignored', () => {
  const issues = inputLabelRule(parseJSX(`<textarea />`))
  assert.equal(issues.length, 0)
})
