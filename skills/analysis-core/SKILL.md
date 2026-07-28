---
name: analysis-core
version: "1.0.0"
user-invocable: false
description: "Shared analysis-stage methodology for PDCA fix workflows: temporary-change permission and rollback gate, instrumentation-debug triggers with debug-skill delegation, analysis step skeleton (existence → research routing → phenomenon/locate/root-cause/upstream-eval/impact), and debug-verify loop. Parameterizes the post-analysis exit as {next-stage}. Referenced via frontmatter dependencies by solve-workflow, opsx-solve-workflow, jira-fix-workflow, opsx-jira-fix-workflow. Triggers — 「分析阶段核心」「分析核心」「临时改动门控」「打点调试门控」「调试验证闭环」「analysis-core」 / analysis stage core, temp-change gate, instrumentation debug gate, debug-verify loop."
dependencies:
  - known-issue-research
  - runtime-evidence-debug
  - browser-debug-toolkit
  - hybrid-debug
  - upstream-dependency-debug
---

# Analysis Core

> Internal shared skill. Single source of truth for **analysis-stage methodology** used by PDCA fix workflows. Workflows keep their own orchestration (exits, manual/auto mode, OpenSpec/Jira artifact sinks, intentional divergences).
>
> **Prerequisite check**: this skill declares strong dependencies in frontmatter. On load, verify each is available; if any is missing, abort and print the install command (`npx skills add FuDesign2008/open-skills -g --skill '*' --yes`). No silent fallback.

## Placeholder contracts

This skill is shared by workflows with different stage numbering. Never hardcode a workflow's stage numbers or titles here.

| Placeholder | Meaning | Who maps it |
|-------------|---------|-------------|
| `{next-stage}` | Stage to enter after analysis exit gate / after instrumentation resolves | Referencing workflow, at the reference line (number + name) |
| `{root-cause step}` / `{impact-assessment step}` / `{upstream-eval step}` | Step numbers inside the analysis stage for `known-issue-research` | Same reference line (existing known-issue-research contract) |

## 1. Temporary-change permission and rollback gate

Analysis is read-only by default. Analysis-assist edits only are allowed; they must be registered and fully rolled back before entering `{next-stage}`. Fix implementation belongs in the workflow's execution stage — not here.

**Allowed (analysis-assist only):**
- Instrumentation, temporary logs, reproduction scripts
- Hypothesis-validation edits (e.g. flip a condition to observe behavior) — restore after validation

**Forbidden:** edits whose purpose is to implement the fix.

**Register (mandatory):** for every temporary edit, record immediately: file + location + original content + purpose (rollback basis).

**Exit gate (must complete before `{next-stage}`):**
1. Restore originals one-by-one from the register (**register is authoritative**; `git diff` only helps confirm register items are clear — the worktree may already have user edits)
2. Output「临时改动清单 + 回滚验证」
3. If anything remains unrolled-back, do not enter `{next-stage}`; keeping an edit requires explicit user confirmation

**Tool limits (analysis stage):** ✅ Read/Grep/SemanticSearch; ✅ WebSearch (research routing / quick search / upstream-eval / `runtime-evidence-debug` escape hatch); ✅ Edit/Write only for analysis-assist edits above; ✅ Bash for read-only verification commands — running the app under debug or reproduction steps still needs user confirmation (see §3).

## 2. Analysis step skeleton

1. **Existence check** (gate — always first)
   - Locate relevant code with Read/Grep/SemanticSearch
   - Act on the verdict:

   | Verdict | Action |
   |---------|--------|
   | ✅ Problem exists | Continue to step 2 → 3–7 |
   | ❌ Problem gone | Report it may already be fixed or logic changed, cite locations, **stop and wait for user** |
   | ⚠️ Description mismatches code | Report the mismatch, **return to the workflow's problem-clarification stage** |

2. **Research routing** — load `known-issue-research` and follow it (triage + known-issue quick search + industry-wide evaluation). The referencing workflow's reference line supplies `{root-cause step}` / `{impact-assessment step}` / `{upstream-eval step}` maps. Report templates: `known-issue-research/reference.md`.

3. **Phenomenon** — reproduction conditions/steps; when the issue is browser-reproducible, prefer `browser-debug-toolkit` to reproduce and observe runtime state (not limited to UI/CSS/DOM; follow that skill's degradation path if browser automation is unavailable).

4. **Locate** — file paths + line numbers, key functions/classes.

5. **Root cause** — data flow and call-chain analysis.

6. **Upstream dependency fix evaluation** (optional) — when root cause is an upstream dependency bug, or step 2 found an upstream fixed version: load `upstream-dependency-debug` and follow it. Outcomes: low-risk upgrade → recommend upgrade in solution exploration; risky → list upgrade alongside workarounds; unfixed → workaround marked temporary.

7. **Impact** — affected modules/features.

If existence fails or description mismatches, do not proceed to solution exploration.

### Analysis-stage red flags

- Research route is 🔵/🟣 but known-issue quick search is skipped; or 🟢 with quick-search triggers hit yet WebSearch is skipped for “read code first”
- Named third-party lib/framework in the root cause without checking upstream Changelog/Release Notes before piling workarounds
- Using “analysis” to ship a fix — temporary edits beyond hypothesis validation, or entering `{next-stage}` without rollback
- Temporary edits not registered, or missing「临时改动清单 + 回滚验证」before `{next-stage}`

## 3. Instrumentation debug (when static analysis stalls)

**Triggers** (any one; prefer before entering `{next-stage}`):
- Root-cause confidence is fuzzy/unknown — module roughly known, concrete logic or path unclear
- Retry/continue — static analysis already tried once and the problem remains

**Load and follow** (prerequisite check already guarantees availability):
- `runtime-evidence-debug` — runtime evidence lifecycle + escape hatch
- `browser-debug-toolkit` — browser DevTools when browser-reproducible; if phenomenon step already did browser repro, continue here only if static analysis still stalls
- `hybrid-debug` — native + WebView/WKWebView/Electron + H5 four-layer chain

Execution details, confidence gating, and escape hatches live in each skill's current SKILL.md — read before invoking.

**Tool limits:** ✅ Read/Grep to choose instrumentation sites; instrumentation and validation edits follow §1 (AI may add instrumentation and must register it); ❌ do not run reproduction steps without user confirmation.

## 4. Debug-verify loop (verification stage)

When the analysis stage used a debug skill to find the root cause, the workflow's verification stage MUST use the **same** skill to verify the fix (not tests alone):

- Browser-reproducible (`browser-debug-toolkit`) → same skill; before/after runtime state (DOM / computed style / box model / console / network); confirm the anomaly is gone
- Runtime evidence (`runtime-evidence-debug`) → re-check original instrumentation sites; before/after evidence; confirm abnormal behavior is gone
- Hybrid (`hybrid-debug`) → verify affected layers (L1–L4); no new cross-layer side effects

## Integration guide (for referencing workflows)

- **Declare** `analysis-core` in frontmatter `dependencies`; abort at workflow startup if missing.
- **Reference line must state** `{next-stage}` (number + name) and the `known-issue-research` step maps.
- **Replace** inlined copies of §§1–4 with a load/reference; keep workflow-only orchestration in the workflow body.
- **Verify stage**: point at §4 instead of pasting the debug-verify bullets again.
- **Do not** sink intentional divergences (coverage-gate strength, ensure-tests blocking, industry-eval Jira gate, etc.) into this skill.
