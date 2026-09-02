## Why

`jira-read` and its Jira-fix hosts assume a PAT is injected as `JIRA_PERSONAL_TOKEN` by mcp-atlassian. On machines without that injector (and on Windows where Schannel curl cannot use PEM `--cert/--key`), the token lives only in one chat session. The next session has no agreed file path, so the agent either re-asks or greps plaintext from transcripts. The incident of 2026-09-01/02 showed the gap is the skill contract, not a missing installer.

## What Changes

- **jira-read** becomes the single source of truth for Jira HTTP credential resolution: env `JIRA_PERSONAL_TOKEN` (alias `JIRA_PAT`) → `~/.config/jira-certs/jira-pat.txt` (Windows `%USERPROFILE%\.config\jira-certs\jira-pat.txt`) → ask once and offer persist to that file. The same chain runs before live MCP/`jira_get_issue` fetches, not only before the attachment script.
- Attachment download: keep the bash+curl script when curl can present a PEM client cert; add a node sidecar and capability probe for Schannel/non-PEM curl. Scripts read the resolved token internally; examples MUST NOT inline the token on the command line; the skill MUST NOT teach a manual curl that interpolates the PAT into argv.
- Auth failures split: missing credential chain vs 401/403 (rotate token and update the file) vs TLS/cert (wrong client, including Windows curl).
- Access-recipe docs in `jira-read` MUST include a Credentials field (where stored, format, rotation). Writing only “user provides the PAT” is incomplete.
- **jira-fix-workflow** prerequisite and Stage 0 connectivity SHALL point at the `jira-read` credential contract: mcp-atlassian is optional; missing MCP does not abort when cache or another `jira-read` live path can obtain the issue. The host MUST NOT copy the full fallback table.
- **jira-status-writeback** adds one line: this skill does not resolve PAT files; session/MCP auth follows `jira-read`.
- **jira-fix-batch** stays an enqueue shell (no copied auth section).
- Out of this change: `opsx-jira-fix-workflow`, OS credential-manager migration, a new `jira-auth-discipline` skill, and committing real PAT values.

## Capabilities

### New Capabilities

- `jira-read`: Jira credential resolution, persist-on-ask, anti-inline usage, attachment download on curl-or-node, auth error split, and the Credentials recipe field.

### Modified Capabilities

- `jira-fix-workflow`: startup prerequisite SHALL delegate PAT/auth readiness to the `jira-read` credential contract instead of treating mcp-atlassian as the only valid injector.

## Impact

- Skills: `skills/jira-read/SKILL.md`, `skills/jira-read/reference.md`, `skills/jira-read/scripts/download_jira_attachments.sh`, new node download sidecar; `skills/jira-fix-workflow/SKILL.md` (and reference status line if it still asserts mcp-atlassian connected); `skills/jira-status-writeback/SKILL.md` one-liner.
- OpenSpec: new `specs/jira-read/spec.md`; delta on `jira-fix-workflow`.
- No application runtime, no **BREAKING** API for callers that already export `JIRA_PERSONAL_TOKEN`.
- Security: plaintext file next to existing mTLS certs (same threat model as today for `client.key`); tokens MUST NOT be written into the git repo or skill examples.
