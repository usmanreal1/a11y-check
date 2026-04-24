import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { textareaLabelRule } from '../../src/rules/textareaLabel'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for textarea with aria-label', () => {
  const issues = textareaLabelRule(parseJSX(`<textarea aria-label="Message" />`))
  assert.equal(issues.length, 0)
})

test('no issue for textarea with aria-labelledby', () => {
  const issues = textareaLabelRule(parseJSX(`<textarea aria-labelledby="msg-label" />`))
  assert.equal(issues.length, 0)
})

test('no issue for textarea with id', () => {
  const issues = textareaLabelRule(parseJSX(`<textarea id="message" />`))
  assert.equal(issues.length, 0)
})

test('error for textarea with no label', () => {
  const issues = textareaLabelRule(parseJSX(`<textarea />`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'textarea-label')
  assert.equal(issues[0].severity, 'error')
})

test('error for textarea with placeholder but no label', () => {
  const issues = textareaLabelRule(parseJSX(`<textarea placeholder="Enter message..." />`))
  assert.equal(issues.length, 1)
})

test('non-textarea elements are ignored', () => {
  const issues = textareaLabelRule(parseJSX(`<input type="text" />`))
  assert.equal(issues.length, 0)
})

test('filePath is attached to issue', () => {
  const issues = textareaLabelRule(
    parseJSX(`<textarea />`, 'src/ContactForm.tsx')
  )
  assert.equal(issues[0].filePath, 'src/ContactForm.tsx')
})

test('line is a positive integer', () => {
  const issues = textareaLabelRule(parseJSX(`<textarea />`))
  assert.ok(issues[0].line > 0)
})
