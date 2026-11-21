# skill-global-install Specification

## Purpose
TBD - created by archiving change fix-clarify-and-promptscript-install. Update Purpose after archive.
## Requirements
### Requirement: Repo SHALL provide a global install helper that avoids PromptScript failure noise

This repository MUST ship a documented install helper (e.g. `scripts/install-skills.mjs`) that performs the recommended global install of `FuDesign2008/open-skills` such that the run completes with **zero** `PromptScript does not support global skill installation` failure lines, while still installing skills into the universal global skills location used by supported agents.

#### Scenario: Helper install has no PromptScript cross marks

- **WHEN** a maintainer runs the documented helper for a full global install (`--skill '*'` equivalent)
- **THEN** the command output MUST NOT contain per-skill `✗ … → PromptScript: PromptScript does not support global skill installation` lines, and skills MUST be present under the universal global skills directory (e.g. `~/.agents/skills`)

### Requirement: Install docs MUST NOT call PromptScript errors known-harmless or blame specific skills

`AGENTS.md` and install documentation MUST NOT describe PromptScript global-install failures as「已知无害」or attribute them to particular “PromptScript-class” skills in this repo (e.g. `xquik-social-data`, `openspec-*`). Docs MUST state the accurate cause (CLI fanout to an agent without `globalSkillsDir`) and MUST point readers to the install helper (and MAY link upstream `vercel-labs/skills` issues).

#### Scenario: AGENTS merge/release install recipe

- **WHEN** an agent follows the Merge PR / release “update global install” steps in `AGENTS.md`
- **THEN** the recipe uses the install helper (or an equivalent agent-filtered command), and the text MUST NOT claim the PromptScript ✗ lines are known-harmless

#### Scenario: Misdiagnosis removed

- **WHEN** a reader searches install docs for PromptScript guidance
- **THEN** they find corrected root-cause wording, not a list of repo skills blamed as PromptScript-type packages

### Requirement: Install helper SHALL start the skills CLI without a Windows shell shim

`scripts/install-skills.mjs` MUST start the skills CLI on Windows without relying on a `.cmd` shell shim. It SHALL resolve npm's `npx-cli.js` from the running Node installation and launch it with that Node binary, and SHALL fall back to the historical `npx` invocation only when that entry cannot be resolved. At the helper's own spawn site, the helper MUST NOT invoke a `.cmd`/`.bat` shim and MUST NOT route its spawn through a shell.

#### Scenario: Windows install reaches the normal steps

- **WHEN** the helper runs on Windows and npm's CLI entry resolves next to the running Node binary
- **THEN** the skills CLI starts without `ENOENT`/`EINVAL`, and the run proceeds through install, completeness verification, prune, and manifest update as on POSIX

#### Scenario: POSIX behavior unchanged

- **WHEN** the helper runs on macOS or Linux
- **THEN** the same CLI start preference applies and the install outcome, flags, and failure detection are identical to before this change

#### Scenario: Unresolved entry falls back

- **WHEN** npm's CLI entry cannot be resolved from the running Node installation
- **THEN** the helper falls back to the `npx` invocation at the helper's own spawn site
- **AND WHEN** that fallback also fails to launch
- **THEN** the helper prints the launch failure and exits non-zero

### Requirement: Install helper arguments SHALL reach the skills CLI verbatim

Values passed to the helper (`--source`, `--skill`, agent list) MUST reach the skills CLI unchanged, including paths containing spaces, because the launch path MUST NOT re-tokenize them. The existing failure contract — clone/installation and PromptScript detection, full-install completeness verification, prune attribution, and manifest semantics — MUST remain unchanged.

#### Scenario: Source path containing spaces

- **WHEN** `--source` names a directory whose path contains spaces
- **THEN** the skills CLI receives it as a single argument and the install proceeds

#### Scenario: Failure contract preserved

- **WHEN** CLI output matches a clone or installation failure
- **THEN** the helper still exits non-zero and does not update the manifest or prune anything

