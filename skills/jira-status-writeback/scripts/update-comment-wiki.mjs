#!/usr/bin/env node
/**
 * update-comment-wiki.mjs — post/update a Jira Server/DC comment with verbatim Wiki markup,
 * then verify markup fidelity against the stored body read back from the API.
 *
 * Usage:
 *   node update-comment-wiki.mjs <ISSUE-KEY> [commentId] [--file <path>]
 *   cat body.wiki | node update-comment-wiki.mjs <ISSUE-KEY> [commentId]
 *
 * commentId omitted -> create (POST), present -> update (PUT).
 * Wiki body: --file <path>, or stdin when stdin is not a TTY.
 *
 * Env:
 *   JIRA_URL (required)
 *   JIRA_CLIENT_CERT / JIRA_CLIENT_KEY  (optional mTLS; default ~/.config/jira-certs/client.crt|.key)
 *   JIRA_SSL_VERIFY=false to disable TLS verification
 * Token via the jira-read credential chain. Never logged.
 *
 * Exit codes: 0 ok | 1 HTTP/request failure | 2 usage or credential error | 3 fidelity FAIL.
 */
import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveJiraToken } from '../../jira-read/scripts/resolve-jira-token.mjs'

const USAGE = `Usage: node update-comment-wiki.mjs <ISSUE-KEY> [commentId] [--file <path>]
  commentId omitted: create a new comment (POST); present: update (PUT).
  Wiki body: read from --file <path>, or from stdin when stdin is not a TTY.
  Env: JIRA_URL (required). Credentials via jira-read chain (token never logged).`

// Pure helper: verify key Wiki markers survived the write channel verbatim.
export function checkFidelity(sent, stored) {
  const issues = []
  const sentText = typeof sent === 'string' ? sent : ''
  const storedText = typeof stored === 'string' ? stored : ''

  if (!storedText) {
    issues.push('stored body is empty or missing (tool response carried no body field?)')
    return { faithful: false, issues }
  }

  const pushMissing = (marker) => {
    issues.push(`wiki marker missing from stored body: ${JSON.stringify(marker)}`)
  }

  for (const marker of sentText.match(/^h[1-6]\.\s/gm) || []) {
    if (!storedText.includes(marker)) pushMissing(marker)
  }
  for (const marker of sentText.match(/\*[^*\n]+\*/g) || []) {
    if (!storedText.includes(marker)) pushMissing(marker)
  }
  for (const marker of sentText.match(/\{\{[^}\n]+\}\}/g) || []) {
    if (!storedText.includes(marker)) pushMissing(marker)
  }
  for (const marker of sentText.match(/\[[^\]\n|]+\|https?:\/\/[^\]\n]+\]/g) || []) {
    if (!storedText.includes(marker)) pushMissing(marker)
  }

  // Heading rewrite: sent has h3. headings but stored body has zero line-start h3.
  if (/^h3\.\s/m.test(sentText) && (storedText.match(/^h3\.\s/gm) || []).length === 0) {
    issues.push('heading rewritten: sent has h3. heading(s) but stored body has none (e.g. turned into Markdown ###)')
  }

  return { faithful: issues.length === 0, issues }
}

function fail(msg, code = 1) {
  console.error(msg)
  process.exit(code)
}

function parseArgs(argv) {
  const positional = []
  let file = null
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--file') {
      file = argv[++i] ?? null
    } else if (argv[i].startsWith('--file=')) {
      file = argv[i].slice('--file='.length)
    } else {
      positional.push(argv[i])
    }
  }
  return { positional, file }
}

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = []
    process.stdin.on('data', (c) => chunks.push(c))
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    process.stdin.on('error', reject)
  })
}

// mTLS only when both cert and key resolve; otherwise a plain agent.
function buildAgent(sslVerify) {
  const home = process.env.HOME || process.env.USERPROFILE || os.homedir()
  const certPath = process.env.JIRA_CLIENT_CERT || path.join(home, '.config', 'jira-certs', 'client.crt')
  const keyPath = process.env.JIRA_CLIENT_KEY || path.join(home, '.config', 'jira-certs', 'client.key')
  const options = { rejectUnauthorized: sslVerify }
  try {
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      options.cert = fs.readFileSync(certPath)
      options.key = fs.readFileSync(keyPath)
    }
  } catch {
    // fall through to plain agent
  }
  return new https.Agent(options)
}

async function request(target, method, payload, agent, sslVerify, token) {
  return new Promise((resolve, reject) => {
    const mod = target.protocol === 'http:' ? http : https
    const req = mod.request(
      {
        hostname: target.hostname,
        port: target.port || (target.protocol === 'http:' ? 80 : 443),
        path: `${target.pathname}${target.search}`,
        method,
        agent,
        rejectUnauthorized: sslVerify,
      },
      (res) => {
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => resolve({ statusCode: res.statusCode, text: Buffer.concat(chunks).toString('utf8') }))
        res.on('error', reject)
      },
    )
    req.on('error', reject)
    req.setHeader('Authorization', `Bearer ${token}`)
    if (payload) {
      req.setHeader('Content-Type', 'application/json')
      req.setHeader('Content-Length', Buffer.byteLength(payload))
      req.write(payload)
    }
    req.end()
  })
}

async function main() {
  const { positional, file } = parseArgs(process.argv.slice(2))
  const [issueKey, commentId] = positional
  if (!issueKey) fail(USAGE, 2)

  let wikiBody
  if (file) {
    wikiBody = fs.readFileSync(file, 'utf8')
  } else if (!process.stdin.isTTY) {
    wikiBody = await readStdin()
  } else {
    fail(USAGE, 2)
  }

  const jiraUrl = (process.env.JIRA_URL || '').trim()
  if (!jiraUrl) fail('JIRA_URL must be set (your Jira base URL, e.g. https://jira.example.com)', 2)

  const resolved = resolveJiraToken()
  if (!resolved.token) {
    fail(
      `Credential chain empty (source: ${resolved.source}): set JIRA_PERSONAL_TOKEN (alias JIRA_PAT), or write the PAT to ~/.config/jira-certs/jira-pat.txt`,
      2,
    )
  }

  const sslVerify = process.env.JIRA_SSL_VERIFY !== 'false'
  const target = new URL(
    commentId
      ? `/rest/api/2/issue/${encodeURIComponent(issueKey)}/comment/${encodeURIComponent(commentId)}`
      : `/rest/api/2/issue/${encodeURIComponent(issueKey)}/comment`,
    jiraUrl.endsWith('/') ? jiraUrl : `${jiraUrl}/`,
  )
  const payload = JSON.stringify({ body: wikiBody })

  let res
  try {
    res = await request(
      target,
      commentId ? 'PUT' : 'POST',
      payload,
      buildAgent(sslVerify),
      sslVerify,
      resolved.token,
    )
  } catch (err) {
    fail(`Request failed: ${err && err.message ? err.message : err}`, 1)
  }

  if (res.statusCode !== 200 && res.statusCode !== 201) {
    fail(`HTTP ${res.statusCode}: ${res.text.slice(0, 400)}`, 1)
  }

  let parsed
  try {
    parsed = JSON.parse(res.text)
  } catch {
    fail(`Invalid JSON response: ${res.text.slice(0, 400)}`, 1)
  }

  const fid = checkFidelity(wikiBody, typeof parsed.body === 'string' ? parsed.body : '')
  console.log(`HTTP ${res.statusCode} | comment id: ${parsed.id} | fidelity: ${fid.faithful ? 'PASS' : 'FAIL'}`)
  for (const issue of fid.issues) {
    console.error(`fidelity issue: ${issue}`)
  }
  process.exitCode = fid.faithful ? 0 : 3
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href
if (isDirectRun) {
  main().catch((err) => {
    console.error(err && err.message ? err.message : err)
    process.exitCode = 1
  })
}
