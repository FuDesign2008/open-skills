## Context

`renderPlainUrl` matched `https?://` up to the next whitespace, then trimmed trailing punctuation at the end of the match. Chinese prose often places a fullwidth semicolon directly after a URL (`…/341；Node …`), so the match ended with `Node` and no trailing punctuation was trimmed. The anchor target and text became `https://…/341；Node`.

## Goals / Non-Goals

**Goals:**

- A URL ends at the first character that cannot belong to it, including CJK punctuation and fullwidth forms.
- Following text stays outside the link.

**Non-Goals:**

- Full URL parsing or validation.
- Supporting CJK punctuation inside query strings.

**Decisions**

- Exclude U+3000–U+303F (CJK punctuation and the ideographic space) and U+FF01–U+FF65 (fullwidth forms) from the URL character class.
- Keep the existing trailing ASCII punctuation trim for URLs followed by a space.
- No change to code-span or Markdown-link rendering.

## Risks / Trade-offs

- [A legitimate URL contains a fullwidth character] → Fullwidth forms are not valid unescaped in URLs; percent-encoding remains supported.
- [CJK punctuation inside a percent-encoded URL] → Percent-encoded bytes are ASCII and unaffected.

## Migration Plan

Regenerate existing views. Rollback is reverting the renderer and reference text.

## Open Questions

None.
