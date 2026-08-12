---
name: figma-pixel-verify
version: "1.0.0"
user-invocable: true
description: "Measure whether a running UI matches a Figma design-spec table (computed styles / box metrics + optional screenshots). Use when checking pixel alignment / 对照 Figma 验收 after implement. Bounded loop; honest residuals if no JS-eval channel. Triggers — 「检查像素对齐」「对照 Figma 验收」「设计保真检查」「是否对齐稿面」「figma 保真检查」 / verify Figma fidelity, pixel check. Do NOT use as the primary implement workflow (use figma-pixel-implement) or for code→Figma."
---

# Figma Pixel Verify

Measure a **running** UI against a Figma **design-spec table** and report pass/fail with evidence. Optionally suggest bounded fixes; do not pretend measurement succeeded without a real measurement channel.

## When to use

- After `figma-pixel-implement` (or any Figma implement pass that left a spec table)
- User asks to check pixel alignment / design fidelity / 对照稿面验收
- Standalone: user provides Figma URL + running preview URL/route; extract or rebuild a minimal spec table first

## Inputs

1. **Design-spec table** — From implement artifacts, or rebuild via Figma metadata/variables (same columns as implement reference).
2. **Runnable UI** — Local/dev URL, Storybook, or in-editor preview the Agent can observe.
3. **Optional:** Figma screenshot for side-by-side vision (supporting evidence, not a substitute for numeric checks when JS-eval is available).

## Workflow (ordered)

1. **Preflight** — Confirm preview is reachable; list which rows will be measured. If no spec table exists, extract a minimal one from Figma before claiming verify.
2. **Vision (optional)** — Capture UI vs Figma screenshot; note gross mismatches (wrong component, missing block, theme drift).
3. **Numeric measurement** — For each critical row, read **computed style** and/or **bounding box** from the live DOM (or equivalent runtime). Map selectors carefully; prefer stable test ids when present.
4. **Compare** — Apply tolerances in [reference.md](reference.md). Assign a **verdict** per row.
5. **Bounded fix loop** — On actionable DRIFT, fix code → re-measure. Cap at about **3** meaningful iterations, then stop with remaining residuals listed.
6. **Report** — Use the template in [reference.md](reference.md). Overall status is not PASS if any critical HARDCODED/DRIFT/MISSING-style remains unless the user explicitly accepts residuals.

## Verdict taxonomy

| Verdict | Meaning |
|---------|---------|
| **PASS** | Within tolerance of expected |
| **DRIFT** | Measurable but outside tolerance |
| **HARDCODED** | Value matches by luck or literal, not via project token/variable when the spec required a token — flag when token mapping was part of the contract |
| **VARIANT** | Matches a different documented variant (e.g. hover/dark) than the requested one |
| **MISSING-style** | Property not measurable (no node, no style, or channel unavailable) |

## Tool intent (platform-agnostic)

| Intent | Agent may use |
|--------|----------------|
| Open/preview UI | Browser MCP, simple browser, device preview |
| Read computed styles / boxes | JS evaluate in page, DevTools-like APIs, test harnesses |
| Screenshots | Browser or Figma screenshot tools |
| Apply fixes | Native edit tools, then re-measure |

If **no** JS-eval / computed-style channel exists: run vision-only comparison, label numeric rows **MISSING-style** or residual, and **do not** claim pixel PASS.

## Relationship

| Skill | Boundary |
|-------|----------|
| `figma-pixel-implement` | Produces code + spec table; does not own final verdict |
| Agent-native Figma→code guidance / MCP fetch | Not a substitute for measurement |
| Host PDCA workflows | Optional invoke — not a default strong dependency |

## Pitfalls

- Declaring PASS from screenshots alone when measurement was possible.
- Infinite tweak loops without re-measure.
- Treating ±1 CSS px geometry noise on high-DPR as failure without noting DPR.
- Silent skip of mask/currentColor issues — if implement violated asset rules, call that out as root cause of color DRIFT.
