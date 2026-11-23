#!/usr/bin/env node
/**
 * Copy repo `.claude/agents/` → Claude Code user-global agents dir with manifest attribution.
 *
 * Usage:
 *   node scripts/install-roles.mjs
 *   node scripts/install-roles.mjs --no-prune
 *   node scripts/install-roles.mjs --repo /path/to/open-skills
 *
 * Env:
 *   OPEN_SKILLS_ROLES_ROOT   Override install target (default: ~/.claude/agents)
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const MANIFEST_NAME = '.open-skills-roles-manifest.json'
export const REPO_CLAIM = 'FuDesign2008/open-skills'

/** @param {NodeJS.ProcessEnv} [env] */
export function resolveRolesRoot(env = process.env) {
  const override = env.OPEN_SKILLS_ROLES_ROOT
  if (override && String(override).trim()) {
    return resolve(String(override).trim())
  }
  return join(homedir(), '.claude', 'agents')
}

/** @type {typeof resolveRolesRoot} */
export const DEFAULT_ROLES_ROOT = resolveRolesRoot

function toPosixRel(path) {
  return path.split(sep).join('/')
}

/**
 * Recursively list relative file paths under `agentsDir` (posix-style), skipping the manifest name.
 * @param {string} agentsDir
 * @returns {string[]}
 */
export function repoRoleRelativePaths(agentsDir) {
  if (!existsSync(agentsDir)) return []
  const out = []

  /** @param {string} dir @param {string} relPrefix */
  function walk(dir, relPrefix) {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const rel = relPrefix ? `${relPrefix}/${ent.name}` : ent.name
      if (ent.name === MANIFEST_NAME) continue
      const abs = join(dir, ent.name)
      if (ent.isDirectory()) {
        walk(abs, rel)
      } else if (ent.isFile()) {
        out.push(toPosixRel(rel))
      }
    }
  }

  walk(agentsDir, '')
  return out.sort()
}

/** @returns {{ repo?: string, files: string[] }} */
export function readRolesManifest(rolesRoot) {
  try {
    const parsed = JSON.parse(readFileSync(join(rolesRoot, MANIFEST_NAME), 'utf8'))
    const files = Array.isArray(parsed?.files)
      ? parsed.files.filter((f) => typeof f === 'string')
      : []
    const repo = typeof parsed?.repo === 'string' ? parsed.repo : undefined
    return { repo, files }
  } catch {
    return { files: [] }
  }
}

/** @param {string} rolesRoot @param {string[]} files */
export function writeRolesManifest(rolesRoot, files) {
  mkdirSync(rolesRoot, { recursive: true })
  writeFileSync(
    join(rolesRoot, MANIFEST_NAME),
    JSON.stringify({ repo: REPO_CLAIM, files: [...files].sort() }, null, 2) + '\n',
  )
}

/**
 * Paths previously claimed but no longer in the new repo tree.
 * @param {string[]} oldFiles
 * @param {string[]} newFiles
 * @returns {string[]}
 */
export function staleRolePaths(oldFiles, newFiles) {
  const keep = new Set(newFiles)
  return oldFiles.filter((f) => !keep.has(f))
}

/**
 * Remove stale claimed files only under `rolesRoot`.
 * @param {string} rolesRoot
 * @param {string[]} stale
 * @returns {{ path: string }[]}
 */
export function pruneStaleRoles(rolesRoot, stale) {
  const removed = []
  for (const rel of stale) {
    const abs = join(rolesRoot, ...rel.split('/'))
    if (existsSync(abs) && statSync(abs).isFile()) {
      rmSync(abs, { force: true })
      removed.push({ path: rel })
      console.log(`✗ pruned stale role file: ${rel} (from ${rolesRoot})`)
    }
  }
  return removed
}

/**
 * Copy repo agents tree and update manifest; optionally prune stale claimed files.
 * @param {string} repoRoot
 * @param {{ prune?: boolean, rolesRoot?: string }} [options]
 */
export function installRoles(repoRoot, options = {}) {
  const rolesRoot = options.rolesRoot ?? resolveRolesRoot()
  const prune = options.prune !== false
  const sourceDir = join(repoRoot, '.claude', 'agents')

  if (!existsSync(sourceDir)) {
    throw new Error(`Source agents dir missing: ${sourceDir}`)
  }

  const newFiles = repoRoleRelativePaths(sourceDir)
  const { files: oldFiles } = readRolesManifest(rolesRoot)

  let copied = 0
  for (const rel of newFiles) {
    const src = join(sourceDir, ...rel.split('/'))
    const dest = join(rolesRoot, ...rel.split('/'))
    mkdirSync(dirname(dest), { recursive: true })
    copyFileSync(src, dest)
    copied++
  }

  if (prune) {
    const stale = staleRolePaths(oldFiles, newFiles)
    if (stale.length > 0) {
      console.log(`\n→ pruning ${stale.length} stale role file(s) no longer shipped by this repo`)
      pruneStaleRoles(rolesRoot, stale)
    }
  }

  writeRolesManifest(rolesRoot, newFiles)

  return { rolesRoot, copied, claimed: newFiles.length, pruned: prune, sourceDir }
}

/**
 * @param {string[]} argv
 * @param {{ repoDefault?: string, env?: NodeJS.ProcessEnv }} [ctx]
 */
export function parseRoleArgs(argv, ctx = {}) {
  const repoDefault =
    ctx.repoDefault ?? resolve(fileURLToPath(import.meta.url), '..', '..')
  let prune = true
  let repoRoot = repoDefault
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--no-prune') {
      prune = false
    } else if (a === '--repo' && argv[i + 1]) {
      repoRoot = resolve(argv[++i])
    } else if (a === '--help' || a === '-h') {
      return { help: true }
    } else {
      console.error(`Unknown argument: ${a}`)
      return { help: true, error: true }
    }
  }
  return { help: false, prune, repoRoot, rolesRoot: resolveRolesRoot(ctx.env) }
}

function printHelp() {
  console.log(`Usage: node scripts/install-roles.mjs [--repo <path>] [--no-prune]

Copies <repo>/.claude/agents/ → Claude Code user-global agents directory (copy, never symlink).
Records claims in .open-skills-roles-manifest.json; prunes only stale claimed files on full sync.

Env:
  OPEN_SKILLS_ROLES_ROOT   Override install target (default: ~/.claude/agents)

Default --repo: repository root containing this script (open-skills checkout).

--no-prune   Copy and refresh manifest without removing stale claimed files.
`)
}

function main(argv = process.argv.slice(2)) {
  const parsed = parseRoleArgs(argv)
  if (parsed.help) {
    printHelp()
    process.exit(parsed.error ? 1 : 0)
  }

  try {
    const result = installRoles(parsed.repoRoot, {
      prune: parsed.prune,
      rolesRoot: parsed.rolesRoot,
    })
    console.log(
      `\n✓ roles install: ${result.copied} file(s) → ${result.rolesRoot} (${result.claimed} claimed` +
        (parsed.prune ? ')' : '; prune skipped)'),
    )
  } catch (err) {
    console.error(`\n✗ roles install failed: ${err instanceof Error ? err.message : err}`)
    process.exit(1)
  }
}

const isMain =
  Boolean(process.argv[1]) &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  main()
}