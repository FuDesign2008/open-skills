## Context

`figma-pixel-implement` / `figma-pixel-verify` shipped as opt-in tools. Product owners now want the four PDCA hosts (`solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow`) to **strong-depend** on both and to invoke them under Figma-scope conditions—mirroring how `browser-debug-toolkit` is already mandatory to install even for non-browser tasks.

`solve-workflow` has no dedicated OpenSpec capability file; its behavior is covered by the modified `figma-pixel-fidelity` host list plus direct skill edits. Opsx/Jira hosts gain ADDED requirements mirroring the `learn-and-improve` strong-dep pattern.

## Goals / Non-Goals

**Goals:**

- Frontmatter `dependencies` on all four hosts for both Figma pixel skills; prerequisite abort when missing.
- Thin execute/verify hooks: when to load implement vs verify; no methodology copy.
- Update `figma-pixel-fidelity` to reverse prior opt-in MUST NOT; sync `AGENTS.md`.
- Keep platform-agnostic tool intent inside the Figma skills themselves.

**Non-Goals:**

- New shared routing discipline skill.
- Soft-deps or silent skip when missing.
- Making implement/verify run on every non-UI bug (install yes, invoke no).
- Changing Figma skill internal workflows beyond host wiring.

## Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Dependency shape | Both skills on all four hosts | User chose C; verify without implement still useful for standalone验收 |
| Hook placement | Execute ≈ implement; Verify ≈ verify | Matches skill duties; jira stage numbers differ but same intent |
| solve-workflow spec | No new capability; fidelity + skill edit | No existing `solve-workflow` spec to MODIFY |
| Hook prose | 3–6 lines + trigger names | Thin reference; AGENTS iron law against host changelog fluff |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Partial installs abort all PDCA hosts | Document `--skill '*'`; missing-notice includes both skill ids |
| Token cost of two more deps in missing-notice lists | Prefer “see frontmatter dependencies” where that pattern already exists; else add two bullets |
| Over-triggering implement | Scope predicates: Figma URL/node or explicit pixel-restore / 按稿 intent only |

## Migration Plan

1. Land skill + AGENTS + spec sync in one change.
2. After release, users with selective installs must add the two skills or use full install.
3. No runtime data migration.

## Open Questions

_None — solution 1 confirmed; auto mode execution._
