#!/usr/bin/env node
/**
 * Global install helper for FuDesign2008/open-skills.
 *
 * Avoids vercel-labs/skills PromptScript (and Eve) global-install failure noise by
 * passing an explicit --agent list that excludes agents without globalSkillsDir.
 * See: https://github.com/vercel-labs/skills/issues/1352
 *
 * Also prunes stale global copies on full installs (`--skill '*'`): the skills CLI
 * only adds/updates and never removes, so skills deleted from this repo keep living
 * in global dirs with their old triggers. Attribution is manifest-based — only
 * directories this script previously claimed (recorded in .open-skills-manifest.json
 * next to the installed skills) are ever removed; skills from other sources are safe.
 *
 * Usage:
 *   node scripts/install-skills.mjs
 *   node scripts/install-skills.mjs --skill solve-workflow
 *   node scripts/install-skills.mjs --source .
 *   node scripts/install-skills.mjs --no-prune   (skip pruning on a full install)
 *   OPEN_SKILLS_AGENTS="claude-code cursor" node scripts/install-skills.mjs
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, posix, resolve, win32 } from 'node:path'
import { fileURLToPath } from 'node:url'
import { installRoles } from './install-roles.mjs'

/** Agents in skills CLI that have globalSkillsDir: undefined (skills@1.5.x). */
export const NO_GLOBAL_AGENTS = Object.freeze(['promptscript', 'eve'])

/** Default agents aligned with this repo's supported platforms. */
export const DEFAULT_AGENTS = Object.freeze(['claude-code', 'cursor', 'opencode'])

const PROMPTSCRIPT_FAIL_RE =
  /PromptScript:\s*PromptScript does not support global skill installation/i

const MANIFEST_NAME = '.open-skills-manifest.json'

/** Global skill roots this script may prune in (existence-checked at run time). */
export const GLOBAL_SKILL_ROOTS = Object.freeze([
  join(homedir(), '.agents', 'skills'),
  join(homedir(), '.claude', 'skills'),
  join(homedir(), '.cursor', 'skills'),
])

/** Skill names currently shipped by this repo (skills/ top-level dirs with SKILL.md). */
export function repoSkillNames(repoRoot) {
  const skillsDir = join(repoRoot, 'skills')
  if (!existsSync(skillsDir)) return []
  return readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(skillsDir, d.name, 'SKILL.md')))
    .map((d) => d.name)
    .sort()
}

/** Read the manifest; returns [] when absent or malformed (never throws). */
export function readManifest(skillsRoot) {
  try {
    const parsed = JSON.parse(readFileSync(join(skillsRoot, MANIFEST_NAME), 'utf8'))
    if (!Array.isArray(parsed?.skills)) return []
    return parsed.skills.filter((s) => typeof s === 'string')
  } catch {
    return []
  }
}

/** Persist the claimed set. Manifest lives next to installed skills (hidden file). */
export function writeManifest(skillsRoot, names) {
  mkdirSync(skillsRoot, { recursive: true })
  writeFileSync(
    join(skillsRoot, MANIFEST_NAME),
    JSON.stringify({ repo: 'FuDesign2008/open-skills', skills: [...names].sort() }, null, 2) + '\n',
  )
}

/**
 * Compute the stale list: names the old manifest claimed that the new claim no
 * longer includes. Foreign skills (never claimed) can never appear here.
 */
export function staleList(oldNames, newNames) {
  const keep = new Set(newNames)
  return oldNames.filter((n) => !keep.has(n))
}

/**
 * Remove stale claimed dirs from every existing global root.
 * Prints each removal; returns the list of removed {root, name}.
 */
export function pruneStale(roots, stale) {
  const removed = []
  for (const root of roots) {
    if (!existsSync(root) || stale.length === 0) continue
    for (const name of stale) {
      const dir = join(root, name)
      if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true })
        removed.push({ root, name })
        console.log(`✗ pruned stale skill: ${name} (from ${root})`)
      }
    }
  }
  return removed
}

/**
 * @param {string[]} agents
 * @param {readonly string[]} [denylist]
 * @returns {string[]}
 */
export function filterAgentsForGlobalInstall(agents, denylist = NO_GLOBAL_AGENTS) {
  const deny = new Set(denylist.map((a) => a.toLowerCase()))
  const seen = new Set()
  const out = []
  for (const raw of agents) {
    const a = String(raw).trim()
    if (!a) continue
    const key = a.toLowerCase()
    if (deny.has(key) || seen.has(key)) continue
    seen.add(key)
    out.push(a)
  }
  return out
}

/**
 * @param {string} output
 * @returns {boolean}
 */
export function hasPromptScriptGlobalFail(output) {
  return PROMPTSCRIPT_FAIL_RE.test(output)
}

/** Clone/installation failure signals emitted by the skills CLI. */
const CLONE_FAIL_RE =
  /Failed to clone repository|SKILLS_GIT_CLONE_TIMEOUT|Installation failed/

/** Strip ANSI CSI escapes; turn CR progress-bar rewrites into line breaks. */
function normalizeCliOutput(output) {
  return String(output ?? '')
    .replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '')
    .replace(/\r/g, '\n')
}

/**
 * True when install output reports a clone/installation failure. The CLI can
 * print these and still exit 0, so status alone cannot be trusted.
 * @param {string} output
 * @returns {boolean}
 */
export function hasCloneFailure(output) {
  return CLONE_FAIL_RE.test(normalizeCliOutput(output))
}

/**
 * Names from `names` not installed under `root` (missing dir or no SKILL.md).
 * @param {string} root
 * @param {string[]} names
 * @returns {string[]}
 */
export function missingInstalledSkills(root, names) {
  return names.filter((name) => !existsSync(join(root, name, 'SKILL.md')))
}

/**
 * @param {string[]} argv
 * @param {NodeJS.ProcessEnv} [env]
 */
export function parseArgs(argv, env = process.env) {
  let source = 'FuDesign2008/open-skills'
  let skill = '*'
  let prune = true
  let roles = true
  const rest = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--source' && argv[i + 1]) {
      source = argv[++i]
    } else if ((a === '--skill' || a === '-s') && argv[i + 1]) {
      skill = argv[++i]
    } else if (a === '--no-prune') {
      prune = false
    } else if (a === '--no-roles') {
      roles = false
    } else if (a === '--help' || a === '-h') {
      return { help: true }
    } else {
      rest.push(a)
    }
  }
  const fromEnv = (env.OPEN_SKILLS_AGENTS || '')
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  const agents = filterAgentsForGlobalInstall(
    fromEnv.length > 0 ? fromEnv : [...DEFAULT_AGENTS],
  )
  return { help: false, source, skill, prune, roles, agents, rest }
}

/**
 * Locate npm's npx CLI entry from the running Node installation so the skills
 * CLI can be launched without a shell or a Windows `.cmd` shim.
 * Returns { command, args, via } where `args` precede the skills CLI arguments.
 * @param {{ execPath?: string, platform?: string, fileExists?: (path: string) => boolean }} [options]
 * @returns {{ command: string, args: string[], via: 'node-npx-cli' | 'npx-fallback' }}
 */
export function resolveNpxLaunch({
  execPath = process.execPath,
  platform = process.platform,
  fileExists = existsSync,
} = {}) {
  const pathImpl = platform === 'win32' ? win32 : posix
  const execDir = pathImpl.dirname(execPath)
  const candidates = [
    pathImpl.join(execDir, 'node_modules', 'npm', 'bin', 'npx-cli.js'),
    pathImpl.join(execDir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npx-cli.js'),
  ]
  for (const candidate of candidates) {
    if (fileExists(candidate)) {
      return { command: execPath, args: [candidate], via: 'node-npx-cli' }
    }
  }
  return { command: 'npx', args: [], via: 'npx-fallback' }
}

/**
 * Combine a launcher plan with the skills CLI arguments, keeping every value
 * as one discrete argv entry (no shell re-tokenization).
 * @param {{ command: string, args: string[], via: string }} plan
 * @param {string[]} cliArgs
 */
export function npxInvocation(plan, cliArgs) {
  return { command: plan.command, args: [...plan.args, ...cliArgs], via: plan.via }
}

/**
 * Render the launch plan for the progress log.
 * @param {{ command: string, args: string[] }} invocation
 */
export function formatLaunchLine(invocation) {
  return `→ ${invocation.command} ${invocation.args.join(' ')}`
}

/**
 * Diagnostic for the Windows case where npm's CLI entry could not be resolved
 * and the historical `npx` fallback is about to be spawned as a `.cmd` shim.
 * @param {{ via: string }} plan
 * @param {string} [platform]
 * @returns {string | null}
 */
export function npxLaunchFailureHint(plan, platform = process.platform) {
  if (plan.via !== 'npx-fallback' || platform !== 'win32') return null
  return (
    '\n  hint: npx is a Windows .cmd shim that Node cannot start directly, and npm\'s\n' +
    '  npx-cli.js was not found next to the Node binary. Reinstall Node with npm\n' +
    '  included, or run the same command from a shell.'
  )
}

function printHelp() {
  console.log(`Usage: node scripts/install-skills.mjs [--source <repo-or-path>] [--skill <name|*>] [--no-prune] [--no-roles]

Env:
  OPEN_SKILLS_AGENTS   Space/comma-separated agent ids (default: claude-code cursor opencode)
                       promptscript and eve are always excluded.

After a successful skills install, also syncs repo role agents to ~/.claude/agents/
unless --no-roles. Role prune follows --no-prune for this run. Standalone: node scripts/install-roles.mjs

Runs: the skills CLI through npm's npx-cli.js using the running Node binary
      (<node dir>/node_modules/npm/bin/npx-cli.js), so no shell or .cmd shim is
      launched; falls back to 'npx skills add ...' when that entry is not found.

Fails with exit 1 (no manifest refresh, no prune) when:
  - clone/install failures appear in output (Failed to clone repository,
    SKILLS_GIT_CLONE_TIMEOUT, Installation failed) — the CLI can still exit 0;
  - PromptScript global-install errors remain in output;
  - a full install leaves shipped skills missing on disk (no SKILL.md under the
    primary global root).
Prefer --source . to install from this local checkout instead of cloning.
Raise the clone timeout with SKILLS_CLONE_TIMEOUT_MS=<ms>.

Prune (full install only, i.e. --skill '*'):
  After install, removes global skill directories that a previous full install
  claimed (recorded in .open-skills-manifest.json) but that no longer exist in
  this repo. Foreign skills from other sources are never touched.
  Partial installs (--skill <name>) skip pruning and keep the manifest as-is.
  --no-prune skips pruning for this run.
`)
}

function main(argv = process.argv.slice(2)) {
  const parsed = parseArgs(argv)
  if (parsed.help) {
    printHelp()
    process.exit(0)
  }
  if (parsed.agents.length === 0) {
    console.error('No agents left after filtering; set OPEN_SKILLS_AGENTS to global-capable agents.')
    process.exit(1)
  }

  const cliArgs = [
    'skills',
    'add',
    parsed.source,
    '-g',
    '--yes',
    '--skill',
    parsed.skill,
    '--agent',
    ...parsed.agents,
    ...parsed.rest,
  ]

  const launch = npxInvocation(resolveNpxLaunch(), cliArgs)
  console.log(formatLaunchLine(launch))
  const result = spawnSync(launch.command, launch.args, {
    encoding: 'utf8',
    shell: false,
    env: process.env,
  })

  const output = `${result.stdout || ''}${result.stderr || ''}`
  if (output) process.stdout.write(output)

  if (hasCloneFailure(output)) {
    console.error(
      '\n✗ skills CLI clone/install failure detected in output. Refusing to treat as success.\n' +
        '  The global install did not complete; this repo was NOT updated.\n' +
        '  Fix options:\n' +
        '    1) Install from the local repo instead of cloning: node scripts/install-skills.mjs --source .\n' +
        '    2) Raise the clone timeout: SKILLS_CLONE_TIMEOUT_MS=900000 node scripts/install-skills.mjs',
    )
    process.exit(1)
  }

  if (hasPromptScriptGlobalFail(output)) {
    console.error(
      '\n✗ PromptScript global-install failure still present in output. Refusing to treat as success.\n' +
        '  See https://github.com/vercel-labs/skills/issues/1352',
    )
    process.exit(1)
  }

  if (result.status !== 0 && result.status !== null) {
    process.exit(result.status)
  }
  if (result.error) {
    console.error(result.error)
    const hint = npxLaunchFailureHint(launch)
    if (hint) console.error(hint)
    process.exit(1)
  }

  const isFullInstall = parsed.skill === '*'
  const repoRoot = resolve(fileURLToPath(import.meta.url), '..', '..')
  const primaryRoot = GLOBAL_SKILL_ROOTS[0]

  // Full installs must actually land every shipped skill on disk. A partial
  // clone/install can exit 0, so verify before touching manifest/prune state.
  if (isFullInstall) {
    const expected = repoSkillNames(repoRoot)
    const missing = missingInstalledSkills(primaryRoot, expected)
    if (missing.length > 0) {
      console.error(
        `\n✗ install incomplete: ${missing.length}/${expected.length} skill(s) missing under ${primaryRoot}\n` +
          missing.map((name) => `  - ${name}`).join('\n') +
          '\n  Manifest not updated. Re-run the install (or use --source .).',
      )
      process.exit(1)
    }
  }

  // Post-install prune (full installs only). Runs only after a successful add:
  // a failed install must not touch global state.
  if (isFullInstall && parsed.prune) {
    const newNames = repoSkillNames(repoRoot)
    const oldNames = readManifest(primaryRoot)
    const stale = staleList(oldNames, newNames)
    if (stale.length > 0) {
      console.log(`\n→ pruning ${stale.length} stale skill(s) no longer shipped by this repo`)
      pruneStale(GLOBAL_SKILL_ROOTS, stale)
    }
    writeManifest(primaryRoot, newNames)
    console.log(`\n✓ manifest updated: ${newNames.length} skill(s) claimed`)
  } else if (isFullInstall && !parsed.prune) {
    console.log('\n✓ prune skipped (--no-prune); manifest left unchanged')
  } else {
    console.log('\n✓ partial install: prune and manifest intentionally skipped')
  }

  if (parsed.roles) {
    try {
      const roleResult = installRoles(repoRoot, { prune: parsed.prune })
      console.log(
        `✓ roles synced: ${roleResult.copied} file(s) → ${roleResult.rolesRoot}` +
          (parsed.prune ? '' : ' (role prune skipped with --no-prune)'),
      )
    } catch (err) {
      console.error(
        `\n✗ roles sync failed: ${err instanceof Error ? err.message : err}\n` +
          '  Skills install completed; re-run node scripts/install-roles.mjs',
      )
      process.exit(1)
    }
  } else {
    console.log('✓ roles sync skipped (--no-roles)')
  }

  console.log('✓ Global install finished without PromptScript failure noise.')
}

const isMain =
  Boolean(process.argv[1]) &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  main()
}
