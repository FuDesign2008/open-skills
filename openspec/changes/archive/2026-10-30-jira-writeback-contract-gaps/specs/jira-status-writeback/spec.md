## ADDED Requirements

### Requirement: jira-read SHALL be declared for the bundled REST fallback

The bundled fidelity fallback (`scripts/update-comment-wiki.mjs`) imports `resolveJiraToken` from `jira-read`, so an installation without `jira-read` cannot run the fallback the spec promises. In addition to the `jira-wiki-markup` dependency covered by the existing dependency requirement, `jira-status-writeback` MUST list `jira-read` in frontmatter `dependencies` and abort its own load when it is missing.

When that check fails at writeback load, the missing dependency is a writeback failure: the agent MUST record it for the host report as a warning and MUST NOT revert or block an already-completed merge (same handling as an API failure).

The skill prose MUST distinguish the two authentication paths: the SOP itself uses the agent's session or MCP tooling (behavior unchanged), while the bundled script resolves credentials through the `jira-read` chain (`JIRA_PERSONAL_TOKEN` / `JIRA_PAT` / `~/.config/jira-certs/jira-pat.txt`). The "this skill does not resolve PAT files" statement MUST be scoped to the SOP rather than the whole skill, so it does not contradict the shipped script.

The bundled script keeps its static import and assumes both skills are installed under the same skills root (the standard `--skill` installation layout). Direct invocation without `jira-read` remains unsupported; the load-time check is what keeps a compliant run away from that path.

#### Scenario: Missing jira-read aborts the skill

- **WHEN** `jira-status-writeback` loads and `jira-read` is not available
- **THEN** the skill aborts with the standard missing-dependency install hint instead of proceeding until the fallback crashes

#### Scenario: Single-skill install fails at the prerequisite check

- **WHEN** a user installs only `jira-status-writeback` and starts a writeback run
- **THEN** the prerequisite check reports the missing `jira-read` before any Jira call is made

#### Scenario: Missing dependency after merge does not revert the merge

- **WHEN** the dependency check fails after a PR/MR has already merged
- **THEN** the agent records a writeback warning for the host report and the host continues completion bookkeeping

#### Scenario: Documentation separates SOP auth from script auth

- **WHEN** an agent reads the skill overview and the fidelity fallback step
- **THEN** the overview limits the "no PAT resolution" statement to the SOP, and the fallback step states that the script resolves credentials through the `jira-read` chain
