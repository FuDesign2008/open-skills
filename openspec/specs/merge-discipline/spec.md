# merge-discipline Specification

## Purpose
TBD - created by archiving change extract-merge-discipline-skill. Update Purpose after archive.
## Requirements
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

### Requirement: Coverage gate SHALL honor project preference then per-merge ask

Before running `test-coverage-analyzer`, Part C SHALL resolve a project coverage preference by scanning `AGENTS.md` then `CLAUDE.md` (first match wins) for an explicit `coverage-gate:` value of `always`, `never`, or `ask`. If no declaration is found, the preference SHALL be treated as `ask`.

- **`always`**: run the gate script path without asking (subject to analyzer availability rules).
- **`never`**: skip the analyzer, write a project-preference skip 留痕, and proceed to Part R (PR code review).
- **`ask`**: on every merge, ask the user whether to run coverage or skip this merge; MUST NOT auto-run. Skip requires user-explicit skip 留痕 before Part R.

#### Scenario: Unset preference asks every merge

- **WHEN** merge is imminent and neither `AGENTS.md` nor `CLAUDE.md` declares `coverage-gate:`
- **THEN** the agent asks whether to run or skip coverage for this merge and does not start the analyzer until the user chooses run

#### Scenario: Project preference never skips without asking

- **WHEN** `AGENTS.md` or `CLAUDE.md` declares `coverage-gate: never`
- **THEN** Part C skips the analyzer, writes project-preference skip 留痕, and proceeds to Part R without asking

#### Scenario: Project preference always runs when analyzer exists

- **WHEN** preference is `always` and `test-coverage-analyzer` is available
- **THEN** Part C runs the gate script with constructed `--base` without asking

#### Scenario: User chooses skip under ask preference

- **WHEN** preference is `ask` and the user chooses to skip coverage for this merge
- **THEN** Part C writes user-explicit skip 留痕 and proceeds to Part R without running the analyzer

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
- **THEN** Part C proceeds to Part R without requiring `test-coverage-analyzer` to be present

### Requirement: Tip pinning SHALL prevent stale-tip merge race

After Part R passes and before the merge command executes, the skill SHALL pin the merge revision to the just-pushed tip, preventing the race where a merge fast-forwards to a pre-push tip while freshly-pushed commits stay on the source branch.

#### Scenario: Pin merge revision with --sha

- **WHEN** the source branch tip was just pushed and is ready to merge
- **THEN** compute `MERGE_SHA=$(git rev-parse origin/<source-branch>)` and merge with `glab mr merge <id> --sha "$MERGE_SHA" -y` (GitLab) or `gh pr merge <id> --match-head-commit "$MERGE_SHA"` (GitHub)

#### Scenario: Platform CLI lacks --sha support

- **WHEN** the platform CLI does not support `--sha`
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

### Requirement: Pipeline succeeded signal SHALL be verified against current tip

The skill SHALL NOT trust an instantly-appearing "Pipeline succeeded" after a fresh push, because it is almost certainly the old tip's green result (the new tip's CI cannot finish in seconds).

#### Scenario: Instant Pipeline succeeded after push

- **WHEN** a new commit was pushed just before merge and "Pipeline succeeded" appears immediately
- **THEN** verify the result's sha equals the just-pushed tip, or rely on `--sha` to let the platform enforce the match

### Requirement: Post-merge ancestor check SHALL be mandatory

After the merge command completes, the skill SHALL verify the pinned SHA is an ancestor of the target branch. A MISSING result means freshly-pushed commits did not enter the target.

#### Scenario: Ancestor check passes

- **WHEN** `git merge-base --is-ancestor "$MERGE_SHA" origin/<target>"` returns OK
- **THEN** proceed to Jira writeback / completion

#### Scenario: Ancestor check fails (MISSING)

- **WHEN** the ancestor check returns MISSING
- **THEN** do NOT claim completion or proceed to Jira writeback; open a backfill MR (cherry-pick missing commits) or pause for user decision

### Requirement: Dual-strategy fallback SHALL handle merge race risk

The skill SHALL default to Strategy A (same-MR pinned-tip merge: archive + main fix in one MR, run all tip-pinning steps). Strategy B (separate docs MR for archive after the implementation MR already merged) MUST NOT be presented as a recommended or default path when the merge attempt is still associated with an active OpenSpec change — that case MUST use the archive association gate (block until archive is on the same tip). Strategy B MAY only be used as **recovery** after an accidental merge that left archive pending, with explicit 留痕 listing "archive pending !N", and MUST never pretend archive is already on the target branch.

#### Scenario: Default same-MR strategy

- **WHEN** the MR is open, the main fix is mergeable, and any associated OpenSpec change is already archived (or there is no association)
- **THEN** use Strategy A: pin tip and merge archive + main fix in the same MR, executing all tip-pinning steps

#### Scenario: Associated active change must not use Strategy B as recommended path

- **WHEN** merge is requested and an associated OpenSpec change is still active
- **THEN** the skill blocks via the archive association gate and does not recommend opening a separate post-merge archive MR as the primary path

#### Scenario: Recovery-only separate-MR strategy

- **WHEN** the implementation MR was already merged accidentally and archive is still pending
- **THEN** Strategy B MAY open a separate docs MR for archive with explicit "archive pending !N" 留痕, without claiming specs are already on the target

### Requirement: merge-discipline SHALL compose with feature-branch-closeout without owning the menu

`merge-discipline` MUST remain the single source for Parts A→B→C→R→D on protected-branch merges. When a host uses `feature-branch-closeout`, that skill owns the closeout **menu** and non-merge paths; `merge-discipline` MUST apply only after merge is selected (or on a direct user merge command). merge-discipline MUST NOT redefine the full closeout option list.

#### Scenario: Menu then merge

- **WHEN** feature-branch-closeout selects merge
- **THEN** merge-discipline runs A→B→C→R→D and does not present a competing full closeout menu

#### Scenario: Direct merge still uses merge-discipline

- **WHEN** the user issues a direct merge command without going through closeout
- **THEN** merge-discipline still loads (unchanged existing requirement)

### Requirement: Part R SHALL resolve pr-review-gate preference before review depth

Before loading `pr-code-review`, Part R MUST resolve `pr-review-gate:` from `AGENTS.md` then `CLAUDE.md` (first match wins). Allowed values: `always`, `never`, `ask`, `non-code-light`. If unset, Part R MUST treat the preference as `always` (full dual-axis review).

#### Scenario: Unset preference means full review

- **WHEN** neither `AGENTS.md` nor `CLAUDE.md` declares `pr-review-gate:`
- **THEN** Part R runs full-depth `pr-code-review` (no light path solely from unset)

#### Scenario: never skips with 留痕

- **WHEN** preference is `never`
- **THEN** Part R writes project-preference skip 留痕 and proceeds to Part D without invoking `pr-code-review`

#### Scenario: ask requires user choice

- **WHEN** preference is `ask`
- **THEN** Part R asks whether to run full, light, or skip for this merge; MUST NOT auto-pick; skip requires user-explicit skip 留痕

### Requirement: Part R SHALL classify non-application-code surfaces

Part R MUST classify the open PR/MR three-dot diff as **non-application-code** when every changed path matches the allowlist and none match the denylist in `merge-discipline/reference.md`. A mixed diff (any denylisted path) MUST be classified as **application-code**.

#### Scenario: Skills-only PR is non-application-code

- **WHEN** the PR diff only changes files under `skills/**` and `openspec/**` and `docs/**` Markdown
- **THEN** the surface classifier reports non-application-code

#### Scenario: Mixed runtime source forces full surface

- **WHEN** the PR also changes a denylisted path (e.g. `.opencode/**`, `hooks/**`, or runtime source extensions per the reference table)
- **THEN** the surface is application-code

### Requirement: non-code-light preference SHALL use light review on non-application-code surfaces

When preference is `non-code-light` and the surface is non-application-code, Part R MUST invoke `pr-code-review` with `depth=light`, still applying dual-axis ≥80 Critical/Important clearance. When preference is `non-code-light` and the surface is application-code, Part R MUST use `depth=full`. When preference is `always`, Part R MUST use `depth=full` regardless of surface.

#### Scenario: non-code-light on docs/skills PR

- **WHEN** preference is `non-code-light` and surface is non-application-code
- **THEN** Part R runs `pr-code-review` at light depth, then proceeds to Part D on pass

#### Scenario: non-code-light on code PR

- **WHEN** preference is `non-code-light` and surface is application-code
- **THEN** Part R runs `pr-code-review` at full depth

### Requirement: Part R SHALL run pr-code-review before tip pinning

After Part C (coverage) resolves to continue, and before Part D (tip pinning), `merge-discipline` MUST apply the `pr-review-gate` preference and surface classifier. Unless preference resolves to `never` (or `ask` with user skip 留痕), Part R MUST load strong dependency `pr-code-review` and run it at the selected depth against the open PR/MR about to be merged. Missing `pr-code-review` MUST abort with a per-skill install command when a run (full or light) is required. Execution order MUST remain A → B → C → R → D → merge.

#### Scenario: Order includes Part R when review runs

- **WHEN** a protected-branch merge is imminent, Parts A–C have passed, and preference requires a review run
- **THEN** Part R runs `pr-code-review` before any tip-pin merge command

### Requirement: Part R pass/fail SHALL use dual-axis clearance

Part R MUST treat `pr-code-review` as failed (block merge) when either the Standards or Spec axis retains one or more issues at confidence ≥80 with severity Critical or Important, unless the user gives an explicit Part R skip 留痕. Minor-only survivors or all scores below 80 MUST count as Part R pass. Part R MUST NOT require a receiving-code-review reception loop to pass. Light depth MUST NOT weaken this clearance rule.

#### Scenario: Spec-axis Important blocks merge

- **WHEN** `pr-code-review` posts an Important Spec finding scored ≥80 and Standards is clean
- **THEN** merge-discipline blocks Part D until fixed or explicit skip 留痕

#### Scenario: Dual-axis clean proceeds to tip pin

- **WHEN** both axes have no remaining ≥80 Critical/Important issues
- **THEN** Part R passes and Part D tip pinning runs next

### Requirement: Part D SHALL sync the local workspace onto the merged target branch

After the post-merge ancestor check passes, merge-discipline SHALL bring the local workspace back onto the integration line: resolve the target branch from the MR's base metadata (`gh pr view <id> --json baseRefName` / GitLab `target_branch`, reusing the base resolved in Part B) rather than assuming `main` or `master`; when the target branch exists locally, check it out and fast-forward it with `git pull --ff-only origin <target>`, reporting the sync outcome in one line. When checkout or fast-forward is impossible (branch absent locally, diverged history), the step MUST state what happened and how to recover instead of skipping silently. Deleting the merged source branch MAY be offered as explicit follow-up (local and remote), consistent with closeout cleanup ownership.

#### Scenario: Target branch is not main

- **WHEN** an MR merges into `develop` (or any non-main target)
- **THEN** the workspace switches to `develop` and fast-forwards it from origin, without ever consulting `main`

#### Scenario: Local copy of the target is missing

- **WHEN** the resolved target branch does not exist in the local repository
- **THEN** the step reports the fetch command to obtain it (e.g. `git fetch origin <target>:<target>`) and does not treat this as a silent skip

#### Scenario: Fast-forward is blocked

- **WHEN** the local target branch has diverged from origin so `--ff-only` would fail
- **THEN** the step reports the divergence state and hands the decision to the user instead of rebasing or force-updating on its own

### Requirement: merge-discipline description SHALL be English-primary with Chinese triggers

Frontmatter `description` for `merge-discipline` MUST use English for the routing summary (what / when / Do NOT use) and MUST include Chinese trigger phrases (English equivalents MAY follow). It MUST NOT use a Chinese-primary narrative that interleaves English Part labels mid-sentence as the main routing prose.

#### Scenario: Description matches English-primary template

- **WHEN** an agent or installer reads `merge-discipline` frontmatter `description`
- **THEN** the what/when/Do-NOT prose is English-primary and Chinese triggers appear in the Triggers section of that string

### Requirement: Part D SHALL run a squash decision step before the merge command

After Part R passes and before any merge command executes, merge-discipline MUST run a squash decision step: (1) list the MR/PR's commits, (2) classify commit quality, (3) present a recommendation — squash or no-squash — with rationale, and (4) obtain explicit user confirmation of the merge strategy. The step MUST NOT be skipped on a direct merge command. When two or more viable strategies exist, the step MUST NOT auto-select one on the user's behalf. Tip-pinning semantics are unchanged by this step.

**Collapse pre-check**: when fewer than two viable strategies exist, the step SHALL state its conclusion plus a one-line reason and adopt it WITHOUT prompting. A decision space collapses in exactly these cases: the MR contains exactly one commit ahead of base (nothing to consolidate; equivalent outcomes), or repo/platform policy permits only one merge method (no alternative to choose). The stated conclusion keeps the choice overridable by the user, preserving the anti-default rationale: prompting is for divergent outcomes, not for confirming what cannot be otherwise.

Recommendation semantics MUST be dynamic, based on the MR's commit history:
- Atomic commits with individual value (feature + reviewable enhancement + archive as separate meaningful commits) → recommend **no-squash** (merge commit preserves history).
- Trivial accumulation (fixup / typo / wip / CI-retry noise, intermediate states without standalone value) → recommend **squash**.
- A source branch that will continue to receive development → lean **no-squash** (squashing cuts the commit graph shared with the target and breeds conflicts on later merges), regardless of commit tidiness.

The step MUST be platform-neutral: GitHub executes via `gh pr merge <id> --merge|--squash --match-head-commit "$MERGE_SHA"`; GitLab executes via `glab mr merge <id> [--squash] --sha "$MERGE_SHA"`; platforms without squash support fall back to their available merge methods with the gap stated.

#### Scenario: Atomic commit history recommends no-squash

- **WHEN** Part D lists the MR commits and they are atomic with individual value (e.g. skill creation, enhancement, archive as three separate commits)
- **THEN** the recommendation is no-squash (merge commit), the user confirms, and the merge executes with the platform's merge-commit method with the tip pinned

#### Scenario: Trivial accumulation recommends squash

- **WHEN** the MR commits are trivial accumulation (fixup / typo / wip / CI-retry noise without standalone value)
- **THEN** the recommendation is squash, the user confirms, and the merge executes with the platform's squash method with the tip pinned

#### Scenario: Continuing-development branch leans no-squash

- **WHEN** the source branch will continue to receive development after this merge (even if commits look tidy)
- **THEN** the recommendation leans no-squash, citing that squashing cuts the commit graph shared with the target and breeds conflicts on later merges

#### Scenario: Single-commit MR adopts no-squash without prompting

- **WHEN** the MR contains exactly one commit ahead of its base branch
- **THEN** the collapse pre-check states "single commit: no-squash" with a one-line reason and proceeds without asking, and the user may still override from the stated conclusion

#### Scenario: Single-viable-strategy platform policy skips the ask

- **WHEN** the repository or platform settings permit only one merge method (e.g. squash-only merges)
- **THEN** the collapse pre-check adopts that single permitted strategy without prompting and notes the enforced policy in its output

#### Scenario: Direct merge command cannot skip the decision

- **WHEN** the user issues a direct "merge MR" command without going through a workflow closeout
- **THEN** Part D still runs the squash decision step before executing the merge command

#### Scenario: User overrides the recommendation

- **WHEN** the recommendation is no-squash but the user explicitly chooses squash (or vice versa)
- **THEN** the user's explicit choice wins, the merge executes with the chosen strategy, and tip pinning still applies

#### Scenario: Platform without squash support

- **WHEN** the hosting platform's CLI offers no squash merge method
- **THEN** the step still presents the commit-quality assessment, states the platform gap, and merges with the available method

