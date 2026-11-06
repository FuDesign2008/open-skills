# Role Contract

> Shared contract for role-based dispatch. Referenced by the agent definitions in this
> directory and by `skills/jira-fix-workflow/SKILL.md` Stage 8.
> This file is documentation, not an agent definition (it has no `name` / `description`
> frontmatter, so the host skips it).

## Three layers

- **Organizer** — a host workflow (for example `jira-fix-workflow`). It dispatches tasks,
  receives results, and judges acceptance. It does not inspect how a role works internally.
- **Role** — an independent execution subject defined by a file in this directory. It
  decides which skills to call and how to do the work.
- **Skill** — a capability package under `skills/`, used by a role.

## Task card (organizer → role)

- `Goal` — one sentence naming the outcome.
- `Artifacts` — paths or ranges the role may read.
- `Constraints` — hard limits, including what the role may write.
- `Acceptance criteria` — checkable items the result will be judged against.
- `Model tier` — `standard` or `escalated`, supplied when the organizer dispatches one.

## Result card (role → organizer)

```text
Verdict: PASS | FAIL
Confidence: high | low
Model tier: standard | escalated
Findings:
  - <file:line> — <issue> — <evidence> — <severity>
Evidence:
  - <command or action> — <short output summary or artifact path>
Unresolved:
  - <what could not be determined and why>
```

Rules:

- `Verdict: PASS` requires `Unresolved` to be empty. An unexecuted check makes the card
  `FAIL`; it never rides along with a pass.
- `Unresolved` and `Confidence` are independent. `Unresolved` holds specific unresolved
  items and blocks a `PASS`. `Confidence: low` means overall certainty is low without a
  specific unresolved item; it does not block a `PASS`, and it triggers the escalated
  review.
- A reviewer role prefixes each finding with its axis: `[Standards]` or `[Spec]`. The two
  axes are judged separately and are not merged into one ranked list.

## Organizer acceptance

1. Read every field.
2. Missing field, empty `Evidence`, or `PASS` with a non-empty `Unresolved` → **block**.
3. Any `FAIL` on any card → route to fix.
4. Every card `PASS` with an empty `Unresolved` → stage passes.
5. `Confidence` does not change the outcome. It is recorded for the stage report.

That is the whole gate. There is no separate confidence-based acceptance rule.

## Escalation

Run the escalated review when any one condition holds:

1. A changed path matches the sensitive-path list in `skills/merge-discipline/reference.md`.
2. The working-tree diff — the same input the review uses, not `base...HEAD` — exceeds the
   large-diff row of the content-matched depth ladder in `skills/merge-discipline/reference.md`.
3. The standard review returns `Confidence: low`.

The escalated review uses the same agent and the same flow with the `escalated` tier. Its
input is identical to the standard-tier input. Both cards are independent and both must
pass; any `FAIL` fails the review. A stronger model does not overrule an observed failure.

## Model tiers

Tier names are stable contract identifiers. Concrete models live in `models.json`.

| Call site | Tier |
|---|---|
| developer | `standard` |
| code-reviewer (basic review) | `standard` |
| code-reviewer (escalated review) | `escalated` |
| tester | `standard` |

Resolution: read `models.json`, map the tier to a model alias, and pass that alias on the
dispatch call. When `models.json` is missing or unreadable, or a tier has no mapping,
**abort and report**.

The organizer records both the requested tier and the model the host actually resolved in
the stage report. No equality assertion is made: a host may map a tier to any model it
offers (for example, an environment may serve the `escalated` tier with a model whose name
is not the one written in `models.json`).

## Write boundaries

- `code-reviewer` must not write files. Its `tools` field omits `Write`/`Edit`; because
  `Bash` can still redirect output, this is a stated convention, not a sandbox.
- `tester` may add or modify test files only, and must never change production code.
- `developer` may modify production code.

## Unit tests vs integration tests

- Unit tests follow `test-first-discipline`: the developer writes a failing test, observes
  red, then writes production code.
- Integration tests are owned by the tester: it designs scenarios from the requirement and
  the diff, adds test files, and runs them in a real environment.
- The tester adding tests after implementation does not weaken test-first: the two layers
  cover different scopes, and the unit-test obligation stays with the developer.
