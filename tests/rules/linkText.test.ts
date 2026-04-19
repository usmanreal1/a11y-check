import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { linkTextRule } from '../../src/rules/linkText'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for link with descriptive text', () => {
  const issues = linkTextRule(parseJSX(`<a href="/about">About our company</a>`))
  assert.equal(issues.length, 0)
})

test('no issue for link with aria-label', () => {
  const issues = linkTextRule(parseJSX(`<a href="/more" aria-label="Read our accessibility guide"></a>`))
  assert.equal(issues.length, 0)
})

test('no issue for link with img that has descriptive alt', () => {
  const issues = linkTextRule(parseJSX(`<a href="/home"><img src="logo.png" alt="Go to homepage" /></a>`))
  assert.equal(issues.length, 0)
})

test('no issue for link with dynamic expression content', () => {
  const issues = linkTextRule(parseJSX(`<a href="/page">{linkText}</a>`))
  assert.equal(issues.length, 0)
})

test('error for link with no text content', () => {
  const issues = linkTextRule(parseJSX(`<a href="/page"></a>`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'link-text')
  assert.equal(issues[0].severity, 'error')
  assert.match(issues[0].message, /no accessible text/)
})

test('warning for "click here"', () => {
  const issues = linkTextRule(parseJSX(`<a href="/page">click here</a>`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].severity, 'warning')
  assert.match(issues[0].message, /click here/)
})

test('warning for "read more"', () => {
  const issues = linkTextRule(parseJSX(`<a href="/page">read more</a>`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].severity, 'warning')
})

test('warning for "here"', () => {
  const issues = linkTextRule(parseJSX(`<a href="/page">here</a>`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].severity, 'warning')
})

test('warning for "learn more"', () => {
  const issues = linkTextRule(parseJSX(`<a href="/page">learn more</a>`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].severity, 'warning')
})

test('case-insensitive match for non-descriptive text', () => {
  const issues = linkTextRule(parseJSX(`<a href="/page">Click Here</a>`))
  assert.equal(issues.length, 1)
})

test('filePath is attached to issue', () => {
  const issues = linkTextRule(parseJSX(`<a href="/x"></a>`, 'src/Nav.tsx'))
  assert.equal(issues[0].filePath, 'src/Nav.tsx')
})

test('non-anchor elements are ignored', () => {
  const issues = linkTextRule(parseJSX(`<button>click here</button>`))
  assert.equal(issues.length, 0)
})
