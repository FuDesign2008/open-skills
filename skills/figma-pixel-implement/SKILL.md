---
name: figma-pixel-implement
version: "1.0.0"
user-invocable: true
description: "Implement Figma UI with export-faithful assets and a design-spec table for later measured verify. Use when implementing from Figma URLs/nodes or user asks pixel-level restore / 按稿实现. Prerequisites: Figma MCP + official figma-design-to-code (or equivalent). Does NOT claim pixel alignment complete—hand off to figma-pixel-verify. Triggers — 「像素级还原」「按稿实现」「Figma 对齐实现」「还原 Figma」「figma 保真实现」 / implement from Figma, pixel restore. Do NOT use for code→Figma canvas writes, no-design creative UI, or post-impl alignment checking alone (use figma-pixel-verify)."
---

# Figma Pixel Implement

Implement UI from a Figma node into the target codebase with **export-faithful assets** and a **design-spec table** that `figma-pixel-verify` can measure against.

**Completion boundary:** this skill ends at “implemented + measurable contract.” It does **not** assert pixel alignment. Run `figma-pixel-verify` for pass/fail with evidence.

## Prerequisites

1. **Official design-to-code first** — Before any design-context / screenshot MCP call for implementation, load the Agent’s official Figma design-to-code skill (commonly `figma-design-to-code` or an equivalent published under that role). Follow its URL parsing, Code Connect, and project-adaptation rules.
2. **Figma MCP available** — Confirm the Agent can invoke Figma design tools (design context, metadata, screenshot as provided by the environment). If tools are missing or auth fails, **stop**: tell the user how to enable Figma MCP / plugin for their Agent. Do **not** invent a single hard-coded install path as the only option.
3. **Figma URL or node** — Prefer a `figma.com` design/make URL or explicit `fileKey` + `nodeId`. If missing, ask once with clarifying-question discipline.

## Workflow (ordered)

1. **Parse target** — Extract `fileKey` / `nodeId` (convert `node-id=1-2` → `1:2`). Note frame name for the spec table.
2. **Fetch design context** — Call the environment’s design-context tool after step Prerequisites. Treat output as a **reference to adapt**, not paste-ready final code.
3. **Large frames** — If the payload is truncated or the frame is clearly multi-section: fetch **metadata/structure** first, then implement **child nodes** one at a time (or in clear sections). Prefer variables/tokens over guessed literals.
4. **Build the design-spec table** — Before or while coding, write a measurable table (session note or artifact). Minimum columns: `node` / role, `property`, `expected` (Figma exact), `unit`, `token` / class in repo, `source` (variable, MCP field, metadata, or Code Connect component). Screenshots are visual reference only—not the sole source of numbers. Template: [reference.md](reference.md).
5. **Map to project** — Reuse existing components, tokens, and layout primitives. Prefer design-system variables over hard-coded values when the project already has them; flag unbound one-offs; when hard-coding is required for fidelity, record the expected value in the spec table.
6. **Assets (hard rules)** — See [reference.md](reference.md) whitelist/blacklist. Export real image/SVG bytes into the project (or an approved dynamic source). Use `<img>` / framework image / export-preserving SVG. **Do not** use hand-authored path placeholders, CSS `mask` / `mask-image` + fill/`currentColor` recolor, or invent mask theming when only a light export exists (prefer a second export or record pending).
7. **Theme** — Default to **design-faithful** colors and surfaces for the requested frame/variant. Do not silently restyle to an ambient dark/light theme unless the user or design variant requires it.
8. **Hand off** — State that implementation is ready for measurement; point to the spec table; recommend `figma-pixel-verify` (or run it if the user asked for both).

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

| Skill | Boundary |
|-------|----------|
| Official `figma-design-to-code` (or equiv.) | Prerequisite loader for MCP implement hygiene |
| `figma-pixel-verify` | Owns measured pass/fail after this skill |
| `design-approval-gate` | Host workflow pre-impl approval — orthogonal |

## Pitfalls

- Treating MCP code as final without project adaptation.
- Claiming “pixel perfect” without `figma-pixel-verify`.
- Using CSS mask recolor for icons that Figma exported as flat assets.
- Skipping the spec table so verify has nothing measurable.
