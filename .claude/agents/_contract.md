# Role Contract

> Shared contract for role-based dispatch. Referenced by the agent definitions in this
> directory and by PDCA hosts. Hosts that provide this contract dispatch the meta-role
> `leader`; `leader` selects and dispatches subordinate roles. This file is documentation,
> not an agent definition (no `name` / `description` frontmatter — the host skips it).

## Three layers

- **Host workflow** — a PDCA skill (for example `jira-fix-workflow`). When a role contract
  is present it dispatches `leader` with a phase task card; otherwise it runs its own
  checks. It fail-closed-accepts the **leader** result card (and any nested cards the
  leader surfaces). It does not micro-manage how `leader` works internally.
- **Role** — an independent execution subject defined by a file in this directory.
  - **Meta-role:** `leader` — selects subordinate roles, dispatches them, aggregates cards.
  - **Subordinate roles:** craft specialists listed under Role catalog.
- **Skill** — a capability package under `skills/`, used by a role.

## Role catalog

| id | Chinese | Kind | Default tier |
|---|---|---|---|
| `leader` | 领导者 | meta | `escalated` |
| `product-manager` | 产品经理 | subordinate | `standard` |
| `designer` | 设计师 | subordinate | `standard` |
| `architect` | 架构师 | subordinate | `escalated` |
| `developer` | 研发 | subordinate | `standard` |
| `tester` | 测试 | subordinate | `standard` |
| `code-reviewer` | 代码审查 | subordinate | `standard` / `escalated` |
| `security-reviewer` | 安全审查 | subordinate | `escalated` |
| `debugger` | 调试 | subordinate | `standard` |
| `perf-engineer` | 性能工程 | subordinate | `standard` |
| `releaser` | 发布 | subordinate | `standard` |
| `tech-writer` | 技术写作 | subordinate | `standard` |
| `researcher` | 调研 | subordinate | `standard` |
| `retrospector` | 复盘 | subordinate | `standard` |

Existing ids `developer`, `tester`, `code-reviewer`, and `architect` keep their names.

## Task card (host → leader, or leader → subordinate)

- `Goal` — one sentence naming the outcome.
- `Phase` — when the host calls `leader`: one of `clarify` | `design` | `implement` |
  `verify` | `release` | `retrospect` (hosts MAY add a short phase note).
- `Artifacts` — paths or ranges the role may read (and write, if within write boundary).
- `Constraints` — hard limits, including what the role may write.
- `Acceptance criteria` — checkable items the result will be judged against.
- `Model tier` — `standard` or `escalated`, supplied when dispatching.

## Result card (role → caller)

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
  review for `code-reviewer`.
- A reviewer role (`code-reviewer`, `security-reviewer`) prefixes each finding with its
  axis: `[Standards]` or `[Spec]`. Axes are judged separately and are not merged into one
  ranked list.
- `leader` MUST attach nested subordinate result cards (or a faithful summary of each
  required field) under `Evidence` / `Findings` so the host can fail-closed-accept.

## Acceptance (host and leader)

1. Read every field of the card being accepted.
2. Missing field, empty `Evidence`, or `PASS` with a non-empty `Unresolved` → **block**.
3. Any `FAIL` on any required nested card → route to fix (leader returns `FAIL`).
4. Every required card `PASS` with an empty `Unresolved` → stage / phase passes.
5. `Confidence` does not change the outcome. It is recorded for the stage report.

## Escalation (code-reviewer)

Run the escalated `code-reviewer` when any one condition holds:

1. A changed path matches the sensitive-path list in `skills/merge-discipline/reference.md`.
2. The working-tree diff — the same input the review uses, not `base...HEAD` — exceeds the
   large-diff row of the content-matched depth ladder in `skills/merge-discipline/reference.md`.
3. The standard review returns `Confidence: low`.

Both standard and escalated cards are independent; any `FAIL` fails the review.

## Model tiers

Tier names are stable contract identifiers. Concrete models live in `models.json`.

| Call site | Tier |
|---|---|
| leader | `escalated` |
| product-manager | `standard` |
| designer | `standard` |
| architect | `escalated` |
| developer | `standard` |
| tester | `standard` |
| code-reviewer (basic) | `standard` |
| code-reviewer (escalated) | `escalated` |
| security-reviewer | `escalated` |
| debugger | `standard` |
| perf-engineer | `standard` |
| releaser | `standard` |
| tech-writer | `standard` |
| researcher | `standard` |
| retrospector | `standard` |

Resolution: read `models.json`, map the tier to a model alias, and pass that alias on the
dispatch call. When `models.json` is missing or unreadable, or a tier has no mapping,
**abort and report**.

## Write boundaries

- `leader` does not modify production or test code. It MAY only write paths listed in its
  task-card `Artifacts` that are orchestration/report documents.
- `code-reviewer` and `security-reviewer` must not write files (`tools` omit `Write`/`Edit`;
  `Bash` redirect is a stated convention, not a sandbox).
- `tester` may add or modify test files only; never production code.
- `developer` may modify production code (and unit tests per `test-first-discipline`).
- `architect` may write design documents only (`Artifacts`; default
  `openspec/changes/<change-name>/design.md` when a change exists).
- `product-manager` may write intake/contract/decision-ticket docs in `Artifacts` only.
- `designer` may write design/spec/inventory docs and Figma living-artifact paths in
  `Artifacts`; not unrelated production logic outside the implement scope the leader set.
- `debugger` may add temporary instrumentation only when registered for rollback; must not
  leave production behavior changes without an explicit implement handoff.
- `perf-engineer` may change code only inside the performance campaign scope in `Artifacts`.
- `releaser` may run delivery/git commands within policy; must not merge protected branches
  without a human (reserved).
- `tech-writer` may write documentation paths in `Artifacts` only.
- `researcher` may write research-report paths in `Artifacts` only.
- `retrospector` may write retrospective/sediment paths in `Artifacts` only.

The caller (`leader` or host) inspects the diff and rejects a result that crosses the role's
boundary.

## Leader phase dispatch (defaults)

When the host dispatches `leader` with `Phase`, `leader` MUST evaluate gates and dispatch
at least the roles below when applicable. Extra roles from the catalog MAY be added when
artifacts warrant them. Skip auto-dispatch of a role when its gate does not fire; record
the match or miss.

| Phase | Default subordinates |
|---|---|
| `clarify` | `product-manager` |
| `design` | `architect` when the design-phase architect gate fires; `designer` when the goal/card contains `figma.com` or `node-id=` or UI/稿面 intent; `researcher` when user-visible competitor behavior is in scope |
| `implement` | `developer`; `debugger` when static analysis stalled / fix failed / silent failure triggers from `runtime-evidence-debug`; `perf-engineer` when the goal names performance / 性能 / 卡顿 |
| `verify` | `code-reviewer` (`standard`, plus `escalated` when escalation holds); `tester`; `security-reviewer` when a changed path matches the sensitive-path list or the goal names auth/security/权限 |
| `release` | `releaser` (protected-branch merge stays human-only) |
| `retrospect` | `retrospector` |

Manual / on-demand dispatch of any catalog role remains available when the contract exists.

## Design-phase architect gate

Auto-include `architect` in `design` phase only when a role contract is present **and** at
least one input holds. Record which input matched, or that none matched.

**Explicit mark (any one):**

- Task card field `architecture: true`
- User utterance containing 「架构设计」 or `architecture design`

**Verifiable signals (any one):**

- Goal or constraints name cross-repo or cross-service work
- Selected solution proposes a new top-level module directory
- The change touches two or more independent paths under `openspec/specs/`
- Goal contains an architecture keyword from this list: `architecture`, `跨层`,
  `新模块边界`, `cross-layer`, `new module boundary`

Do not use estimated file/line counts or unaudited preference as gate inputs.

## Unit tests vs integration tests

- Unit tests follow `test-first-discipline`: the developer writes a failing test, observes
  red, then writes production code.
- Integration tests are owned by the tester.
- The tester adding tests after implementation does not weaken test-first.
