---
name: session-cleanup
version: "1.0.0"
user-invocable: true
description: "End a finished conversation by inventorying temp files and background services this session created, keeping unique uncommitted work, stopping those services, and deleting disposable temps. Use for 「清理临时文件」「关闭后台服务」「会话收尾」「结束前清理」「会话清理」 / session cleanup, clean temp files, stop background services, including when the agent is about to finish and those resources are still around. Do NOT use for merge (merge-discipline), the branch closeout menu or worktree removal (feature-branch-closeout), or a retrospective (learn-and-improve)."
---

# Session Cleanup

Run this skill before saying a conversation is finished when this session created temp files or started background services, and whenever the user asks to clean those up. Finish the report before the closing message.

Resolve `<integration>` once and reuse it. Take the remote default branch (`git symbolic-ref --short refs/remotes/origin/HEAD`, drop the remote prefix). If that ref is missing, use the branch the current checkout tracks. Comparisons below use that name.

## Inventory

List what this session actually did, in four groups:

1. Paths this session created.
2. Background processes and services this session started, with the process id and any port that process bound.
3. Uncommitted and untracked paths in the workspace.
4. Paths and processes whose origin is unclear.

Classify each item as unique uncommitted content, a session-started background service, a disposable temp file, or pre-existing user state. Unclear origin is unique uncommitted content.

Show the classified list before stopping anything or deleting anything.

## Preserve

For each uncommitted path, compare it with the integration branch:

- `git diff <integration> -- <path>`
- `git show <integration>:<path>`

The working-tree file, and any copy already loaded in the conversation, are not that comparison. A section that appears in the conversation and in the working tree, and is absent from the integration ref, is unique uncommitted content.

An empty diff loses nothing if that path is restored, and restoring it needs no discard confirmation. A non-empty diff stays until the user explicitly confirms discard. Before any discard, copy the unique content to a directory outside the delete set and put that directory in the report. The later delete pass does not enter it.

A file the user asked to keep is a deliverable. It stays in the workspace.

## Stop

After preserve, stop each background process or service this session started for a task that is now finished. Confirm the process id is gone, or the port that process bound is free.

A service the user asked to keep stays running. The report names it and a stop method.

A process that was already running before this session stays running.

Confirm the target by its process id, or by the port that process bound. Search text that also appears on the check command line identifies the checker. That hit is not the target.

## Delete

After every stop is confirmed, delete temp files and directories this session created that are not the deliverable. A one-shot download used as a working input goes away once the task no longer needs it. Pre-existing user files stay. Unique uncommitted content stays.

The preserve copy sits outside the delete set.

## Report

```
Preserved: <paths, or none>
Stopped: <process id or port, or none>
Deleted: <paths, or none>
Left in place: <what> — <why> — <how to remove>
Hand off: <owning skill> — <what is still open>
```

Claim a clean resource closeout only when no session-started service and no disposable temp file remain. A kept service is a "Left in place" line, not a clean closeout.

Name the owner when that work is still open, and leave the work to that skill:

- An unmerged result goes to `merge-discipline`.
- A branch menu or worktree removal goes to `feature-branch-closeout`.
- A retrospective goes to `learn-and-improve`.
