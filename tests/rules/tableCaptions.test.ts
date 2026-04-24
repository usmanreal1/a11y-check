import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { tableCaptionsRule } from '../../src/rules/tableCaptions'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for table with caption', () => {
  const issues = tableCaptionsRule(
    parseJSX(`<table><caption>Sales Q1</caption><tbody><tr><td>A</td></tr></tbody></table>`)
  )
  assert.equal(issues.length, 0)
})

test('no issue for table with aria-label', () => {
  const issues = tableCaptionsRule(
    parseJSX(`<table aria-label="Sales data"><tbody><tr><td>A</td></tr></tbody></table>`)
  )
  assert.equal(issues.length, 0)
})

test('no issue for table with aria-labelledby', () => {
  const issues = tableCaptionsRule(
    parseJSX(`<table aria-labelledby="tbl-title"><tbody><tr><td>A</td></tr></tbody></table>`)
  )
  assert.equal(issues.length, 0)
})

test('warning for table with no caption or aria-label', () => {
  const issues = tableCaptionsRule(
    parseJSX(`<table><tbody><tr><td>A</td></tr></tbody></table>`)
  )
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'table-captions')
  assert.equal(issues[0].severity, 'warning')
})

test('non-table elements are ignored', () => {
  const issues = tableCaptionsRule(parseJSX(`<div><p>Hello</p></div>`))
  assert.equal(issues.length, 0)
})

test('filePath is attached to issue', () => {
  const issues = tableCaptionsRule(
    parseJSX(`<table><tbody><tr><td>A</td></tr></tbody></table>`, 'src/Report.tsx')
  )
  assert.equal(issues[0].filePath, 'src/Report.tsx')
})

test('line is a positive integer', () => {
  const issues = tableCaptionsRule(
    parseJSX(`<table><tbody><tr><td>A</td></tr></tbody></table>`)
  )
  assert.ok(issues[0].line > 0)
})
