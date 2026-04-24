import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { tabIndexRule } from '../../src/rules/tabIndex'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for tabIndex={0}', () => {
  const issues = tabIndexRule(parseJSX(`<div tabIndex={0}>click</div>`))
  assert.equal(issues.length, 0)
})

test('no issue for tabIndex={-1}', () => {
  const issues = tabIndexRule(parseJSX(`<button tabIndex={-1}>hidden</button>`))
  assert.equal(issues.length, 0)
})

test('no issue for element without tabIndex', () => {
  const issues = tabIndexRule(parseJSX(`<div onClick={() => {}}>click</div>`))
  assert.equal(issues.length, 0)
})

test('warning for tabIndex={1}', () => {
  const issues = tabIndexRule(parseJSX(`<div tabIndex={1}>click</div>`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'tab-index')
  assert.equal(issues[0].severity, 'warning')
})

test('warning for tabIndex={5} on a button', () => {
  const issues = tabIndexRule(parseJSX(`<button tabIndex={5}>Submit</button>`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'tab-index')
})

test('warning for tabIndex as string "2"', () => {
  const issues = tabIndexRule(parseJSX(`<input tabIndex="2" />`))
  assert.equal(issues.length, 1)
})

test('no issue for tabIndex as string "0"', () => {
  const issues = tabIndexRule(parseJSX(`<input tabIndex="0" />`))
  assert.equal(issues.length, 0)
})

test('no issue for tabIndex as string "-1"', () => {
  const issues = tabIndexRule(parseJSX(`<input tabIndex="-1" />`))
  assert.equal(issues.length, 0)
})

test('message includes the offending tabIndex value', () => {
  const issues = tabIndexRule(parseJSX(`<span tabIndex={3}>text</span>`))
  assert.ok(issues[0].message.includes('3'))
})

test('filePath is attached to issue', () => {
  const issues = tabIndexRule(parseJSX(`<div tabIndex={1}>x</div>`, 'src/Nav.tsx'))
  assert.equal(issues[0].filePath, 'src/Nav.tsx')
})

test('line is a positive integer', () => {
  const issues = tabIndexRule(parseJSX(`<div tabIndex={2}>x</div>`))
  assert.ok(issues[0].line > 0)
})

test('elements without positive tabIndex are ignored', () => {
  const issues = tabIndexRule(parseJSX(`<div><p>Hello</p><a href="/">Link</a></div>`))
  assert.equal(issues.length, 0)
})
