## ADDED Requirements

### Requirement: Coverage gate SHALL honor project preference then per-merge ask

Before running `test-coverage-analyzer`, Part C SHALL resolve a project coverage preference by scanning `AGENTS.md` then `CLAUDE.md` (first match wins) for an explicit `coverage-gate:` value of `always`, `never`, or `ask`. If no declaration is found, the preference SHALL be treated as `ask`.

- **`always`**: run the gate script path without asking (subject to analyzer availability rules).
- **`never`**: skip the analyzer, write a project-preference skip 留痕, and proceed to tip pinning.
- **`ask`**: on every merge, ask the user whether to run coverage or skip this merge; MUST NOT auto-run. Skip requires user-explicit skip 留痕 before Part D.

#### Scenario: Unset preference asks every merge

- **WHEN** merge is imminent and neither `AGENTS.md` nor `CLAUDE.md` declares `coverage-gate:`
- **THEN** the agent asks whether to run or skip coverage for this merge and does not start the analyzer until the user chooses run

#### Scenario: Project preference never skips without asking

- **WHEN** `AGENTS.md` or `CLAUDE.md` declares `coverage-gate: never`
- **THEN** Part C skips the analyzer, writes project-preference skip 留痕, and proceeds to tip pinning without asking

#### Scenario: Project preference always runs when analyzer exists

- **WHEN** preference is `always` and `test-coverage-analyzer` is available
- **THEN** Part C runs the gate script with constructed `--base` without asking

#### Scenario: User chooses skip under ask preference

- **WHEN** preference is `ask` and the user chooses to skip coverage for this merge
- **THEN** Part C writes user-explicit skip 留痕 and proceeds to tip pinning without running the analyzer

## MODIFIED Requirements

### Requirement: Merge action SHALL trigger coverage gate

The merge-discipline skill SHALL be loaded when any merge into a protected branch is imminent — covering branch-closeout decisions that select "merge", direct user merge commands, and AI preparing to call `glab mr merge` / `gh pr merge`. Selecting "keep branch" or "continue development" SHALL NOT trigger the coverage-gate decision. Triggering SHALL mean starting Part C's preference/ask decision; it SHALL NOT imply automatically running `test-coverage-analyzer`.

#### Scenario: User directly issues merge command

- **WHEN** user says "merge MR" / "合并 MR" / "准备合并" without going through branch-closeout decision
- **THEN** merge-discipline loads and starts the Part C coverage-gate decision before the merge command executes

#### Scenario: Branch-closeout decision selects merge

- **WHEN** a workflow's branch-closeout step selects "merge" (not "keep" / "continue")
- **THEN** merge-discipline loads and starts the Part C coverage-gate decision

#### Scenario: Non-merge decision skips gate

- **WHEN** branch-closeout decision is "keep branch" or "continue development"
- **THEN** the coverage gate SHALL NOT trigger

### Requirement: Coverage gate SHALL detect test-coverage-analyzer availability

After the preference/ask decision resolves to **run**, the skill SHALL scan the environment for `test-coverage-analyzer`. If found, run the gate script with a constructed `--base` (target branch from MR/PR metadata). If not found, write an environment-miss留痕 and let the user decide whether to proceed. If the decision resolved to **skip**, this availability scan and script run SHALL NOT be required.

#### Scenario: Coverage analyzer available and passing

- **WHEN** the user or preference selected run, test-coverage-analyzer is detected, and coverage meets threshold
- **THEN** proceed to tip-pinning discipline

#### Scenario: Coverage analyzer unavailable

- **WHEN** the user or preference selected run and test-coverage-analyzer is not detected in environment
- **THEN** write environment-miss留痕 (timestamp + "system: env gap") and present to user for decision

#### Scenario: Coverage below threshold or script crash

- **WHEN** coverage is below threshold, or script crashes, or no report, or no test code
- **THEN** pause merge and present report to user for decision (force-merge / add tests / abort)

#### Scenario: Skip decision does not require analyzer

- **WHEN** preference is `never` or the user chose skip under `ask`
- **THEN** Part C proceeds to tip pinning without requiring `test-coverage-analyzer` to be present
