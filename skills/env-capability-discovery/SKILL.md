---
name: env-capability-discovery
version: "1.0.0"
user-invocable: false
description: "Cross-platform environment capability discovery for workflow skills: scan once at startup for available enhancement skills/agents (debugging, web research, planning, TDD, build-fix, verification, branch management, etc.), match by keywords, and invoke them as progressive enhancements without changing stage gates or tool constraints. Weak reference by default — workflows normally reference it without declaring it in dependencies; workflows that do declare it (e.g. solve-workflow) get availability guaranteed by their prerequisite check. Load it when a workflow references it; when unavailable and not declared, skip silently."
---

# Environment Capability Discovery

> Internal shared skill. A workflow runs on heterogeneous platforms (Claude Code, OpenCode, Cursor, …) with different installed skills/agents. This skill defines **how to discover and invoke optional enhancements** instead of relying only on the workflow's own built-in flow.
>
> **Reference semantics**: weak reference by default — referencing workflows normally do NOT list this skill in frontmatter `dependencies`; when it is unavailable, they skip discovery silently and run their original flow — no error, no abort. A workflow MAY explicitly declare it as a strong dependency (as `solve-workflow` does); that workflow's prerequisite check then guarantees availability, and a missing skill aborts the workflow at startup.

## When to scan

Once, at workflow startup (before the first working stage). Record the result for the rest of the session (the referencing workflow defines where — conversation context or a state file); never rescan.

## How to scan

Use the current platform's skill-discovery capability to list available skills/agents/plugins:

- Check the available-items listing in the system prompt, or use the platform's skill-listing tool.
- **Graceful degradation**: if no discovery method exists, skip enhancement discovery and run the original flow.

## Capability types and matching keywords

Match against each candidate's `name` and `description`:

| Capability | Keywords |
|-----------|----------|
| 🔍 Debugging analysis | debug, root-cause, investigate, systematic-debugging, 分析问题 |
| 🌐 Web research | research, web, look up, investigate, web-research, effective-web-research |
| 💡 Solution design | brainstorm, design, architect, 探索方案 |
| 📋 Code review | code-review, review, requesting-review |
| 📝 Planning | plan, writing-plan, 制定计划 |
| ⚡ Execution orchestration | execute, executing-plan, subagent, parallel |
| 🧪 Test-driven | test, tdd, test-driven |
| 🔧 Build repair | build-fix, build, linter, type-check |
| ✅ Completion verification | verify, verification, complete |
| 🌿 Branch management | worktree, branch, git-worktree |

This table contains **no stage numbers**: each referencing workflow keeps its own small capability→stage mapping table (stage numbering differs per workflow) alongside its reference note.

## Handling scan results

- **Matched**: record it; load and invoke at the workflow's mapped points.
- **No match**: skip silently; run the original flow. Never error, never block.
- **Multiple matches of one type**: prefer the one with the more specific description.

## Invocation principles

1. **Progressive enhancement, never a replacement**: enhancements assist; they do not change stage order or gate logic.
2. **Read-only stages stay read-only**: an enhancement never grants Edit/Write to a stage that forbids it.
3. **Enhancement failure never blocks**: on error, log a warning and continue the original flow.
4. **Read the skill's current doc before invoking**: never invoke from memory — rules may have changed.
5. **frontmatter `dependencies` are out of scope**: strong dependencies are guaranteed by the workflow's prerequisite check; do not rediscover them here.
