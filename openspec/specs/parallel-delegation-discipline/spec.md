# parallel-delegation-discipline Specification

## Purpose
TBD - created by archiving change parallel-delegation-discipline. Update Purpose after archive.

## Requirements

### Requirement: Parallelism SHALL require a verifiable admission test

The discipline MUST admit a set of work units to parallel execution only when **every** admission condition holds. Each condition MUST be checkable from an artifact, a command, or a path set — the discipline MUST NOT admit units on an unverifiable judgement such as "these look independent".

The admission conditions are:

1. **Dependency independence** — no unit depends on another unit's output (no dependency edge in the plan between them).
2. **Disjoint write sets** — when any admitted unit writes, every unit declares its write set as a path or module list, and the pairwise intersection of those declared sets is empty.
3. **Distinct artifact sinks** — each unit writes to its own artifact path; no two units target the same file.
4. **Cost threshold** — the unit count is at least 3 and at most 5 by default; fewer than 3 units MUST run serially.
5. **Gate compatibility** — no admitted unit is a gate, an approval, a stage transition, or an item on the serial reservation list; a declared dependency between two admitted units (for example a standard review that an escalated review depends on) resolves before dispatch rather than inside the parallel set.

When any condition fails, the unit set MUST run serially and the run MUST state which condition failed.

#### Scenario: Disjoint read-only units are admitted

- **WHEN** an analysis or verification stage produces 3–5 units with no dependency edge between them and no write set at all
- **THEN** the units are admitted to parallel execution and the run states the unit count and the split basis

#### Scenario: Overlapping write sets are refused

- **WHEN** two candidate units declare write sets whose intersection is non-empty
- **THEN** neither is admitted to the parallel set; the affected work runs serially and the run names the overlapping path

#### Scenario: Two units are not parallelized

- **WHEN** only two independent units exist
- **THEN** they run serially because the cost threshold requires at least three units

#### Scenario: Unverifiable independence is not admitted

- **WHEN** the only basis for parallelizing two units is a statement that they "seem unrelated", with no dependency field or path set to check
- **THEN** the units run serially

### Requirement: Parallel execution SHALL use one of four declared composition modes

The discipline MUST select and state one composition mode from: **sectioning** (independent subtasks of one decomposition), **voting** (the same object judged independently by several units), **orchestrator-workers** (subtasks determined at run time rather than known up front), and **pipeline** (stages with declared dependencies that may still overlap). The selected mode MUST be stated with the split basis so the collection step knows what it is merging.

#### Scenario: Voting mode for an adversarial judgement

- **WHEN** the review stage needs independent judgements of the same artifact
- **THEN** the run selects voting mode, keeps each unit blind to the others' framing, and states that blindness as part of the split basis

### Requirement: Delegated units SHALL return a bounded summary, not a transcript

Every delegated unit MUST receive a self-contained instruction; the unit MUST NOT be assumed to inherit the host session's history. Every unit MUST return a bounded summary rather than its working transcript. The generic summary MUST carry: the conclusion, the supporting evidence (a command with its output summary, or a file-and-line reference), the artifact path produced, and any unresolved item. The summary size bound and the re-compression duty are owned by `context-budget-discipline`; this discipline references them and MUST NOT restate their numeric limits.

When the project provides a role contract under `agent-role-separation`, that contract's task card and result card are authoritative: the host MUST use those fields and acceptance rules, and this discipline MUST NOT restate them or introduce a competing card shape.

#### Scenario: Unit returns a summary with evidence

- **WHEN** a delegated unit finishes
- **THEN** its return carries a conclusion, at least one evidence reference, the artifact path, and any unresolved item, within the bound owned by `context-budget-discipline`

#### Scenario: Oversized return is re-compressed

- **WHEN** a delegated unit returns more than its summary contract allows
- **THEN** the host requests a condensed summary instead of ingesting the full output

#### Scenario: Instruction is self-contained

- **WHEN** a unit is delegated
- **THEN** its instruction states the task, the allowed scope, the expected artifact, and the return contract, without relying on the host's conversation history

#### Scenario: Role contract wins when present

- **WHEN** the project provides a role contract and a unit is dispatched as a role
- **THEN** the host uses that contract's task card, result card, and fail-closed acceptance rules, and the discipline supplies only the parallel admission and collection layer

### Requirement: Collected results SHALL be treated as unverified claims

After parallel collection, the host MUST treat every unit's self-report as an unverified claim and MUST check it before the results support a stage exit. The check MUST include a conflict check across units' declared write sets and a fresh-evidence check per `completion-evidence-discipline`. A unit report alone MUST NOT satisfy a stage gate.

#### Scenario: Unit claims completion without evidence

- **WHEN** a unit reports success but supplies no command output, diff, or artifact path
- **THEN** the host does not accept the claim; the item stays pending or the unit is re-run

#### Scenario: Conflicting writes are detected at collection

- **WHEN** two units' reported artifacts touch the same path despite an admitted disjoint write set
- **THEN** the host stops the merge of those results, reports the conflict, and re-runs the affected work serially

### Requirement: Serial reservation SHALL keep gated and authoritative actions single-threaded

The discipline MUST reserve the following to serial execution regardless of the admission test: stage transitions and stage exits; approval gates (`design-approval-gate` and any human checkpoint); merges, releases, and protected-branch operations; Jira status transitions and writeback; writes to a shared file or a shared OpenSpec change; the final cross-axis verdict; and evidence acceptance. Parallel execution MUST NOT reorder, skip, or pre-approve any reserved item.

#### Scenario: Parallel analysis does not advance the stage

- **WHEN** a parallel analysis set completes
- **THEN** the host still runs the stage exit and its confirmation serially, and the parallel work alone does not advance the workflow

#### Scenario: Jira writeback stays serial

- **WHEN** a Jira host runs any stage in parallel
- **THEN** the Jira status transition and the fix comment remain serial single-owner actions

### Requirement: Parallel execution SHALL isolate writes and disclose its plan

When the admitted set includes writing units, each writing unit MUST run in its own isolated workspace created through `git-worktree-discipline`; the discipline MUST NOT define its own worktree procedure. Before the units start, the host MUST state the parallel plan — unit count, split basis, and per-unit write set or isolated workspace — inside the existing stage-confirmation output, adding no new pause and no new approval event. The user MUST retain a serial override: a stated request to run serially makes the current run serial and the run MUST record that choice with its reason.

#### Scenario: Writing units get isolated workspaces

- **WHEN** an admitted unit set includes file writes
- **THEN** each writing unit runs in an isolated workspace created per `git-worktree-discipline`, and the plan names that workspace

#### Scenario: Plan is disclosed without a new pause

- **WHEN** the host is about to run a parallel unit set
- **THEN** the parallel plan appears in the stage-confirmation output already required by the host, and no additional confirmation step is introduced

#### Scenario: User override is honored and recorded

- **WHEN** the user requests serial execution while a parallel set is admissible
- **THEN** the run executes serially and records the override with its reason

### Requirement: The discipline SHALL stay platform-agnostic, declarative, and cost-aware

The discipline's body MUST describe intent — delegate independent units to clean contexts, collect bounded summaries, isolate writes, keep failures from cancelling siblings — and MUST NOT name a platform-specific delegation tool or enumerate a per-platform tool matrix. The discipline MUST remain declarative: it MUST NOT introduce runtime slots, watchdogs, schedulers, queue processes, or background-process mechanics; those belong to the host adapter layer. The discipline MUST state the cost posture: parallel delegation multiplies token spend against serial execution and MUST NOT be presented as cheaper; the default unit bound is 3–5 and a larger set requires a stated reason.

#### Scenario: No platform tool is named

- **WHEN** a reader searches the discipline's body for a platform-specific delegation, background-execution, or agent-type token
- **THEN** none is present; only intent wording and the admission/collection contracts appear

#### Scenario: Larger sets require a reason

- **WHEN** a run proposes more than five parallel units
- **THEN** the plan states the reason the larger set is justified

### Requirement: The discipline SHALL declare its boundaries against adjacent skills

The discipline MUST reference, not restate, the adjacent contracts: `context-budget-discipline` owns the summary bound and compaction, `git-worktree-discipline` owns workspace isolation, `completion-evidence-discipline` owns fresh-evidence acceptance, and `goal-driven-queue` owns card-level slot concurrency. The discipline MUST NOT duplicate those skills' rules, and hosts that already carry them MUST NOT gain a second copy through this discipline.

#### Scenario: Summary bound is referenced not copied

- **WHEN** the discipline states the delegated-unit return contract
- **THEN** it points at `context-budget-discipline` for the numeric bound instead of stating a number of its own

#### Scenario: Queue concurrency remains separately owned

- **WHEN** a reader compares this discipline with `goal-driven-queue`'s concurrency rules
- **THEN** card-level slot dispatch and module-set admission remain described only in `goal-driven-queue`
