## Context

The inline renderer already handles code spans, Markdown links, images, and emphasis. Plain URLs in body text were escaped as text.

## Goals / Non-Goals

**Goals:**

- Link plain `http(s)` URLs in body text.
- Keep code spans and Markdown links unchanged.
- Keep trailing punctuation outside the link.

**Non-Goals:**

- Linkifying URLs inside code blocks.
- Linkifying non-http schemes.
- Rewriting existing Markdown links.

## Decisions

- Add a `renderPlainUrl` detector in `renderInline`, before the plain-character fallback and after the code/link branches.
- The detector matches `http(s)://` followed by non-space/non-quote characters, trims trailing punctuation, and emits one anchor.
- Code spans and Markdown links are consumed by earlier branches, so they are not double-linked.
- The anchor text is the URL itself; the existing anchor color and wrapping apply.

## Risks / Trade-offs

- [Trailing punctuation becomes part of the URL] → Trim common punctuation before building the anchor.
- [A URL inside code gets linked] → The code-span branch runs first and escapes its content.

## Migration Plan

No backfill. Regenerated views carry the links. Rollback is reverting the renderer.

## Open Questions

None.
