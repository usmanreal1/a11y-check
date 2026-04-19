import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { langAttributeRule } from '../../src/rules/langAttribute'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for html with lang', () => {
  const issues = langAttributeRule(parseJSX(`<html lang="en"><body /></html>`))
  assert.equal(issues.length, 0)
})

test('no issue for html with locale lang', () => {
  const issues = langAttributeRule(parseJSX(`<html lang="en-US"><body /></html>`))
  assert.equal(issues.length, 0)
})

test('no issue for non-html elements', () => {
  const issues = langAttributeRule(parseJSX(`<div><p>Hello</p></div>`))
  assert.equal(issues.length, 0)
})

test('error for html without lang', () => {
  const issues = langAttributeRule(parseJSX(`<html><body /></html>`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'lang-attribute')
  assert.equal(issues[0].severity, 'error')
  assert.match(issues[0].message, /missing a lang/)
})

test('error for html with empty lang', () => {
  const issues = langAttributeRule(parseJSX(`<html lang=""><body /></html>`))
  assert.equal(issues.length, 1)
  assert.match(issues[0].message, /empty lang/)
})

test('filePath is attached to issue', () => {
  const issues = langAttributeRule(parseJSX(`<html><body /></html>`, 'pages/_document.tsx'))
  assert.equal(issues[0].filePath, 'pages/_document.tsx')
})
