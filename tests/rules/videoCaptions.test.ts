import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import type { ParsedFile } from '../../src/parser'
import { videoCaptionsRule } from '../../src/rules/videoCaptions'

function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}

test('no issue for video with track kind="captions"', () => {
  const issues = videoCaptionsRule(
    parseJSX(`<video src="v.mp4"><track kind="captions" src="c.vtt" /></video>`)
  )
  assert.equal(issues.length, 0)
})

test('no issue for video with track kind="subtitles"', () => {
  const issues = videoCaptionsRule(
    parseJSX(`<video src="v.mp4"><track kind="subtitles" src="s.vtt" /></video>`)
  )
  assert.equal(issues.length, 0)
})

test('error for video with no children', () => {
  const issues = videoCaptionsRule(
    parseJSX(`<video src="v.mp4"></video>`)
  )
  assert.equal(issues.length, 1)
  assert.equal(issues[0].rule, 'video-captions')
  assert.equal(issues[0].severity, 'error')
})

test('error for video with track kind="descriptions" only', () => {
  const issues = videoCaptionsRule(
    parseJSX(`<video src="v.mp4"><track kind="descriptions" src="d.vtt" /></video>`)
  )
  assert.equal(issues.length, 1)
})

test('error for video with track but no kind attribute', () => {
  const issues = videoCaptionsRule(
    parseJSX(`<video src="v.mp4"><track src="t.vtt" /></video>`)
  )
  assert.equal(issues.length, 1)
})

test('no issue for non-video elements', () => {
  const issues = videoCaptionsRule(parseJSX(`<audio src="a.mp3" />`))
  assert.equal(issues.length, 0)
})

test('filePath is attached to issue', () => {
  const issues = videoCaptionsRule(
    parseJSX(`<video src="v.mp4"></video>`, 'src/Hero.tsx')
  )
  assert.equal(issues[0].filePath, 'src/Hero.tsx')
})

test('line is a positive integer', () => {
  const issues = videoCaptionsRule(parseJSX(`<video src="v.mp4"></video>`))
  assert.ok(issues[0].line > 0)
})

test('multiple videos each get their own issue', () => {
  const issues = videoCaptionsRule(
    parseJSX(`
      <div>
        <video src="a.mp4"></video>
        <video src="b.mp4"></video>
      </div>
    `)
  )
  assert.equal(issues.length, 2)
})
