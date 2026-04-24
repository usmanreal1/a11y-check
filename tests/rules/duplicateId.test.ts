import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { duplicateIdRule } from '../../src/rules/duplicateId'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for unique ids', () => {
  const issues = duplicateIdRule(
    parseJSX(`<div><span id="a" /><span id="b" /></div>`)
  )
  assert.equal(issues.length, 0)
})

test('no issue for single element with an id', () => {
  const issues = duplicateIdRule(parseJSX(`<div id="main" />`))
  assert.equal(issues.length, 0)
})

test('no issue for dynamic ids (expression containers)', () => {
  const issues = duplicateIdRule(parseJSX(`<div><div id={itemId} /><div id={otherId} /></div>`))
  assert.equal(issues.length, 0)
})

test('error for two elements with the same id', () => {
  const issues = duplicateIdRule(
    parseJSX(`<div><span id="foo" /><p id="foo" /></div>`)
  )
  assert.equal(issues.length, 2)
  assert.equal(issues[0].rule, 'duplicate-id')
  assert.equal(issues[0].severity, 'error')
})

test('reports all occurrences when id appears three times', () => {
  const issues = duplicateIdRule(
    parseJSX(`<div><div id="x" /><div id="x" /><div id="x" /></div>`)
  )
  assert.equal(issues.length, 3)
})

test('message includes the duplicate id value', () => {
  const issues = duplicateIdRule(
    parseJSX(`<div><span id="header" /><span id="header" /></div>`)
  )
  assert.ok(issues[0].message.includes('header'))
})

test('elements without id are ignored', () => {
  const issues = duplicateIdRule(parseJSX(`<div><div /><p /><span /></div>`))
  assert.equal(issues.length, 0)
})

test('filePath is attached to issue', () => {
  const issues = duplicateIdRule(
    parseJSX(`<div><div id="foo" /><div id="foo" /></div>`, 'src/Page.tsx')
  )
  assert.equal(issues[0].filePath, 'src/Page.tsx')
})

test('line is a positive integer', () => {
  const issues = duplicateIdRule(
    parseJSX(`<div><div id="dup" /><div id="dup" /></div>`)
  )
  assert.ok(issues[0].line > 0)
})
