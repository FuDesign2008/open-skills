# Design: pixel gate is a substring

## Decision

Scope is the literal substrings `figma.com` or `node-id=` in the goal, card, issue, or plan. "Pixel-restore intent" is not an input. A gate input must be something a command can see.

## Hosts

`goal-driven-workflow`, `goal-driven-queue`, `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, and `opsx-jira-fix-workflow` load `figma-pixel-implement` / `figma-pixel-verify` on that substring, or when the user asks for pixel restore (像素级还原). Pixel rows stay hard. Visible text, a visibility flag, or a list length does not pass them.

## Shipped reference

When the same text also contains `参考`, `match the existing`, or `same as`, `figma-pixel-verify` reads the named control's hover, focus, focus-within, and open or expanded rules. Each property that differs from rest is a row. A resting-frame reading does not pass those rows.

## Queue checker

`skills/goal-driven-queue/scripts/check-pixel-tier.mjs` reads one markdown file. No `figma.com` / `node-id=` → exit 0. Otherwise exit 1 when a soft/human line or section mentions pixel geometry, or the file does not cite `check-figma-verify-report.mjs`.

## Approval

The user asked to adjust this repo's skills. Design-approval escape: that request. Time: 2026-10-14T01:40:00Z.
