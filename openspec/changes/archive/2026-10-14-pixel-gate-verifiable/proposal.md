# Proposal: pixel gate is a substring, not an intent

## Why

A dialog restore cited a Figma URL and told the agent to match an existing control. The host marked pixel geometry soft and passed a functional probe (visible text, a visibility flag, a list length). Later passes found border, shadow, and focus differences only after a person pointed at them. [PR #326](https://github.com/FuDesign2008/open-skills/pull/326) already forces an exhaustive table once `figma-pixel-verify` is running. It does not force the host to enter that skill when the agent judges the task is "not a pixel restore".

## What changes

- Hosts treat `figma.com` or `node-id=` in the goal, card, issue, or plan as the scope fact. Pixel rows stay hard. A functional probe does not pass them.
- When that text also contains `参考`, `match the existing`, or `same as`, verify adds the named control's hover, focus, and open rules as rows.
- `goal-driven-queue` runs `scripts/check-pixel-tier.mjs` on `verification.md` before engine-done.

## Non-goals

- Rebuilding the exhaustive spec table, source reconciliation, differential sweep, or independent re-check from PR #326.
