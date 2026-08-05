## ADDED Requirements

### Requirement: jira-read SHALL download attachments to disk, never into Agent context

When an issue has attachments and the user needs their content, `jira-read` MUST download them to local disk via `scripts/download_jira_attachments.sh` (or an equivalent curl command). Attachment content MUST NOT be read into the Agent context; log inspection is done by targeted extraction (`grep`/`head`/`tail`) on the downloaded file.

#### Scenario: User requests an attachment

- **WHEN** the user asks to download or view an issue attachment (e.g. logs)
- **THEN** `jira-read` downloads it to disk via the script and reports the result per `reference.md` §7, without loading the content into context

### Requirement: jira-read attachment examples SHALL use generic placeholders

All hostnames, product names, and Jira IDs in `jira-read` content (SKILL.md, reference.md, scripts) MUST use generic placeholders (e.g. `jira.example.com`, `app-log`, `PROJ-1234`). No real internal hostname, product name, or Jira ID may be baked into defaults or examples. The download script MUST require `JIRA_URL` explicitly (no built-in default host).

#### Scenario: No internal identifiers in jira-read

- **WHEN** a reader scans `skills/jira-read/` for internal hostnames, product names, or project codes
- **THEN** none are present, and the script fails fast with a hint if `JIRA_URL` is unset rather than defaulting to a baked-in host
