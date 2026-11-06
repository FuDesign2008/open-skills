# Role Contract

> Shared contract for role-based dispatch. Referenced by the agent definitions in this
> directory and by `skills/jira-fix-workflow/SKILL.md` Stage 8.
> This file is documentation, not an agent definition (it has no `name` / `description`
> frontmatter, so the host skips it).

## Three layers

- **Organizer** — a host workflow (for example `jira-fix-workflow`). It dispatches tasks,
  receives results, and judges acceptance. Its acceptance actions are part of the contract,
  not a look into the role's internals: reading every result-card field, verifying the
  artifacts the card cites, and snapshotting the working tree around write-capable roles.
- **Role** — an independent execution subject defined by a file in this directory. It
  decides which skills to call and how to do the work.
- **Skill** — a capability package under `skills/`, used by a role.

## Task card (organizer → role)

Required fields:

- `Goal` — one sentence naming the outcome.
- `Artifacts` — paths or ranges the role may read (diff range, requirement source, plan).
- `Constraints` — hard limits, including which paths the role may write.
- `Acceptance criteria` — checkable items the result will be judged against.
- `Model tier` — `standard` or `escalated`. The organizer resolves it before dispatch.

## Result card (role → organizer)

Required fields:

```text
Verdict: PASS | FAIL
Confidence: high | low
Model tier: standard | escalated
Findings:
  - <axis> <file:line> — <issue> — <evidence> — <severity>
Evidence:
  - <command or action> — <short output summary or artifact path>
Unresolved:
  - <what could not be determined and why>
```

`Model tier` echoes the tier the organizer placed in the task card. For a reviewer role,
add two axis verdicts; the axes are judged separately and are never merged into a ranked
list:

```text
Standards: PASS | FAIL
Spec: PASS | FAIL
```

An empty `Evidence` entry, a missing field, or an unparseable card is a format error.

## Organizer acceptance rules

1. Read every field. `Verdict` alone is not acceptance.
2. Format error, missing field, or empty `Evidence` → **block** (fail-closed).
3. `PASS` with a non-empty `Unresolved` → **not accepted**. The role must resolve the item,
   or return `FAIL` / `Confidence: low`. An unexecuted check never rides along with a pass.
4. `PASS` with `Confidence: low` → escalate when the escalated card has not run.
5. `FAIL` on any card or on either review axis → route to fix. **FAIL wins across cards.**
6. A passing escalated card (`PASS` + `high`) discharges a standard card's `low`, but only
   when the standard card carries no `FAIL`. It never discharges a `FAIL`.
7. When escalation did not run, the standard card must itself be `PASS` + `high`.
8. Reviewer cards: `Standards` and `Spec` are both required; either `FAIL` fails the card.
9. An `Evidence` entry citing a path must point to an artifact that exists.
10. For a write-capable role, the organizer snapshots the working tree before and after
    (`git status --porcelain` plus `git rev-parse HEAD`). The snapshots must match; a
    difference invalidates that role's result.

## Model tiers

Tier names are stable contract identifiers. Concrete models live in `models.json` and may
be changed per project without touching any skill or agent file.

| Call site | Tier |
|---|---|
| developer | `standard` |
| code-reviewer (basic review) | `standard` |
| code-reviewer (escalated review) | `escalated` |
| tester | `standard` |

Resolution: read `models.json`, map the tier to a model alias, and pass that alias on the
dispatch call. When `models.json` is missing or unreadable, or a tier has no mapping,
**abort and report**. Never fall back silently, and never let a role inherit the organizer's
model by omission.

Verification of the tier: the task card carries `Model tier`, the result card echoes it, and
the organizer records the alias it actually dispatched in the stage report. A card whose
`Model tier` does not match the dispatch record is a format error.

## Test paths

A write-capable role may only add or modify files under test paths. Default set, extendable
per project through the `testPaths` array in `models.json`:

- directories: `tests/`, `test/`, `__tests__/`, `spec/`, `e2e/`
- file patterns: `*.test.*`, `*.spec.*`

The organizer checks the resulting diff against this set. A change outside it invalidates
that role's result.

## Escalation to the escalated-tier review

Run the escalated review when any one condition holds:

1. A changed path matches the sensitive-path list in `skills/merge-discipline/reference.md`.
2. The diff exceeds the content-matched depth-ladder threshold for a full review defined in
   `skills/merge-discipline/reference.md`. Reference that ladder; do not restate its numbers
   here.
3. The standard review returns `Confidence: low`.

The escalated review uses the same agent and the same flow with the `escalated` tier. Its
input is identical to the standard-tier input — no extra context, no delta instructions.
Both result cards are independent. When they conflict, **FAIL wins**; a stronger model does
not overrule an observed failure.

## Unit tests vs integration tests

- Unit tests follow `test-first-discipline`: the developer writes a failing test, observes
  red, then writes production code.
- Integration tests are owned by the tester. It designs scenarios from the requirement and
  the diff, adds test files, and runs them in a real environment.
- Allowing the tester to add test files after implementation does not weaken test-first:
  the two layers cover different scopes, and the unit-test obligation stays with the
  developer.

## Read-only is a convention, not a sandbox

The host's `tools` field cannot stop `Bash` from redirecting output into a file. The
code-reviewer therefore states explicitly that it must not write files. The organizer
verifies the working tree is unchanged across the review (rule 10); any change invalidates
that result.
