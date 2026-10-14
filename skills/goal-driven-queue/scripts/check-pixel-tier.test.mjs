import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'check-pixel-tier.mjs')

function run(body) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixel-tier-'))
  const file = path.join(dir, 'verification.md')
  fs.writeFileSync(file, body)
  const result = spawnSync(process.execPath, [script, file], { encoding: 'utf8' })
  fs.rmSync(dir, { recursive: true, force: true })
  return result.status
}

test('no figma url exits 0', () => {
  assert.equal(run('hard: tests pass\nsoft: tone\n'), 0)
})

test('soft pixel line exits 1', () => {
  const body = [
    'goal: https://www.figma.com/design/abc',
    'hard (tests) soft (像素对齐)',
    'check-figma-verify-report.mjs',
  ].join('\n')
  assert.equal(run(body), 1)
})

test('figma url without checker citation exits 1', () => {
  assert.equal(run('see https://www.figma.com/design/abc\nhard: row count\n'), 1)
})

test('hard citation exits 0', () => {
  const body = [
    'node-id=1:2',
    '### Hard',
    '- pixel geometry: check-figma-verify-report.mjs exits 0',
    '### Soft',
    '- wording',
  ].join('\n')
  assert.equal(run(body), 0)
})

test('pixel bullet under a Soft heading exits 1', () => {
  const body = [
    'https://www.figma.com/design/abc',
    '### Hard',
    '- check-figma-verify-report.mjs exits 0',
    '### Soft',
    '- pixel alignment of the dialog',
  ].join('\n')
  assert.equal(run(body), 1)
})
