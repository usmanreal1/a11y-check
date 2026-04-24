import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { tableHeadersRule } from '../../src/rules/tableHeaders'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for table with th and td', () => {
  const issues = tableHeadersRule(
    parseJSX(`
      <table>
        <thead><tr><th scope="col">Name</th><th scope="col">Age</th></tr></thead>
        <tbody><tr><td>Alice</td><td>30</td></tr></tbody>
      </table>
    `)
  )
  assert.equal(issues.length, 0)
})

test('no issue for table with only th cells (no td)', () => {
  const issues = tableHeadersRule(
    parseJSX(`<table><tr><th>A</th><th>B</th></tr></table>`)
  )
  assert.equal(issues.length, 0)
})

test('error for table with td but no th', () => {
  const issues = tableHeadersRule(
    parseJSX(`<table><tbody><tr><td>Alice</td><td>30</td></tr></tbody></table>`)
  )
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'table-headers')
  assert.equal(issues[0].severity, 'error')
})

test('non-table elements are ignored', () => {
  const issues = tableHeadersRule(parseJSX(`<div><p>Hello</p></div>`))
  assert.equal(issues.length, 0)
})

test('filePath is attached to issue', () => {
  const issues = tableHeadersRule(
    parseJSX(`<table><tr><td>A</td></tr></table>`, 'src/DataTable.tsx')
  )
  assert.equal(issues[0].filePath, 'src/DataTable.tsx')
})

test('line is a positive integer', () => {
  const issues = tableHeadersRule(
    parseJSX(`<table><tbody><tr><td>A</td></tr></tbody></table>`)
  )
  assert.ok(issues[0].line > 0)
})

test('th nested inside thead is found', () => {
  const issues = tableHeadersRule(
    parseJSX(`
      <table>
        <thead><tr><th>Col</th></tr></thead>
        <tbody><tr><td>Val</td></tr></tbody>
      </table>
    `)
  )
  assert.equal(issues.length, 0)
})
