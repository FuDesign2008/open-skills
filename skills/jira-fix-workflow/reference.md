# Jira Fix Workflow — Output Format Reference

Per-stage output-format examples for the `jira-fix-workflow` skill, for the AI to follow when formatting output.

Stage 3 analysis methodology lives in `analysis-core`. Industry-wide evaluation methodology/template: `known-issue-research/reference.md`; jira-fix **gate** divergence: see § Industry-Wide Issue Evaluation Report below.

---

## Mode Differences Quick Reference

| Stage | 🤖 Auto | 👤 Manual |
|------|--------|--------|
| 0 Prerequisite check | P0 interception; dirty workspace→stash | Dirty workspace→prompt to handle |
| 2 Understanding alignment | Skip→3 | Restate, then wait for confirmation→3 |
| 4 Grading | 🔴 Extremely hard→terminate | 🔴 Extremely hard→A/B |
| 5 Solution review | Loop review ≤3 rounds; pause at cap | Pick solution→review→user verdict |
| 6 Plan | Normal auto-confirm; pause if hard/high-risk | Wait for confirmation |
| 7 Execute | Auto-creates branch; pause for review if hard | Single-repo creates directly; multi-repo confirms first |
| 8 Verify | Auto-rolls back ≤2 times, then pauses | Wait for confirmation, then→9 |
| 9 Submit | Auto push + PR/MR | Present the plan, execute once confirmed |
| 10 Merge | ⛔ Merge requires confirmation (same as manual) | Merge requires confirmation |
| Interruption recovery | Continue directly from checkpoint | Ask whether to resume |

---

## State Directory and state.json

Directory layout (`.jira-fix/{JIRA-ID}/`):

```
state.json           ← progress (mode, review_round, review_status)
00-branch.md         ← stage 7 pre-step (fix-branch creation)
01-jira-info.md      ← stage 1
02-alignment.md      ← stage 2 (manual mode)
02-analysis.md       ← stage 3
04-grade.md          ← stage 4
03-options.md        ← stage 5 (solutions + review record)
04-plan.md           ← stage 6
05-execution.md      ← stage 7
06-verification.md   ← stage 8
07-report.md         ← stage 9
08-merge.md          ← stage 10
```

`state.json` example:

```json
{
  "jira_id": "PROJ-12345",
  "jira_url": "https://your-jira.example.com/browse/PROJ-12345",
  "mode": "manual",
  "current_phase": 3,
  "completed_phases": [0, 1],
  "branch": "fix/jira-fix-PROJ-12345",
  "grade": null,
  "selected_option": null,
  "review_round": 0,
  "review_status": null,
  "started_at": "ISO_TIMESTAMP",
  "last_updated": "ISO_TIMESTAMP"
}
```

- `review_round`: 0-3; `review_status`: null | in_progress | passed | failed_max_rounds

## Commit Message Format

```
<type>(<scope>): <Jira-ID> <subject>
```

Example: `fix(ai-summary): PROJ-123 fix AI-summary button visibility in share links`

Type: fix, feat, refactor, perf, style, docs, test. Scope examples: ai-summary, share, auth, api, ui, core.

## Stage Exit Scripts

Stop points are in the SKILL.md "Quick Reference". When a fixed closing line is needed, use the wording below:

- **Stage 2 (manual)**: Please confirm whether the understanding is accurate, or add any details missing from the Jira description.
- **Stage 6 (manual)**: ⏸️ Stage 6 (make a plan) complete. Proceed to **Stage 7: Execute the Plan**? Reply 「确认」/"confirm" to continue, or describe what needs adjusting.
- **Stage 7 branch (manual, single-repo)**: ✅ Fix branch created: `fix/jira-fix-[JIRA-ID]`, starting code changes.
- **Stage 7 branch (manual, multi-repo)**: ⏸️ Multi-repo branches created; about to start code changes. Reply 「确认」/"confirm" to continue.
- **Stage 7 (manual)**: ⏸️ Stage 7 (execute the plan) complete, please review the code. Proceed to **Stage 8: Check & Verify**? Reply 「确认」/"confirm" to continue, or let me know what needs adjusting.
- **Stage 9 (manual)**: ⏸️ Submission plan ready. Once confirmed, the AI will push and open a PR/MR. Reply 「确认」/"confirm" to continue, or let me know what needs changing.
- **Stage 10 (auto/manual)**: ⏸️ The PR/MR was created in stage 9; please complete code review. Reply 「确认」/"confirm" once you approve the merge, and the AI will merge and clean up the branch.
- **Stage 4 extremely-hard, choosing B (manual)**: ⚠️ Risk acknowledged; proceeding to **Stage 5: Explore & Review Solutions**. Reply 「确认」/"confirm" to continue, or reply 「A」to terminate.

## Stage 7 Branch-Creation Details

- **Naming**: `fix/jira-fix-[JIRA-ID]` (e.g. `fix/jira-fix-PROJ-12167`)
- **[🤖]**: match each repo's `.git` root against stage 6's file list → batch `git checkout -b …`; abort on failure
- **[👤 single-repo]**: create directly, append the "Stage 7 branch (manual, single-repo)" script
- **[👤 multi-repo]**: present repo/base-branch/branch-name, create once confirmed, append "Stage 7 branch (manual, multi-repo)"
- Write `00-branch.md`, update `state.json` `branch`; output template below under "Stage 7: Git Branch Created"

---

## Stage 0: Prerequisite Check Complete

```
## Stage 0 Complete: Prerequisite Check Passed

**Jira ID**: PROJ-12167
**Issue Title**: [title] (existence confirmed)
**Priority**: P1
**Execution Mode**: 🤖 Auto / 👤 Manual
**Credential chain**: ✅ / ⚠️ asked user to persist
**MCP (optional)**: ✅ available / ⚠️ missing (using cache or `jira-read`)
**Git Repository**: ✅

---
Proceeding to Stage 1: Read Jira Info
```

---

## Stage 1: Read Jira Info

```
## Stage 1 Complete: Jira Info Retrieved

**Jira ID**: PROJ-12167
**Title**: [title]
**Priority**: P1
**Status**: To Do
**Data Source**: Live API / Local Cache

**Problem Description**: [description]
**Repro Steps**: 1. ... 2. ...
**Expected Result**: [expected]
**Actual Result**: [actual]

**Comment Summary**: X total
> Latest comment - [user] ([time]): [content summary]

---
[🤖 Auto / 👤 Manual] Proceeding to Stage 2: Understanding Alignment
```

---

## Stage 2: Understanding Alignment

```
[Problem Restatement] My understanding of this bug is: ... (one sentence, no technical judgment)
[Key Elements] Trigger condition: ... / Expected behavior: ... / Actual behavior: ... / Repro environment: ...
[Ambiguities & Assumptions] (if any)
[Question] A [...] B [...]
Please confirm whether my understanding is accurate, or add any details missing from the Jira description.
```

Save to `.jira-fix/{JIRA-ID}/02-alignment.md`.

---

## Stage 3: Analysis Complete

Methodology steps live in `analysis-core` (existence → phenomenon → locate → red-capable loop → root cause → upstream-eval → impact). Do **not** restate that skeleton here. The stage output MUST close with the **analysis gate output block** (SoT: `analysis-core` §5 — red loop / debug entry / scenario supplements / temporary changes; missing block blocks Stage 4); do not restate the block's fields.

**Host-only output** (save to `.jira-fix/{JIRA-ID}/02-analysis.md`):

```
## Stage 3: Analysis Complete

### Artifact
Path: `.jira-fix/{JIRA-ID}/02-analysis.md`

### Jira-specific notes
- Existence / industry-wide gates: follow `analysis-core` + `known-issue-research` (industry-wide is a **gate** for jira-fix — see § Industry-Wide Issue Evaluation below)
- Difficulty pre-assessment (feeds Stage 4 grading):
  - Estimated files changed: X
  - Root-cause clarity: Clear / Mostly clear / Vague / Unknown

### Summary (fill from analysis-core results)
- Existence: ✅ / ❌ / ⚠️ …
- Root cause (one paragraph): …
- Impact: …
- Close with the analysis gate output block (`analysis-core` §5): Red loop / Debug entry / Scenario supplements / Temporary changes

---
Proceeding to Stage 4: Difficulty Grading
```

---

## Stage 4: Difficulty Grading

**[🤖 Auto] Extremely hard → termination report**:
```
## ⚠️ jira-fix Terminated: Difficulty Exceeds Auto-Fix Threshold

**Jira ID**: PROJ-12167
**Difficulty Grade**: 🔴 Extremely Hard
**Matched Conditions**:
  - [x] Root cause unknown: unable to pinpoint a specific fix location after analysis
  - [ ] Architectural change involved
  - [ ] Change scope too large

**Work Completed**:
  - Branch created: fix/jira-fix-PROJ-12167
  - Analysis saved: .jira-fix/PROJ-12167/02-analysis.md

**Recommended Next Steps**:
  1. Continue with manual mode: jira-fix [URL] --manual --resume
  2. Skip grading and force execution: jira-fix [URL] --force (at your own risk)
  3. Fix after a team review
```

**[👤 Manual] Extremely hard → risk notice + options**:
```
## ⚠️ High-Risk Notice: This Issue Is Graded "Extremely Hard"

**Matched Conditions**:
  - [x] [trigger condition name]: [specific detail]

**Recommendation**:

  Option A — Analysis only (recommended)
    Save the analysis to .jira-fix/PROJ-12167/02-analysis.md
    Add a Jira comment: "AI analysis complete; human evaluation needed before continuing the fix"
    End this fix attempt and wait for a human to take over

  Option B — Continue anyway (at your own risk)
    After stage 6's plan, require a second confirmation before entering stage 7
    After stage 7 executes, do not auto-commit; wait for the user to review the code before committing manually

Please reply A or B:
```

**[👤 Manual] Easy/medium → suggest switching to auto**:
```
💡 Note: this issue is graded "Easy/Medium"
Estimated [X] files changed, root cause clear, risk manageable.
You can switch to auto mode: "fix this bug [URL]" (without the manual-mode flag).

To continue the manual flow, just reply "继续"/"continue".
```

---

## Stage 5: Solution Evaluation

**[🤖 Auto]**:
```
## Stage 5: Solution Auto-Selected

| Solution | Core Approach | Complexity | Risk | Recommendation |
|------|---------|--------|------|--------|
| Solution 1 | [approach] | Low | Low | ⭐⭐⭐⭐⭐ |
| Solution 2 | [approach] | Medium | Low | ⭐⭐⭐ |

**AI Auto-Selected**: Solution 1
**Selection Rationale**: 1. ... 2. ...

---
Entering solution review (round 1)
```

**[👤 Manual]**:
```
## Stage 5: Evaluate Solutions

[solution comparison table]
[detailed description of each solution]

### Recommended Solution: Solution 1
Rationale: ...

---
Please select a solution number to enter solution review
```

---

## Stage 5 Review: Output Template

The review report body and loop rules follow the strong dependency `staged-review-flow` (full `solution-review` / conditional `code-design-review`, binary verdict, auto-mode ≤3 rounds, design summary). This file no longer maintains a full "four-dimension evaluation" example.

Append the review record to `.jira-fix/{JIRA-ID}/03-options.md` (`{artifact-sink}`).

**[🤖 Auto · pass]** Once the shared review concludes ✅, proceed to stage 6: make a plan.

**[🤖 Auto · fail]** Output the optimization notes → re-review; at the 3-round cap:
- **Non-batch**: pause, list a summary with "continue review / reselect solution / manual adjustment" options, wait for the user
- **Batch** (`{batch-overcap-behavior}`):

```
## ⚠️ [{JIRA-ID}] Solution Review Exceeded Cap, Skipped

**Difficulty Grade**: … → marked "review failed (cap exceeded)"
**Review Round**: 3 / 3
**Unresolved Issues**: …
**Action**: Skip stages 7-9, continue with the next issue
```

**[👤 Manual]** Append after the shared review report:

```
Please give a verdict:
- Say 「通过」/「确认」("pass"/"confirm") → proceed to stage 6
- Say 「修改方案」/「完善方案」/「优化方案」("revise the solution") → refine per the feedback and re-review
- Say 「重选方案」("reselect solution") → go back to solution selection
```

---

## Stage 7: Git Branch Created (execution pre-step)

**[🤖 Auto] Single project**:
```
## Stage 7 Pre-Step: Git Branch Auto-Created

**Jira ID**: PROJ-12167
**Base Branch**: release/8.2.30
**Fix Branch**: fix/jira-fix-PROJ-12167
**Status**: Automatically switched to the fix branch

---
Auto-continuing to execute the plan
```

**[🤖 Auto] Multi-project**:
```
## Stage 7 Pre-Step: Git Branches Auto-Created (Multi-Project)

| Project | Base Branch | Fix Branch | Status |
|------|---------|---------|------|
| backend | release/8.2.30 | fix/jira-fix-PROJ-12167 | ✅ Created |
| frontend | release/8.2.30 | fix/jira-fix-PROJ-12167 | ✅ Created |

---
Auto-continuing to execute the plan
```

**[👤 Manual]**:
```
## Stage 7 Pre-Step: Git Branch Created

**Jira ID**: PROJ-12167
**Base Branch**: release/8.2.30 (source: main_branch file)
**Fix Branch**: fix/jira-fix-PROJ-12167

---
Starting code changes
```

---

## Stage 9: Submission Complete

**Jira writeback comment template** (stage 10 step 2.3, rendered with `jira-status-writeback`'s field map):
```
**AI Auto-Fix Report**

- **Fix Branch**: fix/jira-fix-{JIRA-ID}
- **Commit**: {commit_hash}
- **PR/MR URL**: {pr_mr_url}
- **Root Cause**: {root_cause_summary}
- **Fix Solution**: {solution_summary}
- **Files Changed**: {file_list}
- **Analysis Report**: reports/{JIRA-ID}-analysis.md

Code has been merged to the main branch; please proceed with QA verification.
```

Manual mode additionally includes a "Verification Scenarios" section:
```
### Verification Scenarios

1. [scenario name]
   Steps: [specific steps, 1-3 steps]
   Expected: [user-observable result]
2. ...
```

**Completion output [🤖 Auto]**:
```
## Stage 9 Complete: Code Auto-Committed and Pushed

**Fix Branch**: fix/jira-fix-[JIRA-ID]
**Commit**: [commit hash]
**Push Status**: ✅ Success
**PR/MR URL**: [URL]
**Analysis Report**: reports/[JIRA-ID]-analysis.md
- [Mode Status] Auto mode has completed this round and reverted to manual mode. Stage 10 merge still requires your confirmation.
```

**Completion output [🤖 Auto] multi-project**:
```
## Stage 9 Complete: Code Auto-Committed and Pushed (Multi-Project)

| Project | Commit | Push Status | Changes |
|------|--------|---------|------|
| backend | a1b2c3d | ✅ Success | +45/-12 (3 files) |
| frontend | e4f5g6h | ✅ Success | +23/-8 (2 files) |

**Analysis Report**: reports/[JIRA-ID]-analysis.md
```

---

## Pre-Merge Checklist

See the strong dependency `merge-discipline`'s [reference.md](../merge-discipline/reference.md) § Pre-Merge Checklist (single source, Part A-D — do not duplicate its body here).

---

## Industry-Wide Issue Evaluation Report

> Stage 3 delegates to `known-issue-research` via `analysis-core`. **Shared report template**: `known-issue-research/reference.md` — do not paste it here.
>
> **jira-fix divergence (gate):** when the conclusion is 🚫 "industry-recognized hard problem, no viable fix", this evaluation is a **gate** — stop the flow, write a Jira comment with the evaluation summary, and do **not** proceed to solution exploration (do not use a "continue anyway" path).

---

## Stage 8: Verification Result

```
[Verification Result]
- Jira repro-steps verification: (✅ / ❌ per item)
- Comparison against the stage 6 plan: completed … / not completed …
- Test conclusion: (attach results if run; list manual checkpoints if no automation)
- Side effects: Node / Linter / TS / functional side effects
- Logical completeness: …
- Verification verdict: ✅ Pass / ❌ Below threshold (include the return path)
```

## Stage 5: Solution Comparison

| Solution | Description | Pros | Cons | Complexity | Recommendation |
|------|------|------|------|--------|--------|
| Solution 1 | … | … | … | Low/Medium/High | ⭐… |
