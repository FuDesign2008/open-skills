## Why

`jira-fix-workflow` (~781 lines) and `opsx-jira-fix-workflow` (~557 lines) remain far longer than the already-thinned solve family (~373/396). Shared skills are declared, but host bodies still restate merge Red Flags, env-enhancement blocks, exit boilerplate, and a near-copy **Jira status writeback** SOP. Thinning Wave 1 plus extracting writeback into one skill restores the “host = mapping + sinks + intentional divergences” pattern without merging the two hosts’ divergent gates.

## What Changes

- **Wave 1 (both hosts)**: Remove restatements of `merge-discipline` Part C/D, compress env-capability to mapping-only, collapse duplicate quick-reference tables where safe, move bulky templates / OpenSpec field lists into `reference.md`, keep analysis/pdca/clarifying as thin pointers + host-only deltas.
- **Wave 2 in same change**: Add shared skill `jira-status-writeback` as the single source for post-merge Jira transition to「已修复」+ independent `jira_add_comment(body=…)`; both hosts declare it in `dependencies` and replace inline writeback prose with load + field mapping.
- **Non-goals**: No unified `jira-fix-core`; no difficulty-gateway or verification-loop extraction; do not change ensure-tests `advisory` vs `mandatory` divergence; do not change stage numbering or difficulty auto-stop semantics.

## Capabilities

### New Capabilities

- `jira-status-writeback`: Post-merge Jira writeback SOP — transition only to「已修复」, two-step API (`jira_transition_issue` without comment + `jira_add_comment` with `body`), required comment fields via host-supplied placeholders, failure handling (warn, do not block).

### Modified Capabilities

- `workflow-contract-sync`: Jira writeback requirement MUST delegate to `jira-status-writeback`; add host-thinning requirements so jira/opsx-jira hosts MUST NOT re-embed merge Part C/D checklists or full env-discovery methodology.

## Impact

- New: `skills/jira-status-writeback/SKILL.md` (+ optional short reference)
- Edit: `skills/jira-fix-workflow/SKILL.md`, `reference.md`; `skills/opsx-jira-fix-workflow/SKILL.md`, `reference.md`
- Host frontmatter `dependencies` + AGENTS skill table if maintained
- `docs/generated/skills-index.md` via gen script / pre-commit
- Behavior: writeback semantics unchanged; hosts become shorter and less drift-prone
