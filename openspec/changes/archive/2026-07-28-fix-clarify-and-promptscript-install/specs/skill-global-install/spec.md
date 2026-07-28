## ADDED Requirements

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
