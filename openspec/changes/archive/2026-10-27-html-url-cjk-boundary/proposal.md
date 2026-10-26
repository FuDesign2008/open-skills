## Why

The URL autolinker stopped only at whitespace. Chinese text often follows a URL with a fullwidth semicolon and no space, as in `https://example.com/pull/341；Node ...`. The link then swallowed the punctuation and the following word, producing a broken target such as `https://example.com/pull/341；Node`.

## What Changes

- A plain URL ends at whitespace, CJK punctuation, or fullwidth forms; the punctuation and the following text stay outside the link.
- Trailing ASCII punctuation continues to stay outside the link.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `goal-queue`: plain URLs in human-facing HTML views end at CJK punctuation as well as whitespace, so following text is never part of the link.

## Impact

- `skills/goal-driven-queue/reference.md`, `scripts/render-html.mjs`, `scripts/render-html.test.mjs`.
- No dependency; no engine template edit; no change to the Markdown source.
