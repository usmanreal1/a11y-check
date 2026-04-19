import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { altTextRule } from '../../src/rules/altText'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issues for img with descriptive alt', () => {
  const parsed = parseJSX(`<img src="photo.jpg" alt="A smiling dog" />`)
  const issues = altTextRule(parsed)
  assert.equal(issues.length, 0)
})

test('no issues for img with empty alt (decorative)', () => {
  const parsed = parseJSX(`<img src="divider.png" alt="" />`)
  const issues = altTextRule(parsed)
  assert.equal(issues.length, 0)
})

test('error when img is missing alt attribute', () => {
  const parsed = parseJSX(`<img src="photo.jpg" />`)
  const issues = altTextRule(parsed)
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'alt-text')
  assert.equal(issues[0].severity, 'error')
  assert.match(issues[0].message, /missing an alt attribute/)
})

test('error when img has alt with no value (bare attribute)', () => {
  const parsed = parseJSX(`<img src="photo.jpg" alt />`)
  const issues = altTextRule(parsed)
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'alt-text')
  assert.equal(issues[0].severity, 'error')
  assert.match(issues[0].message, /no value/)
})

test('filePath is attached to each issue', () => {
  const parsed = parseJSX(`<img src="x.jpg" />`, 'src/components/Hero.tsx')
  const issues = altTextRule(parsed)
  assert.equal(issues[0].filePath, 'src/components/Hero.tsx')
})

test('line number is reported for missing alt', () => {
  const parsed = parseJSX(`
    const el = (
      <img src="x.jpg" />
    )
  `)
  const issues = altTextRule(parsed)
  assert.equal(issues.length, 1)
  assert.ok(issues[0].line > 0, 'line should be a positive number')
})

test('non-img JSX elements are ignored', () => {
  const parsed = parseJSX(`
    <div>
      <span>hello</span>
      <button>click</button>
    </div>
  `)
  const issues = altTextRule(parsed)
  assert.equal(issues.length, 0)
})

test('multiple imgs — each missing alt produces its own issue', () => {
  const parsed = parseJSX(`
    <div>
      <img src="a.jpg" />
      <img src="b.jpg" />
    </div>
  `)
  const issues = altTextRule(parsed)
  assert.equal(issues.length, 2)
})
