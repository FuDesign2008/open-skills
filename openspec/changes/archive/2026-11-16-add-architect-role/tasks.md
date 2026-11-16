# Tasks

## 1. Role contract & agent definition

- [x] 1.1 Add `.claude/agents/architect.md` (result card, design-doc work, write/read tool set without production edits, `escalated` tier, boundaries)
- [x] 1.2 Update `.claude/agents/_contract.md`: write boundaries for `architect`; model-tier call-site row; design-phase gate signal list (SoT); organizer diff check for design paths
- [x] 1.3 Confirm `models.json` still maps `escalated` (no change unless missing)

## 2. Spec / docs sync (iron law 9)

- [x] 2.1 Keep delta specs under `openspec/changes/add-architect-role/specs/` consistent with implementation as hooks land
- [x] 2.2 Grep mentions of Write boundaries / Host integration / Stage 8 role enum / `developer`/`tester`/`code-reviewer` catalogs; sync any descriptive enumerations in `docs/SKILL_DISTRIBUTION.md` / `AGENTS.md` if they list roles
- [x] 2.3 Update `agent-role-separation` Purpose already done in main spec; avoid re-TBD on archive

## 3. Host thin hooks

- [x] 3.1 `skills/solve-workflow/SKILL.md` — after Stage 3 selection, before Stage 4 review: presence guard + gate + dispatch `architect` + fail-closed accept
- [x] 3.2 `skills/opsx-solve-workflow/SKILL.md` — same Phase 3→4 boundary; note design.md handoff when architect wrote it
- [x] 3.3 `skills/jira-fix-workflow/SKILL.md` — Stage 5 after pick / before review; optional reference.md result-card line
- [x] 3.4 `skills/opsx-jira-fix-workflow/SKILL.md` — explore/review after pick / before `staged-review-flow`

## 4. Verification

- [x] 4.1 `openspec validate add-architect-role --strict` (and `--strict --all` if required by host)
- [x] 4.2 Grep hosts for shared gate phrases / presence-guard wording consistency
- [x] 4.3 Manual checklist: no-contract skip; mark trigger; signal trigger; architect production-file reject path documented in contract
