## Context

See `proposal.md` § Why for the motivation. The relevant current state:

- The four hosts carry zero `sub-agent|parallel` instructions; the only parallel-permitting text in the repository is `staged-review-flow`'s unenforced "Axes MAY run in parallel".
- Four adjacent shared skills already own pieces of the problem space and must not be duplicated: `context-budget-discipline` (summary bound, compaction, ledger), `git-worktree-discipline` (workspace isolation), `completion-evidence-discipline` (fresh-evidence acceptance), `goal-driven-queue` (card-level slot concurrency and module-set admission).
- Repository constraints that shape the design: 铁律 6 (skill bodies describe intent, never a per-platform tool matrix), 铁律 7 (`description` ≤1024 chars, single-line double-quoted), the "rules are written once" simplification rule, and the thin-reference integration pattern used by `staged-review-flow` / `analysis-core`.

## Goals / Non-Goals

**Goals**

- One authoritative place to answer: may these units run in parallel, how are they split, what comes back, what must stay serial.
- Hosts gain parallelism without gaining methodology paragraphs: one pointer per affected stage.
- Every admission condition is checkable from an artifact, a command, or a path set.
- Any run that selects no parallelism is behaviorally identical to today.

**Non-Goals (design-level)**

- Not a scheduler: no slots, queues, caps, or backlogs (those belong to `goal-driven-queue`).
- Not a context strategy: no threshold table, no ledger format, no summary size number (owned by `context-budget-discipline`).
- Not an isolation toolkit: no worktree creation or cleanup procedure (owned by `git-worktree-discipline`).
- No new user-facing trigger is required to enable parallelism, and no new approval event is introduced.

## Decisions

### D1 — A standalone `-discipline` skill rather than extending an existing one

**Chosen:** new `skills/parallel-delegation-discipline/`.

**Alternatives:** (a) inline the rules in each of the four hosts — four copies that drift, and violates "rules are written once"; (b) extend `staged-review-flow` — that skill's scope is the review stage only, so analysis and verification could not reference it, and its name would misdescribe the content; (c) extend `context-budget-discipline` — the two concerns are orthogonal (one is "how much context", the other is "how many parallel contexts"), and that skill is already a dependency of several hosts, so changes there have a wider blast radius.

**Rationale:** the admission test is a distinct contract with its own role in the taxonomy (`-discipline`), and a standalone skill lets all four hosts plus any future host reference one source.

### D2 — Admission conditions are facts, not judgements

**Chosen:** five conditions, each resolvable without AI discretion — dependency edge absent, declared write sets with empty pairwise intersection, distinct artifact sinks, unit count within 3–5, and no reserved (gated) item in the set.

**Alternatives:** a prose criterion such as "units must be independent" — rejected because it is unfalsifiable and is exactly the failure mode 铁律 10 warns about (a gate whose input is AI judgement is not a gate).

**Rationale:** the write-set condition is the same shape as `goal-driven-queue`'s machine-readable `Modules:` admission, which already proved that a path-set intersection is checkable in this repository. Reusing the shape keeps the two concurrency layers consistent without merging them.

### D3 — Default 3–5 units, not "as many as possible"

**Chosen:** lower bound 3 (sets of 1–2 run serially), upper bound 5 by default, larger sets require a stated reason.

**Alternatives:** platform maximum (20 concurrent) — rejected; published engineering data puts the practical sweet spot at 3–5 workers, and multi-agent spend is roughly 15× a chat while coding work has fewer parallelizable units than research. A 20-unit fan-out on a coding task spends the cost without the parallelizable benefit.

**Rationale:** the bound encodes the cost posture in the skill so hosts do not each re-derive it, and the "state a reason above 5" clause keeps the escape available without making it the default.

### D4 — Four named composition modes instead of one generic "run in parallel"

**Chosen:** sectioning / voting / orchestrator-workers / pipeline, each stated with its split basis.

**Alternatives:** no taxonomy — rejected because the collection step differs materially: voting must keep units blind to each other, orchestrator-workers must decide the split at run time, pipeline must respect declared dependencies. Naming the mode is what tells the collector whether merging is legitimate.

**Rationale:** this mirrors the established pattern taxonomy in Anthropic's agent-building guidance, so it is recognizable, and each mode maps to a stage the hosts already have (sectioning → analysis/verification, voting → review axes, orchestrator-workers → research/batch, pipeline → cross-stage overlap).

### D5 — Invariants live in the discipline; wiring lives in the hosts

**Chosen:** the discipline owns the admission test, modes, return contract, collection duty, reservation list, and cost posture. Each host owns only: the dependency declaration, one pointer per affected stage, and the place where the parallel plan is announced (its existing stage-confirmation output).

**Alternatives:** a host-local `parallel:` plan block — rejected; it would introduce a second artifact schema and a new pause, contradicting the "no new approval event" decision.

**Rationale:** this is the same thin-reference shape the repository already uses for `analysis-core` and `staged-review-flow`, so it needs no new integration concept.

### D6 — Write parallelism gated on isolation plus disjointness, and admitted only after the read-only stages

**Chosen:** writing units require (a) an empty write-set intersection at admission and (b) one isolated workspace per writing unit via `git-worktree-discipline`; hosts admit parallel writing only in their execution stage — stages 1–5 of the solve hosts keep their no-business-code-write rule.

**Alternatives:** allow parallel writes in any stage — rejected; analysis is read-only by contract (`analysis-core`'s temporary-change gate), and permitting writes there would silently widen the analysis stage's authority. Allow writes only when the user opts in — rejected because the user already chose "host creates the worktree automatically, approved with the stage confirmation".

**Rationale:** isolation and disjointness are independent safety conditions; requiring both keeps a single mistake from producing an overwrite, and the stage restriction keeps each host's existing authority boundary intact.

### D7 — Compose with `agent-role-separation` instead of defining a second card contract

**Chosen:** when the project provides a role contract (`.claude/agents/_contract.md` by default), that contract's task card, result card, fail-closed acceptance, and write boundaries are authoritative; the discipline contributes only the parallel admission and collection layer. When no role contract exists, the discipline's generic summary fields apply.

**Alternatives:** define the return contract here and let hosts choose — rejected; two authoritative card shapes in one repository is exactly the drift the "rules are written once" rule forbids, and `agent-role-separation` already owns fail-closed acceptance and write boundaries.

**Rationale:** `agent-role-separation` is a repository-level configuration (not part of the skill installation surface), while this discipline is a distributed skill. The discipline therefore must not depend on that contract being present; it names it as the preferred shape when present and keeps a generic fallback for other projects.

### D8 — Declarative only: no runtime mechanics

**Chosen:** the discipline describes admission, composition, collection, and reservation rules; it introduces no slots, watchdogs, schedulers, or background processes.

**Alternatives:** mirror the queue's slot machinery — rejected; `docs/super-agent-essence-analysis.md` § 7 records that concurrency slots belong to the host adapter layer, not to a declarative skill library, and `goal-driven-queue` already owns the one slot implementation this repository has.

**Rationale:** a declarative contract travels across platforms; runtime mechanics do not.

### D9 — Sub-agent output is a claim until the host re-checks

**Chosen:** collection is a host duty with two checks — a cross-unit write conflict check and a fresh-evidence check per `completion-evidence-discipline` — and a unit's self-report alone cannot satisfy a stage gate.

**Alternatives:** trust the summary — rejected; this is the same anti-sycophancy failure `ai-proxy-discipline` documents for same-context review, and the repository already has a discipline that forbids accepting prior-turn or agent-asserted evidence as fresh.

**Rationale:** parallelism multiplies the number of unverified claims entering the host, so the collection duty must be explicit even though the evidence rule itself is owned elsewhere.

## Risks / Trade-offs

- **Token cost rises steeply under parallelism** → the 3–5 bound, the ≥3 lower bound, and an explicit "parallelism is not cheaper" statement in the discipline; the cost posture is stated once rather than per host.
- **A delegated unit is anchored by the host's framing** → voting mode requires units to stay blind to each other's framing, and the instruction must be self-contained rather than a pointer into conversation history.
- **Conflicting writes slip through admission** → collection re-checks the reported artifacts against the declared write sets and stops the merge of results when they disagree.
- **Hosts drift by re-explaining the method** → the requirement text says "at most one pointer per stage" and the discipline's boundary requirement forbids duplication; review of the host diff checks for restated prose.
- **A user is surprised by parallel execution** → the plan is announced in the existing stage-confirmation output, and a stated serial request overrides parallelism for the run with the reason recorded.
- **`staged-review-flow`'s "MAY" becomes a hard requirement by accident** → the modified requirement keeps it permissive ("MAY run in parallel") and only redirects the method to the new discipline.
- **Two competing result-card shapes** → D7 makes `agent-role-separation` authoritative when present and restricts the discipline to the parallel layer; a review grep checks that the discipline does not restate `Verdict`/`Confidence`/`Model tier`.
- **Drift against a moving `main`** → `main` advanced during planning (role contract, Stage 8 split, super-agent analysis); the change was rebased and these three inputs were read before execution, and the same sync check runs before the final verification.

## Migration Plan

1. Add `skills/parallel-delegation-discipline/SKILL.md` (add `reference.md` only if prompt/summary templates push `SKILL.md` past its budget).
2. Add the dependency line and stage pointers to the four hosts, one stage at a time, so each diff stays reviewable.
3. Reword the single sentence in `staged-review-flow`.
4. Update the `AGENTS.md` dependency table and regenerate `docs/generated/skills-index.md`.
5. Run `npm run lint:skill-description`, `npm run lint:deid`, the skills-index consistency check, and `openspec validate --strict --all`.

**Rollback:** remove the dependency line and the pointer paragraphs from the four hosts and delete the skill directory; no other file carries behavioral content, so rollback restores the exact prior behavior.

## Open Questions

None that would change the specs, the approach, or the task breakdown. Whether `reference.md` is needed is deferred to implementation and depends on the final `SKILL.md` length.
