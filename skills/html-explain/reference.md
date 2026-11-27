# HTML Explain — Reference

## Five-section page template

Write a new page in the user's language. English headings below are examples because this skill is written in English.

1. **What changed** — concise summary of the delta (MR/PR/diff/local).
2. **Why it matters** — intent or problem the change addresses.
3. **Key files / areas** — the important paths or modules, with evidence pointers.
4. **Risks / follow-ups** — what to watch, unknowns, or leftover work.
5. **How to verify** — concrete checks the reader can run or observe.

Always include a **title** and a **one-sentence summary** under the title before the five sections.

Sample placeholder MR URL (deid-safe):

`https://example.com/group/project/-/merge_requests/123`

## Escalation decision table

| Subject | Path |
|---------|------|
| User wants HTML for what an MR/PR/diff/local change did | Default lightweight five-section page |
| Ask is mainly a concept / mechanism / protocol shape | Optionally load `explain-clearly` (form = HTML); this skill opens + closes |
| Hands-on tutorial | Route to `teach` — stop |
| Design-doc rewrite into review doc | Route to `tech-review-doc` — stop |

## Output naming

`.html-explain/<topic-slug>-<local-YYYYMMDD-HHmm>.html`

Example: `.html-explain/fix-login-timeout-20261127-1021.html`
