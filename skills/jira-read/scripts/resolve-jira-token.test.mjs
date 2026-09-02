import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { credentialFilePath, resolveJiraToken } from './resolve-jira-token.mjs'

test('canonical env wins over alias and file', () => {
  const r = resolveJiraToken({
    env: { JIRA_PERSONAL_TOKEN: 'canon', JIRA_PAT: 'alias' },
    readFileSync: () => 'file-token',
  })
  assert.equal(r.token, 'canon')
  assert.equal(r.source, 'env:JIRA_PERSONAL_TOKEN')
})

test('alias env used when canonical empty', () => {
  const r = resolveJiraToken({
    env: { JIRA_PERSONAL_TOKEN: '', JIRA_PAT: ' alias-token ' },
    readFileSync: () => {
      throw new Error('should not read file')
    },
  })
  assert.equal(r.token, 'alias-token')
  assert.equal(r.source, 'env:JIRA_PAT')
})

test('file fallback when both env empty', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jira-pat-'))
  const filePath = path.join(dir, 'jira-pat.txt')
  fs.writeFileSync(filePath, '  file-secret  \n', 'utf8')
  const r = resolveJiraToken({ env: {}, filePath })
  assert.equal(r.token, 'file-secret')
  assert.equal(r.source, 'file')
  fs.rmSync(dir, { recursive: true, force: true })
})

test('empty chain when env and file missing', () => {
  const r = resolveJiraToken({
    env: {},
    filePath: path.join(os.tmpdir(), 'no-such-jira-pat-xyz.txt'),
  })
  assert.equal(r.token, null)
  assert.equal(r.source, 'empty')
})

test('credentialFilePath uses home/.config/jira-certs/jira-pat.txt', () => {
  assert.equal(
    credentialFilePath('/home/example'),
    path.join('/home/example', '.config', 'jira-certs', 'jira-pat.txt'),
  )
})
