import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

function trimToNull(value) {
  if (value == null) return null
  const s = String(value).trim()
  return s === '' ? null : s
}

export function credentialFilePath(home = process.env.HOME || process.env.USERPROFILE || os.homedir()) {
  return path.join(home, '.config', 'jira-certs', 'jira-pat.txt')
}

/**
 * Resolve a Jira PAT without logging it.
 * @returns {{ token: string | null, source: string, path?: string }}
 */
export function resolveJiraToken({
  env = process.env,
  readFileSync = fs.readFileSync,
  filePath,
} = {}) {
  const canonical = trimToNull(env.JIRA_PERSONAL_TOKEN)
  if (canonical) return { token: canonical, source: 'env:JIRA_PERSONAL_TOKEN' }

  const alias = trimToNull(env.JIRA_PAT)
  if (alias) return { token: alias, source: 'env:JIRA_PAT' }

  const resolvedPath = filePath || credentialFilePath()
  try {
    const firstLine = String(readFileSync(resolvedPath, 'utf8')).split(/\r?\n/, 1)[0]
    const fromFile = trimToNull(firstLine)
    if (fromFile) return { token: fromFile, source: 'file', path: resolvedPath }
  } catch (err) {
    if (err && err.code !== 'ENOENT') throw err
  }

  return { token: null, source: 'empty' }
}
