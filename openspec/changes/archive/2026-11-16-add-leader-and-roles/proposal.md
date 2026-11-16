# Proposal

## Why

After adding `architect`, role dispatch is still host-hardcoded (design → architect, verify → code-reviewer/tester). Real R&D needs a meta scheduler plus more craft roles, without renaming existing ids.

## What Changes

- Add meta-role `leader` that hosts dispatch with a `Phase`; `leader` selects subordinates per `_contract.md` gates and aggregates result cards.
- Add subordinate roles: `product-manager`, `designer`, `security-reviewer`, `debugger`, `perf-engineer`, `releaser`, `tech-writer`, `researcher`, `retrospector`.
- Keep `developer` / `tester` / `code-reviewer` / `architect` ids unchanged.
- Thin PDCA hosts to dispatch `leader` for `design` and `verify` (presence-guarded) instead of listing subordinate dispatches inline.
- Extend `agent-role-separation` and host specs accordingly.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `agent-role-separation`: catalog, leader meta-role, phase dispatch defaults, write boundaries for new roles; host integration via `leader`.
- `jira-fix-workflow`: Stage 5 design + Stage 8 verify go through `leader`.
- `opsx-solve-workflow`: design and verify phases go through `leader`.
- `opsx-jira-fix-workflow`: design phase goes through `leader` (verify remains host+discipline unless already role-wired).

## Impact

- `.claude/agents/*` (engineering config, not distributed)
- Four PDCA host SKILL.md (+ jira reference template)
- `docs/SKILL_DISTRIBUTION.md`
- OpenSpec main specs for the modified capabilities
