---
name: merge-discipline
version: "1.0.0"
user-invocable: true
description: "合并纪律横切 skill：合并动作（glab/gh mr/pr merge）执行前必须加载，覆盖两部分——①覆盖率门控（test-coverage-analyzer 触发判定 + 判定矩阵 + 留痕）②tip 钉死（钉死 revision --sha + Pipeline succeeded 语义 + 合入后祖先校验 + 双策略降级），防 archive/修复提交未随 MR 合入目标分支的 push→merge 竞态与门控漏跑。触发词：「合并 tip」「merge tip」「合并纪律」「push 后合并」「archive 合入」「合并前门控」 / merge discipline, coverage gate, post-push merge check, merge integrity. 被 opsx-jira-fix-workflow / opsx-solve-workflow / jira-fix-workflow 三工作流 frontmatter dependencies 强依赖。"
---

# Merge Discipline

> Internal shared skill — the single source of truth for merge-time discipline. Two parts: **coverage gate** (was triplicated across three workflow reference.md) + **tip pinning** (prevents the stale-tip merge race). Referencing workflows declare this in frontmatter `dependencies` and abort at startup if missing.

## When this applies

Any merge into a protected branch (`glab mr merge` / `gh pr merge` / `git merge <target>`) — whether from a workflow's branch-closeout decision, a direct user merge command, or AI preparing the merge call. "Keep branch" / "continue development" do not trigger.

---

## Part A — Coverage gate

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
   | ✅ Report generated + coverage meets threshold | Continue to Part B (tip pinning) | Prompt pass, wait for user re-confirm |
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

## Part B — Tip pinning (after gate passes, before merge)

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

Gate auto-running test-coverage-analyzer does not trigger "auto reverts to manual" (it's a sub-step of the merge flow). Gate pause (below-threshold / crash / implicit miss) = merge flow interrupted, reverts to manual per existing rules.

---

## Integration guide (for referencing workflows)

- **Keep in your own body:** your stage ordering line (e.g. `archive → branch-closeout → coverage-gate → tip-discipline → merge → writeback`), a one-line pointer to this skill, and 1-2 key red-flags. Do **not** copy the gate steps or tip steps inline.
- **Delegate to this skill:** both Part A (coverage gate) and Part B (tip pinning) — the full rules above.
- **Quick-check table in your reference.md:** keep a compact checklist (gate 5 items + tip 3 items, each pointing to this skill's Part/step). It reminds; this skill defines.
