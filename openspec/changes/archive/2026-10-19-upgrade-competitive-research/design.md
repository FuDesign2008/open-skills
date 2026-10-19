# Design: upgrade competitive research

## Context

Problem-solving hosts (`solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow`) delegate analysis to `analysis-core`, whose research routing loads only `known-issue-research`. Competitor observation lives in `tech-research-workflow`, which is user-invoked, starts at implementation forensics, and is not a dependency of those hosts. This change hard-cuts that skill to `competitive-research` and loads its lean path from analysis when the expected outcome is user-visible.

Constraints: English skill body, Chinese triggers in `description`, `description` ≤1024 characters, generic placeholders only, hard-cut rename (no alias), method written once, hosts keep a one-line delegation. `solve-workflow` has no OpenSpec capability folder; its dependency rule lives on the `analysis-core` delta and is applied in that skill file.

## Goals / Non-Goals

**Goals:**

- One skill id, `competitive-research`, owns layered competitor research and the existing report family.
- User-visible problems record product behavior before mechanism, with evidence source grades and boundary checks when a behavior is adopted as the target.
- The four hosts abort at startup if the skill is missing, and do not restate the method.

**Non-Goals:**

- Pricing, positioning, or growth research on every run.
- Changing `known-issue-research` quick-search triggers, `effective-web-research`, `write-workflow`, or `brainstorm-workflow`.
- Adding `competitive-research` to `analysis-core` frontmatter `dependencies`. That check aborts whenever `analysis-core` loads. The four hosts declare the dependency instead. `analysis-core` aborts only when the user-visible trigger fires and the skill cannot be loaded.

## Decisions

### 1. Hard-cut rename, no alias

Directory, frontmatter `name`, and the active spec folder move to `competitive-research` in the same change. Archive history may still say `tech-research-workflow`. Active `skills/`, `AGENTS.md`, and `openspec/specs/` must not.

Alternative considered: keep the old directory name and only expand the body. Rejected because the name continues to route the skill as technology research.

### 2. Layers, selected by the question

Order inside competitor research:

1. Product behavior, required when the user can see or operate the result. Record the action and the observable result.
2. Interaction boundaries, required when that behavior is adopted as the target: repeat, step back one level, reach zero, interact with an already shipped behavior.
3. Technical mechanism, after a behavior observation exists when layer 1 ran. First-hand runtime evidence outranks articles.
4. Security forensics, evolution curve, and same-track incidents, only when the question sits on those surfaces.

The full report path stays audit → selected competitor layers → design mapping → report family → reflux. A direct request for a research report uses this path.

Alternative considered: run every layer on every question. Rejected as too heavy for a bug-fix lean call.

### 3. Evidence source grades

Behavior claims name one source: in-person or human observation, automation, or a reported or second-hand account. Human observation wins conflicts. For a custom-rendered editor, an automated keystroke counts only when the caret or focus is shown to be on the target before the key, and the recorded result is what was observed at that target. An automation result of no visible change is not the decision source until that check holds, or a human observation agrees. Existing evidence tiers (runtime, file:line, second-hand link+date) stay. Behavior claims carry both a tier and a source grade. The full-report evidence entry lists that source grade next to the tier.

### 4. Lean path question from analysis includes boundaries when adopting

`analysis-core` loads the lean path before a user-visible behavior is treated as confirmed. The delegation question states the user action and asks for the observable result. When that run will treat the competitor behavior as the target to copy, the same question includes the boundary operations in decision 2. The lean path still drops the report family, design mapping, and reflux loop.

Alternative considered: leave boundaries to a later verify stage only. Rejected because copying a main-path observation without the boundary observation is the gap this change closes. Host verify stages are unchanged; the research skill owns the competitor-side boundary record.

### 5. Thin host integration

Each of the four hosts:

- Adds `competitive-research` to frontmatter `dependencies` and to the startup missing-dependency abort.
- Adds one analysis-stage line: load `competitive-research` through `analysis-core` when the expected outcome is user-visible. No method prose.

`analysis-core` owns the trigger and the lean-question shape. It does not list `competitive-research` in its own `dependencies`. The delta specs state the host obligation both on `analysis-core` (so `solve-workflow` is covered) and on the three hosts that have spec folders. That double statement matches this repo's host-dependency pattern. Archive updates both.

`known-issue-research` description gains a boundary sentence. Its routing tables stay.

### 6. Description budget and triggers

`description` is one quoted line and includes 「技术调研」「竞品调研」「产品调研」「全面调研」, plus the Do-NOT-use boundary pointing at `known-issue-research` and `effective-web-research`. If the line would pass 1024 characters, cut methodology detail into the body, not the description.

Depth that does not fit `SKILL.md` (evidence table, layer-selection examples, report templates already in `reference.md`) stays in `reference.md`. The body rewrite follows `skill-creator`. Examples use placeholders such as Competitor A and `example.com`.

## Risks / Trade-offs

- [Startup check runs even for internal-logic fixes] → The four hosts require the skill to be installed. They do not run competitor research unless the outcome is user-visible.
- [“User-visible” is judged too wide or too narrow] → Spec scenarios split the two cases. The delegation line repeats the predicate “result the user can see or operate”.
- [Lean call records only the main action] → Decision 4 puts boundary operations in the question when the behavior will be adopted.
- [Old id lingers in active docs] → Rename task ends with a search of `skills/`, `AGENTS.md`, and active `openspec/specs/` and requires zero hits outside archive history.
- [Description overflows 1024] → Lint `npm run lint:skill-description` before the skill edit is done.
- [Internal identifiers from the source notes leak into the skill] → De-identification lint on the skill diff. The source notes file is not copied into `skills/`.

## Migration Plan

1. `git mv` the skill directory to `skills/competitive-research/` and update frontmatter `name`.
2. Rewrite the body and `reference.md` for layers, source grades, and the lean question. Keep carried-forward behavior (audit, mechanism forensics, design mapping, reflux, report family, `effective-web-research` dependency).
3. Patch `analysis-core`, `known-issue-research`, and the four hosts as in decision 5.
4. Regenerate `docs/generated/skills-index.md`.
5. On archive, sync deltas so `openspec/specs/competitive-research/` exists and `openspec/specs/tech-research-workflow/` is removed from active specs.

Rollback is reverting the change branch. No data migration.

## Open Questions

None. Review notes on double-written host dependencies, boundary operations inside the lean question, and the description budget are decided above.
