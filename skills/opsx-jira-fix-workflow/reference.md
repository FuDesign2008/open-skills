# OPSX Jira Fix Workflow — Output Format Reference

Output templates for each stage of the `opsx-jira-fix-workflow` skill, for the AI to follow when formatting output.

Stage-2 analysis methodology lives in `analysis-core`; difficulty/path/design landing spot are still owned by SKILL.md orchestration.

---

## Stage 3 Artifact Field Checklist

`proposal.md` must include:

- Why: Jira link, problem summary, user impact, why fix it now
- What Changes: the behavior change, not implementation detail
- Capabilities: new or modified capabilities
- Impact: code, API, platform, risk

`design.md` full field set (SKILL.md's minimum completeness bar requires only 5 of these — see the main body):

- Jira Context: Jira title, key description, repro path, expected and actual results
- Problem Analysis: existence check, root cause, impact scope, difficulty grading
- Goals / Non-Goals: fix goals and explicitly excluded scope
- Options: candidate solutions, trade-offs, recommended solution
- Risk: side effects, rollback strategy, QA follow-up items
- Migration Plan: (required when a database/API/config change is involved) migration steps and rollback
- Verification Notes: verification scenarios, test commands, manual-verification items

Common delta-spec format mistakes (cause `openspec validate` to fail):

- `### REQ-001:` → wrong format, the heading must be `### Requirement: <description>`
- `### Requirement: Initialize` → missing SHALL/MUST, the description must contain SHALL or MUST
- No `#### Scenario:` block → every requirement needs at least one scenario

---

## Stage 7 Verification Results

```text
【Verification Results】
- OpenSpec validation: executed (openspec validate <name>, output: ...) / failed (reason: ...)
- Engineering verification: executed (command: ..., result: ...) / pending (manual action needed: ...)
- Behavior cross-check: executed (per-item comparison: ...) / pending (manual verification items: ...)
- Jira cross-check: executed (...) / pending (...)
- Side-effect check: ...
- Ready to submit the PR: yes / no
```

---

## Stage 8.1 Commit Message

```text
fix(<scope>): <JIRA-ID> <subject>
```

Example: `fix(ai-summary): YNOTR-12167 fix AI summary button display in shared links`

---

## Stage 8.1 PR/MR Description

PR/MR description must include:

- Jira link
- Root cause
- Fix approach
- OpenSpec change path
- Changed-file list
- Verification evidence
- Risk & rollback

---

## Stage 8.4 Jira Comment (after the merge completes)

The Jira comment must include:

- Fix branch / PR URL / commit
- Root-cause summary
- Fix approach
- OpenSpec change path
- Verification scenarios
- Risk or QA follow-up items

---

## Pre-merge checklist

See the strong dependency `merge-discipline`'s [reference.md](../merge-discipline/reference.md)「合并前检查清单」(single source, Parts A-D — do not copy its body into this file).
