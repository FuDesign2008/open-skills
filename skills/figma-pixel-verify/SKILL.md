---
name: figma-pixel-verify
version: "1.5.0"
user-invocable: true
description: "Measure whether a running UI matches a Figma living artifact (inventory + spec + Verify section). Use when checking pixel alignment / 对照 Figma 验收 after implement, including light/dark or hover/variant states (switch theme and state, measure each row separately). Writes actual/verdict into that file; spec-gap returns to implement. Critical unmeasured rows fail overall. Bounded loop; honest residuals if no JS-eval channel. On macOS, when the ego-browser skill/install path exists, install that quality channel before measuring. Triggers — 「检查像素对齐」「对照 Figma 验收」「设计保真检查」「是否对齐稿面」「figma 保真检查」「暗黑模式验收」「多主题保真检查」 / verify Figma fidelity, pixel check, dark mode fidelity check, multi-theme verify. Do NOT use as the primary implement workflow (use figma-pixel-implement) or for code→Figma."
---

# Figma Pixel Verify

Measure a **running** UI against a Figma **living artifact** (Inventory + Spec) and write pass/fail evidence into its **Verify** section (or a Spec source sibling). Optionally suggest bounded code fixes; do not pretend measurement succeeded without a real measurement channel. Do not overwrite Figma `expected`. Do not edit `figma-pixel-implement` skill prose.

## When to use

- After `figma-pixel-implement` (or any Figma implement pass that left a durable inventory + spec **path**)
- User asks to check pixel alignment / design fidelity / 对照稿面验收
- Standalone: user provides Figma URL + running preview URL/route; persist a minimal inventory + spec to the same path convention **before** measuring

## Inputs

1. **Living artifact** — File path from implement. Same columns as implement reference (`state`, `mode`, `basis`). After an implement run this session, do **not** silently rebuild a missing table and claim that handoff complete—FAIL and return to `figma-pixel-implement`.
2. **Runnable UI** — Local/dev URL, Storybook, or in-editor preview the Agent can observe.
3. **Optional: Figma screenshot** for side-by-side vision (supporting evidence, not a substitute for numeric checks when JS-eval is available). When the model can inspect images, capture running-UI vs Figma screenshots for gross and composition mismatches.

## Workflow (ordered)

1. **Preflight** — Confirm preview is reachable. Resolve `Spec source` (living-artifact path). The Inventory plus Spec **is** the list of rows to measure. If this run already implemented from Figma and the file is missing or critical rows are absent: Overall **FAIL**, return to `figma-pixel-implement` to complete the table—do not invent rows and claim handoff complete. If this is **standalone** (no implement this run): persist a minimal inventory + spec using implement’s path convention, then measure. Note theme scope (`mode`) and visual `state`s. When multiple themes are in scope, identify how the running UI switches themes (`data-theme`, toggle, system preference) before measuring. **Browser channel (quality gate):** On macOS, if the `ego-browser` skill (or its install script) is available, verify **MUST** make the `ego-browser` CLI ready **before measuring**: load that skill’s install reference when `command -v ego-browser` fails, wait for the user to finish GUI onboarding when required, then load the skill and use it for open preview, real pointer/state switch, screenshot, and JS evaluate. Do **not** skip to a weaker channel while that install is possible. Do **not** copy that product’s TaskSpace/CLI API into this skill. If the OS is not macOS, the skill/install path is absent, or install is blocked, continue with another JS-eval channel the Agent already has and record which channel was used. Missing `ego-browser` on a host that cannot install it does **not** abort verify.
2. **Vision** — When the model can inspect images, capture UI vs Figma screenshot; note gross mismatches (wrong component, missing block, theme drift, fragment-cut / stacking look). Vision is supporting evidence. When JS-eval exists, vision-only comparison does **not** produce Overall PASS.
3. **Numeric measurement** — For each critical visual row, switch the running UI into that row’s `state` and `mode` (prefer a real pointer hover/click/theme control through the browser channel, then read **computed style** and/or **bounding box**). Map selectors carefully; prefer stable test ids when present. Default-state readings do not satisfy a hover (or other state) row. Per-mode rows under different themes are separate verdicts. Skip numeric PASS claims for `out-of-scope: behavior` lines — list them as behavior, not pixel PASS.
4. **Compare** — Apply tolerances in [reference.md](reference.md). Assign a **verdict** per row. Unmeasured critical visual rows (JS-eval was available but the row was skipped) are blocking, not a path to Overall PASS via residuals.
5. **Bounded fix loop** — On actionable **code** DRIFT, fix the running UI → re-measure → update actual/verdict columns. Cap at about **3** meaningful iterations, then stop with remaining residuals listed. Do **not** change Spec `expected`. Do **not** patch `figma-pixel-implement` skill files.
6. **Report** — Write the Verify section of the living artifact (or the sibling report named in Spec source). Template: [reference.md](reference.md). Include coverage (measured vs inventory). For multi-theme scope, report per theme. That Verify section **is** the measured report hosts require. Overall is **PASS** only when every critical visual row in scope is PASS or `accepted-residual`. Overall is **not PASS** if any critical row is unmeasured, `MISSING-style`, unaccepted `DRIFT`, `HARDCODED` when the spec required a token, the spec itself is incomplete, or the running UI shows an **invented solid fill** against Spec transparent/`none`, a **fragment-cut** graphic against a single Assets export, a **generic wrapper** that does not match instance geometry, a **self-invented text-color alias** when Spec recorded a Figma variable, or a visible graphic still on a **remote design URL**.

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
| Open/preview UI | Quality channel after the macOS install gate; otherwise another JS-eval / preview channel the Agent already has |
| Switch visual state | Real pointer hover/click/theme control, then read styles |
| Read computed styles / boxes | JS evaluate in page, DevTools-like APIs, test harnesses |
| Screenshots | Browser or Figma screenshot tools (vision inspects them when the model can see images) |
| Apply fixes | Native edit tools, then re-measure |

After a successful quality-channel install, use that channel for measurement. When install is impossible, another JS-eval path is valid. Do not copy a third-party browser API into this skill.

If **no** JS-eval / computed-style channel exists: run vision-only comparison, label numeric rows **MISSING-style** or residual, and **do not** claim pixel PASS.

## Relationship

| Skill | Boundary |
|-------|----------|
| `figma-pixel-implement` | Produces code + durable Inventory/Spec; does not own final verdict |
| Agent-native Figma→code guidance / MCP fetch | Not a substitute for measurement |
| Host PDCA workflows | Strong-depend at install; invoke when Figma UI is in scope; missing Verify section (or Spec source sibling) fails that verification stage; spec-gap FAIL re-enters implement |
| `ego-browser` (external, macOS) | Quality measurement channel: install when the skill/install path exists; not a frontmatter dependency; degrade when not installable |

## Pitfalls

- Declaring PASS from screenshots alone when measurement was possible.
- Infinite tweak loops without re-measure.
- Treating ±1 CSS px geometry noise on high-DPR as failure without noting DPR.
- Silent skip of mask/currentColor issues — if implement violated asset rules, call that out as root cause of color DRIFT.
- Marking per-mode rows PASS after measuring only the default theme — each theme in scope is measured under its own theme.
- Marking hover rows PASS from default-state styles.
- Overall PASS while critical rows sit only in residuals as “not measured yet”.
- Treating a frozen 18px vs 16px as PASS instead of `accepted-residual`.
- Keeping the report only in chat when a living-artifact path exists.
- Overwriting Spec `expected` with measured actuals.
- After this-run implement: silently rebuilding a missing spec and claiming the handoff was complete.
- Marking PASS for an invented solid fill, stacked leaf-path icon, generic 16/24 shell, invented text-color alias, or remote design URL.
- Skipping the quality-channel install on macOS when the skill/install path exists, then measuring only through a weaker MCP.
- Copying a third-party browser TaskSpace/CLI API into this skill.
- Aborting verify because `ego-browser` is unavailable on a host that cannot install it.
- Declaring Overall PASS from vision/screenshots alone when JS-eval was available.
