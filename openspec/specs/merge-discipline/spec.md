# merge-discipline Specification

## Purpose
TBD - created by archiving change extract-merge-discipline-skill. Update Purpose after archive.

## Requirements

### Requirement: Merge action SHALL trigger coverage gate

The merge-discipline skill SHALL be loaded when any merge into a protected branch is imminent — covering branch-closeout decisions that select "merge", direct user merge commands, and AI preparing to call `glab mr merge` / `gh pr merge`. Selecting "keep branch" or "continue development" SHALL NOT trigger the coverage-gate decision. Triggering SHALL mean starting the merge preflight, in which Part C's preference is resolved (`always` / `never` / `ask` / `auto`; unset ≡ `ask`, not `auto`). When the preference is `ask` or unset, the Coverage item of the merge decision sheet collects the choice and the analyzer MUST NOT start until the user chooses run. Preference `auto` runs the analyzer only when the four-cell says run. Triggering SHALL NOT by itself run `test-coverage-analyzer`.

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

Before running `test-coverage-analyzer`, Part C SHALL resolve a project coverage preference by scanning `AGENTS.md` then `CLAUDE.md` (first match wins) for an explicit `coverage-gate:` value of `always`, `never`, `ask`, or `auto`, matching `coverage-gate:\s*(always|never|ask|auto)\b`. If no declaration is found, the preference SHALL be treated as `ask` (NOT `auto`). The preference SHALL be read during the merge preflight; when it resolves to `ask`, the per-merge question SHALL be asked as the Coverage item of the merge decision sheet, and Part C SHALL consume that answer during execution instead of asking again. `auto` SHALL NOT add a Coverage sheet item. Part C SHALL apply the four-cell at execution time.

- **`always`**: run the gate script path without asking (subject to analyzer availability rules).
- **`never`**: skip the analyzer, write a project-preference skip 留痕, and proceed to the pre-Part-D tip check (then Part D when the check passes).
- **`ask`**: on every merge, ask the user (via the sheet) whether to run coverage or skip this merge; MUST NOT auto-run. Skip requires user-explicit skip 留痕 before the tip check.
- **`auto`**: do not ask. Classify the three-dot changed paths with the non-application-code surface table in `merge-discipline/reference.md`. Apply that file's scale/risk ladder except the post-fail re-entry signal, which MUST NOT count as a coverage hit. A scale/risk hit is any of: changed lines > 400, changed files > 20, the breaking-change regex, or the sensitive path/keyword table. Cells: non-application-code or empty paths (`changed-paths=0` and the classify command succeeded) with no hit → skip and write auto-skip 留痕 recording surface, lines, files, and large/breaking/sensitive flags; non-application-code or empty with a hit → run; application-code with or without a hit → run; classify command failed or changed-path listing failed → run.

**Should-run** includes preference `always`, preference `ask` after the user chose run, and preference `auto` when the cell action is run. Preference `never`, user-explicit skip under `ask`, and auto-skip are NOT implicit misses. The analyzer is read-only. If the user adds tests during a Part C pause and that moves the tip, resuming MUST fail the pre-Part-D tip check and MUST NOT enter Part D.

#### Scenario: Unset preference asks every merge

- **WHEN** merge is imminent and neither `AGENTS.md` nor `CLAUDE.md` declares `coverage-gate:`
- **THEN** the preference is `ask` (not `auto`), the merge decision sheet includes a Coverage item (run / skip, with a Recommended option), and the analyzer does not start until the user chooses run

#### Scenario: Project preference never skips without asking

- **WHEN** `AGENTS.md` or `CLAUDE.md` declares `coverage-gate: never`
- **THEN** Part C skips the analyzer, writes project-preference skip 留痕, and proceeds to the tip check without asking, and the sheet has no Coverage item

#### Scenario: Project preference always runs when analyzer exists

- **WHEN** preference is `always` and `test-coverage-analyzer` is available
- **THEN** Part C runs the gate script with constructed `--base` without asking

#### Scenario: User chooses skip under ask preference

- **WHEN** preference is `ask` and the user chooses to skip coverage on the sheet
- **THEN** Part C writes user-explicit skip 留痕 and proceeds to the tip check without running the analyzer and without asking again

#### Scenario: Auto skips a small non-application diff

- **WHEN** preference is `auto`, every changed path is non-application-code, changed lines and files are within the reference thresholds, and no breaking or sensitive signal hits
- **THEN** Part C skips the analyzer and writes auto-skip 留痕 with surface, lines, files, and flags, and this is not an implicit miss

#### Scenario: Auto runs on application code

- **WHEN** preference is `auto` and the surface is application-code, including when the diff is small and has no scale/risk hit
- **THEN** Part C runs the analyzer

#### Scenario: Auto runs when a non-application diff hits scale or risk

- **WHEN** preference is `auto`, the surface is non-application-code or empty paths, and changed lines exceed 400, or changed files exceed 20, or the breaking regex hits, or the sensitive table hits
- **THEN** Part C runs the analyzer

#### Scenario: Empty successful classify with no hit skips

- **WHEN** preference is `auto`, the classify command succeeds with `changed-paths=0`, and no scale/risk signal hits
- **THEN** Part C treats the surface as empty and writes auto-skip 留痕

#### Scenario: Classify failure runs

- **WHEN** preference is `auto` and the classify command or the changed-path listing fails
- **THEN** Part C runs the analyzer

#### Scenario: Post-fail re-entry does not force a coverage run

- **WHEN** preference is `auto`, the surface is non-application-code with no scale/risk hit, and a prior Part R fail exists on this tip
- **THEN** Part C still auto-skips; the post-fail re-entry signal is not a coverage hit

### Requirement: Coverage gate SHALL detect test-coverage-analyzer availability

After the preference/ask decision resolves to **run**, the skill SHALL scan the environment for `test-coverage-analyzer`. If found, run the gate script with a constructed `--base` (target branch from MR/PR metadata). If not found, write an environment-miss留痕 and let the user decide whether to proceed. If the decision resolved to **skip**, this availability scan and script run SHALL NOT be required.

#### Scenario: Coverage analyzer available and passing

- **WHEN** the user or preference selected run, test-coverage-analyzer is detected, and coverage meets threshold
- **THEN** proceed to the pre-Part-D tip check, then Part D tip pinning when the check passes

#### Scenario: Coverage analyzer unavailable

- **WHEN** the user or preference selected run and test-coverage-analyzer is not detected in environment
- **THEN** write environment-miss留痕 (timestamp + "system: env gap") and present to user for decision

#### Scenario: Coverage below threshold or script crash

- **WHEN** coverage is below threshold, or script crashes, or no report, or no test code
- **THEN** pause merge and present report to user for decision (force-merge / add tests / abort)

#### Scenario: Skip decision does not require analyzer

- **WHEN** preference is `never` or the user chose skip under `ask`
- **THEN** Part C proceeds to the tip check without requiring `test-coverage-analyzer` to be present

### Requirement: Tip pinning SHALL prevent stale-tip merge race

After the pre-Part-D tip check passes and before the merge command executes, the skill SHALL pin the merge revision to `T_trace`, preventing the race where a merge fast-forwards to a pre-push tip while freshly-pushed commits stay on the source branch.

#### Scenario: Pin merge revision with --sha

- **WHEN** the source branch tip was just pushed and is ready to merge
- **THEN** compute `MERGE_SHA` as the verified `T_trace` and merge with `glab mr merge <id> --sha "$MERGE_SHA" -y` (GitLab) or `gh pr merge <id> --match-head-commit "$MERGE_SHA"` (GitHub)

#### Scenario: Platform CLI lacks --sha support

- **WHEN** the platform CLI does not support `--sha`
- **THEN** wait for the just-pushed tip's pipeline to pass before merging, and treat the post-merge ancestor check as the mandatory backstop

### Requirement: OpenSpec archive association gate SHALL run before merge Parts B–D

When a merge into a protected branch is imminent (workflow branch-closeout selecting merge, direct user merge command, or AI preparing `glab mr merge` / `gh pr merge`), `merge-discipline` MUST first determine whether the current branch/PR is **associated** with an active OpenSpec change. Association is true if either: (1) the PR or branch diff includes paths under `openspec/changes/<name>/` that are not under `openspec/changes/archive/`, or (2) a session-bound OpenSpec change name still appears in `openspec list` as active. If not associated, the gate MUST pass through to Part B without requiring archive. If associated and the change is still active, the skill MUST **block** the merge, report the active change name(s), and require archive (specs sync + move to `openspec/changes/archive/`) on the same source tip before Parts B→R→C→D may continue. The gate MUST NOT be implicitly skipped when the user issues a direct merge command.

#### Scenario: Associated active change blocks merge

- **WHEN** the user says "merge MR" and the PR diff still contains `openspec/changes/archive-before-merge/` (active, not archived)
- **THEN** merge-discipline blocks merge, names the active change, and does not run Part B/R/C/D or the merge command until archive completes on that tip

#### Scenario: Unassociated PR passes through

- **WHEN** a merge is requested and neither the PR/branch diff nor the session-bound change list indicates an active OpenSpec change
- **THEN** the archive gate passes through and Part B (rebase pre-check) runs next

#### Scenario: Direct merge command cannot skip the gate

- **WHEN** the user issues "merge MR" / "合并" without going through workflow stage 8
- **THEN** merge-discipline still runs the OpenSpec archive association gate before Parts B→R→C→D

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

`merge-discipline` MUST remain the single source for Parts A→B→R→C→D on protected-branch merges. When a host uses `feature-branch-closeout`, that skill owns the closeout **menu** and non-merge paths; `merge-discipline` MUST apply only after merge is selected (or on a direct user merge command). merge-discipline MUST NOT redefine the full closeout option list.

#### Scenario: Menu then merge

- **WHEN** feature-branch-closeout selects merge
- **THEN** merge-discipline runs A→B→R→C→D and does not present a competing full closeout menu

#### Scenario: Direct merge still uses merge-discipline

- **WHEN** the user issues a direct merge command without going through closeout
- **THEN** merge-discipline still loads (unchanged existing requirement)

### Requirement: Part R SHALL resolve pr-review-gate preference before review depth

Before loading `pr-code-review`, Part R MUST resolve `pr-review-gate:` from `AGENTS.md` then `CLAUDE.md` (first match wins). Allowed values: `always`, `never`, `ask`, `non-code-light`, `auto`. If unset, Part R MUST treat the preference as `auto` (content-matched depth: surface classification plus the size/risk ladder). Preference `always` MUST still mean blanket `depth=full`. Preference `never` and `ask` keep their skip / user-choice behavior. The preference MUST be read during the merge preflight; under `ask`, the full / light / skip choice MUST be asked as the Review item of the merge decision sheet (with the depth the ladder would select as the Recommended option), and Part R MUST consume that answer during execution instead of asking again.

#### Scenario: Unset preference means auto ladder

- **WHEN** neither `AGENTS.md` nor `CLAUDE.md` declares `pr-review-gate:`
- **THEN** Part R treats the preference as `auto` and selects `depth=full` or `depth=light` from the size/risk ladder (not blanket full solely from unset), and the sheet has no Review item

#### Scenario: never skips with 留痕

- **WHEN** preference is `never`
- **THEN** Part R writes project-preference skip 留痕 including `tip=<full sha of origin/<source> at exit>` and proceeds to Part C without invoking `pr-code-review`

#### Scenario: ask requires user choice

- **WHEN** preference is `ask`
- **THEN** the merge decision sheet asks whether to run full, light, or skip for this merge with the ladder-derived depth as Recommended; MUST NOT auto-pick; skip requires user-explicit skip 留痕, and Part R consumes the answer without asking again

#### Scenario: always remains blanket full

- **WHEN** preference is `always` and the PR is a small application-code diff with no escalation hits
- **THEN** Part R still invokes `pr-code-review` at `depth=full`

### Requirement: Part R SHALL classify non-application-code surfaces

Part R MUST classify the open PR/MR three-dot diff as **non-application-code** when every changed path matches the allowlist and none match the denylist in `merge-discipline/reference.md`. A mixed diff (any denylisted path) MUST be classified as **application-code**.

#### Scenario: Skills-only PR is non-application-code

- **WHEN** the PR diff only changes files under `skills/**` and `openspec/**` and `docs/**` Markdown
- **THEN** the surface classifier reports non-application-code

#### Scenario: Mixed runtime source forces full surface

- **WHEN** the PR also changes a denylisted path (e.g. `.github/workflows/**`, `scripts/**`, or runtime source extensions per the reference table)
- **THEN** the surface is application-code

### Requirement: non-code-light preference SHALL use light review on non-application-code surfaces

When preference is `non-code-light` and the surface is non-application-code, Part R MUST invoke `pr-code-review` with `depth=light`, still applying dual-axis ≥80 Critical/Important clearance. When preference is `non-code-light` and the surface is application-code, Part R MUST select depth from the same size/risk ladder used by `auto` (MUST NOT force `full` solely because the surface is application-code). When preference is `always`, Part R MUST use `depth=full` regardless of surface.

#### Scenario: non-code-light on docs/skills PR

- **WHEN** preference is `non-code-light` and surface is non-application-code
- **THEN** Part R runs `pr-code-review` at light depth, writes the clean-pass 留痕 with `tip=`, then proceeds to Part C on pass

#### Scenario: non-code-light on small low-risk application-code PR

- **WHEN** preference is `non-code-light`, surface is application-code, and the size/risk ladder has no escalation hit
- **THEN** Part R runs `pr-code-review` at light depth (dual-axis clearance unchanged)

#### Scenario: non-code-light on escalated application-code PR

- **WHEN** preference is `non-code-light`, surface is application-code, and any size/risk escalation hits
- **THEN** Part R runs `pr-code-review` at full depth

### Requirement: Part R SHALL select application-code review depth from a size/risk ladder

When preference is `auto`, unset (treated as `auto`), or `non-code-light` on an application-code surface, Part R MUST choose `pr-code-review` depth as follows. Any single escalation hit MUST force `depth=full`. With no hit, Part R MUST use `depth=light`. Part R MUST NOT skip `pr-code-review` solely because the application-code diff is small. Light depth MUST NOT weaken dual-axis ≥80 Critical/Important clearance. Escalation signals and the sensitive-path / keyword table MUST live in `merge-discipline/reference.md` as repo-tunable constants (same home as the 400-line / 20-file thresholds). Signals MUST include at least: three-dot changed lines above the line threshold or changed files above the file threshold; breaking-change keywords in PR title / description / commit messages; a prior Part R fail on this tip re-presented after fixes; and a match against the sensitive-path or sensitive-keyword table (so a one-line change on an auth/crypto/session/permission/payment path still gets `full`).

#### Scenario: Small low-risk application-code uses light

- **WHEN** preference is `auto`, the three-dot diff is application-code, changed lines and files are at or below the reference thresholds, and no breaking, re-entry, or sensitive-path/keyword signal hits
- **THEN** Part R invokes `pr-code-review` with `depth=light`

#### Scenario: Large application-code uses full

- **WHEN** preference is `auto`, surface is application-code, and changed lines exceed the reference line threshold (or changed files exceed the file threshold)
- **THEN** Part R invokes `pr-code-review` with `depth=full`

#### Scenario: One-line sensitive path uses full

- **WHEN** preference is `auto` or `non-code-light`, the diff is a small application-code change, and a changed path or keyword matches the sensitive table in `merge-discipline/reference.md`
- **THEN** Part R invokes `pr-code-review` with `depth=full`

#### Scenario: Small application-code is still reviewed

- **WHEN** the size/risk ladder selects `light` for application-code
- **THEN** Part R still loads `pr-code-review` and still applies the ≥80 Critical/Important pass gate

### Requirement: Part R SHALL run pr-code-review before tip pinning

After Part B resolves to continue, and before Part C, `merge-discipline` MUST apply the `pr-review-gate` preference and surface classifier. Unless preference resolves to `never` (or `ask` with user skip 留痕), Part R MUST load strong dependency `pr-code-review` and run it at the selected depth against the open PR/MR about to be merged. Missing `pr-code-review` MUST abort with a per-skill install command when a run (full or light) is required. Execution order MUST remain A → B → R → C → D → merge. Part R still occurs before tip pinning.

#### Scenario: Order includes Part R when review runs

- **WHEN** a protected-branch merge is imminent, Parts A–B have passed, and preference requires a review run
- **THEN** Part R runs `pr-code-review` before Part C and before any tip-pin merge command

### Requirement: Part R pass/fail SHALL use dual-axis clearance

Part R MUST treat `pr-code-review` as failed (block merge) when either the Standards or Spec axis retains one or more issues at confidence ≥80 with severity Critical or Important, unless the user gives an explicit Part R skip 留痕. Minor-only survivors or all scores below 80 MUST count as Part R pass. Part R MUST NOT require a receiving-code-review reception loop to pass. Light depth MUST NOT weaken this clearance rule. A fail that leads to source-tip fixes MUST NOT unlock Part C by itself: Part C MUST wait for a later Part R pass on the post-fix tip, an explicit Part R skip 留痕, or the round-cap human pause outcome defined by the re-review loop requirement.

#### Scenario: Spec-axis Important blocks merge

- **WHEN** `pr-code-review` posts an Important Spec finding scored ≥80 and Standards is clean
- **THEN** merge-discipline blocks Part C until a later Part R pass on the tip, an explicit Part R skip 留痕, or a round-cap human decision that accepts residual blocking with 留痕 or aborts merge

#### Scenario: Dual-axis clean proceeds to coverage

- **WHEN** both axes have no remaining ≥80 Critical/Important issues
- **THEN** Part R passes and Part C runs next

#### Scenario: Fixes alone do not unlock Part C

- **WHEN** Part R fails dual-axis clearance and the agent pushes fixes on the source tip without a new Part R run
- **THEN** Part C and the merge command MUST NOT run

### Requirement: Part R SHALL re-review until clean before Part D

When Part R fails dual-axis clearance and the agent applies source-tip fixes (not an explicit Part R skip), Part R MUST re-invoke `pr-code-review` on the new tip before Part C. The loop is review → fix tip → re-review. Exit to Part C ONLY on a clean dual-axis pass or an explicit Part R skip 留痕.

#### Scenario: Fix then re-review passes

- **WHEN** Part R fails, the agent pushes fixes, and the next Part R run on that tip has no ≥80 Critical/Important on either axis
- **THEN** Part R passes and Part C may proceed

#### Scenario: Explicit skip still unlocks without clean review

- **WHEN** Part R has failed and the user provides an explicit Part R skip 留痕
- **THEN** Part R may proceed to Part C without requiring a clean re-review

#### Scenario: Re-entry keeps post-fail full depth

- **WHEN** a prior Part R fail on this tip is re-presented after fixes
- **THEN** depth selection MUST still apply the post-fail → full escalation signal

#### Scenario: Skipped Part R does not enter the loop

- **WHEN** preference is `never` or the user gave ask-skip 留痕 so Part R did not run
- **THEN** the re-review loop MUST NOT run and Part C follows the existing skip path

### Requirement: Part R SHALL cap fail-fix-re-review at three rounds

Each `pr-code-review` invocation in one merge attempt counts as one round. The fail→fix→re-review loop MUST cap at **3** rounds. If round 3 still fails dual-axis clearance, Part R MUST pause and ask the user to choose: continue another review round / accept residual blocking with 留痕 / abort merge — and MUST NOT auto-enter Part C.

#### Scenario: Second round still fails then third passes

- **WHEN** Part R fails twice after successive fixes and the third review round on the latest tip is dual-axis clean
- **THEN** Part R passes and Part C may proceed

#### Scenario: Three rounds still blocking

- **WHEN** three Part R review rounds in one merge attempt have each retained ≥80 Critical/Important findings after any intervening fixes
- **THEN** Part R pauses for the user (continue another round / accept residual with 留痕 / abort) and MUST NOT enter Part C automatically

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

### Requirement: merge-discipline description SHALL be English-primary with Chinese triggers

Frontmatter `description` for `merge-discipline` MUST use English for the routing summary (what / when / Do NOT use) and MUST include Chinese trigger phrases (English equivalents MAY follow). It MUST NOT use a Chinese-primary narrative that interleaves English Part labels mid-sentence as the main routing prose.

#### Scenario: Description matches English-primary template

- **WHEN** an agent or installer reads `merge-discipline` frontmatter `description`
- **THEN** the what/when/Do-NOT prose is English-primary and Chinese triggers appear in the Triggers section of that string

### Requirement: Part D SHALL run a squash decision step before the merge command

After Part C has continued and the pre-Part-D tip check has passed, and before any merge command executes, merge-discipline MUST run a squash decision step: (1) list the MR/PR's commits, (2) classify commit quality, (3) present a recommendation — squash or no-squash — with rationale, and (4) obtain explicit user confirmation of the merge strategy. The step MUST NOT be skipped on a direct merge command. When two or more viable strategies exist, the step MUST NOT auto-select one on the user's behalf. Tip-pinning semantics are unchanged by this step. Steps (1)–(3) MUST be computed during the merge preflight and the confirmation in (4) MUST be requested as the Squash item of the merge decision sheet; when a sheet answer is present, the step MUST re-list the commits on the tip about to be pinned, state any change from the preflight list, and apply the sheet answer before the merge command without asking again (when the re-listed commits now satisfy the collapse pre-check, the stated collapse conclusion applies).

**Collapse pre-check**: when fewer than two viable strategies exist, the step SHALL state its conclusion plus a one-line reason and adopt it WITHOUT prompting (and the sheet SHALL omit the Squash item). A decision space collapses in exactly these cases: the MR contains exactly one commit ahead of base (nothing to consolidate; equivalent outcomes), or repo/platform policy permits only one merge method (no alternative to choose). The stated conclusion keeps the choice overridable by the user, preserving the anti-default rationale: prompting is for divergent outcomes, not for confirming what cannot be otherwise.

Recommendation semantics MUST be dynamic, based on the MR's commit history:
- Atomic commits with individual value (feature + reviewable enhancement + archive as separate meaningful commits) → recommend **no-squash** (merge commit preserves history).
- Trivial accumulation (fixup / typo / wip / CI-retry noise, intermediate states without standalone value) → recommend **squash**.
- A source branch that will continue to receive development → lean **no-squash** (squashing cuts the commit graph shared with the target and breeds conflicts on later merges), regardless of commit tidiness.

The step MUST be platform-neutral: GitHub executes via `gh pr merge <id> --merge|--squash --match-head-commit "$MERGE_SHA"`; GitLab executes via `glab mr merge <id> [--squash] --sha "$MERGE_SHA"`; platforms without squash support fall back to their available merge methods with the gap stated. `$MERGE_SHA` MUST be the `T_trace` verified by the tip check.

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

### Requirement: Merge decision sheet SHALL batch pending preference decisions before execution

On merge intent, `merge-discipline` MUST first run a read-only preflight over Parts A, B, C, R, and D, collect every pending human preference decision, and present them in one batch form (the "merge decision sheet"). Only after the answers arrive MAY Parts A→B→R→C→D execute. The sheet MUST NOT be auto-answered on the user's behalf, including in auto-mode host workflows.

#### Scenario: Several preferences pending are asked once

- **WHEN** merge intent arrives, the target is 3 commits ahead (`CONFLICTS=0`), `coverage-gate` is unset, `pr-review-gate` is `ask`, and the MR has four atomic commits
- **THEN** preflight runs read-only and one sheet lists rebase, coverage, review, and squash items each with options, Recommended, and rationale, and execution then runs A→B→R→C→D without asking any of them again

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

Coverage item: `coverage-gate` is `ask` or unset (run / skip). `always`, `never`, and `auto` MUST NOT add a Coverage item. Review item: `pr-review-gate` is `ask` (full / light / skip). Squash item: two or more commits and the collapse pre-check does not apply (squash / no-squash). An optional Delete-source-branch item (delete after merge / keep) MAY ride along only when at least one other item is present, and MUST NOT by itself cause a prompt. When no item is needed, the sheet is empty and execution proceeds without prompting.

#### Scenario: Resolved preferences produce no item

- **WHEN** `coverage-gate: never`, `pr-review-gate: auto`, there is no active association, `BEHIND=0`, `CONFLICTS=0`, and the MR has several commits needing a squash choice
- **THEN** the sheet contains only the Squash item (plus optional Delete), with no Coverage, Review, Rebase, or Archive item

#### Scenario: Empty sheet proceeds without prompting

- **WHEN** merge intent arrives, there is no active association, `BEHIND=0` and `CONFLICTS=0`, `coverage-gate: never`, `pr-review-gate: auto`, and the MR is a single commit
- **THEN** merge-discipline presents no sheet and executes A→B→R→C→D directly, stating the single-commit collapse conclusion and the resolved preferences in its output

#### Scenario: Delete-branch item alone does not prompt

- **WHEN** every other item resolves without asking
- **THEN** no sheet is shown and the optional source-branch deletion remains a non-blocking post-merge offer

### Requirement: Execution SHALL consume sheet answers without re-asking

During execution, Parts A→B→R→C→D MUST consume the sheet answers and MUST NOT re-ask an answered item. After a rebase rewrites the source tip, the same attempt continues R → C → D and those Parts MUST re-run detection on the new tip but MUST NOT re-ask answered items unless a new mid-flight failure appears. A pause taken to wait for CI ends the attempt; the next merge re-enters from Part A with a new preflight and a new sheet. Skip answers MUST still produce their 留痕 where the skipped Part would have run. A re-entry from Part A starts a new merge attempt with a new preflight and a new sheet.

#### Scenario: Answers survive a rebase

- **WHEN** the sheet answered rebase: now, and the rebase rewrites the source tip
- **THEN** the same attempt continues R → C → D, re-runs detection on the new tip, and reuses the sheet answers for review, coverage, and squash without re-asking

#### Scenario: Archive-first re-entry builds a new sheet

- **WHEN** Part A would block, the user chose archive first on the sheet, and archive lands on the source tip
- **THEN** re-entry from Part A starts a new merge attempt with a new preflight and a new sheet rather than reusing answers from the previous attempt

#### Scenario: Skip answer still writes 留痕

- **WHEN** the sheet recorded Coverage: skip
- **THEN** Part C writes the user-explicit skip 留痕 when it would have run, without asking again

### Requirement: Mid-flight failures SHALL pause separately from the sheet

These MUST remain separate pauses at the moment they occur and MUST NOT be sheet items: Part R fail and the three-round cap pause, coverage below threshold / crash / no report / no tests, `test-coverage-analyzer` unavailable after a run decision, a rebase conflict that `git-conflict-resolve` cannot finish or a user abort, tip-check mismatch before Part D, post-merge ancestor check MISSING, and fast-forward blocked during workspace sync. They depend on results that do not exist at preflight time.

#### Scenario: Mid-flight failure pauses separately after the sheet

- **WHEN** the user answered the sheet (coverage: run, review: full) and Part R later returns an Important finding at confidence ≥80
- **THEN** Part R follows its fail→fix→re-review rules and pauses on the round cap as defined, as a separate pause, and the sheet answers for coverage, review, and squash are not asked again

#### Scenario: Coverage below threshold pauses on its own

- **WHEN** the sheet recorded Coverage: run and the analyzer reports coverage below threshold
- **THEN** merge pauses for force / add tests / abort as a separate pause and the sheet is not rebuilt

### Requirement: Part B SHALL obtain rebase confirmation before rewriting the source branch

Part B MUST detect `BEHIND` and `CONFLICTS` with read-only commands. When both are zero it MUST proceed to Part R without asking. Otherwise it MUST report the lead and conflict estimate and MUST NOT rebase without user confirmation, taken from the sheet's Rebase item (not asked again when answered). On confirm it rebases the source branch only, delegates conflicts to `git-conflict-resolve` in rebase mode, pushes with `--force-with-lease`, and the same attempt continues R → C → D without waiting for CI. If the attempt pauses to wait for CI, the next merge starts from Part A.

#### Scenario: Clean and level branch skips the question

- **WHEN** `BEHIND=0` and `CONFLICTS=0`
- **THEN** Part B passes through to Part R and the sheet has no rebase item

#### Scenario: Behind target consumes the sheet answer

- **WHEN** `BEHIND>0`, the sheet recorded rebase: now, and Part B runs
- **THEN** Part B rebases the source branch, pushes with `--force-with-lease`, continues the same attempt at R → C → D without waiting on CI, and does not ask for confirmation again

#### Scenario: CI wait starts a new attempt

- **WHEN** a merge attempt pauses to wait for CI and the user later asks to merge again
- **THEN** that merge starts from Part A with a new preflight and a new sheet

#### Scenario: Conflicting rebase stalls

- **WHEN** the sheet answered rebase: now and `git-conflict-resolve` cannot finish the rebase
- **THEN** the merge flow pauses for the human as a separate mid-flight pause

### Requirement: Part R satisfaction 留痕 SHALL record the origin source tip

Every Part R satisfaction exit MUST write a 留痕 that includes `tip=<full sha of origin/<source> at exit>`. Satisfaction exits are: clean dual-axis pass, user-explicit skip, accept-residual after the round cap, and project preference `never`. The clean-pass 留痕 MUST be `【PR code-review 门控通过】tip=<sha>。时间：<ISO>。PR：<id>。depth=<light|full>。` Skip, accept-residual, and never templates MUST also include `tip=<sha>`.

#### Scenario: Clean pass records tip and depth

- **WHEN** Part R passes dual-axis clearance at `depth=light` or `depth=full`
- **THEN** the 留痕 is the clean-pass template with `tip=<full sha of origin/<source> at exit>`, the time, the PR id, and that depth

#### Scenario: Skip and never exits also record tip

- **WHEN** Part R exits by user-explicit skip, accept-residual, or `pr-review-gate: never`
- **THEN** that exit's 留痕 includes `tip=<full sha of origin/<source> at exit>`

### Requirement: Tip check before Part D SHALL fail closed

After Part C continues and before Part D, merge-discipline MUST (1) require the latest Part R satisfaction 留痕 to contain `tip=`; (2) run `git fetch origin <source>`; (3) require `T_trace` (the 留痕 sha), `T_tracking` (`origin/<source>`), `T_pr` (platform head), and `T_local` (`refs/heads/<source>` when that ref exists) to all equal `T_trace`; (4) otherwise MUST NOT enter Part D and MUST pause into a new merge attempt from Part A; (5) when the check passes, Part D MUST pin the merge to that SHA.

#### Scenario: Matching tips allow Part D to pin

- **WHEN** the latest satisfaction 留痕 has `tip=` and after fetch `T_trace`, `T_tracking`, `T_pr`, and `T_local` (if the local ref exists) are equal
- **THEN** Part D runs and pins the merge to `T_trace`

#### Scenario: Tests added during a coverage pause block Part D

- **WHEN** Part C pauses, the user adds tests that move the source tip, and resume finds `T_tracking` or `T_pr` different from `T_trace`
- **THEN** merge-discipline does not enter Part D and starts a new merge attempt from Part A

#### Scenario: Missing tip blocks Part D

- **WHEN** the latest Part R satisfaction 留痕 has no `tip=`
- **THEN** merge-discipline does not enter Part D
