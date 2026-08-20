## Why

Post-merge fidelity audit against the source paradigm (KM article + bulb campaign) found six deviations, grep-verified: (1) the corpus seeds are knowledge tables, not the source's step-by-step attribution/optimization pipelines — seeding from them would produce reference-doc-shaped project skills, betraying the "methodology fixed as a reproducible pipeline, not prompt luck" core claim; (2) no multi-perspective review of the project skills themselves (the article's Agent-Teams half of "skills are code too"); (3) no cross-invocation contract (the article's optimizer Step 6 calls code-insight); (4) technology-selection decisions in Optimize are not escalated to the user (the article's AskUserQuestion discipline); (5) our A/B judge is strictly stricter than the source (no "certainly-correct micro-optimization" exception) — an intentional divergence, recorded not restored; (6) bulb's scenario-inventory and long-session-degradation increments were flattened into workload names.

## What Changes

- `reference.md` gains **Part 5 — Seed pipeline templates**: JS-stack `code-insight` pipeline template (generalized from the bulb model: harness baseline → trace attribution → framework rendering analysis → domain-specific dimensions → long-session degradation → ultimate control experiment → memory/GC → loading; with the bottleneck-report output template) and `code-optimizer` template (understand context → stack best-practice audit → allocation optimization → data-structure review → dataflow/cache → deep-attribution step delegating to the project's `code-insight` → correctness verification). Parts 1/2 re-hung as knowledge attachments per pipeline step; C++ seed slot stays empty pending validation
- SKILL.md Stage 5 seeding contract: the code-optimizer seed MUST include a deep-attribution step that delegates to the project's `code-insight` (③)
- SKILL.md Optimize principles: technology-selection decisions (new dependency / data-structure replacement / memory strategy) list options with trade-offs and escalate to the user (④)
- SKILL.md Skill evolution: updates to the project skills are reviewed from the stack's specialist perspectives (language / runtime / hardware, generalized — no fixed role count) before landing (②)
- SKILL.md harness contract: scenario inventory first (build/read the user-scenario inventory before planning workloads) + long-session degradation as its own problem class (session/switch/history-class loads, trend slope and inflection analysis) (⑥)
- (⑤) A/B strictness recorded as an intentional divergence in the loop section's design note (agents overestimate "certainly correct"; the hard statistical gate stays; restoring the exception would require static equivalence proof + user confirmation)
- **Non-goals**: shipping C++ pipelines (slot only); changing the nine disciplines; changing the A/B acceptance rule itself

## Capabilities

### Modified Capabilities

- `perf-optimize-workflow`: seeding contract gains pipeline shape + cross-delegation; Optimize gains selection-escalation; skill evolution gains multi-perspective review; harness contract gains scenario inventory + degradation class; knowledge-layer requirement extends to Part 5 templates

## Impact

- Modified: `skills/perf-optimize-workflow/SKILL.md` (5 spots), `skills/perf-optimize-workflow/reference.md` (Part 5 + reading guide + Parts 1/2 re-hang note), main spec after archive
- Behavior: seeded project skills are pipeline-shaped from day one; campaigns escalate tech-selection decisions; skill updates get specialist review; workload planning starts from a scenario inventory
- Risk: corpus growth (reference.md ~+120 lines, still fine); no breaking contract changes
