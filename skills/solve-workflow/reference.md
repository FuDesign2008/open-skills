# Solve Workflow — Output Format Reference

This file holds the per-stage output-format templates for the `solve-workflow` skill, for the AI to follow when formatting output.

---

## Stage 1 — Clarify the Problem

```
【Problem restatement】I understand the problem as: ...
(describe only the user's intent and symptoms — no root-cause judgment or fix suggestion; technical conclusions belong to stage 2)
【Key elements】Goal: ... / Constraints: ... / Background: ... / Expected outcome: ...
【Scope breakdown】(if applicable) modules, dependencies, order, first sub-problem: ...
【Points to confirm】(if any, one question at a time)
[question] A [...] B [...]
Please confirm whether my understanding is correct.
```

---

## Stage 2 — Research Output Template

Analysis methodology lives in `analysis-core` (temporary-change gate / analysis steps / instrumentation debug). The "industry-wide issue evaluation report" and "upstream dependency fix evaluation" templates are in `known-issue-research/reference.md` — not duplicated here.

The stage output MUST close with the **analysis gate output block** (SoT: `analysis-core` §5 — red loop / debug entry / scenario supplements / temporary changes; missing block blocks stage 3). Do not restate the block's fields here.

---

## Prerequisite Skill Check — Missing Notice

When a skill declared in frontmatter `dependencies` is missing, print the following and abort immediately:

```
⚠️ solve-workflow is missing a strong dependency and cannot run in full

【Missing skill(s)】
- [skill-name]: [what it is for]

【Why it's needed】
solve-workflow strongly depends on the following skills via frontmatter dependencies (missing = abort):
- `staged-review-flow`: stage 4 review orchestration (full `solution-review` + conditional `code-design-review`)
- `solution-review` / `code-design-review`: review frameworks invoked by the orchestration skill
- `analysis-core`: single source of truth for stage 2's methodology (temporary-change gate / instrumentation debug with runtime-evidence-debug as default entry / analysis step skeleton / analysis gate output block / debug-verify loop)
- `hybrid-debug` / `runtime-evidence-debug` / `browser-debug-toolkit`: debug skills delegated to via `analysis-core` (stage 2 + stage 7)
- `learn-and-improve`: stage 8 retrospective and knowledge sediment
- `workflow-mode-lifecycle`: core manual/auto mode lifecycle rules
- `clarifying-question-discipline`: hard clarifying-question discipline and investigation-first principle
- `known-issue-research`: stage 2 research routing / known-issue quick search / industry-wide evaluation
- `test-suite-ensure`: stage 6 test completion (`mode=advisory`)
- `test-first-discipline`: stage 6 failing-test-first for behavior changes (distinct from test-suite-ensure)
- `design-approval-gate`: before stage 6 — no production impl without approval (named auto/hotfix escapes)
- `delivery-discipline`: stage 8 optional commit + open/update PR/MR (not every run delivers)
- `feature-branch-closeout`: stage 8 post-verify branch menu (merge delegates to merge-discipline when used)
- `decision-fog-discipline`: before explore solutions — graduate fog / decision tickets first
- `git-worktree-discipline`: before stage 6 — worktree gate + optional isolated workspace
- `domain-language-discipline`: clarify/analyze — project glossary / CONTEXT.md when domain terms matter
- `completion-evidence-discipline`: verification honesty — fresh current-turn evidence before pass claims
- `node-version-discipline`: Node-version alignment before running tests in stage 7
- `figma-pixel-implement` / `figma-pixel-verify`: Figma export-faithful implement + measured verify (required installed; invoke when Figma UI work is in scope)

Without them, stage gates lose their single sources of truth — running anyway would produce unreviewed solutions with unclear root causes, defeating the point of a PDCA workflow.

【Install】
- Install **each** missing skill by name (preferred):
  npx skills add FuDesign2008/open-skills -g --skill <name> --yes
  (repeat once per missing name)
- Or install every open-skills skill:
  npx skills add FuDesign2008/open-skills -g --skill '*' --yes

Re-trigger this workflow after installing.
```

---

## Stage 4 — Review Report

The review report body and pass/fail verdict follow the strong dependency `staged-review-flow` (full `solution-review` / conditional `code-design-review`, binary verdict, auto-mode ≤3 rounds, design summary). This file no longer maintains a "five-dimension / four-dimension" scoring table.

**[🤖 Auto]** Each round must include: review round (N of max 3), the structured conclusion from `solution-review` (and `code-design-review` for code-affecting solutions), issue list, ✅/❌. On fail, output the optimization notes and re-review.

**[👤 Manual]** After the shared review report, append this workflow's shell (pause for the user's verdict):

```
Please confirm the review verdict:
- Say「通过」「确认」「OK」/ "pass" / "confirm" → enter stage 5
- Say「修改方案」「完善方案」「优化方案」/ "revise solution" → optimize per guidance and re-review
- Say「重选方案」/ "reselect solution" → return to stage 3
```

---

## Stage 5 — Make a Plan

```
【Chosen solution】Adopt solution X: ...
【File change list】
1. File: xxx/yyy/zzz.js, location: function abc(), change: ...
2. File: xxx/yyy/aaa.js, location: class DEF.methodXYZ(), change: ...
【Change order】1. xxx/yyy/zzz.js (dependency) → 2. xxx/yyy/aaa.js (caller)
【Expected impact】Scope: ... / Risk points: ...
```

---

## Stage 7 — Verification Results

```
【Check results】
- Stage 1 expected outcome achievement: ...
- Vs stage 5 plan: done ... / not done ..., reason ...
- Verification points / test conclusions: ... (if tests ran, attach results; if not, attach the manual-test reminder)
- Side-effect check: did the change introduce new issues in other modules (functional), or unexpected performance/security/maintainability impact (non-functional)
- Logic and end-to-end flow review: ...
```

---

## Stage 8 — Improvement Suggestions

```
【Improvement suggestions】
- Practices worth solidifying: ...
- Content not recommended to solidify: ...
- Recommended sediment carrier: AGENTS.md / CLAUDE.md / .cursor/rules/ / in-repo skill / summary doc / none for now; rationale: ...
- Recommendation: start another round / close out. If closing: leftovers and follow-ups: ...
- User confirm before write: needed / not needed; if needed, wait for an explicit user request before entering「制定计划 → 执行计划」/ "make plan → execute"
- [Mode] Auto mode finished this round and reverted to manual. To auto-run the next round, explicitly say「自动 xxx」/ "auto xxx".
```

---

## Stage 8 — Pre-Merge Coverage Reminder (Non-Gating)

> ⚠️ solve-workflow **does not own protected-branch merge** as a mandatory stage step — merge only happens if closeout selects merge (via `merge-discipline`). Optional commit/PR is owned by `delivery-discipline`. This reminder is **advisory, not a mandatory gate** — it does not run a script, does not block the flow, and is not a capability-discovery table entry.

**Trigger conditions** (all must hold):
1. Environment discovery finds the `test-coverage-analyzer` skill available
2. Stage 6's executed change touches code (not purely config/style/docs)

**Behavior**: append one non-blocking reminder line to the improvement suggestions:

```
💡 If this change will merge via MR/PR, run test-coverage-analyzer before merge
   (with --base <target branch>, so a already-pushed source tip is not misread as 0 diff).
   Advisory only: solve-workflow does not merge; the mandatory gate belongs to workflows
   that own a merge step (e.g. jira-fix-workflow / opsx-*), run immediately before merge.
```

**Does not trigger when**:
- `test-coverage-analyzer` is not found → skip silently, no reminder
- The change is purely config/style/docs → no reminder
- The user has already stated they won't go through an MR/PR → no reminder

> **Boundary with mandatory gates**: solve-workflow only suggests "run this before merging" — it never runs the script or judges pass/fail. The mandatory gate (script run + decision matrix + audit trail) belongs to skills that own a merge step, executed right before their merge step.
