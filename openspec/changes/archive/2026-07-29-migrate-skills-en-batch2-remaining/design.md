## Context

Batch-1 Englishized six workflow host `SKILL.md` files. Inventory still has Chinese-primary bodies (`perf-workflow`, `frontend-perf`, `git-conflict-resolve`, `git-release-start`) plus leftover Chinese references/templates (`merge-discipline`, `jira-fix-workflow`, `solve-workflow`, `known-issue-research`, partial `code-design-review` / `solution-review`). User chose solution B with auto mode and lightweight in-change evals (2–3 prompts/skill vs Chinese snapshot).

## Goals / Non-Goals

**Goals:**
- English-primary instructional prose for the full confirmed inventory
- Preserve Chinese triggers and contractual slogans
- Lightweight eval summary retained under `skills/_eval-en-batch2-tools/`
- Sync OpenSpec deltas into main specs on archive

**Non-Goals:**
- Translating `article-writer`
- Full skill-creator grader/viewer loop (deferred; keyword/heuristic or thin text eval OK)
- Changing workflow stage semantics beyond language
- Hardcoding platform-specific tools

## Decisions

1. **Translate in place** (not dual-file CN/EN) — matches batch-1 and `skill-authoring-language`.
2. **P0 then P1 order** — heavy Chinese bodies first; leftover references second.
3. **Snapshots before rewrite** — copy current files to `skills/<name>-workspace/skill-snapshot/` (gitignored) at HEAD before edits.
4. **Eval bar** — 2–3 prompts covering trigger/mode + gate/clarify where applicable; compare with_skill vs old_skill; no skill-body “fix” unless clear semantic regression.
5. **Parallel translation by skill** — independent skills translated via parallel agents; shared reference leftovers sequentially to avoid conflict.

### Stage 4 review (auto) — Pass

- **solution-review**: Approach matches agreed B; YAGNI OK; risk of large PR mitigated by inventory checklist + incremental commits if needed.
- **code-design-review**: Markdown-only; no new architecture; Layer A N/A for runtime structure.
- **Spec compliance**: proposal Why/What aligned; deltas cover authoring language + eval harness; tasks will enumerate each skill + eval.

## Risks / Trade-offs

- [Missed Chinese remnant] → Post-translate CJK scan with allowlist for triggers/slogans
- [Semantic drift in long skills] → Prefer faithful translation; spot-check gate phrases
- [Eval keyword false negatives EN/CN] → Document as known; rely on human skim of answers if needed
- [Large PR] → Single change as agreed; group commits by P0/P1/eval

## Migration Plan

1. Snapshot targets → translate P0 → translate P1 leftovers → CJK scan
2. Write `evals.json` + run with/old answers → summary md/json
3. `openspec validate` → archive after user confirm → PR → merge-discipline

Rollback: revert commits on feature branch before merge.

## Open Questions

None blocking — inventory and verification bar confirmed by user.
