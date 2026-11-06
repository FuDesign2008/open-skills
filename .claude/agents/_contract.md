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

The organizer's only interface with a role is the task card and the result card.

## Task card (organizer → role)

Required fields:

- `Goal` — one sentence naming the outcome.
- `Artifacts` — paths or ranges the role may read (diff range, requirement source, plan).
- `Constraints` — hard limits, including which paths the role may write.
- `Acceptance criteria` — checkable items the result will be judged against.

## Result card (role → organizer)

Every field is required.

```text
Verdict: PASS | FAIL
Confidence: high | low
Findings:
  - <file:line> — <issue> — <evidence> — <severity>
Evidence:
  - <command or action> — <short output summary or artifact path>
Unresolved:
  - <what could not be determined and why>
```

An empty `Evidence` entry, a missing field, or an unparseable card is a format error.

## Organizer acceptance rules

1. Read all five fields. `Verdict` alone is not acceptance.
2. Format error, missing field, or empty `Evidence` → **block** (fail-closed).
3. `PASS` with `Confidence: low` → not accepted. Escalate to the escalated-tier review
   if it has not already run.
4. `FAIL` → route per the host workflow's verdict table.
5. An `Evidence` entry citing a file must point to an artifact that exists.
6. For a role allowed to write test files, inspect the resulting diff: any change outside
   test paths invalidates that role's result.

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
**abort and report**. Never fall back silently, and never let a role inherit the
organizer's model by omission.

## Escalation to the escalated-tier review

Run the escalated review when any one condition holds:

1. A changed path matches the sensitive-path list in
   `skills/merge-discipline/reference.md`.
2. `git diff --numstat <base>...HEAD` reports more than 400 changed lines, or more than
   20 changed files. Binary files are excluded from the line count.
3. The standard-tier review returns `Confidence: low`.

The escalated review uses the same agent and the same flow with the `escalated` tier. Its
input is identical to the standard-tier input — no extra context, no delta instructions.
Both result cards are independent. When they conflict, **FAIL wins**; a stronger model
does not overrule an observed failure.

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
verifies that the working tree is unchanged across the review; any change invalidates
that result.
