# Proposal: upgrade competitive research

## Why

Problem-solving workflows research known defects and industry limits, then move on to a fix. They do not observe what shipped competitors actually do for the user. The standalone research skill that does look at competitors starts at implementation forensics (DOM, network, isolation) and is not loaded by those workflows. Fixes then align to a mechanism before anyone has confirmed the user-visible behavior the mechanism is supposed to produce.

## What Changes

- **BREAKING**: Hard-cut rename `tech-research-workflow` → `competitive-research` (directory, frontmatter `name`, OpenSpec capability folder, and in-repo references). No alias directory and no dual name.
- Expand that skill from technology-and-mechanism research into layered competitive research. When the question is about something the user can see or operate, the product-behavior layer is required before technical mechanism. Interaction-boundary checks follow behavior. Security forensics, evolution curves, and same-track incident search stay, and run only when the question sits on those surfaces.
- Record evidence by source: in-person or human observation, automation, and reported or second-hand accounts. Automation that drives a custom-rendered editor (self-drawn caret or selection) is auxiliary until the caret or focus is shown to be on the target, and a conflicting human observation wins.
- After a behavior is adopted, verification includes boundary operations (repeat, step back one level, zero, interaction with an already-shipped behavior), not only the main path.
- `analysis-core` loads `competitive-research` on its lean, layer-selected path when the problem's expected outcome is user-visible behavior, before that behavior is treated as confirmed. Problems that are not user-visible do not run this path.
- `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, and `opsx-jira-fix-workflow` each add `competitive-research` to frontmatter `dependencies` (missing skill aborts startup) and one delegation line. They do not restate the method.
- `known-issue-research` keeps known-defect and industry-limit routing. Its description states that competitor product-behavior observation belongs to `competitive-research`.
- Explicit "produce a research report" requests still run `competitive-research` directly, including its full report family. Triggers keep 「技术调研」 and add 「竞品调研」「产品调研」「全面调研」.
- Skill body stays English. Examples use generic placeholders only.

## Capabilities

### New Capabilities

- `competitive-research`: Layered competitive research (product behavior, interaction boundaries, technical mechanism, and on-demand risk surfaces), evidence-source grades, lean path for problem-solving hosts, and the existing decision-ready report family under the new skill id.

### Modified Capabilities

- `tech-research-workflow`: Requirements leave this capability id. The hard cut removes the old id from active specs.
- `analysis-core`: Analysis loads `competitive-research` for user-visible outcomes before the behavior is treated as confirmed, and the four PDCA hosts above declare that dependency.
- `known-issue-research`: Boundary — this skill does not own competitor product-behavior observation.
- `opsx-solve-workflow`: Startup dependency on `competitive-research` plus a one-line analysis delegation.
- `jira-fix-workflow`: Startup dependency on `competitive-research` plus a one-line analysis delegation.
- `opsx-jira-fix-workflow`: Startup dependency on `competitive-research` plus a one-line analysis delegation.

## Impact

- Skills: rename `skills/tech-research-workflow/` to `skills/competitive-research/`; edit `analysis-core`, `known-issue-research`, and the four hosts above. `solve-workflow` has no OpenSpec capability folder; its dependency obligation is specified on `analysis-core` and applied in that skill file.
- Specs: add `openspec/specs/competitive-research/`; remove active `openspec/specs/tech-research-workflow/` after archive sync. `docs/generated/skills-index.md` regenerates with the skill docs script.
- `known-issue-research` quick search, `effective-web-research`, and the security/evolution/incident steps stay. `write-workflow` and `brainstorm-workflow` are out of scope.
- De-identification: case tickets, internal product names, and internal URLs from the source notes do not enter skill text.
