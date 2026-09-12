# Proposal: add `evolution-review` skill

## Why

A real 4.5-month solo business experiment (AI-music side project, 307 releases, ¥95 total revenue) produced a working portfolio-selection mechanism — dual-metric inventory, two-period fixation, extinction with recorded failure recipes, a 15~20% mutation quota, a 3-month rolling window, and diversity checks. The mechanism was validated in production use (one line fixed, two lines/extinction decisions executed, negative-ROI operations killed) but lives only in a private project's notes. Anyone running a portfolio of works/experiments/products (solo builders, side projects, content creators, small teams) faces the same failure mode: gut-feeling reviews, sunk-cost lock-in, single-month whiplash. No existing catalog skill covers "portfolio-level, data-driven monthly selection review".

## What Changes

- Add `skills/evolution-review/SKILL.md` (v1.0.1, English body per AGENTS.md 铁律 3, Chinese trigger words in description, `user-invocable: true`) carrying the six-step mechanism (inventory → fixation → extinction → mutation quota → rolling window → diversity check), six iron rules, and a rolling ledger template.
- Add `skills/evolution-review/evals/evals.json` (2 evals, 7 assertions) covering the core disciplines: data-first, three-valued verdicts, rolling window, mutation quota as ceiling+floor, sunk-cost recognition, kill-action concreteness.
- Regenerate `docs/generated/skills-index.md` (mechanical product of `gen-skill-docs.mjs`).
- Fix the long-outdated README badges (skills-11 → actual count) in both languages.

## Capabilities

### New Capabilities

- `evolution-review`: data-driven portfolio-level monthly selection review — dual-metric inventory from platform data (never self-report), two-period confirmation before fixation, extinction with recorded failure recipes, mutation quota as both ceiling and floor (15~20%), 3-month rolling window (single-month swings never change direction), diversity check, three-valued verdicts (Fixed/Observing/Extinct), and a rolling ledger template. Chain with `learn-and-improve` (single-task retrospective) — portfolio selection first, single-item retrospective second.

### Modified Capabilities

(none — no existing spec's requirements change)

## Impact

- Files added: `skills/evolution-review/SKILL.md`, `skills/evolution-review/evals/evals.json`; regenerated: `docs/generated/skills-index.md`; updated: `README.md` / `README.zh-CN.md` badges, `RELEASE-NOTES.md` Unreleased entry.
- Provenance de-identification: the source business is described only in aggregate numbers; project names/paths are not referenced in the skill body (private repo, not distributable).
- Boundary (description-level): distinct from `learn-and-improve` (single-task retrospective) — this skill owns portfolio-level selection.

---
_记录性归档：实现先于沉淀（merge-discipline Part R 的 FAIL 修复轮中补做 openspec 沉淀；实现已在 PR #312 评审通过的方向上完成）。_
