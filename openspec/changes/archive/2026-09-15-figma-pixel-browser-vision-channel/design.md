## Context

Verify already lists platform-agnostic tool intents. The remaining gap is a **quality gate**: when the environment can install `ego-browser` (macOS + that skill/install path), verify must install and use it, instead of treating every browser channel as equally optional. Copying that product’s TaskSpace API into `figma-*` stays out of scope.

This matches the repo’s existing `browser-debug-toolkit` pattern (named quality channel, runtime-local, not frontmatter `dependencies`), with a stricter **install-if-possible** step for pixel measurement.

## Goals / Non-Goals

**Goals:** Install `ego-browser` when macOS and the skill/install path exist; use it for real state switch + screenshot + evaluate; vision as supporting evidence; degrade without aborting when install is impossible.

**Non-Goals:** Frontmatter dependency on `ego-browser`; copying TaskSpace/CLI API into `figma-*`; replacing numeric SoT with “looks right”; host restatement; changing implement’s Figma MCP hard gate; requiring `ego-browser` on non-macOS.

## Decisions

- **Install-when-possible:** Darwin + `ego-browser` skill/install path ⇒ MUST follow that skill’s install reference, wait for user GUI onboarding when required, confirm `command -v ego-browser`, then measure on that channel. Weaker MCP already connected is not an excuse to skip.
- **Not a hard id for every Agent:** not in frontmatter `dependencies`; non-macOS / missing skill / blocked install ⇒ other JS-eval channel; verify still runs.
- Hover/theme: real pointer/UI switch through the quality channel (or the degraded channel), then evaluate.
- Vision inspects screenshots when the model can see images; Overall PASS still needs numeric rows if eval exists.

## Risks / Trade-offs

- Agents skip install because MCP is already up → eval `install-quality-browser-when-possible`.
- Agents paste TaskSpace API into `figma-*` → prose forbids copy; load the external skill instead.
- Vision over-claim PASS → existing “screenshots alone when measurement was possible” pitfall stays.

## Migration Plan

Skill text + evals. Rollback = revert.

## Open Questions

- None blocking.
