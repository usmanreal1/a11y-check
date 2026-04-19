import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { autoplayMediaRule } from '../../src/rules/autoplayMedia'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for video without autoPlay', () => {
  const issues = autoplayMediaRule(parseJSX(`<video src="x.mp4" controls />`))
  assert.equal(issues.length, 0)
})

test('no issue for video with autoPlay and muted', () => {
  const issues = autoplayMediaRule(parseJSX(`<video src="x.mp4" autoPlay muted />`))
  assert.equal(issues.length, 0)
})

test('no issue for audio without autoPlay', () => {
  const issues = autoplayMediaRule(parseJSX(`<audio src="x.mp3" controls />`))
  assert.equal(issues.length, 0)
})

test('no issue for audio with autoPlay and muted', () => {
  const issues = autoplayMediaRule(parseJSX(`<audio src="x.mp3" autoPlay muted />`))
  assert.equal(issues.length, 0)
})

test('error for video with autoPlay and no muted', () => {
  const issues = autoplayMediaRule(parseJSX(`<video src="x.mp4" autoPlay />`))
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'autoplay-media')
  assert.equal(issues[0].severity, 'error')
  assert.match(issues[0].message, /video/)
})

test('error for audio with autoPlay and no muted', () => {
  const issues = autoplayMediaRule(parseJSX(`<audio src="x.mp3" autoPlay />`))
  assert.equal(issues.length, 1)
  assert.match(issues[0].message, /audio/)
})

test('filePath is attached to issue', () => {
  const issues = autoplayMediaRule(parseJSX(`<video autoPlay />`, 'src/Hero.tsx'))
  assert.equal(issues[0].filePath, 'src/Hero.tsx')
})

test('non-media elements are ignored', () => {
  const issues = autoplayMediaRule(parseJSX(`<div autoPlay />`))
  assert.equal(issues.length, 0)
})
