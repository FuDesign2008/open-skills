import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import {
  DEFAULT_AGENTS,
  NO_GLOBAL_AGENTS,
  filterAgentsForGlobalInstall,
  hasCloneFailure,
  hasPromptScriptGlobalFail,
  missingInstalledSkills,
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

test('hasCloneFailure detects real clone-timeout output with ANSI and CR noise', () => {
  const out =
    '\x1b[31m■\x1b[39m Failed to clone repository\r\n' +
    '[SKILLS_GIT_CLONE_TIMEOUT] Clone timed out after 300s\r\n'
  assert.equal(hasCloneFailure(out), true)
})

test('hasCloneFailure detects Installation failed', () => {
  assert.equal(hasCloneFailure('\x1b[2K\r✗ Installation failed'), true)
})

test('hasCloneFailure ignores successful output with a copied skill', () => {
  assert.equal(hasCloneFailure('\x1b[32m✓\x1b[39m ~/.agents/skills/x\nInstalled 1 skill'), false)
  assert.equal(hasCloneFailure('\r\x1b[2K⠙ Installing…\r✓ done'), false)
  assert.equal(hasCloneFailure(''), false)
  assert.equal(hasCloneFailure(undefined), false)
})

test('missingInstalledSkills returns names absent or without SKILL.md', () => {
  const root = mkdtempSync(join(tmpdir(), 'open-skills-missing-'))
  try {
    for (const name of ['alpha', 'beta']) {
      mkdirSync(join(root, name))
      writeFileSync(join(root, name, 'SKILL.md'), `---\nname: ${name}\n---\n`)
    }
    mkdirSync(join(root, 'gamma')) // directory exists, no SKILL.md

    assert.deepEqual(missingInstalledSkills(root, ['alpha', 'beta']), [])
    assert.deepEqual(missingInstalledSkills(root, ['alpha', 'beta', 'delta']), ['delta'])
    assert.deepEqual(missingInstalledSkills(root, ['alpha', 'gamma']), ['gamma'])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
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
