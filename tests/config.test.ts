import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { loadConfig } from '../src/config'

function withTempDir(fn: (dir: string) => void) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'a11y-test-'))
  try {
    fn(dir)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

test('returns defaults when no config file exists', () => {
  withTempDir((dir) => {
    const config = loadConfig(dir)
    assert.deepEqual(config, { rules: {}, exclude: [] })
  })
})

test('loads rules from config file', () => {
  withTempDir((dir) => {
    fs.writeFileSync(
      path.join(dir, '.a11yrc.json'),
      JSON.stringify({ rules: { 'alt-text': 'off', 'heading-order': 'warning' } })
    )
    const config = loadConfig(dir)
    assert.equal(config.rules['alt-text'], 'off')
    assert.equal(config.rules['heading-order'], 'warning')
  })
})

test('loads exclude patterns from config file', () => {
  withTempDir((dir) => {
    fs.writeFileSync(
      path.join(dir, '.a11yrc.json'),
      JSON.stringify({ exclude: ['src/legacy/**', '**/*.stories.tsx'] })
    )
    const config = loadConfig(dir)
    assert.deepEqual(config.exclude, ['src/legacy/**', '**/*.stories.tsx'])
  })
})

test('empty config file returns defaults', () => {
  withTempDir((dir) => {
    fs.writeFileSync(path.join(dir, '.a11yrc.json'), JSON.stringify({}))
    const config = loadConfig(dir)
    assert.deepEqual(config, { rules: {}, exclude: [] })
  })
})

test('throws on invalid JSON', () => {
  withTempDir((dir) => {
    fs.writeFileSync(path.join(dir, '.a11yrc.json'), '{ invalid json }')
    assert.throws(() => loadConfig(dir), /Could not parse/)
  })
})

test('throws on invalid rule severity', () => {
  withTempDir((dir) => {
    fs.writeFileSync(
      path.join(dir, '.a11yrc.json'),
      JSON.stringify({ rules: { 'alt-text': 'maybe' } })
    )
    assert.throws(() => loadConfig(dir), /invalid severity/)
  })
})

test('throws when rules is not an object', () => {
  withTempDir((dir) => {
    fs.writeFileSync(
      path.join(dir, '.a11yrc.json'),
      JSON.stringify({ rules: ['alt-text'] })
    )
    assert.throws(() => loadConfig(dir), /must be an object/)
  })
})

test('throws when exclude is not an array of strings', () => {
  withTempDir((dir) => {
    fs.writeFileSync(
      path.join(dir, '.a11yrc.json'),
      JSON.stringify({ exclude: 'src/legacy' })
    )
    assert.throws(() => loadConfig(dir), /must be an array/)
  })
})
