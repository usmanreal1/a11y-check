import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { buttonLabelRule } from '../../src/rules/buttonLabel'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for button with text content', () => {
  const issues = buttonLabelRule(parseJSX(`<button>Submit</button>`))
  assert.equal(issues.length, 0)
})

test('no issue for button with aria-label', () => {
  const issues = buttonLabelRule(parseJSX(`<button aria-label="Close dialog" />`))
  assert.equal(issues.length, 0)
})

test('no issue for button with aria-labelledby', () => {
  const issues = buttonLabelRule(parseJSX(`<button aria-labelledby="label-id"></button>`))
  assert.equal(issues.length, 0)
})

test('no issue for button with img that has descriptive alt', () => {
  const issues = buttonLabelRule(parseJSX(`<button><img src="x.svg" alt="Delete item" /></button>`))
  assert.equal(issues.length, 0)
})

test('no issue for button with dynamic expression content', () => {
  const issues = buttonLabelRule(parseJSX(`<button>{label}</button>`))
  assert.equal(issues.length, 0)
})

test('error for self-closing button with no label', () => {
  const issues = buttonLabelRule(parseJSX(`<button />`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'button-label')
  assert.equal(issues[0].severity, 'error')
})

test('error for empty button', () => {
  const issues = buttonLabelRule(parseJSX(`<button></button>`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'button-label')
})

test('error for button with only whitespace text', () => {
  const issues = buttonLabelRule(parseJSX(`<button>   </button>`))
  assert.equal(issues.length, 1)
})

test('error for button with img that has no alt', () => {
  const issues = buttonLabelRule(parseJSX(`<button><img src="icon.svg" /></button>`))
  assert.equal(issues.length, 1)
})

test('error for button with img that has empty alt', () => {
  const issues = buttonLabelRule(parseJSX(`<button><img src="icon.svg" alt="" /></button>`))
  assert.equal(issues.length, 1)
})

test('filePath is attached to issue', () => {
  const issues = buttonLabelRule(parseJSX(`<button />`, 'src/components/Nav.tsx'))
  assert.equal(issues[0].filePath, 'src/components/Nav.tsx')
})

test('non-button elements are ignored', () => {
  const issues = buttonLabelRule(parseJSX(`<div></div>`))
  assert.equal(issues.length, 0)
})
