import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { headingOrderRule } from '../../src/rules/headingOrder'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for correct heading order h1 -> h2 -> h3', () => {
  const issues = headingOrderRule(parseJSX(`
    <div><h1>Title</h1><h2>Section</h2><h3>Subsection</h3></div>
  `))
  assert.equal(issues.length, 0)
})

test('no issue for single heading', () => {
  const issues = headingOrderRule(parseJSX(`<h1>Title</h1>`))
  assert.equal(issues.length, 0)
})

test('no issue for no headings', () => {
  const issues = headingOrderRule(parseJSX(`<div><p>Text</p></div>`))
  assert.equal(issues.length, 0)
})

test('no issue for h1 -> h2 (valid step down)', () => {
  const issues = headingOrderRule(parseJSX(`<div><h1>Title</h1><h2>Sub</h2></div>`))
  assert.equal(issues.length, 0)
})

test('warning for h1 -> h3 (skipped level)', () => {
  const issues = headingOrderRule(parseJSX(`<div><h1>Title</h1><h3>Sub</h3></div>`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'heading-order')
  assert.equal(issues[0].severity, 'warning')
  assert.match(issues[0].message, /h1.*h3/)
})

test('warning for h2 -> h4 (skipped level)', () => {
  const issues = headingOrderRule(parseJSX(`<div><h2>Title</h2><h4>Sub</h4></div>`))
  assert.equal(issues.length, 1)
  assert.match(issues[0].message, /h2.*h4/)
})

test('no issue for going back up in level (h3 -> h2 is valid)', () => {
  const issues = headingOrderRule(parseJSX(`
    <div><h1>A</h1><h2>B</h2><h3>C</h3><h2>D</h2></div>
  `))
  assert.equal(issues.length, 0)
})

test('filePath is attached to issue', () => {
  const issues = headingOrderRule(parseJSX(`<div><h1>A</h1><h3>B</h3></div>`, 'src/Page.tsx'))
  assert.equal(issues[0].filePath, 'src/Page.tsx')
})
