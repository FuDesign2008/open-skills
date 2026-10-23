## Why

A time-ordered mechanism explained as four prose sections, or as a set of static diagrams, was not understood. The explanation has to show the relevant causes in the shape the subject has. Four fixed prose sections restate that account and are not required.

## What Changes

- When the subject happens step by step in time, an HTML explanation leads with a previous-step / next-step player and opens on step 1. It does not autoplay. A small inline script is allowed only for that player. The sentence a picture cannot show sits next to that step. The chat still gives the file path and does not paste the page.
- Markdown, plain text, and the current session use the same sequence as numbered steps, with no buttons. Plain text stays prose.
- When the subject has a shape but no time order, HTML and Markdown lead with one static diagram, and the sentence the picture cannot show sits next to it. A concept with no shape still gets no forced visual.
- The page names the subject in one sentence. It does not add four prose sections that restate the account. A design implication appears only when the user is choosing an action. An analogy appears only when the picture has not already shown that relation, and it must not invert a constraint.
- A role-handoff flow keeps its existing diagram rule. The skill name stays `explain-clearly`. The Chinese trigger 「容易看懂」 is added.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `explain-clearly`: a time-ordered explanation leads with steps, with the missing sentence next to the step; HTML may include a script only for that player; a non-temporal shape leads with a static diagram; a shapeless concept still has no forced visual; four prose sections are not required.

## Impact

- Skill text and the HTML shell in `skills/explain-clearly/`.
- The contract test that locks those sentences.
- The main `explain-clearly` spec, including the current "no script" rule.
- Queue and workflow writers that follow `explain-clearly` inherit the page order. This change does not add a writer.
