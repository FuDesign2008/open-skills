# Delta Spec: jira-status-writeback

## MODIFIED Requirements

### Requirement: Post-merge Jira writeback SHALL use two independent API calls

The `jira-status-writeback` skill SHALL define the sole SOP for writing Jira status after a successful PR/MR merge into the target branch. The skill MUST require two independent calls: (1) resolve transitions and call `jira_transition_issue` **without** a `comment` parameter; (2) post the repair comment with Wiki markup in the `body` field. Passing the repair comment only via `jira_transition_issue`'s `comment` parameter is forbidden.

For step 2 the skill MUST treat the write channel as unverified until proven faithful: the agent posts through its available tooling, reads back the stored `body` from the tool response (or a follow-up read), and compares it against the composed text for the key Wiki markers (`h3.`/`h4.` line starts, `*bold*`, `{{mono}}`, `[label|url]`). If every marker survives verbatim, the write is complete. If any marker is escaped or rewritten (for example `\*bold\*` or a heading turned into `###`), the agent MUST fall back to a direct REST write via `scripts/update-comment-wiki.mjs` (credential chain identical to `jira-read`), then re-verify fidelity the same way.

#### Scenario: Comment uses jira_add_comment body

- **WHEN** writeback runs after a successful merge
- **THEN** the agent transitions the issue and separately calls `jira_add_comment` with `body` set to the repair comment

#### Scenario: Comment uses body parameter on a faithful channel

- **WHEN** writeback runs after a successful merge and the read-back `body` matches the composed Wiki markup verbatim
- **THEN** the writeback is complete with the primary channel

#### Scenario: Escaped markup triggers REST fallback

- **WHEN** the read-back `body` contains escaped or rewritten markers (for example `\*bold\*` where `*bold*` was sent)
- **THEN** the agent rewrites the comment through the direct REST script and re-verifies fidelity before reporting completion

#### Scenario: Transition comment parameter is not used for the repair note

- **WHEN** writeback runs
- **THEN** `jira_transition_issue` is invoked without relying on its `comment` parameter to persist the repair record

## ADDED Requirements

### Requirement: Comment writeback SHALL verify markup fidelity and fall back to direct REST

The skill MUST ship a fidelity-checking REST fallback script (`scripts/update-comment-wiki.mjs`) that: resolves credentials via the same chain as `jira-read` (env `JIRA_PERSONAL_TOKEN` / `JIRA_PAT`, else first line of `~/.config/jira-certs/jira-pat.txt`); accepts the site base URL via env `JIRA_URL`; reads the Wiki body from `--file <path>` or stdin; supports create (no comment id) and update (comment id argument); enables optional mTLS when `client.crt`/`client.key` are resolvable; performs a built-in read-back fidelity check reporting PASS/FAIL with the diff detail. The skill MUST document when to use the script: only after the primary channel fails the fidelity check. The script MUST NOT log the token.

#### Scenario: Script creates a comment with verbatim Wiki storage

- **WHEN** the script runs with a wiki file, an issue key, and no comment id on a faithful REST endpoint
- **THEN** the comment is created and the script reports fidelity PASS with the stored `body` preview

#### Scenario: Script updates an escaped comment

- **WHEN** the script runs with issue key and comment id whose stored body is markup-escaped
- **THEN** the comment is updated and fidelity re-verified against the composed text

#### Scenario: Token is never logged

- **WHEN** the script runs with any credential resolution outcome
- **THEN** no log line contains the token or its file path contents
