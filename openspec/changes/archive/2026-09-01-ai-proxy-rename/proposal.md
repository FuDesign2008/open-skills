# Proposal: ai-proxy rename

## Why

The Stage-exit policy vocabulary (`manual-pause | counterpart | auto-escape`) violated the repo's unified language: `auto-escape` duplicates the solve-series **auto mode** under a second name (canonical mode names live in `workflow-mode-lifecycle`), `manual-pause` likewise deviates from `manual`, and `counterpart` (对手方) is legal jargon users find hard to understand. Naming should be unified across the project — value ↔ skill ↔ capability three layers, one name.

## What Changes

- Policy vocabulary becomes **`manual | ai-proxy | auto`** — the canonical mode names plus `ai-proxy` (AI 代理) for the seat-filling overlay; mechanism descriptions (named escapes, stop-and-ask) stay in prose, not in value names.
- Skill renamed `ai-counterpart-discipline` → **`ai-proxy-discipline`** (hard cut, no alias dir, per repo rename rule); spec capability `ai-counterpart` → **`ai-proxy`** (requirements carried with terminology updated).
- Ledger marker `counterpart-made` → `proxy-made`; section title "Unattended counterpart exits" → "Unattended proxy exits"; Chinese triggers 「AI 对手方」「对手方质询」→「AI 代理」「代理质询」.
- Legacy mapping (one line, zero migration): legacy `Counterpart: on` / `counterpart` values read as `ai-proxy`; legacy `manual-pause` / `auto-escape` read as `manual` / `auto`.

## Capabilities

### New Capabilities

- `ai-proxy`: carried over from `ai-counterpart` (all six requirements, terminology updated).

### Modified Capabilities

- The `ai-counterpart` capability directory is removed at file level (git rm) — renamed to `ai-proxy`; its requirements are carried, terminology-updated, by the `ai-proxy` ADDED delta (openspec cannot express "empty a spec" via REMOVED).
- `goal-queue`: policy vocabulary + 代理检查点接线 requirement rename (from 对手方检查点接线).
- `goal-run`: same rename + vocabulary.

## Impact

6 skills (rename + version bumps: ai-proxy-discipline 1.3.0, batch 0.10.0, workflow 0.6.0, solve 1.27.0, opsx 1.21.0, jira-fix 3.29.0), AGENTS.md registry, evals terminology, index regeneration. No behavior change — pure vocabulary unification with legacy mappings.
