---
name: figma-pixel-implement
version: "1.1.0"
user-invocable: true
description: "Implement Figma UI with export-faithful assets and a design-spec table for later measured verify. Use when implementing from Figma URLs/nodes or user asks pixel-level restore / 按稿实现, including explicit light/dark or multi-theme scope (theme detection, per-mode spec values, per-theme assets). Prerequisite: a working Figma design-context channel (MCP or equivalent)—not a Cursor-only skill name. Does NOT claim pixel alignment complete—hand off to figma-pixel-verify. Triggers — 「像素级还原」「按稿实现」「Figma 对齐实现」「还原 Figma」「figma 保真实现」「暗黑模式还原」「多主题保真实现」 / implement from Figma, pixel restore, dark mode implement, multi-theme fidelity. Do NOT use for code→Figma canvas writes, no-design creative UI, or post-impl alignment checking alone (use figma-pixel-verify)."
---

# Figma Pixel Implement

Implement UI from a Figma node into the target codebase with **export-faithful assets** and a **design-spec table** that `figma-pixel-verify` can measure against.

**Completion boundary:** this skill ends at “implemented + measurable contract.” It does **not** assert pixel alignment. Run `figma-pixel-verify` for pass/fail with evidence.

This skill is **platform-agnostic** (Claude Code / Cursor / OpenCode / others). It requires a **Figma design-context capability**, not a particular Agent’s skill id.

## Prerequisites

1. **Figma design-context available (hard gate)** — Confirm the Agent can fetch structured design payload for a node (design context, metadata, screenshot, asset export as the environment provides). If that channel is missing or auth fails, **stop**: tell the user how to enable Figma MCP / plugin / equivalent for *their* Agent. Do **not** invent a single hard-coded install path as the only option. Do **not** invent UI from the URL alone.
2. **Optional: platform Figma→code guidance** — If this Agent already ships an official Figma design→code skill or guide (names vary by product; one Cursor plugin example is `figma-design-to-code`), load it when present and follow its URL parsing / Code Connect / adaptation rules. **Missing that named skill is not a blocker**—continue with Figma MCP (or equivalent) + this skill’s fidelity rules. Do not require a Cursor-only skill id on Claude Code, OpenCode, or other Agents.
3. **Figma URL or node** — Prefer a `figma.com` design/make URL or explicit `fileKey` + `nodeId`. If missing, ask once with clarifying-question discipline.

## Workflow (ordered)

1. **Parse target** — Extract `fileKey` / `nodeId` (convert `node-id=1-2` → `1:2`). Note frame name for the spec table.
2. **Fetch design context** — Call the environment’s design-context tool after step Prerequisites. Treat output as a **reference to adapt**, not paste-ready final code.
3. **Large frames** — If the payload is truncated or the frame is clearly multi-section: fetch **metadata/structure** first, then implement **child nodes** one at a time (or in clear sections). Prefer variables/tokens over guessed literals.
4. **Detect theme structure** — Before the spec table, establish how the design expresses themes: variable collections with multiple modes (e.g. `light`/`dark`), or separate per-theme frames/variants. For explicit multi-theme requests, record the theme inventory (mode names or per-theme frame nodeIds); single-theme requests stay on the requested frame/variant.
5. **Build the design-spec table** — Before or while coding, write a measurable table (session note or artifact). Minimum columns: `node` / role, `property`, `expected` (Figma exact), `unit`, `token` / class in repo, `source` (variable, MCP field, metadata, or Code Connect component). Screenshots are visual reference only—not the sole source of numbers. For multi-theme scope, add a `mode` column (or one row per mode) for theme-varying properties: resolve per-mode values from the design itself (variable `valuesByMode` when the channel exposes it, otherwise re-fetch with the file/frame mode switched or via the per-theme frame); shared values stay single-row. Template: [reference.md](reference.md).
6. **Map to project** — Reuse existing components, tokens, and layout primitives. Prefer design-system variables over hard-coded values when the project already has them; flag unbound one-offs; when hard-coding is required for fidelity, record the expected value in the spec table.
7. **Assets (hard rules)** — See [reference.md](reference.md) whitelist/blacklist. Export real image/SVG bytes into the project (or an approved dynamic source). Use `<img>` / framework image / export-preserving SVG. **Do not** use hand-authored path placeholders, CSS `mask` / `mask-image` + fill/`currentColor` recolor, or invent mask theming when only a light export exists (prefer a second export or record pending). For multi-theme scope, export design-provided assets per theme (from each mode or per-theme frame)—one theme's export plus an invented recolor stays forbidden.
8. **Theme** — Default to **design-faithful** colors and surfaces for the requested frame/variant. Do not silently restyle to an ambient dark/light theme unless the user or design variant requires it. When multi-theme scope is explicit, map theme-varying variables onto the project's theming mechanism (CSS custom properties / design tokens / `data-theme` or `prefers-color-scheme` switching) instead of duplicating hard-coded per-theme literals.
9. **Hand off** — State that implementation is ready for measurement; point to the spec table (including its theme scope); recommend `figma-pixel-verify` (or run it if the user asked for both).

## Tool intent (platform-agnostic)

Describe goals; let the Agent pick native tools:

| Intent | Examples of how Agents may satisfy it |
|--------|----------------------------------------|
| Structured design payload | Figma MCP design-context / metadata tools |
| Visual reference | Screenshot or canvas capture tools |
| Asset download | MCP asset download or export APIs |
| Code edits | Native edit/write tools |

Do not require a named MCP server id or CLI as the only path.

## Relationship to other skills

| Capability | Boundary |
|------------|----------|
| Agent-native Figma→code guidance (optional, name varies) | When present, load for MCP hygiene; never a hard dependency on one product’s skill id |
| Figma MCP / design-context tools | Hard gate for structured fetch |
| `figma-pixel-verify` | Owns measured pass/fail after this skill |
| `design-approval-gate` | Host workflow pre-impl approval — orthogonal |

## Pitfalls

- Treating a Cursor-only skill name as required on every Agent.
- Treating MCP code as final without project adaptation.
- Claiming “pixel perfect” without `figma-pixel-verify`.
- Using CSS mask recolor for icons that Figma exported as flat assets.
- Skipping the spec table so verify has nothing measurable.
- Under explicit multi-theme scope: implementing only the requested theme and hand-rolling the other themes' values or assets instead of resolving them from the design.
