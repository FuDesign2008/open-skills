## Why

`pr-code-review` v1.0 only ports the Claude Code `/code-review` pipeline (eligibility, multi-perspective scan, ≥80 confidence, PR comment). Comparing that with mattpocock’s Standards∥Spec dual-axis review and Superpowers’ plan-aligned requesting/receiving shows clear gaps: no separated axes, weak plan/spec alignment, and no severity calibration. Enriching the skill now — on the same PR #256 branch — lands a single installable best-of-breed before merge-discipline Part R hardens around a thin port.

## What Changes

- **Upgrade** `pr-code-review` to combine:
  - **From Claude:** eligibility gates, multi-perspective review, confidence ≥80 filter, false-positive discard list, full-SHA permalink comments.
  - **From mattpocock:** pin fixed-point / PR base; report **Standards** and **Spec** as separate axes (no cross-axis merge-rank); optional Fowler smell baseline in `reference.md` (repo docs override); Spec axis skip when no spec source.
  - **From Superpowers:** align findings to plan/PR body/OpenSpec delta when available; Critical / Important / Minor severity (mapped into confidence); acknowledge strengths before issues; thin pointer to post-feedback reception discipline (**not** a Part R hard gate).
- **Possibly thin-update** `merge-discipline` Part R pass/fail: block when either axis retains ≥80 Critical/Important issues (Standards∥Spec both must clear).
- Deliver on branch `feat/merge-discipline-pr-code-review` / PR #256 (same tip as the initial port).

**Non-goals:** rename to `code-review`; force `receiving-code-review` before merge; hardcode host model tiers or proprietary agent tools.

## Capabilities

### New Capabilities

- `pr-code-review`: Behavioral contract for the enriched multi-perspective, dual-axis, confidence-filtered PR review skill and its merge-discipline Part R host contract.

### Modified Capabilities

- `merge-discipline`: Part R pass/fail MUST respect dual-axis clearance (either axis with remaining ≥80 Critical/Important blocks merge unless explicit skip 留痕).

## Impact

- Skills: `skills/pr-code-review/SKILL.md` + `reference.md`; possibly `skills/merge-discipline/SKILL.md` Part R wording.
- OpenSpec: new `openspec/specs/pr-code-review/`; delta on `merge-discipline` if a main spec exists, else document Part R only under `pr-code-review` host-contract requirement and a thin `workflow-contract-sync` touch if hosts mention Part R semantics.
- Users: stronger pre-merge review; install path unchanged (`--skill pr-code-review`).
