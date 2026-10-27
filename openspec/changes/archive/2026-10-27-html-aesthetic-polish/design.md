## Context

The designed reading views used one presentation for all metadata and a flat type scale. Long values became oversized pills, seven KPI tiles wrapped with one orphan, the navigation did not show the active page, and the title of a task card showed its Markdown backticks. The HTML remains self-contained, script-free, and theme-aware.

## Goals / Non-Goals

**Goals:**

- A calmer editorial hierarchy: one type scale, consistent rhythm, quieter surfaces.
- Metadata that scales with value length.
- Orientation: the current page is visible in the navigation.
- Correct title rendering.

**Non-Goals:**

- A visual redesign away from the editorial template.
- Client-side scripts, external fonts, or new dependencies.
- Per-page style overrides.

## Decisions

- Keep the card surface but soften it: `--line-soft` internal rules, a subtle shadow, more padding, section headers with a bottom rule.
- Header metadata splits by value length: values of 70 characters or more render as `.meta-row` (label column plus value) with dashed separators; shorter values stay as chips.
- The KPI grid drops its minimum tile width so seven statuses fit in one row at the reading width; narrow screens keep the compact grid instead of one tile per row.
- `renderNav` marks the item whose resolved path equals the page being rendered with `aria-current="page"`, and counts that page as available even before the file exists.
- The document `<h1>` renders through `renderInline`, so code spans and emphasis work; the `<title>` element stays plain text.
- Entry link cards gain a top-right arrow, a monospace path anchored to the card bottom, and a hover lift that respects reduced motion.
- Pure CSS changes; the existing tests already lock the structural contract.

## Risks / Trade-offs

- [A metadata value near the length threshold flips between chip and row] → The threshold is a single constant and both presentations carry the same information.
- [The current-page marker is stale after renaming a view] → The nav is regenerated with every view; the manifest is the single source.
- [The section header rule adds visual noise] → The rule uses the soft line token and stays inside the card.

## Migration Plan

Regenerate existing views. Rollback is reverting the renderer and the skill sentences.

## Open Questions

None.
