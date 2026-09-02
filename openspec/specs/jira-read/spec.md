# jira-read Specification

## Purpose

Behavioral contract for `jira-read`: credential resolution, attachment download without putting secrets on argv or into Agent context, and auth error classification. mcp-atlassian remains an optional env injector, not a required runtime.

## Requirements

### Requirement: jira-read SHALL resolve the PAT via env, then file, then ask-and-persist

Before any live Jira HTTP or MCP issue fetch, and before running an attachment download script, `jira-read` MUST resolve the Personal Access Token in this order: (1) environment variable `JIRA_PERSONAL_TOKEN`; (2) if unset or empty, environment variable `JIRA_PAT` as an alias that is copied into `JIRA_PERSONAL_TOKEN` for the rest of the session; (3) if both are empty, the local file `~/.config/jira-certs/jira-pat.txt` (Windows: `%USERPROFILE%\.config\jira-certs\jira-pat.txt`), trimmed of surrounding whitespace, treated as a single-line secret. mcp-atlassian injection of `JIRA_PERSONAL_TOKEN` remains a valid way to satisfy step (1). The skill MUST NOT require mcp-atlassian to be installed.

#### Scenario: Env var already set

- **WHEN** `JIRA_PERSONAL_TOKEN` is set to a non-empty value
- **THEN** `jira-read` uses that value and does not read the credential file or ask the user for a token

#### Scenario: Only alias env is set

- **WHEN** `JIRA_PERSONAL_TOKEN` is empty and `JIRA_PAT` is set
- **THEN** `jira-read` treats `JIRA_PAT` as the token and continues without asking the user

#### Scenario: File fallback

- **WHEN** both env vars are empty and the credential file exists and contains a non-empty line
- **THEN** `jira-read` reads that line as the token and exports `JIRA_PERSONAL_TOKEN` for subsequent commands in the session

#### Scenario: Ask once and offer persist

- **WHEN** env vars and the credential file are all empty
- **THEN** `jira-read` asks the user for a PAT once and asks whether to write it to the agreed credential-file path; it MUST NOT proceed with live fetch until a token is available

### Requirement: jira-read examples and scripts MUST NOT put the PAT on the command line

Skill examples, fallback instructions, and scripts MUST NOT interpolate the PAT into argv (including `PAT='…' cmd`, `curl -H "Authorization: Bearer <token>"` typed in the shell, or teaching the agent to build such a curl by hand). Scripts and the node sidecar MUST read the resolved token from the environment or the credential file internally. The previous “build an equivalent curl command from the Authentication table” fallback is forbidden.

#### Scenario: Download without token in argv

- **WHEN** the agent downloads an attachment
- **THEN** the invoked command line does not contain the PAT value, and SKILL.md does not instruct a manual curl that places the token in headers or `-u`

#### Scenario: User pastes a token in chat

- **WHEN** the user supplies a PAT in the conversation because the chain was empty
- **THEN** the agent offers persist to the credential file and uses env-or-file for later commands rather than re-pasting the token into a shell one-liner

### Requirement: jira-read MUST keep the PAT out of chat transcripts when a store exists

After a token is available from env or the credential file, `jira-read` MUST NOT echo the PAT in assistant messages, command previews, or logs. SKILL.md MUST tell the agent and the user not to paste the PAT into chat on later turns; the first-time paste is only the ask-and-persist path. Scripts and the node sidecar MUST read the file or env themselves so the agent does not `cat` the secret into the conversation.

#### Scenario: Later turn with file present

- **WHEN** `jira-pat.txt` or `JIRA_PERSONAL_TOKEN` already has the token
- **THEN** the agent runs download/fetch without printing the PAT and without asking the user to paste it again

#### Scenario: Skill warns against chat paste

- **WHEN** a reader opens `jira-read` Authentication or pitfalls
- **THEN** the text says not to paste the PAT into chat or argv once the file or env exists

### Requirement: jira-read attachment download SHALL fall back to node when curl cannot present a PEM client cert

`jira-read` MUST keep `scripts/download_jira_attachments.sh` for curl builds that support `--cert`/`--key` with a PEM pair. When curl’s TLS backend is Schannel (typical Windows) or PEM file-pair flags are unavailable, the skill MUST use an equivalent node script (`https` with `key`/`cert` and TLS 1.3) instead of failing on curl. Capability probe (for example `curl -V`) runs first.

#### Scenario: OpenSSL curl with PEM flags

- **WHEN** `curl -V` does not report Schannel and `--cert`/`--key` can be used
- **THEN** the bash script is the download path

#### Scenario: Schannel curl on Windows

- **WHEN** `curl -V` reports Schannel
- **THEN** `jira-read` uses the node sidecar and does not tell the agent that bash+curl with PEM files is sufficient

### Requirement: jira-read SHALL split credential-missing, HTTP 401/403, and TLS failures

When authentication or transport fails, `jira-read` MUST classify: (1) credential chain empty → follow the ask-and-persist flow, not a generic 401 hint; (2) HTTP 401 or 403 with a resolved token → tell the user the token is invalid or revoked and to rotate it and update the credential file; (3) TLS handshake or client-certificate failure → point at the mTLS cert pair and TLS version, including “do not use Schannel curl for PEM mTLS”.

#### Scenario: All three sources empty

- **WHEN** live fetch is attempted and env vars and the credential file are empty
- **THEN** the message states that the three-level chain is empty and starts ask-and-persist rather than only “check token validity”

#### Scenario: Token rejected by server

- **WHEN** the request is sent with a resolved token and the server returns 401 or 403
- **THEN** the message tells the user to rotate the PAT and update `jira-pat.txt` (and env if set)

### Requirement: jira-read access recipe MUST include a Credentials field

Any Authentication or access-recipe section in `jira-read` MUST state where the PAT is stored, the file format (single-line secret), and how to rotate it. A recipe that only says the user provides the PAT is incomplete.

#### Scenario: Authentication section completeness

- **WHEN** a reader opens the Authentication section of `jira-read`
- **THEN** it lists the env names, the credential-file path, the format, and rotation (update the file and env)
