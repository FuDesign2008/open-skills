## Why

Callee skills often maintain exhaustive "Integrated by / Strongly depended on by" host name lists. That duplicates the authoritative host `dependencies` edge, drifts when hosts change, and conflicts with AGENTS.md: "被依赖的 skill 不需要反向声明." Solution 3: codify no-authoritative-reverse-list policy and scrub existing enumerations repo-wide (role phrases only).

## What Changes

- Clarify in `AGENTS.md` (Skill 精简 / dependencies section): callees MUST NOT treat reverse integrator name lists as contract; optional role phrase ("Referenced by PDCA hosts") only; hosts + `AGENTS` dependency table remain SoT.
- Scrub callee `SKILL.md` (and descriptions) that enumerate the four PDCA hosts as reverse deps — replace with role phrases.
- **MODIFIED** `openspec/specs/learn-and-improve`: remove the requirement that MUST list Jira/solve integrators by name; replace with no-authoritative-reverse-list behavior.
- Add capability `skill-dependency-direction` for the authoring contract.

## Capabilities

### New Capabilities

- `skill-dependency-direction`: dependency edges are host→callee only; callees do not maintain authoritative reverse integrator name lists; description stays routing-only (no host dependency graphs).

### Modified Capabilities

- `learn-and-improve`: drop "MUST list integrators by name"; adopt role-phrase / no reverse-list contract.

## Impact

- Many shared skills under `skills/` (learn-and-improve, solution-review, code-design-review, hybrid-debug, runtime-evidence-debug, browser-debug-toolkit, upstream-dependency-debug, analysis-core, clarifying-question-discipline, known-issue-research, workflow-mode-lifecycle, merge-discipline descriptions, etc.)
- `AGENTS.md`, `docs/generated/skills-index.md` (description changes)
- OpenSpec: new `skill-dependency-direction` + modified `learn-and-improve`
