---
name: completion-evidence-discipline
version: "1.0.0"
user-invocable: false
description: "Hard discipline for verification and completion claims: do NOT claim tests passed, a fix works, or a task is complete without fresh evidence from commands or checks run in the CURRENT turn; label unavailable checks as pending with the exact action required. Referenced by PDCA verification stages via pdca-review-orchestration and host workflows. Triggers — 「完成须有证据」「验证证据纪律」「宣称完成前验证」「completion evidence」 / completion evidence discipline, fresh verification evidence. Do NOT use as a standalone product workflow."
---

# Completion Evidence Discipline

> Internal shared skill. Single source of truth for **fresh-evidence gates** on completion and verification claims. Hosts declare it in `dependencies` (directly or via `pdca-review-orchestration`) and abort if missing — no silent fallback.
>
> **Name note:** this skill is intentionally **not** named `verification-before-completion` (reserved by an external skills repo). Use this name only.

## Iron Law

**NO COMPLETION OR PASS CLAIMS WITHOUT FRESH EVIDENCE FROM THE CURRENT TURN.**

- **Fresh** = produced by a command, check, or observed tool result executed in **this** assistant turn (or an attached log from that same turn).
- **Not fresh** = prior-turn memory, “we designed a test”, subagent success text alone, or assumed green CI.

## Required behavior

When about to claim any of: tests passed, typecheck/build OK, verification complete, bug fixed, ready to merge/archive:

1. **Run** the relevant command/check in this turn, **or**
2. **Label Pending** with the exact manual action still required — and **do not** say it passed.

Compose with `pdca-review-orchestration` verification honesty:

| Label | Meaning |
|-------|---------|
| **Executed** | Command/action + concise output summary from this turn |
| **Pending** | Exact action the user (or a later turn) must still run |

## Forbidden

- Reporting “all green” / “verified” when no verifying command was run this turn
- Treating designed scenarios or unchecked assertions as executed passes
- Renaming or aliasing this skill to `verification-before-completion` inside this repository

## Integration guide

- Hosts: one-line pointer at verification / closeout — load this skill; do not paste the Iron Law prose.
- `pdca-review-orchestration`: honesty rule MUST compose with this gate (Executed ⇒ fresh evidence).
- Prefer `user-invocable: false`; users reach it through PDCA hosts.
