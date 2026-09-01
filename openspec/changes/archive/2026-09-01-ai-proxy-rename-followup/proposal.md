# Proposal: ai-proxy rename followup

## Why

The ai-proxy-rename sweep derived its file list too narrowly: `intake-interview-discipline` (3 body mentions wired in by earlier changes) and the `intake-deep-interview` spec's 第三应答源 requirement still carried the old counterpart vocabulary after the main rename archived. Same rename, missed surface — this followup closes the residue to zero.

## What Changes

Terminology-only: `skills/intake-interview-discipline/` (0.4.0 → 0.5.0) swept to proxy terms; `intake-deep-interview` 第三应答源（AI 对手方）requirement renamed to （AI 代理）with content swept. No behavior change.

## Capabilities

### New Capabilities
(none)
### Modified Capabilities
- `intake-deep-interview`: 第三应答源 requirement rename + terminology sweep.

## Impact

1 skill + 1 spec delta; rides PR #300's branch.
