#!/usr/bin/env node
// Called from goal-driven-queue/SKILL.md assembly on verification.md.
// Scope fact: the file contains "figma.com" or "node-id=".
// Fail when pixel geometry sits under soft/human, or the hard line
// does not cite check-figma-verify-report.mjs.
import fs from 'node:fs'

const file = process.argv[2]
if (!file) {
  console.error('usage: check-pixel-tier.mjs <markdown>')
  process.exit(2)
}

const text = fs.readFileSync(file, 'utf8')
if (!/figma\.com|node-id=/.test(text)) {
  console.log('pixel-tier: not in scope')
  process.exit(0)
}

let tier = ''
let softOrHuman = false
for (const line of text.split('\n')) {
  const heading = line.match(/^#{2,3}\s+(Hard|Soft|Human)\b/i)
  if (heading) tier = heading[1].toLowerCase()
  const mentionsPixel = /像素|pixel/i.test(line)
  if ((tier === 'soft' || tier === 'human') && mentionsPixel) softOrHuman = true
  if (/soft[^\n]{0,160}(像素|pixel)/i.test(line)) softOrHuman = true
  if (/human[^\n]{0,160}(像素|pixel)/i.test(line)) softOrHuman = true
}

const citesChecker = /check-figma-verify-report\.mjs/.test(text)
if (softOrHuman || !citesChecker) {
  console.error(
    'pixel-tier: FAIL — figma.com or node-id= is in scope; pixel rows must stay hard and cite check-figma-verify-report.mjs'
  )
  process.exit(1)
}

console.log('pixel-tier: PASS')
process.exit(0)
