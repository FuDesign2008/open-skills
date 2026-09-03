## 1. Discipline: activation and thin freeze

- [x] 1.1 In `skills/ai-proxy-discipline/SKILL.md`, change PDCA host-exit and integration-guide activation from queue-child conjunction to `Stage-exit policy: ai-proxy` on this-run contract or task card (queue child remains a sufficient source). The stop-point-forecast sentence MUST cover independent thin freeze as well as queue child, not only delete the conjunction. Bump version 1.4.0 → 1.5.0.
- [x] 1.2 Add independent thin-freeze rules (verbal trigger ≠ occupancy; required fields; conversation-local contract; occupancy after confirm). Point at `reference.md` for the freeze template; do not paste the charter.
- [x] 1.3 Carve presence tier 1: explicit opt-in + completed freeze MAY occupy later checkpoints; freeze Q&A stays with the present human. Adjust frontmatter Do NOT so it does not veto that grant. Keep description ≤1024.
- [x] 1.4 Add a thin-freeze output template to `skills/ai-proxy-discipline/reference.md` (destination, constraints, policy, stop-point forecast). Keep Counterpart Prompt unchanged.

## 2. Lifecycle overlay recognition

- [x] 2.1 In `skills/workflow-mode-lifecycle/SKILL.md`, add overlay recognition, 「切换 ai-proxy」, revert-to-manual clearing overlay, implicit-continuation ban, batch explicit `Stage-exit policy` pass. State overlay maps to auto carrier + policy; do not inline the charter. When both an auto trigger (「自动*」) and an overlay trigger appear, overlay+freeze wins over naked auto. Bump 1.0.1 → 1.1.0.
- [x] 2.2 State that hosts whose `description` omits ai-proxy triggers (`write-workflow`) MUST ignore overlay. Do not edit `skills/write-workflow/SKILL.md` or `skills/goal-driven-workflow/SKILL.md`.
- [x] 2.3 If the new batch sentence contradicts `skills/goal-driven-batch/SKILL.md` Mode propagation, add one alignment sentence there without changing three-value semantics; otherwise leave batch unchanged.

## 3. PDCA hosts

Each of 3.1–3.4 MUST include all of: description triggers (中英, quoted if they contain `: `); **host-local** overlay recognition and 「切换 ai-proxy」(not description-only — Jira stage-0 / mode-detection tables included); thin occupancy pointer (policy=ai-proxy → occupy per discipline, queue child not required); stop-point forecast after queue-child supply **and** after independent freeze (do not delete the existing queue-child forecast when replacing Unattended text). Description ≤1024.

- [x] 3.1 `skills/solve-workflow/SKILL.md` as the shared host pattern above. Bump 1.27.1 → 1.28.0.
- [x] 3.2 `skills/opsx-solve-workflow/SKILL.md` same pattern. Bump 1.21.0 → 1.22.0.
- [x] 3.3 `skills/jira-fix-workflow/SKILL.md` same pattern **plus**: rewrite the sentence 「Independent use of this skill (no flag) is unchanged」 so independent ai-proxy occupancy is allowed while PR-open stays **only** behind explicit `queue-child`; non-queue closeout remains the skill’s original stage 9/10 (overlay is not naked auto through merge/writeback). Bump 3.31.0 → 3.32.0.
- [x] 3.4 `skills/opsx-jira-fix-workflow/SKILL.md` same as 3.3 with archive+PR-open still `queue-child`-only. Bump 1.20.0 → 1.21.0.

## 4. Index and verify

- [x] 4.1 Run `node scripts/gen-skill-docs.mjs` and include `docs/generated/skills-index.md` if it changes.
- [x] 4.2 Run `npm run lint:skill-description` on the touched skills (or repo script) and fix any overflow.
- [x] 4.3 `openspec validate pdca-independent-ai-proxy` plus `rg` checks: independent triggers present on four PDCA descriptions; host-local overlay detection present on all four (including Jira mode/stage-0 tables); stop-point forecast retained/extended on all four; `queue child AND` conjunction gone from discipline PDCA section; two Jira skills no longer say independent use is unchanged in a way that forbids occupancy; Jira terminals still `queue-child`-only; `write-workflow` description still has no ai-proxy trigger; `goal-driven-workflow` and `write-workflow` bodies unmodified; `skills/ai-proxy-discipline/` still exists.
