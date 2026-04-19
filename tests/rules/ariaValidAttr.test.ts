import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { ariaValidAttrRule } from '../../src/rules/ariaValidAttr'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for valid aria-label', () => {
  const issues = ariaValidAttrRule(parseJSX(`<div aria-label="Search" />`))
  assert.equal(issues.length, 0)
})

test('no issue for valid aria-hidden', () => {
  const issues = ariaValidAttrRule(parseJSX(`<span aria-hidden="true" />`))
  assert.equal(issues.length, 0)
})

test('no issue for valid aria-expanded', () => {
  const issues = ariaValidAttrRule(parseJSX(`<button aria-expanded={open} />`))
  assert.equal(issues.length, 0)
})

test('no issue for valid aria-describedby', () => {
  const issues = ariaValidAttrRule(parseJSX(`<input aria-describedby="hint" />`))
  assert.equal(issues.length, 0)
})

test('no issue for non-aria attributes', () => {
  const issues = ariaValidAttrRule(parseJSX(`<div className="foo" id="bar" />`))
  assert.equal(issues.length, 0)
})

test('error for made-up aria attribute', () => {
  const issues = ariaValidAttrRule(parseJSX(`<div aria-fake="value" />`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'aria-valid-attr')
  assert.equal(issues[0].severity, 'error')
  assert.match(issues[0].message, /aria-fake/)
})

test('error for misspelled aria attribute', () => {
  const issues = ariaValidAttrRule(parseJSX(`<div aria-labell="Search" />`))
  assert.equal(issues.length, 1)
  assert.match(issues[0].message, /aria-labell/)
})

test('multiple invalid attrs produce one issue each', () => {
  const issues = ariaValidAttrRule(parseJSX(`<div aria-foo="1" aria-bar="2" />`))
  assert.equal(issues.length, 2)
})

test('filePath is attached to issue', () => {
  const issues = ariaValidAttrRule(parseJSX(`<div aria-fake="x" />`, 'src/Widget.tsx'))
  assert.equal(issues[0].filePath, 'src/Widget.tsx')
})
