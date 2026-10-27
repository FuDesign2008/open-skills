# Proposal

## Why

`merge-discipline` Part R currently blocks Part D until findings are **fixed** (or explicitly skipped), but does not require a fresh dual-axis review on the post-fix tip. Agents therefore often review → patch → continue into Part D, missing defects introduced by the fix itself. We need a hard **review → fix → re-review** loop that exits only when Part R has no blocking findings, with a bounded round cap so the loop cannot run forever.

## What Changes

- Harden Part R so a fail that leads to source-tip fixes **MUST** re-run `pr-code-review` on the new tip before Part D; Part D is allowed only after a pass (no ≥80 Critical/Important on either axis) or an explicit Part R skip 留痕.
- Cap the fail→fix→re-review loop at **3** review rounds per merge attempt; on the cap, pause for the user (continue another review round / accept residual blocking with 留痕 / abort merge).
- Clarify Fail decision wording so “fixed” alone is not a Part D unlock.
- Thin-sync `pr-code-review` host contract so “until fixed” becomes “until re-reviewed clean (or explicit skip)”, owned by Part R orchestration.
- Update `merge-discipline` reference checklist and evals for the loop + cap.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `merge-discipline`: Part R pass/fail and ordering — add until-clean re-review loop and 3-round cap before Part D.
- `pr-code-review`: Host / Part R contract — fail no longer implies “fixed ⇒ merge path”; Part R owns re-review-until-clean.

## Impact

- Skills: `skills/merge-discipline/SKILL.md`, `reference.md`, `evals/evals.json`; `skills/pr-code-review/SKILL.md` (host-contract line only).
- Specs: `openspec/specs/merge-discipline`, `openspec/specs/pr-code-review`.
- Hosts (`feature-branch-closeout`, PDCA merge pointers): keep thin one-line Part A→D pointers; no host rewrite unless a descriptive “until fixed” citation appears (iron rule 9 sweep at implement time).
- Runtime: one merge attempt may run Part R up to 3 times after successive fix tips; depth still follows existing post-fail → full escalation.
