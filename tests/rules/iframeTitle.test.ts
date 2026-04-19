import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { iframeTitleRule } from '../../src/rules/iframeTitle'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for iframe with title', () => {
  const issues = iframeTitleRule(parseJSX(`<iframe src="map.html" title="Store location map" />`))
  assert.equal(issues.length, 0)
})

test('no issue for non-iframe elements', () => {
  const issues = iframeTitleRule(parseJSX(`<div />`))
  assert.equal(issues.length, 0)
})

test('error for iframe with no title', () => {
  const issues = iframeTitleRule(parseJSX(`<iframe src="map.html" />`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'iframe-title')
  assert.equal(issues[0].severity, 'error')
  assert.match(issues[0].message, /missing a title/)
})

test('error for iframe with empty title', () => {
  const issues = iframeTitleRule(parseJSX(`<iframe src="map.html" title="" />`))
  assert.equal(issues.length, 1)
  assert.match(issues[0].message, /empty title/)
})

test('filePath is attached to issue', () => {
  const issues = iframeTitleRule(parseJSX(`<iframe src="x.html" />`, 'src/Map.tsx'))
  assert.equal(issues[0].filePath, 'src/Map.tsx')
})
