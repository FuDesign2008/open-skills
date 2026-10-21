## Context

The source skill was field-tested in a private workspace across 2026-09/10 on a live e-sign automation chain (verification-code steps read end to end, including two overnight unattended batches). Its operational core (chat.db direct read, freshness gate, sync-delay pacing, three-class sync-failure diagnostic tree) is generic; its case narrative (an e-sign platform name, a project codename, release-batch case numbers, a project resume script) is project-specific. The port must satisfy 铁律 2 (de-identification), 3 (English body + Chinese triggers), 7 (single-line quoted description ≤1024), and the `skill-naming` spec. The run executes unattended under the queue card's frozen decisions (stage-exit policy ai-proxy); interactive eval-viewer review and the statistical description-optimization loop are therefore deferred, following the astrill-control port precedent.

## Goals / Non-Goals

**Goals:**

- A public, generic `sms-code-reader` skill whose operational knowledge (read queries, freshness gate, pacing, failure-mode table, all three ⭐ deep-dives) survives the port intact.
- Full repo compliance: all gates green (`lint:skill-description`, `lint:deid --base origin/main` no new findings, index regen no-drift, `openspec validate`).
- OpenSpec sediment: change created, validated, archived into `openspec/specs/sms-code-reader/`.

**Non-Goals:**

- Porting the project release-flow narrative (case numbers, batch/track wording, the project resume script) — generalized wording carries the same operational knowledge.
- Touching the oh-my-music workspace (its local variant stays as-is).
- An AGENTS.md skill-table row (outside the frozen touch list; the table defers to the generated index, so no stale contract is left behind).
- A bundled script (the source is pure documentation with inline commands; the port keeps the single-file shape the card froze).

## Decisions

1. **Name `sms-code-reader`** — verb phrase without a role suffix, parallel to `git-commit` / `jira-read` in the `skill-naming` taxonomy (single-point action); name unchanged from the source per the card's constraint.
2. **Single-file shape** — everything in SKILL.md, no reference.md split (card constraint); the body stays well under the 500-line progressive-disclosure ceiling.
3. **Identifier strip scope** — the e-sign platform name (电子牵), the project codename (汽水), release-batch case numbers (release-1002, 208 案例), the project resume script (resume.sh), and track/chain-of-releases wording are replaced by generic wording ("the sender", "the automation chain", "the failed step", "a recovery round"). Generic scenario vocabulary (e-sign / login / identity confirmation) is kept — it names the public use case, not the project.
4. **Field numbers kept faithful** — 0-240 s freshness window, 30-90 s wait, 15 s × 4 polls, ~270 s stall window, <20% battery threshold, ~2 s same-network latency, ~10 s human fallback: all preserved as documented (the astrill port's precedent of keeping field-tested numbers verbatim).
5. **⭐ section markers preserved** — the three deep-dive headings keep the ⭐ marker the source uses to flag hard-won field knowledge; the card names the deep-dives by that marker.
6. **English body, Chinese triggers** (铁律 3); single-line double-quoted description with trigger block and Do-NOT-use boundary (铁律 7).
7. **Eval scope** — four scenario prompts + assertions in `evals/evals.json` encode the deep knowledge (freshness gate + pacing, infrastructure-first triage, Mac-side stall recovery, iCloud rollback immediate-use). The statistical trigger-optimization loop is deferred per the unattended-run precedent; the review pass runs in-session (writer/reviewer separation is provided by the gate read-through against the source inventory, recorded in tasks.md) since the card forbids spawning sub-agents.
8. **Date stamps consolidated** — the source's per-section 实证 date stamps collapse into one field-tested line in the intro (provenance without changelog baggage, per the no-history-in-body rule).

## Verification Notes

- 【覆盖率门控跳过】工程偏好 coverage-gate: never。时间:2026-10-17T21:00+08:00。决策人:项目配置。(merge-discipline Part C)
- Unattended run (queue card batch 20261017-2056, stage-exit policy ai-proxy): stage approvals come from the card's frozen decisions; reviewer-attention items are recorded in the run ledger (completion report) rather than interactive pauses.
