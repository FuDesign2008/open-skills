## Context

See proposal.md for why. Specs in this change are the behavior contract. The dispatcher is already the only writer of queue files, and it already writes one review HTML page when a card becomes done. `explain-clearly` writes that page under `.explain-clearly/` from `assets/explanation-shell.html`. A queue child already returns the problem, the cause, and the completed fix, and does not write that page.

## Goals / Non-Goals

**Goals:**

- At the record step for a done card, copy cited screenshots into the batch directory and write one evidence HTML page the reviewer can open.
- Point `verification.md` and the review HTML at that page.
- On a standalone run, write the same kind of page at stage 5 before the review HTML, and record its path on the completion report.

**Non-Goals:**

- A new runtime service, image host, or private template language.
- Backfilling evidence pages onto batches that already finished.
- Letting a queue child or an enqueue shell write into the acceptance directory.
- A new OpenSpec capability for `solve-workflow`.
- An image on a check that did not open a UI.

## Decisions

### Write the evidence page at the record step, then the review page

When a card's status becomes done, under `manual`, `auto`, or `ai-proxy`, the dispatcher copies images and writes `evidence/<card>.html` in that same sole-writer record step. It then calls `explain-clearly` with the form fixed to HTML and with that evidence path, so the review page can link to a file that already exists. `verification.md`, assembled with the acceptance package, records both paths on that card's section. Alternative considered: write both pages only when the batch ends. Rejected because a card is done before the batch ends, and the review link would point at a page that does not exist yet.

### The child reports paths; the dispatcher copies bytes

The completion report's evidence list is data on the report the child already returns. Each item is an opened-UI check with a png, jpg, jpeg, or webp path, or a non-UI check with the command and a short output summary. The dispatcher copies a cited file only when it is a regular file, non-empty, and one of those extensions. The copy lands in `evidence/<card>/`. The page uses a relative `src`. The `<card>` segment is the card slug and contains no path separator. If two copies in one card would share a basename, prefix the later file with its 1-based list index. Alternative considered: leave the `src` on the child's worktree path. Rejected because removing that worktree would empty the page. Alternative considered: the child writes the HTML into the queue directory. Rejected because the dispatcher is the only writer of queue files.

### The evidence page is plain HTML, not an explain-clearly page

The evidence page is a title `证据留痕`, then one block per evidence item. An opened-UI item shows the copied image. A non-UI item shows the command and the output summary and no image. A missing or empty image is text: pending, plus the capture still required. An empty list is one sentence that no checks were recorded, and no image. No script. It does not live under `.explain-clearly/`. Alternative considered: ask `explain-clearly` to render the gallery. Rejected because that skill's page is a title, one sentence, and one visual.

### The review page gains one link, and only when a path is supplied

`explain-clearly` keeps the title, the one sentence, and the visual. When the caller supplies an evidence-page path, it appends one link after the visual. The link text is `证据留痕`. The `href` is the relative path from the review file to the evidence file. A normal explanation supplies no path and gets no link. Alternative considered: put the gallery on the review page. Rejected because that page's shape is the explanation.

### Standalone is one directory per run

A standalone stage 5 creates `.goal-driven/runs/<local-YYYYMMDD-HHmm>/`, writes `evidence.html` and any copied images there, and does not overwrite an existing directory. The completion report records that path. The review page links to it. A queue child of `goal-driven-workflow` only adds the evidence list to the report.

### Queue-child detection does not change

`goal-driven-workflow` keeps its frozen-card predicate. `jira-fix-workflow`, `opsx-jira-fix-workflow`, `opsx-solve-workflow`, and `solve-workflow` keep the signal they already use: this turn's dispatch inlines the frozen task card. Those reports gain the evidence list and state that the run writes neither HTML page. `solve-workflow` has no spec; the sentences live in the skill only. Enqueue shells do not gain these sentences.

### Tests lock sentences

Extend `scripts/review-html-flow-contract.test.mjs` for the evidence page, the copy, the relative path, the slug rule, the pending-and-no-invented-image rule, the verification path, and the child report. Extend `scripts/explain-clearly-contract.test.mjs` so a supplied evidence path adds one link after the visual and a call without that path does not. Do not snapshot rendered HTML.

## Risks / Trade-offs

- [A cited path points at a directory or a non-image] → Copy only a regular file with a png, jpg, jpeg, or webp extension; otherwise the item is pending.
- [Two screenshots share a basename] → Prefix the later copy with its list index so the relative `src` stays unique.
- [A slug contains `../`] → The path segment is the card slug and must contain no path separator. The contract test locks that sentence.
- [The review page is written before the evidence page] → The record step writes the evidence page first, then calls `explain-clearly` with its path.
- [An agent follows the old three-fact sentence and skips the list] → The child requirement keeps its scenario name and replaces the outcome: the report includes the evidence list and writes neither page. Sentence locks cover that outcome.
- [Skill text drifts from the spec] → `npm test` runs the sentence locks.

## Migration Plan

No backfill. Batches that already finished keep their current files. Rollback is reverting the skill text and the contract tests. Evidence files created by a new run are ordinary files under `.goal-driven/` and can be deleted with that run directory.

## Open Questions

None.
