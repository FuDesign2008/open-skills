---
name: write-workflow
version: "1.1.0"
user-invocable: true
description: "Eight-stage document-writing host: clarify intent → analyze sources → explore approach → review approach → outline → execute writer → verify → retrospect. Manual mode pauses at stage exits; auto mode advances but never skips the writer §1 approval gate. Triggers — 「写文档」「写文档工作流」「写技术评审」「生成评审文档」「自动写文档」「自动模式」「write workflow」「write-workflow」. Do NOT use for code bugs/features (solve-workflow), performance (perf-workflow), or marketing articles (article-writer)."
dependencies:
  - clarifying-question-discipline
  - tech-review-doc
  - workflow-mode-lifecycle
---

# Write Workflow

> Eight-stage **document-writing** host (solve-like skeleton, writing semantics). Writer skills own document methodology; this host owns routing, source analysis, mode lifecycle, path depth, and verify/retrospect.
>
> **Default writer:** `tech-review-doc` (design → product/QA technical review).
>
> **Not** `solve-workflow` (code PDCA), **not** `analysis-core` (debug/root-cause). Stage 2 is writing-oriented source analysis only.
>
> **Output templates:** [reference.md](reference.md).

## Prerequisite skill check

At startup, verify every frontmatter `dependencies` entry. If any is missing, abort:

```
npx skills add FuDesign2008/open-skills -g --skill <missing-name> --yes
```

Or: `npx skills add FuDesign2008/open-skills -g --skill '*' --yes`.

**No silent degradation.** Especially: do **not** run without `workflow-mode-lifecycle`.

**Must not depend on:** `analysis-core`, `runtime-evidence-debug`, `hybrid-debug`, `browser-debug-toolkit`.

## Triggers and modes

| Phrasing | Mode | Note |
|----------|------|------|
| 「写文档」「写文档工作流」「write workflow」 | 👤 Manual | Default; pause at host stage exits |
| 「写技术评审」「生成评审文档」 | 👤 Manual | Route to `tech-review-doc` |
| 「自动写文档」「自动模式」+ write intent | 🤖 Auto | Advance host stages; **§1 approval still pauses** |

**Mode detection:** trigger contains 「自动」 → auto; else manual. Mid-run: 「切换自动模式」/「切换手动模式」.

Core lifecycle (revert to manual / explicit re-entry only / no sticky auto) → load `workflow-mode-lifecycle`. **write-workflow differences:**

- **Completion** = stage 8 retrospect finishes → revert to manual.
- **Hard pause even in auto:** writer §1 (or equivalent) user approval; missing required source path.
- After §1 approval in auto: continue Steps 2–5 of the writer, then host stages 7–8, without further host confirmation.
- Interruption (abort, user stop) → revert to manual.

## Path selection

Declare the path when confirming intent (stage 1):

| Path | When | Writing depth |
|------|------|----------------|
| Full | New major feature review; fuzzy goals; many modules | Full diagrams as needed; rich §4; careful Non-Goals |
| Incremental | Ordinary design → review with clear goals | Needed diagrams only; moderate §4 |
| Lean | Small high-certainty change; single surface | Minimal diagrams; aggressive skip of §3/§6; **verify + §1 gate never skipped** |

Upgrade path if scope grows (lean → incremental → full). Manual upgrade needs user confirmation.

## ⚡ Quick Reference

| Stage | Tool permissions | 👤 Manual stop | 🤖 Auto | Required output |
|-------|------------------|----------------|---------|-----------------|
| 1 Clarify intent | Read only if user `@` path / pasted excerpt | ⛔ Confirm intent/path/path-selection | Skip if input already clear | Restatement + route + Path |
| 2 Analyze sources | ✅ Read/Grep sources; ❌ write review file | ⛔ Confirm gap list / readiness | Continue if no blocking gaps | Source inventory + gaps |
| 3 Explore approach | ✅ Read; ❌ write review file | ⛔ Pick diagram/§3/§6 choices | Auto-pick per Path + design | Approach options |
| 4 Review approach | ✅ Read; ❌ write review file | ⛔ User OK on checklist | Auto-pass if checklist clean | Approach checklist |
| 5 Make outline | ✅ Read; ❌ write review file | ⛔ Confirm outline / enter §1 draft | Go to writer Step 1 | Outline → §1 draft handoff |
| 6 Execute (writer) | Per writer | Writer §1 gate always | Same §1 gate; then continuous | Review file via writer |
| 7 Verify | ✅ Read output; ❌ Edit unless user asks fix | ⛔ Confirm verify | Continue to 8 if green | Verify report |
| 8 Retrospect | ❌ Edit skill files by default | End | End + revert manual | Brief improvements |

## Stage 1: Clarify intent

1. Restate what document to produce and the source design path.
2. Choose route (default `tech-review-doc`) and Path (Full/Incremental/Lean).
3. Follow `clarifying-question-discipline` (one question per turn) when unclear.
4. **[👤]** Stop for confirmation. **[🤖]** If path + doc type + design path are already clear, continue to stage 2.

Output format: [reference.md](reference.md) § Stage 1.

## Stage 2: Analyze sources (writing analysis)

> Inspired by “understand before changing” — **not** `analysis-core`. No instrumentation, no root-cause debug loop.

1. **Existence:** design doc readable; note related PRD/OpenSpec if present.
2. **Inventory:** title, modules/surfaces, multi-option comparison?, existing Mermaid, review type.
3. **Gaps:** missing business goals, undefined terms, unclear Non-Goals — list for stage 5 / writer §1.
4. Do **not** write the review file.

**[👤]** Stop after the inventory/gap report. **[🤖]** Continue unless a blocking gap (e.g. no design path).

Output: [reference.md](reference.md) § Stage 2.

## Stage 3: Explore writing approach

Propose how to write (not how to implement the product):

- Which Mermaid types are needed
- Whether §3 comparison / §6 release sections apply
- Detail level for §4 given Path

**[👤]** Wait for choice if options differ. **[🤖]** Select per Path + design evidence.

## Stage 4: Review writing approach

Run a **lightweight checklist** (audience language, no code in §§1–3, conditional sections). Do **not** load full `solution-review` / `code-design-review` unless the user asks.

**[👤]** Wait for OK. **[🤖]** Continue if no blocking checklist fails.

## Stage 5: Make outline

Produce a short outline: §1 topics to confirm, planned figures, sections to skip. Hand off into writer Step 1 (§1 draft dialogue).

**[👤]** Confirm outline. **[🤖]** Enter writer Step 1 immediately.

## Stage 6: Execute via writer

Load the routed writer (`tech-review-doc` by default) and **follow it exactly**, including its HARD-GATE on §1.

- Do not weaken §1 approval in auto mode.
- After §1 approval: in 🤖 auto, allow continuous Steps 2–5 + file write; in 👤 manual, follow the writer’s own pauses.

## Stage 7: Verify

Check against writer success criteria and host expectations: file path/naming, §1 confirmed, diagrams, §3/§6 skip rules, §§1–3 no code except Mermaid.

Output: [reference.md](reference.md) § Stage 7.

**[👤]** Stop for confirmation. **[🤖]** Continue to stage 8 if green; if red, stop for user.

## Stage 8: Retrospect

Brief improvements (host routing, Path choice, gap handling). Do not write skill/rule files unless the user asks. Optional: ask whether to open a follow-up for another writer (e.g. humanizer).

Then revert auto → manual per `workflow-mode-lifecycle`.

## Extension slot (future writers)

1. Add `skills/<name>/`.
2. Add a route-table row; update description triggers (≤1024).
3. Keep stage 6 as “load writer and follow exactly.”
4. Only add frontmatter strong dependencies when required for the default path.

## Relationship to other skills

| Skill | Relationship |
|-------|--------------|
| `tech-review-doc` | Strong dependency; default stage-6 writer |
| `clarifying-question-discipline` | Strong dependency |
| `workflow-mode-lifecycle` | Strong dependency; mode rules |
| `analysis-core` | **Not** a dependency — writing analysis is host stage 2 only |
| `solve-workflow` | Sibling host — not wired |

## Red flags

- Skipping writer §1 approval in auto mode
- Declaring `analysis-core` or debug skills on this host
- Inlining the full tech-review five-step body into this file
- Treating Path as code-PDCA scope instead of writing depth
