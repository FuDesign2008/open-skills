---
name: merge-discipline
version: "1.1.0"
user-invocable: true
description: "合并纪律：合并动作（glab/gh mr/pr merge）前必须加载——rebase/冲突预检（Part A，最先）+ 覆盖率门控（Part B，test-coverage-analyzer）+ tip 钉死（Part C，--sha 钉死 + 祖先校验），防盲目合入已移动的目标分支 + push→merge 竞态致 archive/修复未入目标分支。触发词：「合并 tip」「merge tip」「合并纪律」「push 后合并」「archive 合入」「合并前门控」「rebase 检查」「冲突预检」「合并前 rebase」 / merge discipline, rebase pre-check, coverage gate, post-push merge check. 被 opsx-jira-fix-workflow / opsx-solve-workflow / jira-fix-workflow frontmatter dependencies 强依赖。"
---

# Merge Discipline

> Internal shared skill — the single source of truth for merge-time discipline. Three parts, run in order **A → B → C**: **rebase/conflict pre-check** (Part A — surfaces a moved target before merge) + **coverage gate** (Part B — was triplicated across three workflow reference.md) + **tip pinning** (Part C — prevents the stale-tip merge race). Referencing workflows declare this in frontmatter `dependencies` and abort at startup if missing.

## When this applies

Any merge into a protected branch (`glab mr merge` / `gh pr merge` / `git merge <target>`) — whether from a workflow's branch-closeout decision, a direct user merge command, or AI preparing the merge call. "Keep branch" / "continue development" do not trigger.

**Execution order when merging: Part A (rebase pre-check) → Part B (coverage gate) → Part C (tip pinning) → merge.** Part A runs first because a rebase changes the source tip, forcing B/C to re-run on the new tip.

---

## Part A — Rebase / conflict pre-check

Prevents the **blind-merge-into-a-moving-target** failure: by the time the user says "merge", the target (`release/*`, `main`, …) has usually moved — teammates landed their own work. Merging without checking either fails at the platform (`mergeable=false`) or silently lands behind the tip. This Part makes the AI surface that and offer to rebase, instead of the user having to remember to ask.

### Detect

```bash
git fetch origin <target-branch>
BEHIND=$(git rev-list --count HEAD..origin/<target-branch>)
BASE=$(git merge-base HEAD origin/<target-branch>)
CONFLICTS=$(git merge-tree "$BASE" HEAD origin/<target-branch> | grep -c "^changed in both")
```

`<target-branch>` = the MR/PR base (query it via your platform's CLI) or the merge target the user named.

### Decision matrix

| State | Action |
|---|---|
| `BEHIND=0` and `CONFLICTS=0` | Clean — proceed to Part B |
| `BEHIND>0` and `CONFLICTS=0` | Report "target N commits ahead; rebase applies cleanly" → wait for user confirm |
| `CONFLICTS>0` | Report "target N ahead, ~M files conflict" → wait for user confirm |

No auto-rebase without confirmation — rebase rewrites the source branch and triggers a full CI rerun; the user owns that decision.

### On confirm — execute rebase (source branch only)

The source is the user's personal fix branch (`fix/jira-fix-…`), which team policy allows to force-push. The protected target is never rewritten by this Part.

```bash
git rebase origin/<target-branch>
# On conflict: delegate to git-conflict-resolve skill (mode=rebase — per-commit resolution)
git push --force-with-lease origin <source-branch>
```

If `git-conflict-resolve` is unavailable or the user aborts, stop — leave the worktree mid-rebase (`git rebase --abort` to bail) for human resolution.

### Scope boundary — this Part does NOT wait for CI

After `--force-with-lease` push, this Part **ends**: it reports "rebased, PR updated, CI rerunning" and returns control to the workflow. CI-gating and the actual merge stay with the workflow's normal closeout (Part B → Part C → merge) — the user comes back after CI is green, same as any post-review merge. This Part is a rebase repair tool, not a merge-through-CI orchestrator.

### Loop bound

Each merge attempt triggers at most one rebase. If the target moves again while waiting for CI, the next merge attempt re-enters this Part and re-detects — bounded, not infinite.

### Red flags

- Merging without this Part because "CI is already green" (the green is on the old tip; target moved).
- Rebasing, then claiming merge done before Part C's ancestor check passes on the new tip.

---

## Part B — Coverage gate

### Pre-detection

If the environment has `test-coverage-analyzer` skill, run the gate steps below. If not found, output "gate unavailable: test-coverage-analyzer not detected", write an environment-gap留痕, and let the user decide whether to proceed.

### Gate steps (independent Bash permission — runs the analyzer script)

1. **Construct `--base`** (try in order, stop on first hit):
   - MR/PR: `gh pr view --json baseRefName -q .baseRefName` / `glab mr view <iid> -F json | jq .target_branch` → `--base <target>` (bare branch name; the script's `validate_ref` adds `origin/`)
   - On failure / detached HEAD / no remote → omit `--base`, rely on the script's 5-level fallback; warn "no explicit base, MR may misjudge as 0-diff"
   - Multi-repo MR → run gate per-repo, each with its own `--base`; any repo failing → overall pause

2. **Call the script** (read test-coverage-analyzer SKILL.md first to confirm param contract):
   `python3 "<SKILL_DIR>/scripts/analyze_coverage.py" "<project-root>" [--base <target>]`

3. **Decision matrix**:

   | Result | 🤖 Auto | 👤 Manual |
   |---|---|---|
   | ✅ Report generated + coverage meets threshold | Continue to Part C (tip pinning) | Prompt pass, wait for user re-confirm |
   | ⚠️ Coverage below threshold | Pause, output report, await user (force/add-tests/abort) | same |
   | 💥 Crash / no report / exit 1 | Treat as gate-fail, pause | same |
   | 📭 No test code / 0% pass | Present report, pause for user judgment | same |
   | 🕳️ Gate not run but merge happened (implicit miss) | Pause merge, rerun gate; if already merged, write miss留痕 | same |

### 留痕 templates

Location: PR description and `design.md` Verification Notes.

| Case | Template |
|------|----------|
| User explicit skip | `【覆盖率门控跳过】用户显式跳过，未运行 test-coverage-analyzer。时间：<ISO>。决策人：用户。` |
| Env gap (skill not found) | `【覆盖率门控跳过】未检测到 test-coverage-analyzer skill，门控不可用。时间：<ISO>。决策人：系统（环境缺漏）。` |
| Implicit miss | `【覆盖率门控漏跑】合并已发生但门控未运行。时间：<ISO>。漏跑阶段：<合并前/合并后>。` |

---

## Part C — Tip pinning (after gate passes, before merge)

Prevents the **stale-tip merge race**: archive/fix commits pushed seconds before merge fail to enter the target because the merge fast-forwards to the pre-push tip (whose pipeline was already green), while the freshly-pushed commits stay on the source branch. (Postmortem: `docs/mr-merge-stale-tip-archive-miss-incident.md`.)

1. **Pin the merge revision.**
   ```bash
   MERGE_SHA=$(git rev-parse origin/<source-branch>)   # or the SHA returned by push
   ```
   Merge with `glab mr merge <id> --sha "$MERGE_SHA" -y` (GitLab) or `gh pr merge <id> --sha "$MERGE_SHA"` (GitHub). The `--sha` makes the platform reject a tip mismatch. A bare merge with no `--sha` is forbidden.
   If the platform CLI has no `--sha`: wait for that tip's pipeline to pass before merging, and treat step 3 as the mandatory backstop.

2. **Do not trust an instant `Pipeline succeeded`.**
   If a new commit was pushed just before merge, an immediately-appearing `Pipeline succeeded` is almost certainly the **old** tip's result. Verify the result's sha equals the just-pushed tip, or rely on step 1's `--sha`.

3. **Ancestor check after merge (mandatory).**
   ```bash
   git fetch origin <target>
   git merge-base --is-ancestor "$MERGE_SHA" origin/<target> && echo OK || echo MISSING
   ```
   MISSING → freshly-pushed commits (archive / specs sync / fixes) did not enter the target. Do **not** claim completion, do **not** proceed to Jira writeback. Open a backfill MR (cherry-pick) or pause for the user.

4. **Dual strategy & fallback.**
   - **Strategy A (default):** MR is open and main fix is mergeable → merge archive + main fix in the same MR with tip pinned (run steps 1-3).
   - **Strategy B (fallback):** MR already merged or tip-race risk is high → open a separate docs MR for archive. List explicitly "archive pending !N"; never pretend archive is already on the target.

---

## Mode lifecycle

Gate auto-running test-coverage-analyzer does not trigger "auto reverts to manual" (it's a sub-step of the merge flow). Gate pause (below-threshold / crash / implicit miss) = merge flow interrupted, reverts to manual per existing rules. Part A rebase execution follows the same rule: a user-confirmed rebase is a sub-step of the merge flow (does not itself revert to manual); an unresolved conflict or aborted rebase interrupts the merge flow and reverts to manual.

---

## Integration guide (for referencing workflows)

- **Keep in your own body:** your stage ordering line (e.g. `archive → branch-closeout → rebase-precheck → coverage-gate → tip-discipline → merge → writeback`), a one-line pointer to this skill, and 1-2 key red-flags. Do **not** copy the Part steps inline.
- **Delegate to this skill:** all three Parts — A (rebase pre-check), B (coverage gate), C (tip pinning); the full rules above.
- **Quick-check table in your reference.md:** keep a compact checklist (rebase 3 items + gate 5 items + tip 3 items, each pointing to this skill's Part/step). It reminds; this skill defines.
