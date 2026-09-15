---
name: figma-pixel-verify
version: "1.2.0"
user-invocable: true
description: "Measure whether a running UI matches a Figma inventory + design-spec table (computed styles / box metrics + optional screenshots). Use when checking pixel alignment / 对照 Figma 验收 after implement, including light/dark or hover/variant states (switch theme and state, measure each row separately). Critical unmeasured rows fail overall. Bounded loop; honest residuals if no JS-eval channel. Triggers — 「检查像素对齐」「对照 Figma 验收」「设计保真检查」「是否对齐稿面」「figma 保真检查」「暗黑模式验收」「多主题保真检查」 / verify Figma fidelity, pixel check, dark mode fidelity check, multi-theme verify. Do NOT use as the primary implement workflow (use figma-pixel-implement) or for code→Figma."
---

# Figma Pixel Verify

Measure a **running** UI against a Figma **inventory + design-spec table** and report pass/fail with evidence. Optionally suggest bounded fixes; do not pretend measurement succeeded without a real measurement channel.

## When to use

- After `figma-pixel-implement` (or any Figma implement pass that left an inventory and spec table)
- User asks to check pixel alignment / design fidelity / 对照稿面验收
- Standalone: user provides Figma URL + running preview URL/route; extract or rebuild a minimal inventory + spec table first

## Inputs

1. **Inventory + design-spec table** — From implement artifacts, or rebuild via Figma metadata/variables (same columns as implement reference, including `state`, `mode`, `basis`).
2. **Runnable UI** — Local/dev URL, Storybook, or in-editor preview the Agent can observe.
3. **Optional:** Figma screenshot for side-by-side vision (supporting evidence, not a substitute for numeric checks when JS-eval is available).

## Workflow (ordered)

1. **Preflight** — Confirm preview is reachable. The inventory plus spec table **is** the list of rows to measure. If no spec table exists, extract a minimal one from Figma before claiming verify. Note theme scope (`mode`) and visual `state`s. When multiple themes are in scope, identify how the running UI switches themes (`data-theme`, toggle, system preference) before measuring.
2. **Vision (optional)** — Capture UI vs Figma screenshot; note gross mismatches (wrong component, missing block, theme drift).
3. **Numeric measurement** — For each critical visual row, switch the running UI into that row’s `state` and `mode`, then read **computed style** and/or **bounding box** (or equivalent runtime). Map selectors carefully; prefer stable test ids when present. Default-state readings do not satisfy a hover (or other state) row. Per-mode rows under different themes are separate verdicts. Skip numeric PASS claims for `out-of-scope: behavior` lines — list them as behavior, not pixel PASS.
4. **Compare** — Apply tolerances in [reference.md](reference.md). Assign a **verdict** per row. Unmeasured critical visual rows (JS-eval was available but the row was skipped) are blocking, not a path to Overall PASS via residuals.
5. **Bounded fix loop** — On actionable DRIFT, fix code → re-measure. Cap at about **3** meaningful iterations, then stop with remaining residuals listed.
6. **Report** — Use the template in [reference.md](reference.md). Include coverage (measured vs inventory). For multi-theme scope, report per theme. Overall is **PASS** only when every critical visual row in scope is PASS or `accepted-residual`. Overall is **not PASS** if any critical row is unmeasured, `MISSING-style`, unaccepted `DRIFT`, or `HARDCODED` when the spec required a token.

## Verdict taxonomy

| Verdict | Meaning |
|---------|---------|
| **PASS** | Within tolerance of expected, measured in the correct `state` / `mode` |
| **DRIFT** | Measurable but outside tolerance |
| **HARDCODED** | Value matches by luck or literal, not via project token/variable when the spec required a token — flag when token mapping was part of the contract |
| **VARIANT** | Matches a different documented variant (e.g. hover/dark) than the requested one |
| **MISSING-style** | Property not measurable (no node, no style, or channel unavailable) |
| **accepted-residual** | Explicit frozen deviation (owner + reason). Not PASS against the Figma expected |

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
| `figma-pixel-implement` | Produces code + inventory + spec table; does not own final verdict |
| Agent-native Figma→code guidance / MCP fetch | Not a substitute for measurement |
| Host PDCA workflows | Strong-depend at install; invoke when Figma UI is in scope; missing report fails that verification stage |

## Pitfalls

- Declaring PASS from screenshots alone when measurement was possible.
- Infinite tweak loops without re-measure.
- Treating ±1 CSS px geometry noise on high-DPR as failure without noting DPR.
- Silent skip of mask/currentColor issues — if implement violated asset rules, call that out as root cause of color DRIFT.
- Marking per-mode rows PASS after measuring only the default theme — each theme in scope is measured under its own theme.
- Marking hover rows PASS from default-state styles.
- Overall PASS while critical rows sit only in residuals as “not measured yet”.
- Treating a frozen 18px vs 16px as PASS instead of `accepted-residual`.
