## Context

The renderer already handles inline code spans. File paths in the docs are written in backticks, so the code-span renderer is the natural place to add links.

## Goals / Non-Goals

**Goals:**

- Turn an existing file path in inline code into a local link.
- Leave commands, placeholders, and non-file strings plain.
- Resolve paths against the workspace root, then the queue root and the source/output directories.

**Non-Goals:**

- Linking every path-like string outside inline code.
- Editing the source files.
- A file browser or an IDE integration.

## Decisions

- `renderCodeSpan` asks a `fileLink` resolver for an href; no resolver or no existing file leaves the code span plain.
- `renderFile` builds the resolver from `--file-root`/`fileRoot`; it tries the workspace root, the queue root, the source directory, and the output directory.
- The link is a relative path from the output file; it opens the local source in the browser.
- The link gets a dotted underline and a small arrow so the reader can see it is clickable.

## Risks / Trade-offs

- [A path-like code span is not a file] → The resolver checks `fs.existsSync`; otherwise the span stays plain.
- [A browser refuses to open a local file] → The path remains visible in the link title and text; the reader can copy it.

## Migration Plan

No backfill. Regenerated views carry the links. Rollback is reverting the renderer.

## Open Questions

None.
