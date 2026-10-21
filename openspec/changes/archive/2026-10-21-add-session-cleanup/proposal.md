## Why

A finished agent conversation often leaves disposable temp files, background services, and unused browser pages. The costly failure is treating that cleanup as "delete the dirty workspace": uncommitted content that never reached the integration branch gets discarded, while the temp files and servers were the only things safe to remove. A catalog check on 2026-10-21 (`skills.sh` leaderboard and `npx skills find`) found no skill that both covers this closeout and clears the adopt bar (about 1k installs, or an official source). The nearest public neighbor, `leave-no-mess`, had 4 installs and 98 GitHub stars. This repo's `feature-branch-closeout`, `merge-discipline`, and `learn-and-improve` already own the branch menu, merge, and retrospective.

## What Changes

- Add user-invocable `session-cleanup` (`skills/session-cleanup/SKILL.md`): English body, Chinese triggers in the description, platform-agnostic intents.
- The skill inventories what this session created, classifies each item by what is lost if the action is wrong, preserves unique uncommitted content, stops background services this session started, closes browser pages this session opened and no longer needs, deletes disposable temp files, and reports anything left in place.
- It does not merge, present the branch closeout menu, remove worktrees, or run a retrospective. When those are still open, it names the owning skill.
- Add `skills/session-cleanup/evals/evals.json` for trigger and ordering checks.
- Regenerate `docs/generated/skills-index.md` and add the skill to the category table in `AGENTS.md`.

## Capabilities

### New Capabilities

- `session-cleanup`: End-of-conversation resource closeout. Inventory, loss-based classification, preserve-before-destroy against the integration ref, stop session-started background services, close unused session pages, delete disposable temp files, and a leftover report. Merge, branch menu, worktree removal, and retrospective stay with their current skills.

### Modified Capabilities

(none — existing requirement text is unchanged)

## Impact

- New files: `skills/session-cleanup/SKILL.md`, `skills/session-cleanup/reference.md`, `skills/session-cleanup/evals/evals.json`.
- Generated: `docs/generated/skills-index.md`.
- Doc row: `AGENTS.md` skill table.
- No requirement edits under `openspec/specs/feature-branch-closeout/`, `merge-discipline/`, or `learn-and-improve/`.
- Case notes used as input stay out of the skill body: no internal product names, hosts, ticket ids, or private paths.
