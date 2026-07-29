---
name: jira-fix-workflow
version: "3.22.0"
user-invocable: true
description: "End-to-end Jira bug-fix workflow (stages 0-10), driven by a single Jira link, from intake through PR/MR merge and Jira writeback. Manual mode (default) pauses for confirmation between stages; auto/force modes run end-to-end. Triggers — 「修复这个 bug [URL]」「帮我修复 [URL]」「jira-fix [URL]」「自动修复 [URL]」「强制修复 [URL]」「继续修复」「从上次继续」 / fix this bug, jira-fix, auto fix, force fix, resume fix. Do NOT use for batch fixes across multiple issues — use jira-fix-batch instead."
dependencies:
  - solution-review
  - code-design-review
  - hybrid-debug
  - runtime-evidence-debug
  - browser-debug-toolkit
  - node-version-discipline
  - workflow-mode-lifecycle
  - clarifying-question-discipline
  - known-issue-research
  - analysis-core
  - ensure-tests
  - merge-discipline
  - pdca-review-orchestration
  - jira-status-writeback
  - completion-evidence-discipline
  - domain-language-discipline
  - test-first-discipline
  - design-approval-gate
  - feature-branch-closeout
---

# Jira Bug-Fix Workflow

> End-to-end Jira bug-fix flow; stages 1-6 are read-only. Manual mode (default) requires confirmation between stages.
>
> **Prerequisites**: mcp-atlassian is configured with a valid PAT; the Git environment is healthy.
> **Format reference**: output templates, the state directory, commit format, and exit scripts are in [reference.md](reference.md).

## Triggers and Modes

| Phrasing example | Mode | Note |
|---------|------|------|
| "修复这个 bug [URL]", "帮我修复 [URL]", `jira-fix [URL]` | 👤 Manual | Default; solution/plan/commit need user confirmation |
| "自动修复 [URL]", "修复 [URL] 自动模式", `jira-fix [URL] --auto` | 🤖 Auto | Runs the full flow with no confirmation |
| "强制修复 [URL]", "跳过分级修复 [URL]", `jira-fix [URL] --force` | 🤖 Auto | Skips difficulty grading, forces auto execution |
| "继续修复 [URL]", "再次修复 [URL]", `jira-fix [URL] --retry` | 👤 Manual | Skips stages 0/1, re-analyzes from **stage 3** |
| "从上次继续", "恢复修复 [URL]", `jira-fix [URL] --resume` | Current mode | Resumes from the last checkpoint |

**Mode detection**: contains "自动" / `--auto` → auto; contains "强制" / "跳过分级" → skip grading (auto); contains "继续修复" / "再次修复" / `--retry` → re-enter at stage 3; contains "从上次继续" / "恢复" / `--resume` → resume from checkpoint; otherwise manual.

## Strong Dependencies & Prerequisite Check

Strong dependencies are listed in frontmatter `dependencies`. After stage 0 passes and before stage 1, scan available skills; any missing → print a structured notice and **abort immediately** (format in `solve-workflow/reference.md`). **No degradation.**

## Mode Lifecycle

Core rules live in `workflow-mode-lifecycle`. "Full flow complete" means stages 0-10 finished normally (including any stage's final termination); failure abort / 🔴 extremely-hard termination / user stop / review-cap intervention-termination all revert to manual. Re-entering auto requires an **explicit** trigger; implicit continuation ("继续修复", "再改一下") does **not** reactivate it.

**Workflow-specific differences**: stage 9 complete / stage 10 merge complete / 🔴 extremely-hard termination (auto) → revert to manual; stage 8 under-threshold rollback keeps the current mode (auto, capped at 2 rollbacks); `--retry` → reset to manual; `--resume` → keep the checkpoint's mode.

## ⚡ Quick Reference (read before executing)

| Stage | Edit/Write | Bash | 👤 Manual stop point | 🤖 Auto stop point | Required output |
|------|-----------|------|-------------|-------------|---------|
| 0 Prerequisite check | ❌ | ❌ | Abort on failure; success→1 | Abort on failure/P0; success continues | Check summary |
| 1 Read Jira | ❌ | ❌ | →2 | →2 | Jira summary |
| 2 Understanding alignment | ❌ | ❌ | ⛔ Wait for confirmation→3 | Skip→3 | Restatement + ambiguities |
| 3 Analyze | ❌ | ❌ | Stop on existence-check failure; done→4 then ⏸️→5 | Stop on existence-check failure; done continues | Root cause + difficulty |
| 4 Grading | ❌ | ❌ | 🔴⛔ present A/B; otherwise no separate stop | 🔴⛔ terminate; otherwise continue | Difficulty grade |
| 5 Solution review | ❌ | ❌ | ⛔ pick solution; ⛔ after review | ⛔ if review exceeds 3 rounds | Solution table + review |
| 6 Plan | ❌ | ❌ | ⛔ wait for confirmation | ⛔ if hard/high-risk | Change list |
| 7 Execute | ✅ | ✅ | ⛔ wait for review; multi-repo confirm branches first | ⛔ wait for review if hard | Execution report |
| 8 Verify | ❌ | ✅ test | ⛔ wait for confirmation | Pass→9; under-threshold rollback ≤2 | Verification result |
| 9 Submit | ❌ | ✅ git/CLI | ⛔ confirm, then push+PR | Auto push+PR | Completion report + URL |
| 10 Merge | ❌ | ✅ merge/optional coverage | ⛔ confirm, then merge | ⛔ same, confirmation required | Merge/cleanup/Jira report |

Stage 7: create the branch first; call `node-version-discipline` before build/lint/tsc. Stage 10 Part C decides whether to run the coverage analyzer per preference/ask.

Auto/manual per-stage differences: [reference.md](reference.md) § Mode Differences Quick Reference.

## General Principles

- **Investigate before speaking**: no verdict without code evidence
- **Active questioning**: follow `clarifying-question-discipline` (one question per turn; multi-round until clear; clarify first, do not rush to answer). When domain vocabulary is in play, also follow `domain-language-discipline`.
- **Jira status boundary**: engineering only transitions the issue to "已修复" (Fixed); closing / marking verified belongs to QA

## Path Selection

Chosen after stage 4's grading; may upgrade, never downgrade.

| Path | Fits | Requirement |
|------|------|------|
| Lean | 🟢 Easy | 1 solution + a risk note is enough; plan may fold in; stages 8/9 never skipped |
| Standard | 🟡 Medium | Run stages 1-10 in full |
| Full | 🟠 Hard / 🔴 Extremely-hard choosing B | All stages; pause for review after stage 7 |

Upgrading in manual mode requires user confirmation.

## State Persistence (interruption recovery)

**Resume**: when `state.json` exists, 🤖 auto continues from `current_phase`; 👤 manual asks whether to resume. **Cleanup**: on completion set `current_phase: "completed"`. Directory layout and schema: [reference.md](reference.md) § State Directory and state.json.

**`--retry` (stage-3 re-entry)**: skip 0/1; read the existing `01-jira-info.md`; ask once "what was fixed last time / what's the new symptom"; write "this iteration's context" into `02-analysis.md`; reset state (`current_phase: 3`, `completed_phases: [0,1]`, clear `grade`/`selected_option`/`review_*`); append `-v2`/`-v3`… to the branch name; if root cause is still unclear, prefer instrumentation debugging.

---

## Stage 0: Prerequisite Check

Any failure aborts the flow.

1. Detect the mode (including `--force` / `--resume`), write it to `state.json`
2. `jira_get_issue` (title/priority) connectivity check; abort on failure
3. **P0 interception** (auto only): P0 → abort, switch to manual
4. Git: 🤖 dirty→stash; 👤 dirty→prompt to handle

Output: [reference.md](reference.md) § Stage 0. On success, proceed directly to stage 1.

---

## Stage 1: Read Jira Info

Call `jira-read {JIRA-ID} --live` (degrade to cache → degrade further to manual/abort). Save `01-jira-info.md`. Extract: ID, title, priority, status, description, repro steps, expected/actual result, attachments, comments. Output: reference.md § Stage 1. Tools: ✅ mcp / jira-read; ❌ Edit/Write/Bash. Proceed directly to stage 2.

---

## Stage 2: Understanding Alignment

Restate the understanding from stage 1 and surface ambiguities; **reading code is forbidden**. 🤖 skip→3. 👤 must confirm before →3.

Output: problem restatement (no technical judgment) / key elements / ambiguities (one question per turn) / scope breakdown (if applicable, still no code exploration). Format: reference.md § Stage 2; save `02-alignment.md`.

---

## Stage 3: Analyze the Problem

Load `analysis-core` §§1-3. Mapping: `{next-stage}` = stage 4 "difficulty grading"; `{root-cause step}` = root-cause analysis; `{impact-assessment step}` = impact scope; `{upstream-eval step}` = upstream-dependency fix evaluation.

**Workflow-specific differences**: ① the industry-wide-issue evaluation is a **gate**; ② 🚫 no viable fix → report + **stop, do not enter stage 5** + write a Jira comment (template in reference.md); ③ existence check ❌ → stop + Jira comment + wait for the user; ④ artifact `02-analysis.md` (includes a difficulty pre-assessment).

👤 continue directly into stage 4, append the grading to the end of the output, then ⏸️ pause for confirmation before →5. 🤖 → stage 4.

---

## Stage 4: Difficulty Grading + Mode Decision Gateway

### 🔴 Extremely hard (any one qualifies)

Root cause unknown | architectural change | data migration | API-protocol change | estimated files >10 or lines >500 | cross-repo / cross-service

### Other grades

Files ≤3 and root cause clear → 🟢; 4-10 and mostly clear → 🟡; ≤10 but less clear with a larger change → 🟠

### Mode × Grade

| Grade | 🤖 | 👤 |
|------|-----|-----|
| 🟢/🟡 | Execute normally | May suggest switching to auto; continue manual |
| 🟠 | Pause for review after stage 7 | Normal manual |
| 🔴 | **Terminate** + flag the report | Risk notice, choose A/B |

Write the grade to `04-grade.md` and state `grade`; declare the path. Template: reference.md § Stage 4. 👤 no separate stop for non-extremely-hard cases; the 🔴 choose-B script is in reference.md. 🤖 non-extremely-hard →5.

---

## Stage 5: Explore & Review Solutions

Offer 2-3 solutions (YAGNI). 🤖 auto-select (priority: thorough > best-practice > code quality > smallest change) → review. 👤 ask once if preference is missing, then present the comparison table.

Output: list → expanded detail → **one** comparison table (see reference.md § Stage 5 Solution Comparison) → `03-options.md`. 👤 stop after the comparison table.

**Review**: load `pdca-review-orchestration`. Mapping: `{next-stage}` = stage 6; `{artifact-sink}` = `03-options.md`; `{extra-dimensions}` = none; `{batch-overcap-behavior}` = mark "review failed (cap)" and move to the next issue. ✅ Read; ❌ Edit/Write/Bash.

---

## Stage 6: Make a Plan

Must include: root-cause/solution recap, architecture (optional Mermaid), file change table, order, test scenarios, impact scope, rollback. Save `04-plan.md`.

| Scenario | Behavior |
|------|------|
| 🤖 Normal | Auto→7 |
| 🤖 🟠 or risk > medium | Pause for confirmation |
| 👤 Normal | Wait for confirmation |
| 👤 🔴 chose B | Requires a second confirmation: "I understand the risk, proceed" |

Exit script: reference.md.

---

## Stage 7: Execute the Plan

Before production edits, follow `design-approval-gate` (manual: user pass; auto/force: named escape + 留痕).

**Branch**: naming and single-/multi-repo flow are in [reference.md](reference.md) § Stage 7 Branch-Creation Details; write `00-branch.md`.

Execute strictly per the plan; check off `TodoWrite` / plan checkboxes item by item as completed. Tag every change `// fix [JIRA-ID]`. Quality gate: `node-version-discipline` → `ReadLints` → `typescript-check` when a tsconfig exists. 🤖 multi-repo changes and lints per repo, write `reports/[JIRA-ID]-analysis.md`.

After execution: 🤖 normal→8, 🟠 pause for review; 👤 normal wait for confirmation→8, 🔴 chose B pause without auto-committing. Report → `05-execution.md`. For behavior changes follow `test-first-discipline`; when business logic lacks tests, call `ensure-tests` (`mode=advisory`) — ensure-tests does not satisfy test-first. Exit script: reference.md.

---

## Stage 8: Check & Verify

Output the result only — do not change code. Compare against the Jira repro/expected result, stage 6's plan, tests, side effects, and root cause; use `analysis-core` §4 for the debug-verify loop. Verification-report honesty per `pdca-review-orchestration` and `completion-evidence-discipline`. Template: reference.md § Stage 8.

| Verdict | Next |
|------|------|
| ✅ | →9 |
| ❌ | Implementation error→7; solution flaw→5; incomplete root cause→3 |

🤖 auto-rolls back on under-threshold results, capped at 2, then pauses. 👤 waits for "通过" (pass) / "返回修复" (return to fix) / "重选方案" (reselect solution). Save `06-verification.md`.

---

## Stage 9: Submit PR/MR

1. Collect the Jira ID, root cause, solution, files, and report paths
2. `git-commit` (`execute=true`): add/commit/push; message format in reference.md § Commit Message Format (must include the Jira ID)
3. Open a PR/MR matching the remote (`gh` / `glab`); description includes root cause, solution, files, verification scenarios (≥2 each of functional/boundary/regression), and the Jira link

👤 stop after presenting the plan; the AI executes once confirmed. 🤖 executes directly. Completion output: reference.md § Stage 9 → `07-report.md`.

---

## Stage 10: Review & Merge

Present the PR/MR URL. Load `feature-branch-closeout` for the closeout menu (PR already open → typically merge / keep / continue). **Both auto and manual require user confirmation before merging.**

Once merge is selected:

1. `feature-branch-closeout` loads `merge-discipline` (Part A→B→C→D; checklist in that skill's reference.md)
2. Merge (`gh pr merge --merge` / `glab mr merge`) → delete the remote fix branch → sync the default branch → delete the local branch
3. Load `jira-status-writeback` (field map: branch, commit, PR URL, root cause, solution, files, report, verification scenarios); a writeback failure does not block completion

Write `08-merge.md`; state `current_phase: "completed"`.

---

## Safety Mechanisms (auto mode)

Stash before changing; warn at >10 files or >500 lines; block at >20 files or >1000 lines (requires `--force`); block on linter errors; review loop capped at 3 rounds; log every automatic decision.

---

## Common Mistakes

> Only non-obvious pitfalls are listed here. Merging → `merge-discipline`; writeback → `jira-status-writeback`; industry-wide/upstream issues → `known-issue-research` / `upstream-dependency-debug`. Rules already stated in the stage body are not repeated.

| Mistake | Fix |
|------|------|
| 👤 skips stage 2, or reads code during stage 2 | Align first; stage 2 is Jira-info-only |
| Continuing despite an existence-check mismatch | Stop + Jira comment, wait for confirmation |
| 🤖 executes anyway at 🔴; rolls back more than twice without pausing; merges without confirmation | Follow the stage 4 gateway; pause at the cap; merging always needs confirmation |
| Missing `// fix [JIRA-ID]` | Tag every change |

---

## Batch Fix

Use the `jira-fix-batch` skill.
