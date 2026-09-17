## Context

`goal-driven-queue` currently invests entirely in unattended *execution*. This change adds the missing *selection* layer. The behavioral contract is owned by three specs: modified `goal-queue` plus new `goal-queue-triage` and `goal-queue-reuse`.

Two normative rules are deliberately **not** frozen in the specs, because they are implementation-level derivations that must be applied uniformly and are easier to correct in one place: the **signal → certainty/difficulty band** derivation (required by `goal-queue-triage`'s assessment requirement) and the **information-leverage count** derivation (required by its ordering requirement). They are fixed here.

Constraints from the repository: skill bodies are English with Chinese triggers; `description` ≤1024 characters; OpenSpec artifacts are the traceability carrier; thin references replace restated methodology; the repo prefers coarse bands over false precision.

## Goals / Non-Goals

**Goals:**

- Eliminate work before it is interviewed (equivalence merge, root-cause clustering, kill) without letting an unattended run discard human intent.
- Give each card a derived certainty/difficulty band that doubles as an ordering key and a routing-recommendation feed, resting only on independently verifiable inputs.
- Order coupled cards so the resolution that retires the most downstream work runs first.
- Let a solved problem class seed the next equivalent card's intake instead of re-interviewing it.

**Non-Goals:**

- Parallel or slot-based consumption (deferred to a separate change; includes worktree-mandatory isolation, single-writer progress accounting, and cap splitting).
- Exploration-cost amortisation and acceptance merge compression (separate change).
- Retroactive triage of cards already sitting in a queue.
- Numeric certainty scoring.
- Any scheduler, daemon, or new process.

## Decisions

### D1 — Certainty/difficulty band is **derived** from four signals, never asserted

Signals and their classification:

| Signal | Values | Why factual |
|---|---|---|
| `reversibility` | one-way \| two-way | Checkable: does the card touch a data migration, a public contract, or a destructive operation? |
| `evidence` | red-check-exists \| mechanism-confirmed \| none | Checkable: does a failing reproduction exist; do the named symbols/paths exist? |
| `blast_radius` | isolated (≤1 module) \| contained (2–3) \| cross-cutting (≥4 or public contract) | Checkable against the card's Constraints (declared files/dirs) |
| `dependency_shape` | none \| fan-in only \| fan-out only \| both/cyclic | Checkable from `Waits-on` in/out degree |

Derivation (three coarse values):

- **high-certainty/low-cost** ⇔ `reversibility = two-way` **and** `evidence ∈ {red-check-exists, mechanism-confirmed}` **and** `blast_radius ∈ {isolated, contained}` **and** `dependency_shape ∈ {none, fan-in only}`.
- **uncertain** ⇔ `evidence = none` **or** `dependency_shape ∈ {both/cyclic}`.
- **high-cost** ⇔ `reversibility = one-way` **or** `blast_radius = cross-cutting`.

When more than one applies, the band takes the **most conservative** applicable value (high-cost > uncertain > high-certainty/low-cost). Rationale: the band's only privileged use is unlocking routing defaults; erring conservative costs one question, erring permissive risks an unasked routing decision.

**Alternatives considered:** (a) let the interviewer assign the band directly — rejected: that is exactly the unverifiable per-card judgment the review rejected, since it escapes the consumption-entry factual check; (b) a numeric score — rejected: false precision, and the repo prefers coarse bands; (c) skip the band and keep both tickets mandatory — rejected: it discards the ordering key, which is half of the lever's value.

### D2 — Routing defaults unlock only on **all-factual, verified** inputs

The gate requires: every signal input is `factual`, every `factual` signal passed consumption-entry verification, and the derived band is high-certainty/low-cost. Any `preference` input or any failed verification keeps both the engine and policy tickets mandatory with no default. Rationale: this makes the gate rest on checkable inputs rather than on the band as an assertion.

### D3 — Information-leverage count is a bounded graph quantity

`leverage(card) = |{ p ∈ pending : p ≠ card ∧ p is retired-if(card) }|`, where `p` counts if either:

1. `card` is reachable from `p` through the `Waits-on` closure (the transitive closure of the dependency DAG within the bound queue), or
2. `p` and `card` are members of one root-cause cluster and `card` is that cluster's folded representative.

Cards not in `pending` (`done`, `skipped (covered)`, parked) are excluded. Recomputation happens at every completion boundary; when recomputation changes the head of the queue the event is written to the progress document's Notes so the reordering is auditable. Cost is bounded by the pending set, which is queue-scale (worst case quadratic) — acceptable.

**Alternatives considered:** (a) let the orchestrator estimate leverage by feel — rejected: unverifiable and non-reproducible; (b) only count `Waits-on` dependents, ignoring clusters — rejected: it undercounts the pruning effect that root-cause folding was introduced to capture.

### D4 — "Mechanically provable" has a narrow definition

Automatic application is limited to two cases, each checkable from card fields plus a report path:

- **Equivalence:** the same problem signature **and** the same target path set (exact match). A near-match that requires judgment is not equivalence.
- **Already-covered:** a `done` card's completion report covers this card's stated outcome, and the report path is recorded on the archived card.

Everything else — including any "not worth doing" judgment — is presented for human confirmation.

### D5 — Kill is recorded reversibly

Superseded cards are **archived, never deleted**, inside the bound queue directory, each carrying `superseded-by: <slug-or-report-path>`. Rationale: this keeps the only non-obvious automated action reversible without depending on git history, and it makes the triage record the audit trail for "why did my card disappear".

### D6 — Proxy authority stops at value judgments

Under `Stage-exit policy: ai-proxy` the proxy may grant the batch approval as bounded pre-authorization and mechanical outcomes apply without confirmation, but the proxy **MUST NOT** confirm a value-judgment kill: discarding a card a human submitted is outcome acceptance, which stays human-only. On hit, the item is ticketed and parked as `conflict pending confirmation`. Proxy-made triage decisions are recorded in the triage record and surfaced in the acceptance package's needs-your-judgment section.

### D7 — Reuse records are queue-local; promotion is delegated

Reusable approaches live at `.goal-driven/queues/<queue-id>/approaches/<signature>.md` (git-trackable, inside the queue's existing write scope). Promotion into a shared carrier (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, project-local skill) is governed by `learn-and-improve`'s carrier decision tree — recommend-only, requiring an explicit user request.

**Alternatives considered:** writing project-level knowledge directly into the target project's skills or rules files — rejected: it crosses into a shared, hard-to-reverse carrier and bypasses the one-way-door gate `learn-and-improve` owns.

### D8 — Cross-skill reference discipline

Hard frontmatter `dependencies` stay as today (missing ⇒ abort): `goal-driven-workflow`, `design-approval-gate`, `intake-interview-discipline`, `ai-proxy-discipline`, `jira-fix-workflow`, `opsx-jira-fix-workflow`. `evolution-review` (kill vocabulary, record-the-failed-recipe), `learn-and-improve` (carrier tree), and `solution-review` (reversibility / CBAM / WSJF vocabulary) are **thin references only, not declared**: a missing vocabulary source degrades the richness of a recommendation, never a gate, so declaring them would over-declare and break existing installs.

## Risks / Trade-offs

- **Assessment mis-graded, silently defaulting routing** → input signals are all factual and verified at the consumption-entry check; the band is derived by one uniform rule; any `preference` input disables the default. Residual: the derivation rule itself (D1) is an unverified choice — a systematic error here would affect all cards visibly rather than one card silently.
- **False equivalence archives a wanted card in absence mode** → narrow mechanical definition (D4), reversible archive (D5), triage record in the acceptance package. Residual: detection is late (at acceptance, not at the moment of archiving). Accepted — the alternative (never auto-applying anything) forfeits the lever's whole benefit.
- **`Waits-on` cycle or non-`done` target stalls dependents** → cycles and non-`done` terminal states both park the affected cards as `conflict pending confirmation` without blocking others.
- **Reuse seed propagates a stale approach** → records must pass `factual` verification before seeding; failure falls back to a full intake; the human still approves.
- **Ordering change surprises users** → the priority level still dominates; only within-level order changes; legacy cards without new fields behave exactly as before; the reordering event is logged.
- **Batch approval degrades into rubber-stamping** → the batch approval displays per-item triage outcomes and the Decisions-I-made section; value-judgment kills are never batch-applied. Residual: a large batch still invites skimming — mitigate by keeping batches to the cards of one enqueue interaction; accepted.
- **Change amplification across three capability files** → the consumption-order sequence is stated once (in `持久 backlog 载体`) and referenced elsewhere, not restated; the leverage mechanism is owned by `goal-queue-triage`.
- **Mid-run discovered cards bypass triage** → recorded as a known boundary: those cards still pass the dispatch-time relationship pass (dependency / overlap / derived) and, for the case that matters most, the already-covered check; pending-to-pending equivalence added mid-run remains undone, exactly as in the baseline (no regression).

## Migration Plan

- **No data migration.** Legacy cards carrying none of the new fields are consumed exactly as before (spec scenario 存量卡行为不变).
- **Deployment order for this change's own implementation:** edit `skills/goal-driven-queue/SKILL.md` and `reference.md` first, then `evals/evals.json`, then let the pre-commit hook regenerate `docs/generated/skills-index.md`, then archive the OpenSpec change.
- **Rollback:** `git revert` the change; the contract text and evals revert cleanly. Note: reverting the skill text does **not** un-archive cards already archived in a user project — the triage record names each archived card and its covering report, so restoration is a manual, documented step.

## Open Questions

- **Jira list-enqueue shortcut wording.** The unmodified `Jira 列表入队捷径` requirement still says "skip the **mandatory** engine ticket". After this change the ticket is conditional rather than universally mandatory, so the adjective is stale. Decided: accept it rather than add a seventh MODIFIED requirement for a zero-behavior-change wording fix; the shortcut's own behavior (Engine frozen by the caller) is unaffected.
- **Queue-level checklist triage item.** Decided not to add a dedicated checklist item: the triage record already rides the acceptance package, and the existing "progress-document completeness" item covers discovery notes. Adding one would duplicate.
- **Extending `消费入口事实性代答实证` to assessment signals.** Decided not to extend it: `goal-queue-triage` owns signal verification and reuses the same `factual`/`preference` vocabulary, so extending the older requirement would duplicate the rule in two places.
- **Whether to keep the routing-default BREAKING at all.** It carries the highest guardrail cost for the smallest benefit (saving one ticket inside the high-confidence band). Retained per the user's explicit choice of the maximum-efficiency option; if the guardrail proves costly in practice, dropping the default (keeping the assessment as a recommendation only) removes the highest-risk item at modest value loss.
