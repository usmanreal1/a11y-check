import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { selectLabelRule } from '../../src/rules/selectLabel'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for select with aria-label', () => {
  const issues = selectLabelRule(parseJSX(`<select aria-label="Country"><option>US</option></select>`))
  assert.equal(issues.length, 0)
})

test('no issue for select with aria-labelledby', () => {
  const issues = selectLabelRule(parseJSX(`<select aria-labelledby="country-label"><option>US</option></select>`))
  assert.equal(issues.length, 0)
})

test('no issue for select with id (label may be linked via htmlFor)', () => {
  const issues = selectLabelRule(parseJSX(`<select id="country"><option>US</option></select>`))
  assert.equal(issues.length, 0)
})

test('error for select with no label', () => {
  const issues = selectLabelRule(parseJSX(`<select><option>US</option></select>`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'select-label')
  assert.equal(issues[0].severity, 'error')
})

test('non-select elements are ignored', () => {
  const issues = selectLabelRule(parseJSX(`<input type="text" />`))
  assert.equal(issues.length, 0)
})

test('filePath is attached to issue', () => {
  const issues = selectLabelRule(
    parseJSX(`<select><option>A</option></select>`, 'src/Form.tsx')
  )
  assert.equal(issues[0].filePath, 'src/Form.tsx')
})

test('line is a positive integer', () => {
  const issues = selectLabelRule(parseJSX(`<select><option>A</option></select>`))
  assert.ok(issues[0].line > 0)
})
