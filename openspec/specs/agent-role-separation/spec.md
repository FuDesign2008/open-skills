# agent-role-separation Specification

## Purpose
Defines the role contract for organizer ↔ role dispatch: task/result cards, fail-closed acceptance, model tiers, write boundaries (including `architect`), and opt-in host integration when a contract is present at project or Claude Code user-global paths.
## Requirements
### Requirement: Role contract SHALL define task and result cards

The role contract SHALL define a task card with `Goal`, `Artifacts`, `Constraints`, and
`Acceptance criteria`, and a result card with `Verdict`, `Confidence`, `Model tier`,
`Findings`, `Evidence`, and `Unresolved`. A reviewer role MUST prefix each finding with its
axis (`Standards` or `Spec`) and MUST NOT merge the two axes into one ranked list.

#### Scenario: Missing field is a format error

- **WHEN** a result card omits any required field
- **THEN** the organizer treats it as a format error and blocks the stage

#### Scenario: Reviewer labels findings by axis

- **WHEN** a reviewer role returns findings
- **THEN** each finding carries a `[Standards]` or `[Spec]` prefix

### Requirement: Organizer SHALL accept results fail-closed

The organizer MUST read every result-card field. A missing field, an empty `Evidence`
entry, or a `Verdict: PASS` carrying a non-empty `Unresolved` MUST block acceptance. An
unexecuted check MUST return `FAIL`; it MUST NOT ride along with a pass.

#### Scenario: Unresolved blocks a pass

- **WHEN** a card reports `Verdict: PASS` with a non-empty `Unresolved`
- **THEN** the organizer does not accept it

#### Scenario: Empty evidence blocks acceptance

- **WHEN** a card's `Evidence` is empty
- **THEN** the organizer blocks the stage

### Requirement: Confidence SHALL be recorded but SHALL NOT gate acceptance

`Confidence` MUST be recorded in the stage report and MUST NOT change the pass/fail
outcome. The stage passes when every card is `Verdict: PASS` with an empty `Unresolved`.

#### Scenario: Low confidence with passing verdicts

- **WHEN** every card is `Verdict: PASS` with an empty `Unresolved` and one card reports
  `Confidence: low`
- **THEN** the stage passes, and the low confidence is recorded

### Requirement: Escalation SHALL run the same role with the escalated tier

The organizer MUST run the escalated review when a changed path matches the sensitive-path
list in `skills/merge-discipline/reference.md`, when the diff exceeds that skill's
large-diff row, or when the standard review reports `Confidence: low`. The escalated review
MUST use the same agent and the same flow with the `escalated` tier. Both cards are
independent and both must pass; a `FAIL` on either card fails the review.

#### Scenario: Escalated failure fails the review

- **WHEN** the standard card is `PASS` and the escalated card is `FAIL`
- **THEN** the review fails and routes to fix

#### Scenario: Missing role configuration aborts

- **WHEN** the project role configuration is missing or unreadable, or a tier has no mapping
- **THEN** the organizer aborts and reports instead of falling back silently

### Requirement: Write boundaries SHALL match the role

`code-reviewer` MUST NOT write files; because `Bash` can still redirect output, this is a
stated convention, not a sandbox. `tester` MAY add or modify test files only and MUST NOT
change production code. `developer` MAY modify production code. `architect` MAY write design
documents only (task-card `Artifacts`) and MUST NOT modify production or test code. The
organizer MUST inspect the diff produced by a write-capable role and reject a result that
crosses its boundary.

#### Scenario: Tester touching production code is rejected

- **WHEN** the tester's diff changes a production file
- **THEN** the organizer rejects that result

#### Scenario: Architect touching test code is rejected

- **WHEN** the architect's diff changes a test file
- **THEN** the organizer rejects that result

### Requirement: Host integration SHALL be opt-in by presence

PDCA hosts that support role dispatch MUST dispatch only when a role contract exists at the project path `.claude/agents/_contract.md` OR at `~/.claude/agents/_contract.md` (expand `~`). If both exist, the project path wins. If neither exists, hosts run without role dispatch. When enabled, hosts MUST dispatch `leader` for opted-in phases. Agent files MAY be installed by this repo's scripts into `~/.claude/agents/` by copy; they MUST NOT be installed via `npx skills add`.

#### Scenario: User-global contract enables dispatch

- **WHEN** the project has no `_contract.md` but `~/.claude/agents/_contract.md` exists
- **THEN** the host treats the role contract as present and may dispatch `leader` at role boundaries

#### Scenario: Project contract overrides user-global

- **WHEN** both `.claude/agents/_contract.md` and `~/.claude/agents/_contract.md` exist
- **THEN** the host uses only the project contract for dispatch gates and configuration

#### Scenario: No contract keeps the original behavior

- **WHEN** neither project nor user-global `_contract.md` exists
- **THEN** the host runs its original checks without role dispatch

#### Scenario: Contract present uses leader

- **WHEN** a role contract is present (per precedence above) and the host reaches a role-dispatch boundary
- **THEN** the host dispatches `leader` with a `Phase` and does not inline subordinate lists

### Requirement: Role package install SHALL copy with manifest attribution

Repo scripts MUST copy from `<repoRoot>/.claude/agents/` to `~/.claude/agents/` (not symlink). They MUST record claims in `~/.claude/agents/.open-skills-roles-manifest.json`, prune only stale claimed paths on full sync unless `--no-prune`, and MUST NOT touch foreign agent files. `install-skills.mjs` MUST respect `--no-roles`. Source of truth remains repo `.claude/agents/`.

#### Scenario: Stale claimed role file is pruned

- **WHEN** a file was previously manifest-claimed and is removed from repo `.claude/agents/`
- **THEN** the next full role install deletes only that path under `~/.claude/agents/`

#### Scenario: Foreign agent file survives

- **WHEN** `~/.claude/agents/` contains an agent file never recorded in `.open-skills-roles-manifest.json`
- **THEN** role install and prune leave that file unchanged

#### Scenario: Skill install skips roles with flag

- **WHEN** the user runs `install-skills.mjs` with `--no-roles` and skills install succeeds
- **THEN** no role copy or role manifest update runs

#### Scenario: Default skill install refreshes roles

- **WHEN** the user runs a successful default `install-skills.mjs` without `--no-roles`
- **THEN** role files are copied from the repo `.claude/agents/` tree per the manifest rules

### Requirement: Architect role SHALL own design docs at escalated tier

The role catalog MUST include `architect`. Dispatch MUST use the `escalated` model tier. `architect` MAY write only design-document paths in task-card `Artifacts` (default `openspec/changes/<name>/design.md` when a change exists) and MUST NOT modify production or test code. Manual dispatch MUST remain available when a role contract is present.

#### Scenario: Architect default tier is escalated

- **WHEN** the organizer dispatches `architect`
- **THEN** the task card's model tier is `escalated` and the organizer resolves that tier from the project role configuration

#### Scenario: Architect design-doc write is accepted

- **WHEN** `architect` writes only paths listed in `Artifacts` that are design documents
- **THEN** the organizer accepts the write set for boundary purposes

#### Scenario: Architect touching production code is rejected

- **WHEN** `architect`'s diff modifies a production or test file
- **THEN** the organizer rejects that result

### Requirement: Design-phase architect dispatch SHALL use an explicit-or-verifiable gate

When a role contract is present, `leader` (for `Phase: design`) MUST auto-dispatch `architect` after solution selection and before solution review iff an explicit architecture mark or a verifiable architecture signal holds. Otherwise it MUST NOT auto-dispatch `architect`. The match or miss MUST be recorded. Signal definitions live in the role contract.

#### Scenario: Explicit mark triggers dispatch

- **WHEN** a role contract is present and the user marks `architecture: true`
- **THEN** `leader` dispatches `architect` after solution selection and before solution review

#### Scenario: Verifiable signal triggers dispatch

- **WHEN** a role contract is present and the selected solution proposes a new top-level module directory
- **THEN** `leader` dispatches `architect` and records that signal as the gate match

#### Scenario: No mark and no signal skips auto-dispatch

- **WHEN** a role contract is present but neither an explicit mark nor a verifiable signal holds
- **THEN** `leader` does not auto-dispatch `architect`

### Requirement: Leader meta-role SHALL schedule subordinates by phase

The role catalog MUST include meta-role `leader`. When a role contract is present, PDCA hosts that opt into role dispatch MUST dispatch `leader` with a task card that includes `Phase` (`clarify`|`design`|`implement`|`verify`|`release`|`retrospect`). `leader` MUST select subordinates per the contract's phase defaults and gates, fail-closed-accept nested cards, and return one aggregated leader card. Default model tier for `leader` is `escalated`.

#### Scenario: Host dispatches leader for design phase

- **WHEN** a role contract is present and the host reaches the design-phase role boundary
- **THEN** the host dispatches `leader` with `Phase: design` and fail-closed-accepts the leader card

#### Scenario: Leader surfaces nested FAIL

- **WHEN** a required subordinate returns `Verdict: FAIL`
- **THEN** the leader card is `FAIL` and the host does not treat the phase as passed

### Requirement: Role catalog SHALL include the agreed subordinate ids

The contract MUST list subordinate roles `product-manager`, `designer`, `architect`, `developer`, `tester`, `code-reviewer`, `security-reviewer`, `debugger`, `perf-engineer`, `releaser`, `tech-writer`, `researcher`, and `retrospector`. Existing ids `developer`, `tester`, `code-reviewer`, and `architect` MUST keep those names.

#### Scenario: Catalog enumerates product-manager

- **WHEN** a reader opens the role contract catalog
- **THEN** it includes `product-manager` and does not rename `developer`

