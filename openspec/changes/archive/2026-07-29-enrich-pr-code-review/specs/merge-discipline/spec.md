## ADDED Requirements

### Requirement: Part R SHALL run pr-code-review before tip pinning

After Part C (coverage) resolves to continue, and before Part D (tip pinning), `merge-discipline` MUST load strong dependency `pr-code-review` and run it against the open PR/MR about to be merged. Missing `pr-code-review` MUST abort with a per-skill install command (`npx skills add FuDesign2008/open-skills -g --skill pr-code-review --yes`). Execution order MUST be A → B → C → R → D → merge.

#### Scenario: Order includes Part R

- **WHEN** a protected-branch merge is imminent and Parts A–C have passed
- **THEN** Part R runs `pr-code-review` before any tip-pin merge command

### Requirement: Part R pass/fail SHALL use dual-axis clearance

Part R MUST treat `pr-code-review` as failed (block merge) when either the Standards or Spec axis retains one or more issues at confidence ≥80 with severity Critical or Important, unless the user gives an explicit Part R skip 留痕. Minor-only survivors or all scores below 80 MUST count as Part R pass. Part R MUST NOT require a receiving-code-review reception loop to pass.

#### Scenario: Spec-axis Important blocks merge

- **WHEN** `pr-code-review` posts an Important Spec finding scored ≥80 and Standards is clean
- **THEN** merge-discipline blocks Part D until fixed or explicit skip 留痕

#### Scenario: Dual-axis clean proceeds to tip pin

- **WHEN** both axes have no remaining ≥80 Critical/Important issues
- **THEN** Part R passes and Part D tip pinning runs next

## MODIFIED Requirements

### Requirement: Coverage gate SHALL honor project preference then per-merge ask

Before running `test-coverage-analyzer`, Part C SHALL resolve a project coverage preference by scanning `AGENTS.md` then `CLAUDE.md` (first match wins) for an explicit `coverage-gate:` value of `always`, `never`, or `ask`. If no declaration is found, the preference SHALL be treated as `ask`.

- **`always`**: run the gate script path without asking (subject to analyzer availability rules).
- **`never`**: skip the analyzer, write a project-preference skip 留痕, and proceed to **Part R** (PR code review), not directly to tip pinning.
- **`ask`**: on every merge, ask the user whether to run coverage or skip this merge; MUST NOT auto-run. Skip requires user-explicit skip 留痕 before **Part R**.

#### Scenario: Unset preference asks every merge

- **WHEN** merge is imminent and neither `AGENTS.md` nor `CLAUDE.md` declares `coverage-gate:`
- **THEN** the agent asks whether to run or skip coverage for this merge and does not start the analyzer until the user chooses run

#### Scenario: Project preference never skips without asking

- **WHEN** `AGENTS.md` or `CLAUDE.md` declares `coverage-gate: never`
- **THEN** Part C skips the analyzer, writes project-preference skip 留痕, and proceeds to **Part R** without asking

#### Scenario: Project preference always runs when analyzer exists

- **WHEN** preference is `always` and `test-coverage-analyzer` is available
- **THEN** Part C runs the gate script with constructed `--base` without asking

#### Scenario: User chooses skip under ask preference

- **WHEN** preference is `ask` and the user chooses to skip coverage for this merge
- **THEN** Part C writes user-explicit skip 留痕 and proceeds to **Part R** without running the analyzer

### Requirement: Coverage gate SHALL detect test-coverage-analyzer availability

After the preference/ask decision resolves to **run**, the skill SHALL scan the environment for `test-coverage-analyzer`. If found, run the gate script with a constructed `--base` (target branch from MR/PR metadata). If not found, write an environment-miss留痕 and let the user decide whether to proceed. If the decision resolved to **skip**, this availability scan and script run SHALL NOT be required.

#### Scenario: Coverage analyzer available and passing

- **WHEN** the user or preference selected run, test-coverage-analyzer is detected, and coverage meets threshold
- **THEN** proceed to **Part R** (PR code review), then tip-pinning after Part R passes

#### Scenario: Coverage analyzer unavailable

- **WHEN** the user or preference selected run and test-coverage-analyzer is not detected in environment
- **THEN** write environment-miss留痕 (timestamp + "system: env gap") and present to user for decision

#### Scenario: Coverage below threshold or script crash

- **WHEN** coverage is below threshold, or script crashes, or no report, or no test code
- **THEN** pause merge and present report to user for decision (force-merge / add tests / abort)

#### Scenario: Skip decision does not require analyzer

- **WHEN** preference is `never` or the user chose skip under `ask`
- **THEN** Part C proceeds to **Part R** without requiring `test-coverage-analyzer` to be present

### Requirement: Tip pinning SHALL prevent stale-tip merge race

After **Part R** passes and before the merge command executes, the skill SHALL pin the merge revision to the just-pushed tip, preventing the race where a merge fast-forwards to a pre-push tip while freshly-pushed commits stay on the source branch.

#### Scenario: Pin merge revision with --sha

- **WHEN** the source branch tip was just pushed and is ready to merge
- **THEN** compute `MERGE_SHA=$(git rev-parse origin/<source-branch>)` and merge with `glab mr merge <id> --sha "$MERGE_SHA" -y` (GitLab) or `gh pr merge <id> --match-head-commit "$MERGE_SHA"` (GitHub)

#### Scenario: Platform CLI lacks --sha support

- **WHEN** the platform CLI does not support tip-pin flags
- **THEN** wait for the just-pushed tip's pipeline to pass before merging, and treat the post-merge ancestor check as the mandatory backstop

### Requirement: OpenSpec archive association gate SHALL run before merge Parts B–D

When a merge into a protected branch is imminent (workflow branch-closeout selecting merge, direct user merge command, or AI preparing `glab mr merge` / `gh pr merge`), `merge-discipline` MUST first determine whether the current branch/PR is **associated** with an active OpenSpec change. Association is true if either: (1) the PR or branch diff includes paths under `openspec/changes/<name>/` that are not under `openspec/changes/archive/`, or (2) a session-bound OpenSpec change name still appears in `openspec list` as active. If not associated, the gate MUST pass through to Part B without requiring archive. If associated and the change is still active, the skill MUST **block** the merge, report the active change name(s), and require archive (specs sync + move to `openspec/changes/archive/`) on the same source tip before Parts B→C→R→D may continue. The gate MUST NOT be implicitly skipped when the user issues a direct merge command.

#### Scenario: Associated active change blocks merge

- **WHEN** the user says "merge MR" and the PR diff still contains `openspec/changes/archive-before-merge/` (active, not archived)
- **THEN** merge-discipline blocks merge, names the active change, and does not run Part B/C/R/D or the merge command until archive completes on that tip

#### Scenario: Unassociated PR passes through

- **WHEN** a merge is requested and neither the PR/branch diff nor the session-bound change list indicates an active OpenSpec change
- **THEN** the archive gate passes through and Part B (rebase pre-check) runs next

#### Scenario: Direct merge command cannot skip the gate

- **WHEN** the user issues "merge MR" / "合并" without going through workflow stage 8
- **THEN** merge-discipline still runs the OpenSpec archive association gate before Parts B→C→R→D

### Requirement: merge-discipline SHALL compose with feature-branch-closeout without owning the menu

`merge-discipline` MUST remain the single source for Parts A→B→C→R→D on protected-branch merges. When a host uses `feature-branch-closeout`, that skill owns the closeout **menu** and non-merge paths; `merge-discipline` MUST apply only after merge is selected (or on a direct user merge command). merge-discipline MUST NOT redefine the full closeout option list.

#### Scenario: Menu then merge

- **WHEN** feature-branch-closeout selects merge
- **THEN** merge-discipline runs A→B→C→R→D and does not present a competing full closeout menu

#### Scenario: Direct merge still uses merge-discipline

- **WHEN** the user issues a direct merge command without going through closeout
- **THEN** merge-discipline still loads (unchanged existing requirement)
