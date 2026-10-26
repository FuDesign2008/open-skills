# Proposal

## Why

A real incident (ynote-web, 2026-10-26) showed that `node-version-discipline` listed CI in the priority chain but its paste-ready probe omitted CI, and agents invented unsafe zsh globs (`ls … Dockerfile*`) that aborted before `.gitlab-ci.yml` was checked—so an authoritative `image: node:14` pin was reported as “no declaration.” Degenerate `engines` and install-before-align gaps compounded the failure. Hardening the skill’s detection and install gates closes that false-negative path.

## What Changes

- Expand CI probe sources beyond GitHub Actions examples to include GitLab CI / Jenkins / Docker `FROM node` style pins (`image: node:N`, `node-version`, `NODE_VERSION`).
- Require **shell-safe** CI file existence checks: probe named paths one-by-one with `[ -f ]` (or equivalent); never mix literal paths with unmatched globs in one shell word-list under zsh `nomatch`.
- Make the §7 paste-ready script actually walk the full chain **including CI** (today it stops after volta/`engines`).
- Treat obviously degenerate `engines.node` ranges (e.g. `>=0.8.0`) as non-authoritative: continue probing and do not present them as peer “candidates” beside real pins.
- Harden pre-command gates: version-sensitive commands including `npm install` / `npm ci` MUST NOT run until alignment (or user-answered no-declaration path) completes; treat corrupt-install signals such as `Exit handler never called!` as stop-and-remediate even when exit code is 0.
- Add an eval covering “CI-only pin + unsafe glob must not false-negative.”

## Capabilities

### New Capabilities

- `node-version-discipline`: Behavioral contract for probing Node version declarations (priority chain, shell-safe CI detection, degenerate engines, align-before-install / corrupt-install stop) and disclosing alignment in verification reports.

### Modified Capabilities

- (none — hosts already require calling `node-version-discipline`; this change defines the dependee’s missing capability spec rather than changing host phase wording.)

## Impact

- Skill: `skills/node-version-discipline/SKILL.md`, `skills/node-version-discipline/evals/evals.json`
- Downstream: any host that depends on or soft-references this skill inherits safer detection without host text changes (scope: dependee only)
- No runtime app code; Markdown skill + OpenSpec archive only
