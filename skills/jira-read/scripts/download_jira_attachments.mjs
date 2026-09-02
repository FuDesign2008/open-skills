#!/usr/bin/env node
/**
 * Download a Jira attachment (PAT Bearer + mTLS PEM; Basic fallback).
 * Usage: download_jira_attachments.mjs <attachment-id> <filename> <output-path>
 * Env:   JIRA_URL (required). Token from JIRA_PERSONAL_TOKEN, else JIRA_PAT, else jira-pat.txt.
 *        Never logs the PAT. Prefer this script when curl is Schannel (Windows).
 */
import fs from 'node:fs'
import https from 'node:https'
import os from 'node:os'
import path from 'node:path'
import { resolveJiraToken, credentialFilePath } from './resolve-jira-token.mjs'

function fail(msg, code = 1) {
  console.error(msg)
  process.exit(code)
}

if (process.argv.length !== 5) {
  fail('Usage: download_jira_attachments.mjs <attachment-id> <filename> <output-path>', 2)
}

const attId = process.argv[2]
const attFilename = process.argv[3]
const out = process.argv[4]
const jiraUrl = (process.env.JIRA_URL || '').trim()
if (!jiraUrl) fail('JIRA_URL must be set (your Jira base URL, e.g. https://jira.example.com)')

const resolved = resolveJiraToken()
if (!resolved.token) {
  fail(
    `Credential chain empty: set JIRA_PERSONAL_TOKEN (alias JIRA_PAT), or write a one-line PAT to ${credentialFilePath()}`,
  )
}

const home = process.env.HOME || process.env.USERPROFILE || os.homedir()
const certPath = process.env.JIRA_CLIENT_CERT || path.join(home, '.config', 'jira-certs', 'client.crt')
const keyPath = process.env.JIRA_CLIENT_KEY || path.join(home, '.config', 'jira-certs', 'client.key')
const sslVerify = process.env.JIRA_SSL_VERIFY !== 'false'

let cert
let key
try {
  cert = fs.readFileSync(certPath)
  key = fs.readFileSync(keyPath)
} catch {
  fail(`mTLS cert/key not readable: ${certPath} / ${keyPath}`)
}

const target = new URL(
  `/secure/attachment/${encodeURIComponent(attId)}/${encodeURIComponent(attFilename)}`,
  jiraUrl.endsWith('/') ? jiraUrl : `${jiraUrl}/`,
)

function requestOnce(authHeader, redirectLeft = 8) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: target.hostname,
        port: target.port || 443,
        path: `${target.pathname}${target.search}`,
        method: 'GET',
        headers: { Authorization: authHeader },
        key,
        cert,
        minVersion: 'TLSv1.3',
        rejectUnauthorized: sslVerify,
      },
      (res) => {
        const loc = res.headers.location
        if (res.statusCode >= 300 && res.statusCode < 400 && loc && redirectLeft > 0) {
          res.resume()
          const next = new URL(loc, target)
          target.hostname = next.hostname
          target.port = next.port
          target.pathname = next.pathname
          target.search = next.search
          resolve(requestOnce(authHeader, redirectLeft - 1))
          return
        }
        if (res.statusCode !== 200) {
          res.resume()
          reject(Object.assign(new Error(`HTTP ${res.statusCode}`), { statusCode: res.statusCode }))
          return
        }
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => resolve(Buffer.concat(chunks)))
        res.on('error', reject)
      },
    )
    req.on('error', reject)
    req.end()
  })
}

fs.mkdirSync(path.dirname(out), { recursive: true })

let body
try {
  body = await requestOnce(`Bearer ${resolved.token}`)
} catch {
  console.error('Bearer auth download failed, trying Basic auth...')
  const basic = Buffer.from(`${resolved.token}:x-oauth-basic`, 'utf8').toString('base64')
  body = await requestOnce(`Basic ${basic}`)
}

if (!body || body.length === 0) {
  fail(`Download failed or empty file: ${out}`)
}

fs.writeFileSync(out, body)
const kb = (body.length / 1024).toFixed(1)
console.log(`Downloaded: ${out} (${kb}K)`)
