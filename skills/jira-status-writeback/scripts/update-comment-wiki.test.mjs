import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkFidelity } from './update-comment-wiki.mjs'

const WIKI = [
  'h3. Summary',
  'h4. Root Cause',
  'some *bold* text and {{mono}} markup, link [label|https://source.example.com/x]',
].join('\n')

test('faithful write: stored equals sent wiki markup -> PASS', () => {
  const r = checkFidelity(WIKI, WIKI)
  assert.equal(r.faithful, true)
  assert.deepEqual(r.issues, [])
})

test('escaped markup: *bold* stored escaped -> FAIL, issue names the marker', () => {
  const stored = WIKI.replace(/\*/g, '\\*')
  const r = checkFidelity(WIKI, stored)
  assert.equal(r.faithful, false)
  assert.ok(
    r.issues.some((i) => i.includes('*bold*')),
    `issues should mention *bold*: ${JSON.stringify(r.issues)}`,
  )
})

test('heading rewrite: h3. turned into Markdown ### -> FAIL, issue mentions heading rewritten', () => {
  const sent = 'h3. Title\nbody text without markers'
  const stored = '### Title\nbody text without markers'
  const r = checkFidelity(sent, stored)
  assert.equal(r.faithful, false)
  assert.ok(
    r.issues.some((i) => i.includes('heading rewritten')),
    `issues should mention heading rewritten: ${JSON.stringify(r.issues)}`,
  )
})

test('empty stored body (no body field) -> FAIL with at least one issue', () => {
  const r = checkFidelity(WIKI, '')
  assert.equal(r.faithful, false)
  assert.ok(r.issues.length > 0)
})

test('plain text without any wiki markers -> PASS', () => {
  const r = checkFidelity('plain text only', 'plain text only')
  assert.equal(r.faithful, true)
  assert.deepEqual(r.issues, [])
})
