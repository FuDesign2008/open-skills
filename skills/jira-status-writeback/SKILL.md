---
name: jira-status-writeback
version: "1.4.2"
user-invocable: false
description: "Post-merge Jira writeback SOP: transition only to「已修复」, then an independent Wiki-markup comment posted in the body field with read-back markup-fidelity verification and a direct-REST fallback. Triggers — 「Jira 状态回写」「回写已修复」「合并后写 Jira」「jira writeback」「jira status writeback」. Do NOT use for reading issues, creating issues, or pre-merge comments. Loaded by Jira fix hosts after merge via frontmatter dependencies."
dependencies:
  - jira-status-lifecycle
  - jira-wiki-markup
  - jira-read
---

# Jira Status Writeback

> Internal shared skill. Single source of truth for **post-merge** Jira status update + repair comment. Hosts declare it in `dependencies`, abort if missing, and pass a field map; they MUST NOT restate the two-step API or status boundary inline. The SOP does not resolve PAT files; session or MCP auth follows the `jira-read` credential contract. The bundled REST fallback resolves credentials through that same contract and expects both skills under one skills root.
>
> **Prerequisite check**: `jira-status-lifecycle`, `jira-wiki-markup`, and `jira-read` must all be available; if any is missing, abort and print the standard install hint (`npx skills add FuDesign2008/open-skills -g --skill '*' --yes`).

## When to run

Only after the PR/MR has **successfully merged** into the target branch. Never at PR-create time.

## SOP

1. **Transition (no comment on the transition call)**  
   - Call `jira_get_transitions` (or equivalent) first and record whether a transition to the `fixed` status exists.  
   - Load `jira-status-lifecycle` and run `decidePostMerge` with the session user, assignee, status class, and that boolean.  
   - When the decision's `transition` is true, select the developer-owned status equivalent to「已修复」and call `jira_transition_issue` **without** a `comment` parameter. Pass boolean `true` to `applyTransitionResult` only when that call succeeded. Pass `false` for every other result. Do not pass the raw API result.  
   - Do **not** transition to close / verified / QA-owned statuses.  
   - When the decision's `notify` is true, tell the operator the status was left unchanged because the issue is not assigned to the session user.  
   - When the outcome is `incomplete-identity`, `incomplete-not-assignee`, or `incomplete-transition`, keep the merge and leave the lifecycle incomplete. Do not describe the bug as「已修复」.

2. **Comment (independent call, verify markup fidelity)**
   - Post this step when the lifecycle decision's `comment` is true, including after `incomplete-identity` and `incomplete-transition`. Skip it for `incomplete-not-assignee`.
   - Load `jira-wiki-markup` and compose `body` from the host field map using that skill's canonical repair-comment skeleton (Wiki markup).
   - If any line of that repair `body` starts with `h1.` or `h2.`, rewrite those titles as numbered `# *name*` items so the comment stays at `h3.`/`h4.` plus lists.
   - Post via your available comment tooling with the text in the `body` field. Never rely on `jira_transition_issue`'s `comment` parameter for the repair record (it may be silently dropped).
   - **Verify fidelity before declaring done**: read back the stored `body` from the tool response (or a follow-up read) and compare it against the composed text — line-start headings (`h3.`/`h4.`), `*bold*`, `{{mono}}`, and `[label|url]` must all survive verbatim. A 2xx response alone is NOT success: an intermediate layer may escape markup (store `*bold*` as `\*bold\*`) or rewrite headings (`h3. X` into `### X`) and still return 2xx.
   - On any fidelity failure, rewrite the comment with the bundled REST fallback `scripts/update-comment-wiki.mjs` (comment bodies only; credential chain identical to `jira-read`; pass no comment id to create, pass the comment id to update; it re-verifies fidelity on its own), then report from its PASS output.

3. **Failure handling**  
   - When the outcome is `incomplete-transition`, the lifecycle stays incomplete and the repair comment still posts. The merge stays. `status-satisfied` applies only when `decidePostMerge` returns it for an issue already `fixed` and assigned to the session user. `incomplete-not-assignee` stays incomplete and does not post the repair comment, including when the status is already `fixed`.  
   - A comment API failure after a successful transition warns and records for the host report. The merge stays, and the status obligation already met stays met.  
   - A missing prerequisite at load aborts writeback. The merge stays, and the host leaves the lifecycle incomplete.

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
