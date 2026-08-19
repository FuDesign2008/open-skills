## Why

Second fidelity audit (grep-verified) found four remaining gaps beyond the first round's six: (A) A/B arm-environment contamination — bulb pitfall #6: hot-reload state after code switching (mixed old/new modules, duplicated singletons) systematically pollutes one arm of an interleaved A/B comparison; the nine disciplines miss this fourth trap class (environment-state validity specific to comparison experiments); (B) the probe-script engineering pattern — bulb's 8 `probe-*.js` attribution probes are what made its code-insight executable rather than prose; the seeding contract never mentions them, so seeded skills degrade into "reads right, runs nowhere" pipelines; (C) seed-time specialist review missing — the article's Agent-Teams review applies at skill creation too, but last round's fix only attached review at evolution time; (D) reading-priority rules from the bulb pipeline (penetration threshold applies to interaction phase only; first-screen ~100% is normal; LongTask tiering >50 investigate / >100 severe) not carried into the JS seed.

## What Changes

- SKILL.md Evidence Validity Disciplines gains **discipline 10: comparison-experiment environment-state validity** — after code switching between arms, hot-reload/stale-module state pollutes the comparison; verdict rule: optimizations touching module structure require an environment restart/hard-refresh between arms; mounted at loop steps 3-4 (between code switch and judge)
- SKILL.md harness contract gains the **probe-script pattern**: every recurring attribution question is sedimented as a reusable probe script under the harness (convention `probe-*`); pipeline steps in the project's code-insight invoke probes instead of ad-hoc scripting; probes are part of what the first campaign seeds and later campaigns evolve
- SKILL.md seeding contract: after seeding, run the specialist-perspective pass over the seeded content before landing (extends last round's evolution-time review to seed time)
- reference.md Part 5 code-insight step 1 gains the reading-priority rules (open-cost vs scale linearity; penetration threshold = interaction phase only, first-screen ~100% normal; LongTask >50 investigate / >100 severe), as JS-stack knowledge attachment
- **Non-goals**: renumbering existing disciplines (10 appends); changing the A/B statistical rule; C++ seed content

## Capabilities

### Modified Capabilities

- `perf-optimize-workflow`: disciplines become ten (appended environment-state validity); harness contract adds probe-script pattern; seeding contract adds seed-time review; Part 5 gains reading-priority attachment

## Impact

- Modified: `skills/perf-optimize-workflow/SKILL.md` (disciplines table + gate-rule line, harness contract, seeding contract ×2), `skills/perf-optimize-workflow/reference.md` (Part 5 step 1), main spec after archive
- Behavior: A/B runs restart the environment between arms when module structure changed; seeded skills carry probe scripts and get reviewed at seed time
- Risk: none structural; discipline count referenced as "nine" in description and spec must be updated consistently
