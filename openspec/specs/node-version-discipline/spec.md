# node-version-discipline Specification

## Purpose

Defines how agents MUST discover a project's Node version pin, align before version-sensitive commands, and avoid false "no declaration" reports when the pin lives only in CI or Docker metadata.

## Requirements

### Requirement: Probe declaration sources in priority order
The skill SHALL probe Node version declarations in this order and use the first authoritative hit: `.nvmrc`, `.node-version`, `.tool-versions`, `package.json` `volta.node`, non-degenerate `package.json` `engines.node`, then CI/Docker Node pins.

#### Scenario: Exact pin file wins over engines and CI
- **WHEN** the project root has `.nvmrc` containing `18.20.0` and also `engines.node` and a CI Node image pin
- **THEN** the agent MUST align to `18.20.0` from `.nvmrc` and MUST NOT treat later sources as the alignment target

#### Scenario: CI pin used when earlier sources miss
- **WHEN** no `.nvmrc` / `.node-version` / `.tool-versions` / `volta.node` exists and `engines.node` is absent or non-authoritative
- **AND** `.gitlab-ci.yml` (or equivalent CI/Docker config) pins Node (e.g. `image: node:14`)
- **THEN** the agent MUST treat that CI/Docker pin as the declaration for alignment and MUST NOT claim the project has no Node declaration

### Requirement: Shell-safe CI and Docker file probing
When probing CI/Docker config files for Node pins, the agent MUST check each candidate path with an existence test that does not abort the whole probe when optional globs match nothing (e.g. per-path `[ -f path ]`, or nullglob/`noglob`). The agent MUST NOT combine required literal paths and unmatched shell globs in one expandable word list under zsh `nomatch`.

#### Scenario: Missing Dockerfile glob must not hide gitlab-ci
- **WHEN** `.gitlab-ci.yml` exists and no `Dockerfile*` matches in the project root
- **AND** a probe would have used a single command listing both `.gitlab-ci.yml` and `Dockerfile*`
- **THEN** the agent MUST still observe that `.gitlab-ci.yml` exists and MUST read its Node pin when present
- **AND** MUST NOT conclude "no CI config" solely because a Dockerfile glob failed to expand

#### Scenario: Explicit CI candidates include GitLab and GitHub
- **WHEN** the agent reaches the CI/Docker step of the chain
- **THEN** it MUST consider at least `.gitlab-ci.yml`, `.github/workflows/*` (when present), and common Dockerfiles by safe per-path checks
- **AND** it MUST recognize pins expressed as `image: node:<ver>`, `node-version:`, `NODE_VERSION`, or `FROM node:<ver>`

#### Scenario: Quoted YAML pins are recognized
- **WHEN** a CI/Docker file pins Node with optional quotes (e.g. `node-version: '18'` or `image: "node:14"`)
- **THEN** the probe MUST extract the same version it would from the unquoted form (`18` / `14`)

### Requirement: Degenerate engines ranges are non-authoritative
The skill MUST treat clearly obsolete or placeholder `engines.node` ranges that cannot represent a modern project pin (including `>=0.8.0`) as non-authoritative: continue the probe chain and MUST NOT present them to the user as a peer candidate alongside real pins or README anecdotes when a later authoritative source exists or when asking for a version.

#### Scenario: Placeholder engines continues to CI
- **WHEN** `package.json` has `"engines": { "node": ">=0.8.0" }` and `.gitlab-ci.yml` has `image: node:14`
- **THEN** the agent MUST continue past engines, adopt Node 14 from CI, and MUST NOT list `>=0.8.0` as an equally valid alignment choice

### Requirement: Align before version-sensitive commands including install
Before running `tsc`, lint, build, test, `npm install`, `npm ci`, or other version-sensitive Node commands, the agent MUST complete declaration probing and version alignment (or the documented no-declaration ask-and-confirm path). The agent MUST NOT run install on the host default Node while a declaration probe is incomplete or unresolved.

#### Scenario: Install blocked until aligned
- **WHEN** the agent is about to run `npm install` or `npm ci` in a Node project
- **AND** the project's declared Node version has not yet been aligned in the same shell invocation
- **THEN** the agent MUST align first (or stop and ask under the no-declaration path) and MUST NOT proceed with install on an unaligned host default

### Requirement: Corrupt install signals force stop even with exit code 0
If `npm install` / `npm ci` emits a corrupt-install signal such as `Exit handler never called!`, the agent MUST treat the install as failed regardless of process exit code 0, stop using that `node_modules` for further verification, and remediate (re-align Node, clean install) before continuing.

#### Scenario: Exit-handler message with exit 0
- **WHEN** an install command prints `Exit handler never called!` and exits with code 0
- **THEN** the agent MUST NOT treat the install as successful
- **AND** MUST stop before type-check/build/test that would rely on those dependencies

### Requirement: Paste-ready probe covers the full chain including CI
The skill's paste-ready detection script (or equivalent documented probe) MUST implement the full priority chain through the CI/Docker step with shell-safe file checks, not only pin files and `package.json` fields.

#### Scenario: Script finds GitLab image pin
- **WHEN** an agent runs the skill's paste-ready probe in a repo whose only Node pin is `.gitlab-ci.yml` `image: node:14`
- **THEN** the probe output MUST surface that Node 14 declaration (or an equivalent extracted version) rather than only reporting "no declaration"
