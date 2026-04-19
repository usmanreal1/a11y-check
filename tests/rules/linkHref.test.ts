import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { linkHrefRule } from '../../src/rules/linkHref'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for link with valid href', () => {
  const issues = linkHrefRule(parseJSX(`<a href="/about">About</a>`))
  assert.equal(issues.length, 0)
})

test('no issue for link with external href', () => {
  const issues = linkHrefRule(parseJSX(`<a href="https://example.com">Visit</a>`))
  assert.equal(issues.length, 0)
})

test('no issue for link with anchor href', () => {
  const issues = linkHrefRule(parseJSX(`<a href="#section-1">Jump</a>`))
  assert.equal(issues.length, 0)
})

test('no issue for dynamic href expression', () => {
  const issues = linkHrefRule(parseJSX(`<a href={url}>Link</a>`))
  assert.equal(issues.length, 0)
})

test('error for link with no href', () => {
  const issues = linkHrefRule(parseJSX(`<a>Click</a>`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'link-href')
  assert.equal(issues[0].severity, 'error')
  assert.match(issues[0].message, /missing an href/)
})

test('error for link with empty href', () => {
  const issues = linkHrefRule(parseJSX(`<a href="">Click</a>`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].severity, 'error')
  assert.match(issues[0].message, /empty href/)
})

test('warning for href="#"', () => {
  const issues = linkHrefRule(parseJSX(`<a href="#">Click</a>`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].severity, 'warning')
  assert.match(issues[0].message, /does not navigate/)
})

test('filePath is attached to issue', () => {
  const issues = linkHrefRule(parseJSX(`<a>Click</a>`, 'src/Nav.tsx'))
  assert.equal(issues[0].filePath, 'src/Nav.tsx')
})

test('non-anchor elements are ignored', () => {
  const issues = linkHrefRule(parseJSX(`<button>Click</button>`))
  assert.equal(issues.length, 0)
})
