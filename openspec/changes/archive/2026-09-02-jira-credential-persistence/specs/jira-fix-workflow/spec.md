## ADDED Requirements

### Requirement: Jira fix workflow SHALL delegate PAT readiness to the jira-read credential contract

`jira-fix-workflow` MUST NOT treat mcp-atlassian as the only valid PAT injector. Before any live Jira call, the host MUST run the `jira-read` credential resolution chain (env `JIRA_PERSONAL_TOKEN`, alias `JIRA_PAT`, then the agreed credential file, then ask-and-persist). mcp-atlassian remains a valid way to populate `JIRA_PERSONAL_TOKEN`. The host MUST point at `jira-read` rather than copy the full chain. Stage 0 MUST NOT abort solely because mcp-atlassian is missing. Connectivity MAY use MCP `jira_get_issue` when that tool is available; if it is not, the host MUST degrade to `jira-read` cache or another `jira-read` live path that uses the resolved credentials, and abort only when issue data cannot be obtained at all. This change does not require a new full Jira REST issue client inside `jira-fix-workflow`.

#### Scenario: Machine without mcp-atlassian

- **WHEN** mcp-atlassian is not configured and the `jira-read` chain resolves a PAT from env or the credential file
- **THEN** `jira-fix-workflow` does not abort at Stage 0 solely because mcp-atlassian is missing

#### Scenario: Stage 0 MCP tool missing but cache exists

- **WHEN** MCP `jira_get_issue` is unavailable and a local `jira-read` cache for the issue exists
- **THEN** Stage 0 / Stage 1 continues from cache instead of aborting on the MCP connectivity check

#### Scenario: Host does not duplicate the chain

- **WHEN** a reader compares `jira-fix-workflow` Prerequisites or Stage 0 with `jira-read`
- **THEN** the host has a pointer to `jira-read` and does not restate the three-level fallback table
