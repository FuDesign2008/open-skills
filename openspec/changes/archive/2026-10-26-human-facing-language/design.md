## Context

The queue writes human-facing records and HTML views. Repo rule 3 requires the skill instructional body to stay English for model accuracy and global distribution. The renderer's default labels and footers are English.

## Goals / Non-Goals

**Goals:**

- Human-facing records and HTML views use the language of the human conversation.
- The skill body and agent-only files remain English.
- Entry-page labels and HTML footers are localizable.

**Non-Goals:**

- Translating `SKILL.md`, reference/spec contracts, or code identifiers.
- Automatic language detection beyond the conversation's language.
- Backfilling old batches.

## Decisions

- The dispatcher applies the rule at write time: use the human's conversation language for records and HTML content.
- The renderer accepts label/footer text options; defaults remain English. The dispatcher passes the human's language for entry-page labels and footers.
- The contract test locks the rule sentence in `SKILL.md` and `reference.md`.
- Mixed-language conversations use the latest human language and disclose the choice.

## Risks / Trade-offs

- [A run switches language mid-way] → Use the latest human language and disclose it in the record.
- [Agent-only files drift into the human language] → The contract test asserts the English skill-body rule; repo lint remains authoritative.

## Migration Plan

No backfill. Future runs follow the rule. Rollback is reverting the skill text and the contract assertion.

## Open Questions

None.
