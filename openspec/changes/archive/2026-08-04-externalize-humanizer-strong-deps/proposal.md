## Why

PR #264 vendored `humanizer` and `humanizer-zh` into open-skills, but the intended contract is **external strong dependencies**: the host must abort if they are missing, while this repo must not ship or maintain their SKILL bodies. Upstream remains blader/humanizer and op7418/Humanizer-zh.

## What Changes

- **Remove** in-repo `skills/humanizer/` and `skills/humanizer-zh/` (and stop listing them in skills-index / AGENTS as project skills).
- **Keep** `write-workflow` frontmatter strong deps on `humanizer` and `humanizer-zh`, routing, and gate differences.
- **Update** prerequisite missing-notice to install via upstream URLs and require directory names `humanizer` / `humanizer-zh`.
- **OpenSpec**: remove or retire main specs that treated humanizers as in-repo capabilities; MODIFY `write-workflow` requirements for external install hints.
- Land on the same branch as #264 (append commit).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `write-workflow`: strong deps remain; install hints are external (URL + exact directory names); not provided by FuDesign2008/open-skills skill pack.
- `humanizer` / `humanizer-zh` (main specs): **REMOVED** as in-repo shipped capabilities (behavior lives upstream only).

## Impact

- Deletes vendored skill trees from #264 tip
- AGENTS.md, docs/generated/skills-index.md, openspec/specs/*
- Users must install upstream skills separately before write-workflow runs
