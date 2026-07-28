#!/usr/bin/env node
/**
 * Global install helper for FuDesign2008/open-skills.
 *
 * Avoids vercel-labs/skills PromptScript (and Eve) global-install failure noise by
 * passing an explicit --agent list that excludes agents without globalSkillsDir.
 * See: https://github.com/vercel-labs/skills/issues/1352
 *
 * Usage:
 *   node scripts/install-skills.mjs
 *   node scripts/install-skills.mjs --skill solve-workflow
 *   node scripts/install-skills.mjs --source .
 *   OPEN_SKILLS_AGENTS="claude-code cursor" node scripts/install-skills.mjs
 */

import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Agents in skills CLI that have globalSkillsDir: undefined (skills@1.5.x). */
export const NO_GLOBAL_AGENTS = Object.freeze(['promptscript', 'eve'])

/** Default agents aligned with this repo's supported platforms. */
export const DEFAULT_AGENTS = Object.freeze(['claude-code', 'cursor', 'opencode'])

const PROMPTSCRIPT_FAIL_RE =
  /PromptScript:\s*PromptScript does not support global skill installation/i

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

/**
 * @param {string[]} argv
 * @param {NodeJS.ProcessEnv} [env]
 */
export function parseArgs(argv, env = process.env) {
  let source = 'FuDesign2008/open-skills'
  let skill = '*'
  const rest = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--source' && argv[i + 1]) {
      source = argv[++i]
    } else if ((a === '--skill' || a === '-s') && argv[i + 1]) {
      skill = argv[++i]
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
  return { help: false, source, skill, agents, rest }
}

function printHelp() {
  console.log(`Usage: node scripts/install-skills.mjs [--source <repo-or-path>] [--skill <name|*]

Env:
  OPEN_SKILLS_AGENTS   Space/comma-separated agent ids (default: claude-code cursor opencode)
                       promptscript and eve are always excluded.

Runs: npx skills add <source> -g --yes --skill <skill> --agent <agents...>
Fails if install output still contains PromptScript global-install errors.
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

  const args = [
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

  console.log(`→ npx ${args.join(' ')}`)
  const result = spawnSync('npx', args, {
    encoding: 'utf8',
    shell: false,
    env: process.env,
  })

  const output = `${result.stdout || ''}${result.stderr || ''}`
  if (output) process.stdout.write(output)

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
    process.exit(1)
  }
  console.log('\n✓ Global install finished without PromptScript failure noise.')
}

const isMain =
  Boolean(process.argv[1]) &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  main()
}
