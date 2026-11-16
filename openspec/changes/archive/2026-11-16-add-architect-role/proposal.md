# Proposal

## Why

Role separation today covers post-implementation verification (`developer` / `code-reviewer` / `tester`) but not architecture design. Design docs are still produced by the organizer in the same context that later implements code, so "architecture only, no code" cannot be enforced or independently evidenced.

## What Changes

- Add engineering-level role `architect` under `.claude/agents/` (alongside existing `developer` / `code-reviewer` / `tester`); extend `_contract.md` write boundaries and model-tier call sites.
- `architect` MAY write design documents (task-card `Artifacts`; default `openspec/changes/<name>/design.md`) and MUST NOT modify production or test code; default model tier is `escalated`.
- When a role contract is present, PDCA hosts (`solve-workflow` / `opsx-solve-workflow` / `jira-fix-workflow` / `opsx-jira-fix-workflow`) dispatch `architect` after solution selection and before solution review, only when an explicit architecture mark **or** a verifiable architecture signal fires.
- Manual / on-demand dispatch of `architect` remains available whenever the contract exists.
- No role-contract projects keep current behavior (presence guard unchanged in spirit; design-phase dispatch is also opt-in by contract presence).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `agent-role-separation`: add `architect` write boundary, escalated default tier, design-phase dispatch gate (explicit mark ∨ verifiable signals), and broaden host-integration beyond Stage 8-only wording.
- `jira-fix-workflow`: design/explore stage dispatches `architect` under the same presence guard and gate; keep Stage 8 reviewer/tester dispatch.
- `opsx-solve-workflow`: after solution pick and before solution review, dispatch `architect` when the gate fires and a role contract is present.
- `opsx-jira-fix-workflow`: same design-phase `architect` dispatch under presence guard + gate.

## Impact

- **Engineering config (not distributed)**: `.claude/agents/architect.md`, `_contract.md`, `models.json` call-site table
- **Skills**: `skills/{solve,opsx-solve,jira-fix,opsx-jira-fix}-workflow/SKILL.md` (+ reference snippets if Stage templates need a result-card line)
- **Specs**: `openspec/specs/agent-role-separation`, `jira-fix-workflow`, `opsx-solve-workflow`, `opsx-jira-fix-workflow`
- **Docs**: brief mention in `docs/SKILL_DISTRIBUTION.md` / `AGENTS.md` structure only if they enumerate roles
