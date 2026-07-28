---
name: jira-status-writeback
version: "1.0.0"
user-invocable: false
description: "Post-merge Jira writeback SOP: transition only to「已修复」, then independent jira_add_comment with body. Triggers — 「Jira 状态回写」「回写已修复」「合并后写 Jira」「jira writeback」「jira status writeback」. Do NOT use for reading issues, creating issues, or pre-merge comments. Loaded by jira-fix-workflow / opsx-jira-fix-workflow after merge."
---

# Jira Status Writeback

> Internal shared skill. Single source of truth for **post-merge** Jira status update + repair comment. Hosts declare it in `dependencies`, abort if missing, and pass a field map; they MUST NOT restate the two-step API or status boundary inline.

## When to run

Only after the PR/MR has **successfully merged** into the target branch. Never at PR-create time.

## SOP

1. **Transition (no comment on the transition call)**  
   - Call `jira_get_transitions` (or equivalent) and select the developer-owned status equivalent to「已修复」.  
   - Call `jira_transition_issue` **without** a `comment` parameter.  
   - Do **not** transition to close / verified / QA-owned statuses.  
   - If no matching transition: skip transition, emit a warning, continue to comment if possible.

2. **Comment (independent call)**  
   - Call `jira_add_comment(issue_key=..., body=...)`.  
   - The comment text parameter name is **`body`** (not `comment`).  
   - Never rely on `jira_transition_issue`'s `comment` parameter for the repair record (it may be silently dropped).

3. **Failure handling**  
   - Transition or comment API failure → warn and record for the host report; **do not** block or revert an already-completed merge.

## Host field map

Hosts MUST supply concrete values for these semantic fields (omit a field only when truly N/A, and say so):

| Field | Meaning |
|-------|---------|
| Fix branch | Source branch name |
| Commit | Merged tip SHA or primary fix commit |
| PR/MR URL | Merge request URL |
| Root cause | Short root-cause summary |
| Fix summary | What changed |
| Changed files | Key paths |
| Verification | Functional / boundary / regression notes (hosts may require ≥2 each) |
| Extra | Host-specific: analysis report path (`jira-fix-workflow`), OpenSpec change path (`opsx-jira-fix-workflow`), QA risks, etc. |

## Integration

- Declare `jira-status-writeback` in frontmatter `dependencies`.  
- At writeback: load this skill, pass the field map, follow the SOP.  
- Keep in the host: when writeback runs in the stage order (after merge; after archive when required), and the field map only.
