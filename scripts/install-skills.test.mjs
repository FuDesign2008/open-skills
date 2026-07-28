import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_AGENTS,
  NO_GLOBAL_AGENTS,
  filterAgentsForGlobalInstall,
  hasPromptScriptGlobalFail,
  parseArgs,
} from './install-skills.mjs'

test('filterAgentsForGlobalInstall drops promptscript and eve', () => {
  const out = filterAgentsForGlobalInstall([
    'claude-code',
    'promptscript',
    'cursor',
    'eve',
    'PromptScript',
  ])
  assert.deepEqual(out, ['claude-code', 'cursor'])
})

test('filterAgentsForGlobalInstall dedupes case-insensitively', () => {
  assert.deepEqual(filterAgentsForGlobalInstall(['Cursor', 'cursor', 'CURSOR']), [
    'Cursor',
  ])
})

test('hasPromptScriptGlobalFail detects CLI failure line', () => {
  assert.equal(
    hasPromptScriptGlobalFail(
      '✗ solve-workflow → PromptScript: PromptScript does not support global skill installation',
    ),
    true,
  )
  assert.equal(hasPromptScriptGlobalFail('✓ solve-workflow (copied)'), false)
})

test('parseArgs defaults and env override', () => {
  const d = parseArgs([])
  assert.equal(d.source, 'FuDesign2008/open-skills')
  assert.equal(d.skill, '*')
  assert.deepEqual(d.agents, [...DEFAULT_AGENTS])
  assert.ok(NO_GLOBAL_AGENTS.includes('promptscript'))

  const e = parseArgs(['--source', '.', '-s', 'git-commit'], {
    OPEN_SKILLS_AGENTS: 'claude-code,promptscript,cursor',
  })
  assert.equal(e.source, '.')
  assert.equal(e.skill, 'git-commit')
  assert.deepEqual(e.agents, ['claude-code', 'cursor'])
})
