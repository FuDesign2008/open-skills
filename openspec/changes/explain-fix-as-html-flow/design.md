# Design

## Context

See proposal.md for why. The acceptance package today is `progress.md` plus `verification.md`. `explain-clearly` already writes a new HTML file under `.explain-clearly/` and treats `assets/explanation-shell.html` as a structure reference. Queue children already report back; the dispatcher is the only writer of queue files.

## Goals / Non-Goals

**Goals:**

- One review HTML per completed card, written by the acceptance owner through `explain-clearly` with the form fixed to HTML.
- Queue-child engines add the problem, the cause, and the completed fix to the report they already return.
- A role-handoff flow leads with a diagram. A comparison table does not replace it.

**Non-Goals:**

- A private HTML template inside the queue.
- A page for a card that did not reach done.
- Pages from `jira-fix-queue` or `opsx-jira-fix-queue`.
- A new OpenSpec capability for `solve-workflow`.

## Decisions

### The dispatcher writes the page when it records done

The queue writes the HTML at the record step for a card whose status becomes done, under `manual`, `auto`, and `ai-proxy`. Stage 3 copies that path into the card's `verification.md` section. A failed, skipped, or parked card gets no file. Alternative considered: write only at package assembly. Rejected because a card can be done before the batch ends, and the review page belongs to that card.

### The page is an explain-clearly call, not a new layout

The dispatcher follows `explain-clearly` and names HTML, so the form question does not fire. The subject is the three facts from the child report. File name, language, no script, and a new file each time stay that skill's rules. Alternative considered: a queue-owned template. Rejected because the case that missed the flow was a template filled with prose and a table.

### Queue-child detection stays the predicate each engine already has

`goal-driven-workflow` uses its frozen-card predicate: a queue child supplies the three facts in the stage 5 report and does not write HTML; a standalone run writes one page at stage 5 and records the path on that report. `jira-fix-workflow` and `opsx-jira-fix-workflow` use their existing queue-child dispatch. `solve-workflow` and `opsx-solve-workflow` use the same signal the queue already sends: this turn's dispatch inlines the frozen task card. They add the three facts to the verification report and do not write HTML. No new flag.

### The diagram rule is a lead, not a second visual system

In `explain-clearly`, when the subject is roles handing work onward, the diagram is the first visual and it comes before the four prose sections: distinct roles, order, and the handed-off items. A comparison table may sit beside it and does not satisfy the flow. A concept with no shape still gets no diagram. Ordinary explanations still ask for a form when none was named.

### Tests lock sentences, not rendered pages

Extend `scripts/explain-clearly-contract.test.mjs` for the diagram lead. Add sentence locks for the queue's one-file-per-done-card rule, the standalone versus queue-child split, and the three-fact report on each engine, including `solve-workflow`. Do not snapshot HTML.

## Risks / Trade-offs

- [A child and the queue both write a page] → The queue-child branch says the child does not write HTML. Contract tests lock that sentence next to the standalone write sentence.
- [The visual slot is still a table] → The diagram is specified as the lead, and a comparison table is specified as not sufficient. The shell stays a reference.
- [Skill text drifts from the spec] → Sentence locks run in `npm test`.

## Migration Plan

No data migration. Rollback is reverting the skill text and the contract tests. Existing `.explain-clearly/` files stay where they are.

## Open Questions

None.
