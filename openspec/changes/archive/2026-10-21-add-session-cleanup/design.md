## Context

The repo has no skill that closes a conversation's temp files, background services, and unused browser pages. `feature-branch-closeout`, `merge-discipline`, and `learn-and-improve` already own the branch menu, merge, and retrospective. A 2026-10-21 catalog check found no adoptable external skill for this gap. The chosen solution is a new user-invocable skill, `session-cleanup`. Behavior is fixed in `specs/session-cleanup/spec.md`.

Constraints: English skill body, Chinese triggers, one-line double-quoted description, platform-agnostic intents, no internal identifiers from the source notes.

## Goals / Non-Goals

**Goals:**

- Give an agent a fixed order: inventory, classify, preserve unique uncommitted content, stop session-started services, close unused session pages, delete disposable temps, report leftovers.
- Make "already on the integration branch" a git-ref check.
- Keep a preserve copy outside the delete set.
- Hand unfinished merge, branch closeout, worktree removal, and retrospective work to the owning skill by name.

**Non-Goals:**

- Merging, the branch closeout menu, worktree removal, ticket updates, and retrospectives.
- A deleter script. Classification is a judgment; a script that deletes is the failure this skill exists to prevent.
- Loading the three owning skills as hard dependencies. Naming them is the handoff. Aborting cleanup because one of them is not installed blocks the safe part.

## Decisions

### Skill text, plus a contract test

The procedure lives in `skills/session-cleanup/SKILL.md`. The report field list lives in `skills/session-cleanup/reference.md`. A Node test in `scripts/session-cleanup-contract.test.mjs` locks the name, triggers, order, git-ref check, self-match rule, recorded process id, page closeout, handoffs, and the report fields. `evals/evals.json` holds prompt cases for later trigger checks.

Alternative: a shell scanner that deletes matched paths. Rejected. The dangerous cases are unique uncommitted text and a liveness check that matches itself. Those are not safe regex deletes.

### Fixed action order

Inventory and classify, then preserve, then stop, then close unused session pages, then delete, then report. Delete is last so a preserve copy is not swept up.

Alternative: stop and delete as soon as each item is seen. Rejected. That is how a backup written into the temp area disappears in the same pass.

### Integration ref is resolved, not hardcoded

The skill tells the agent to resolve the repo's integration branch (remote HEAD, else the branch the checkout tracks) and compare with `git diff <integration> -- <path>` or `git show <integration>:<path>`. A working-tree file or a copy already in the conversation is not that check.

Alternative: always `main`. Rejected. Other repos use `master` or a release branch.

### Unclear origin is kept

If the session record does not show that this session created a path, process, or page, classify it as unique content or pre-existing state and leave it, with a leftover line. Only session-created non-deliverable temps are deleted. Only session-started services for a finished task are stopped, unless the user asked to keep one. Only pages this session opened, and that the finished task no longer needs, are closed.

### Process liveness uses the process's own identity

Confirm a stop with the recorded process id. The port that process bound only checks that same process. A different process now bound to the port stays running. The browser that holds the pages stays running; its unused pages are closed in the next step. A hit whose only evidence is search text that also appears in the check command does not count.

### Close session pages without quitting the browser

Close pages this session opened once the finished task no longer needs them, including pages only visited on the way to the result. Pages already open before the session, pages the user opened, pages the user asked to keep, and pages of unclear origin stay open. Closing pages leaves the browser running.

### Handoff follows the owner

A branch that is still unmerged, when the user did not ask to merge, goes to `feature-branch-closeout`, together with the branch menu and worktree removal. A requested merge goes to `merge-discipline`. This skill does not merge, present the menu, or remove a worktree.

### Description is the trigger surface

`user-invocable: true`. The description lists 「清理临时文件」「关闭后台服务」「关闭网页」「清理不用的网页」「会话收尾」「结束前清理」「会话清理」 and the English equivalents, and names the three skills it does not replace. Single-line double quotes, under 1024 characters.

### No frontmatter dependencies

The skill does not declare `dependencies`. It does not inline the other skills' procedures.

## Risks / Trade-offs

- [Agent skips the skill at the end of a chat] → Description states both the explicit phrases and the "about to finish with leftovers" case.
- [Unique notes get discarded] → Non-empty diff blocks discard until the user confirms; preserve copy sits outside the delete set.
- [A shared server is stopped] → Only the recorded process id this session started is stopped. A different process on that port stays up.
- [Closing pages quits the browser] → Closing pages leaves the browser running. Pre-existing pages, user-opened pages, and pages of unclear origin stay open.
- [An unmerged branch is sent straight to merge] → Without a merge request it goes to `feature-branch-closeout`. A requested merge is named as `merge-discipline` and is not performed here.
- [Liveness check matches itself and never exits] → Identity check, not a search string shared with the checker.
- [Source notes leak into the body] → Generic examples only; `npm run lint:deid` on the new files.
- [Another skill's contract is edited by accident] → This change adds a skill and a table row. It does not edit those requirements.

## Migration Plan

Add the skill, its report reference, the contract test, and the generated index row. Rollback is reverting that commit. No data migration.

## Open Questions

None. The review passed and the user switched this run to auto mode.
