# Proposal: runtime-evidence-debug as the default debug entry

## Why

In real usage, even when a PDCA host (solve-workflow) is active, the agent fails to think of escalating to `runtime-evidence-debug` in complex or uncertain debugging scenarios. Verified root causes:

1. **Two lazy-load hops** — the instrumentation gate lives in `analysis-core` §3, which the agent may never actually load; the gate text never enters context.
2. **No output slot** — the referencing workflows' stage-2 output templates are empty (e.g. `solve-workflow/reference.md` §Stage 2 has only a pointer, no mandatory fields), so skipping the gate is invisible.
3. **Self-assessment triggers + soft escape hatch** — §3 fires on self-assessed "fuzzy confidence" (models reliably overestimate), and the red-loop escape ("state clearly why a loop cannot be established") is satisfiable by user-pasted logs without the agent running anything or proposing instrumentation.

User positioning (validated in discussion): `runtime-evidence-debug` is the most general debug skill — the methodology umbrella — and SHOULD be the **default entry of the debug skill family**, composing with (not demoting) scenario skills: `browser-debug-toolkit` (tool selection), `hybrid-debug` (layer localization), real-device channel enablers like `android-webview-debug`.

## What Changes

- **analysis-core §3 (instrumentation debug) rewritten**: whenever runtime observation is needed after static analysis stalls, `runtime-evidence-debug` is the default entry (state-based trigger: "needs any runtime observation", not self-assessed confidence). Scenario skills compose on demand: browser-reproducible → `browser-debug-toolkit`; hybrid app → `hybrid-debug` for layer localization first; real-device → channel enablers (e.g. `android-webview-debug`).
- **analysis-core §2 step 5 (red-capable loop gate) escape hatch tightened**: a user-reported symptom is not an agent-observed red; when the loop is not agent-runnable, the escape MUST land as a handoff (instrumentation/repro steps handed to the user per `runtime-evidence-debug`'s human-AI division), never as silent pass.
- **New analysis-stage gate output block, SoT in analysis-core**: a mandatory closing block for every referencing workflow's analysis-stage output — red loop status, debug entry status (`runtime-evidence-debug` loaded + trigger reason / not needed + one-line evidence), scenario supplements, temporary-change rollback. Filling it is the entry condition for `{next-stage}`.
- **Referencing workflows' reference.md get thin pointers** to the gate block (solve-workflow, opsx-solve-workflow, jira-fix-workflow, opsx-jira-fix-workflow) — no methodology duplication (thin-reference model).
- **runtime-evidence-debug description gains state-based Chinese triggers** — 「修了还是不行」「日志正常但行为不对」「偶现」 etc. plus default-entry positioning; single line, ≤1024 chars (铁律 7).
- **Guardrail preserved**: default entry within the debug skill family ≠ skipping static analysis; `runtime-evidence-debug` Phase 1 (escalation decision, static-first) remains authoritative.

## Capabilities

### New Capabilities

- `runtime-evidence-debug`: default-entry role in the debug skill family; delegation boundaries (tool selection → `browser-debug-toolkit`, domain localization → `hybrid-debug`, channel enablers compose underneath); state-based trigger contract for its description.

### Modified Capabilities

- `analysis-core`: §3 delegation model changes from "parallel skill list + self-assessed triggers" to "default entry + scenario composition"; §5 red-loop escape hatch tightened to agent-observed red or explicit user handoff; new requirement owning the analysis-stage gate output block as SoT.

## Impact

- `skills/analysis-core/SKILL.md` — §2 step 5, §3 rewrite, new gate output block (§5 or as §2.5; SoT)
- `skills/runtime-evidence-debug/SKILL.md` — description only (triggers + positioning)
- `skills/solve-workflow/reference.md`, `skills/opsx-solve-workflow/reference.md`, `skills/jira-fix-workflow/reference.md`, `skills/opsx-jira-fix-workflow/reference.md` — thin pointer in stage-2 template sections
- `docs/generated/skills-index.md` — regenerated (pre-commit hook)
- Gates: `lint:skill-description` (铁律 7), `lint:skill-deidentification --staged` (铁律 2), skills-index CI parity
- No runtime code, hooks, or platform configs affected — Markdown-only change
