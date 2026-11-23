## ADDED Requirements

### Requirement: Merge decision sheet SHALL batch pending preference decisions before execution

On merge intent, `merge-discipline` MUST first run a read-only preflight over Parts A, B, C, R, and D, collect every pending human preference decision, and present them in one batch form (the "merge decision sheet"). Only after the answers arrive MAY Parts A→B→C→R→D execute. The sheet MUST NOT be auto-answered on the user's behalf, including in auto-mode host workflows.

#### Scenario: Several preferences pending are asked once

- **WHEN** merge intent arrives, the target is 3 commits ahead (`CONFLICTS=0`), `coverage-gate` is unset, `pr-review-gate` is `ask`, and the MR has four atomic commits
- **THEN** preflight runs read-only and one sheet lists rebase, coverage, review, and squash items each with options, Recommended, and rationale, and execution then runs A→B→C→R→D without asking any of them again

#### Scenario: Sheet is exempt from one-question-per-turn

- **WHEN** the sheet lists four items in one turn
- **THEN** this conforms to merge-discipline; the sheet MAY present multiple items in one turn and is exempt from the one-question-per-turn rule of `clarifying-question-discipline` (merge gates are a bounded set of preference decisions, not a clarify interview), and `clarifying-question-discipline` itself is unchanged

### Requirement: Merge preflight SHALL be read-only and fact-based

The preflight MUST NOT mutate the repository (no rebase, push, analyzer run, review run, or merge). Its inputs MUST be independently verifiable facts: association with active `openspec/changes/<name>/` paths and `openspec list`; Part B `BEHIND` and `CONFLICTS` counts; the `coverage-gate` and `pr-review-gate` preference lines; the surface classification and size/risk ladder result; the commit list with its quality classification and the collapse pre-check.

#### Scenario: Preflight does not mutate

- **WHEN** preflight runs on a branch that is behind the target and has an `ask` review preference
- **THEN** no rebase, push, analyzer run, review run, or merge occurs before the user answers the sheet

### Requirement: Merge decision sheet SHALL include an item only when human input is needed

Each sheet item MUST show its options, a Recommended option, and a one-line rationale. An item MUST appear only when its Part would otherwise need human input; a preference that resolves without asking MUST NOT produce an item. Archive item: Part A would block (archive first Recommended, or skip with explicit 留痕). Rebase item: `BEHIND>0` or `CONFLICTS>0` (rebase now / proceed without rebase only when `CONFLICTS=0` / abort).

#### Scenario: Behind branch with active association gets Archive and Rebase items

- **WHEN** the PR diff still contains active `openspec/changes/<name>/` and `BEHIND>0`
- **THEN** the sheet lists an Archive item (archive first Recommended) and a Rebase item, each with options, Recommended, and rationale

### Requirement: Merge decision sheet SHALL cover coverage, review, squash, and optional deletion

Coverage item: `coverage-gate` is `ask` or unset (run / skip). Review item: `pr-review-gate` is `ask` (full / light / skip). Squash item: two or more commits and the collapse pre-check does not apply (squash / no-squash). An optional Delete-source-branch item (delete after merge / keep) MAY ride along only when at least one other item is present, and MUST NOT by itself cause a prompt. When no item is needed, the sheet is empty and execution proceeds without prompting.

#### Scenario: Resolved preferences produce no item

- **WHEN** `coverage-gate: never`, `pr-review-gate: auto`, there is no active association, `BEHIND=0`, `CONFLICTS=0`, and the MR has several commits needing a squash choice
- **THEN** the sheet contains only the Squash item (plus optional Delete), with no Coverage, Review, Rebase, or Archive item

#### Scenario: Empty sheet proceeds without prompting

- **WHEN** merge intent arrives, there is no active association, `BEHIND=0` and `CONFLICTS=0`, `coverage-gate: never`, `pr-review-gate: auto`, and the MR is a single commit
- **THEN** merge-discipline presents no sheet and executes A→B→C→R→D directly, stating the single-commit collapse conclusion and the resolved preferences in its output

#### Scenario: Delete-branch item alone does not prompt

- **WHEN** every other item resolves without asking
- **THEN** no sheet is shown and the optional source-branch deletion remains a non-blocking post-merge offer

### Requirement: Execution SHALL consume sheet answers without re-asking

During execution, Parts A→B→C→R→D MUST consume the sheet answers and MUST NOT re-ask an answered item. After a rebase rewrites the source tip, Parts C, R, and D MUST re-run detection on the new tip but MUST NOT re-ask answered items unless a new mid-flight failure appears. Skip answers MUST still produce their 留痕 where the skipped Part would have run. A re-entry from Part A starts a new merge attempt with a new preflight and a new sheet.

#### Scenario: Answers survive a rebase

- **WHEN** the sheet answered rebase: now, and the rebase rewrites the source tip
- **THEN** Parts C, R, and D re-run detection on the new tip and reuse the sheet answers for coverage, review, and squash without re-asking

#### Scenario: Archive-first re-entry builds a new sheet

- **WHEN** Part A would block, the user chose archive first on the sheet, and archive lands on the source tip
- **THEN** re-entry from Part A starts a new merge attempt with a new preflight and a new sheet rather than reusing answers from the previous attempt

#### Scenario: Skip answer still writes 留痕

- **WHEN** the sheet recorded Coverage: skip
- **THEN** Part C writes the user-explicit skip 留痕 when it would have run, without asking again

### Requirement: Mid-flight failures SHALL pause separately from the sheet

These MUST remain separate pauses at the moment they occur and MUST NOT be sheet items: Part R fail and the three-round cap pause, coverage below threshold / crash / no report / no tests, `test-coverage-analyzer` unavailable after a run decision, a rebase conflict that `git-conflict-resolve` cannot finish or a user abort, post-merge ancestor check MISSING, and fast-forward blocked during workspace sync. They depend on results that do not exist at preflight time.

#### Scenario: Mid-flight failure pauses separately after the sheet

- **WHEN** the user answered the sheet (coverage: run, review: full) and Part R later returns an Important finding at confidence ≥80
- **THEN** Part R follows its fail→fix→re-review rules and pauses on the round cap as defined, as a separate pause, and the sheet answers for coverage, review, and squash are not asked again

#### Scenario: Coverage below threshold pauses on its own

- **WHEN** the sheet recorded Coverage: run and the analyzer reports coverage below threshold
- **THEN** merge pauses for force / add tests / abort as a separate pause and the sheet is not rebuilt

### Requirement: Part B SHALL obtain rebase confirmation before rewriting the source branch

Part B MUST detect `BEHIND` and `CONFLICTS` with read-only commands. When both are zero it MUST proceed to Part C without asking. Otherwise it MUST report the lead and conflict estimate and MUST NOT rebase without user confirmation, taken from the sheet's Rebase item (not asked again when answered). On confirm it rebases the source branch only, delegates conflicts to `git-conflict-resolve` in rebase mode, pushes with `--force-with-lease`, and ends without waiting for CI.

#### Scenario: Clean and level branch skips the question

- **WHEN** `BEHIND=0` and `CONFLICTS=0`
- **THEN** Part B passes through to Part C and the sheet has no rebase item

#### Scenario: Behind target consumes the sheet answer

- **WHEN** `BEHIND>0`, the sheet recorded rebase: now, and Part B runs
- **THEN** Part B rebases the source branch, pushes with `--force-with-lease`, ends without waiting on CI, and does not ask for confirmation again

#### Scenario: Conflicting rebase stalls

- **WHEN** the sheet answered rebase: now and `git-conflict-resolve` cannot finish the rebase
- **THEN** the merge flow pauses for the human as a separate mid-flight pause

## MODIFIED Requirements

### Requirement: Merge action SHALL trigger coverage gate

The merge-discipline skill SHALL be loaded when any merge into a protected branch is imminent — covering branch-closeout decisions that select "merge", direct user merge commands, and AI preparing to call `glab mr merge` / `gh pr merge`. Selecting "keep branch" or "continue development" SHALL NOT trigger the coverage-gate decision. Triggering SHALL mean starting the merge preflight, in which Part C's preference/ask decision is resolved (directly from the project preference, or as the Coverage item of the merge decision sheet when the preference is `ask` or unset); it SHALL NOT imply automatically running `test-coverage-analyzer`.

#### Scenario: User directly issues merge command

- **WHEN** user says "merge MR" / "合并 MR" / "准备合并" without going through branch-closeout decision
- **THEN** merge-discipline loads and starts the merge preflight, resolving the Part C coverage-gate decision before the merge command executes

#### Scenario: Branch-closeout decision selects merge

- **WHEN** a workflow's branch-closeout step selects "merge" (not "keep" / "continue")
- **THEN** merge-discipline loads and starts the merge preflight, resolving the Part C coverage-gate decision

#### Scenario: Non-merge decision skips gate

- **WHEN** branch-closeout decision is "keep branch" or "continue development"
- **THEN** the coverage gate SHALL NOT trigger

### Requirement: Coverage gate SHALL honor project preference then per-merge ask

Before running `test-coverage-analyzer`, Part C SHALL resolve a project coverage preference by scanning `AGENTS.md` then `CLAUDE.md` (first match wins) for an explicit `coverage-gate:` value of `always`, `never`, or `ask`. If no declaration is found, the preference SHALL be treated as `ask`. The preference SHALL be read during the merge preflight; when it resolves to `ask`, the per-merge question SHALL be asked as the Coverage item of the merge decision sheet, and Part C SHALL consume that answer during execution instead of asking again.

- **`always`**: run the gate script path without asking (subject to analyzer availability rules).
- **`never`**: skip the analyzer, write a project-preference skip 留痕, and proceed to Part R (PR code review).
- **`ask`**: on every merge, ask the user (via the sheet) whether to run coverage or skip this merge; MUST NOT auto-run. Skip requires user-explicit skip 留痕 before Part R.

#### Scenario: Unset preference asks every merge

- **WHEN** merge is imminent and neither `AGENTS.md` nor `CLAUDE.md` declares `coverage-gate:`
- **THEN** the merge decision sheet includes a Coverage item (run / skip, with a Recommended option) and the analyzer does not start until the user chooses run

#### Scenario: Project preference never skips without asking

- **WHEN** `AGENTS.md` or `CLAUDE.md` declares `coverage-gate: never`
- **THEN** Part C skips the analyzer, writes project-preference skip 留痕, and proceeds to Part R without asking, and the sheet has no Coverage item

#### Scenario: Project preference always runs when analyzer exists

- **WHEN** preference is `always` and `test-coverage-analyzer` is available
- **THEN** Part C runs the gate script with constructed `--base` without asking

#### Scenario: User chooses skip under ask preference

- **WHEN** preference is `ask` and the user chooses to skip coverage on the sheet
- **THEN** Part C writes user-explicit skip 留痕 and proceeds to Part R without running the analyzer and without asking again

### Requirement: Part R SHALL resolve pr-review-gate preference before review depth

Before loading `pr-code-review`, Part R MUST resolve `pr-review-gate:` from `AGENTS.md` then `CLAUDE.md` (first match wins). Allowed values: `always`, `never`, `ask`, `non-code-light`, `auto`. If unset, Part R MUST treat the preference as `auto` (content-matched depth: surface classification plus the size/risk ladder). Preference `always` MUST still mean blanket `depth=full`. Preference `never` and `ask` keep their skip / user-choice behavior. The preference MUST be read during the merge preflight; under `ask`, the full / light / skip choice MUST be asked as the Review item of the merge decision sheet (with the depth the ladder would select as the Recommended option), and Part R MUST consume that answer during execution instead of asking again.

#### Scenario: Unset preference means auto ladder

- **WHEN** neither `AGENTS.md` nor `CLAUDE.md` declares `pr-review-gate:`
- **THEN** Part R treats the preference as `auto` and selects `depth=full` or `depth=light` from the size/risk ladder (not blanket full solely from unset), and the sheet has no Review item

#### Scenario: never skips with 留痕

- **WHEN** preference is `never`
- **THEN** Part R writes project-preference skip 留痕 and proceeds to Part D without invoking `pr-code-review`

#### Scenario: ask requires user choice

- **WHEN** preference is `ask`
- **THEN** the merge decision sheet asks whether to run full, light, or skip for this merge with the ladder-derived depth as Recommended; MUST NOT auto-pick; skip requires user-explicit skip 留痕, and Part R consumes the answer without asking again

#### Scenario: always remains blanket full

- **WHEN** preference is `always` and the PR is a small application-code diff with no escalation hits
- **THEN** Part R still invokes `pr-code-review` at `depth=full`

### Requirement: Part D SHALL run a squash decision step before the merge command

After Part R passes and before any merge command executes, merge-discipline MUST run a squash decision step: (1) list the MR/PR's commits, (2) classify commit quality, (3) present a recommendation — squash or no-squash — with rationale, and (4) obtain explicit user confirmation of the merge strategy. The step MUST NOT be skipped on a direct merge command. When two or more viable strategies exist, the step MUST NOT auto-select one on the user's behalf. Tip-pinning semantics are unchanged by this step. Steps (1)–(3) MUST be computed during the merge preflight and the confirmation in (4) MUST be requested as the Squash item of the merge decision sheet; when a sheet answer is present, the step MUST re-list the commits on the tip about to be pinned, state any change from the preflight list, and apply the sheet answer before the merge command without asking again (when the re-listed commits now satisfy the collapse pre-check, the stated collapse conclusion applies).

**Collapse pre-check**: when fewer than two viable strategies exist, the step SHALL state its conclusion plus a one-line reason and adopt it WITHOUT prompting (and the sheet SHALL omit the Squash item). A decision space collapses in exactly these cases: the MR contains exactly one commit ahead of base (nothing to consolidate; equivalent outcomes), or repo/platform policy permits only one merge method (no alternative to choose). The stated conclusion keeps the choice overridable by the user, preserving the anti-default rationale: prompting is for divergent outcomes, not for confirming what cannot be otherwise.

Recommendation semantics MUST be dynamic, based on the MR's commit history:
- Atomic commits with individual value (feature + reviewable enhancement + archive as separate meaningful commits) → recommend **no-squash** (merge commit preserves history).
- Trivial accumulation (fixup / typo / wip / CI-retry noise, intermediate states without standalone value) → recommend **squash**.
- A source branch that will continue to receive development → lean **no-squash** (squashing cuts the commit graph shared with the target and breeds conflicts on later merges), regardless of commit tidiness.

The step MUST be platform-neutral: GitHub executes via `gh pr merge <id> --merge|--squash --match-head-commit "$MERGE_SHA"`; GitLab executes via `glab mr merge <id> [--squash] --sha "$MERGE_SHA"`; platforms without squash support fall back to their available merge methods with the gap stated.

#### Scenario: Atomic commit history recommends no-squash

- **WHEN** preflight lists the MR commits and they are atomic with individual value (e.g. skill creation, enhancement, archive as three separate commits)
- **THEN** the sheet's Squash item recommends no-squash (merge commit), the user confirms, and the merge executes with the platform's merge-commit method with the tip pinned

#### Scenario: Trivial accumulation recommends squash

- **WHEN** the MR commits are trivial accumulation (fixup / typo / wip / CI-retry noise without standalone value)
- **THEN** the sheet's Squash item recommends squash, the user confirms, and the merge executes with the platform's squash method with the tip pinned

#### Scenario: Continuing-development branch leans no-squash

- **WHEN** the source branch will continue to receive development after this merge (even if commits look tidy)
- **THEN** the recommendation leans no-squash, citing that squashing cuts the commit graph shared with the target and breeds conflicts on later merges

#### Scenario: Single-commit MR adopts no-squash without prompting

- **WHEN** the MR contains exactly one commit ahead of its base branch
- **THEN** the collapse pre-check states "single commit: no-squash" with a one-line reason, the sheet has no Squash item, execution proceeds without asking, and the user may still override from the stated conclusion

#### Scenario: Single-viable-strategy platform policy skips the ask

- **WHEN** the repository or platform settings permit only one merge method (e.g. squash-only merges)
- **THEN** the collapse pre-check adopts that single permitted strategy without prompting, omits the Squash sheet item, and notes the enforced policy in its output

#### Scenario: Direct merge command cannot skip the decision

- **WHEN** the user issues a direct "merge MR" command without going through a workflow closeout
- **THEN** the squash decision is still resolved (on the sheet, or by the collapse pre-check) before the merge command executes

#### Scenario: User overrides the recommendation

- **WHEN** the recommendation is no-squash but the user explicitly chooses squash (or vice versa)
- **THEN** the user's explicit choice wins, the merge executes with the chosen strategy, and tip pinning still applies

#### Scenario: Platform without squash support

- **WHEN** the hosting platform's CLI offers no squash merge method
- **THEN** the step still presents the commit-quality assessment, states the platform gap, and merges with the available method

### Requirement: Part D SHALL sync the local workspace onto the merged target branch

After the post-merge ancestor check passes, merge-discipline SHALL bring the local workspace back onto the integration line: resolve the target branch from the MR's base metadata (`gh pr view <id> --json baseRefName` / GitLab `target_branch`, reusing the base resolved in Part B) rather than assuming `main` or `master`; when the target branch exists locally, check it out and fast-forward it with `git pull --ff-only origin <target>`, reporting the sync outcome in one line. When checkout or fast-forward is impossible (branch absent locally, diverged history), the step MUST state what happened and how to recover instead of skipping silently. Deleting the merged source branch MAY be offered as explicit follow-up (local and remote), consistent with closeout cleanup ownership. When a merge decision sheet was presented, the delete-branch choice MAY be collected as its optional Delete item and, if the user chose delete, MUST be executed after the sync outcome is reported without asking again; when no sheet was presented, the deletion remains a non-blocking offer after sync. Cleanup ownership stays with `feature-branch-closeout`.

#### Scenario: Target branch is not main

- **WHEN** an MR merges into `develop` (or any non-main target)
- **THEN** the workspace switches to `develop` and fast-forwards it from origin, without ever consulting `main`

#### Scenario: Local copy of the target is missing

- **WHEN** the resolved target branch does not exist in the local repository
- **THEN** the step reports the fetch command to obtain it (e.g. `git fetch origin <target>:<target>`) and does not treat this as a silent skip

#### Scenario: Fast-forward is blocked

- **WHEN** the local target branch has diverged from origin so `--ff-only` would fail
- **THEN** the step reports the divergence state and hands the decision to the user instead of rebasing or force-updating on its own

#### Scenario: Delete answer taken from the sheet

- **WHEN** the sheet's Delete item was answered "delete after merge" and the ancestor check and workspace sync succeeded
- **THEN** the step deletes the merged source branch (local and remote) without asking again

#### Scenario: No sheet leaves deletion as an offer

- **WHEN** no sheet was presented because every other item resolved without asking
- **THEN** the step offers branch deletion as a non-blocking follow-up after sync
