# Design

## Context

See proposal.md for why. `explain-clearly` used to require four prose sections after any visual. Those sections are no longer the explanation. `assets/explanation-shell.html` remains a script-free reference, and its example sections are not a required outline.

## Goals / Non-Goals

**Goals:**

- One classification order so a page has a single lead.
- The HTML step player shows one step at a time, opens on step 1, and does not autoplay.
- Contract tests lock the new sentences.

**Non-Goals:**

- Autoplay, or a separate animation timeline.
- Renaming the skill, or depending on `eli5`.
- A new writer in the queue or workflow skills.
- A rendered-page test of the player.

## Decisions

### Classify the subject in this order

Apply the first match:

1. Role-handoff flow: the existing diagram leads. Do not also require the step player.
2. Happens step by step in time: the step sequence leads.
3. Has a comparison, mapping, topology, or flow, and is not time-ordered: one static diagram leads.
4. No such shape: no visual.

The four matches are the whole explanation, plus one sentence under the title. Do not append four prose sections. A sentence sits next to the step or diagram it belongs to. An analogy is omitted when the picture already shows that relation. A design implication appears only when the user is choosing an action. Alternative considered: keep the four sections after the lead. Rejected because they restate the account. Alternative considered: let a time-ordered role handoff use the step player. Rejected because the role-handoff diagram rule stays as it is.

### HTML may add one inline script; the shell stays without one

The written HTML page, only when the subject is time-ordered, may contain one inline script. That script only shows and hides steps and only responds to previous and next. It does not load a remote URL, does not autoplay, and opens on the first step. The bundled shell stays a script-free reference. Its comment says the example sections are not a required outline, and that a time-ordered subject uses the player as the body. Alternative considered: a script-free radio or `details` control. Rejected because the interaction has to be previous and next, and a script is acceptable for that player.

### Other forms lead with numbered steps

Markdown, plain text, and the current session use the same steps as a numbered sequence and have no previous or next controls. Plain text stays prose. The current session puts that sequence in the chat and writes no file. HTML still gives only the file path in the chat.

### A step shows only what is true at that moment

Each step states the facts that hold then. A position mark is drawn as a mark, not as a message in the list. A later action is not drawn on the same row as the state from before that action. This is the existing rule that a visual must not invent a relationship, applied to each step.

### Tests lock sentences, not the player

`scripts/explain-clearly-contract.test.mjs` asserts the classification order, the player constraints, the numbered-step forms, that four prose sections are not required, the 「容易看懂」 trigger, and that the shell itself still has no script. It does not open a browser.

## Risks / Trade-offs

- [A step still draws a mark as a message] → The skill states that each step shows only what is true then, and that a position mark is not a message. The contract test locks that sentence.
- [The script does more than move steps] → The skill and the spec allow only that effect. The test locks the sentence.
- [Four prose sections are appended after the player] → The skill says not to add them. The contract test locks that sentence.
- [The shell and the page disagree about script] → The shell stays script-free. Only the written time-ordered page adds the player script.

## Migration Plan

No data migration. Rollback is reverting the skill, the shell comment, the contract test, and the spec delta. Existing `.explain-clearly/` files stay where they are.

## Open Questions

None.
