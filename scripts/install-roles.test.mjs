import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import {
  MANIFEST_NAME,
  installRoles,
  pruneStaleRoles,
  readRolesManifest,
  repoRoleRelativePaths,
  resolveRolesRoot,
  staleRolePaths,
  writeRolesManifest,
} from './install-roles.mjs'

function seedAgents(repoRoot, files) {
  const agentsDir = join(repoRoot, '.claude', 'agents')
  for (const [rel, content] of Object.entries(files)) {
    const abs = join(agentsDir, ...rel.split('/'))
    mkdirSync(join(abs, '..'), { recursive: true })
    writeFileSync(abs, content)
  }
}

test('repoRoleRelativePaths skips manifest name and sorts', () => {
  const root = mkdtempSync(join(tmpdir(), 'roles-src-'))
  try {
    seedAgents(root, {
      '_contract.md': '# c\n',
      'leader.md': '# l\n',
      'subdir/helper.md': '# h\n',
    })
    writeFileSync(join(root, '.claude', 'agents', MANIFEST_NAME), '{}')
    assert.deepEqual(repoRoleRelativePaths(join(root, '.claude', 'agents')), [
      '_contract.md',
      'leader.md',
      'subdir/helper.md',
    ])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('installRoles copies files and writes manifest claim', () => {
  const repoRoot = mkdtempSync(join(tmpdir(), 'roles-repo-'))
  const target = mkdtempSync(join(tmpdir(), 'roles-target-'))
  try {
    seedAgents(repoRoot, { '_contract.md': 'project', 'developer.md': 'dev' })
    const prevEnv = process.env.OPEN_SKILLS_ROLES_ROOT
    process.env.OPEN_SKILLS_ROLES_ROOT = target
    try {
      const result = installRoles(repoRoot)
      assert.equal(result.copied, 2)
      assert.equal(readFileSync(join(target, '_contract.md'), 'utf8'), 'project')
      const manifest = JSON.parse(readFileSync(join(target, MANIFEST_NAME), 'utf8'))
      assert.deepEqual(manifest.files, ['_contract.md', 'developer.md'])
      assert.equal(manifest.repo, 'FuDesign2008/open-skills')
    } finally {
      if (prevEnv === undefined) delete process.env.OPEN_SKILLS_ROLES_ROOT
      else process.env.OPEN_SKILLS_ROLES_ROOT = prevEnv
    }
  } finally {
    rmSync(repoRoot, { recursive: true, force: true })
    rmSync(target, { recursive: true, force: true })
  }
})

test('prune removes only stale claimed files; foreign file preserved', () => {
  const repoRoot = mkdtempSync(join(tmpdir(), 'roles-repo-'))
  const target = mkdtempSync(join(tmpdir(), 'roles-target-'))
  try {
    seedAgents(repoRoot, { '_contract.md': 'v2', 'leader.md': 'keep' })
    writeFileSync(join(target, 'gone.md'), 'stale')
    writeFileSync(join(target, 'foreign-custom.md'), 'mine')
    writeRolesManifest(target, ['gone.md', '_contract.md', 'leader.md'])

    installRoles(repoRoot, { rolesRoot: target, prune: true })

    assert.equal(existsSync(join(target, 'gone.md')), false)
    assert.equal(readFileSync(join(target, 'foreign-custom.md'), 'utf8'), 'mine')
    const { files } = readRolesManifest(target)
    assert.deepEqual(files, ['_contract.md', 'leader.md'])
  } finally {
    rmSync(repoRoot, { recursive: true, force: true })
    rmSync(target, { recursive: true, force: true })
  }
})

test('--no-prune keeps stale claimed file', () => {
  const repoRoot = mkdtempSync(join(tmpdir(), 'roles-repo-'))
  const target = mkdtempSync(join(tmpdir(), 'roles-target-'))
  try {
    seedAgents(repoRoot, { 'leader.md': 'keep' })
    writeFileSync(join(target, 'legacy.md'), 'old')
    writeRolesManifest(target, ['legacy.md', 'leader.md'])

    installRoles(repoRoot, { rolesRoot: target, prune: false })

    assert.equal(readFileSync(join(target, 'legacy.md'), 'utf8'), 'old')
    const { files } = readRolesManifest(target)
    assert.deepEqual(files, ['leader.md'])
  } finally {
    rmSync(repoRoot, { recursive: true, force: true })
    rmSync(target, { recursive: true, force: true })
  }
})

test('staleRolePaths and pruneStaleRoles helpers', () => {
  assert.deepEqual(staleRolePaths(['a.md', 'b.md'], ['b.md']), ['a.md'])
  const target = mkdtempSync(join(tmpdir(), 'roles-prune-'))
  try {
    writeFileSync(join(target, 'x.md'), 'x')
    const removed = pruneStaleRoles(target, ['x.md', 'missing.md'])
    assert.deepEqual(removed, [{ path: 'x.md' }])
    assert.equal(existsSync(join(target, 'x.md')), false)
  } finally {
    rmSync(target, { recursive: true, force: true })
  }
})

test('resolveRolesRoot honors OPEN_SKILLS_ROLES_ROOT', () => {
  const custom = join(tmpdir(), 'custom-agents')
  assert.equal(resolveRolesRoot({ OPEN_SKILLS_ROLES_ROOT: custom }), custom)
})