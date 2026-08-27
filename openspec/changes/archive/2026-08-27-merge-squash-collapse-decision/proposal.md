## Why

Part D's squash decision currently prompts on every merge ("always ask"), but when the decision space collapses to a single viable option the prompt carries zero information: a single-commit MR has nothing to consolidate, and a repo whose settings allow exactly one merge method offers no real choice. Users asked for one-pass closure of all such pseudo-prompts instead of piecemeal fixes.

## What Changes

- Part D Step 0 gains a **collapse pre-check**: when fewer than two viable strategies exist — exactly one commit ahead of base, or platform/repo policy permitting a single merge method — the step states its conclusion plus a one-line reason and proceeds **without prompting**. The user can still override from the stated conclusion, so the anti-default rationale ("never silently pick between divergent outcomes") is preserved rather than weakened.
- All ≥2-commit scenarios keep today's quality-based recommendation + explicit confirmation flow unchanged.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `merge-discipline`: the "squash decision step" requirement is extended with the collapse pre-check semantics and two new scenarios; the frontmatter description's "always ask" wording relaxes to ask-when-divergent.

## Impact

- Files: `skills/merge-discipline/SKILL.md` (frontmatter description sentence + Part D Step 0), `openspec/specs/merge-discipline/spec.md` via delta sync, one summary line in AGENTS.md 合并偏好 section.
- No other part (A/B/C/R) or referencing host changes; consumers inherit automatically since merge-discipline is shared.
