## Why

`jira-read` could only point users to "visit Jira" for attachments. Pulling attachment content (multi-MB logs) into the Agent context via MCP tools blows up the context window. This change adds a script-based attachment-download capability: download to disk, then extract relevant lines with `grep`/`head`/`tail`. It also brings the new content into compliance with the repo's AI 铁律 (de-identify examples, English body), since the original draft leaked internal hostnames / product names / Jira IDs and was written in Chinese.

## What Changes

- Add an "Attachment Download" section to `skills/jira-read/SKILL.md`: auth elements (PAT Bearer + mTLS client cert + SSL `-k`), attachment URL source, script usage, download & archive flow.
- Add §7 "Attachment Download Report" format to `skills/jira-read/reference.md`.
- Add `skills/jira-read/scripts/download_jira_attachments.sh` (Bearer with Basic fallback; `JIRA_URL` and `JIRA_PERSONAL_TOKEN` required, fail-fast).
- De-identify all new examples (generic placeholders) and translate the new body to English (Chinese trigger words kept in `description`).
- De-identify pre-existing internal project-code example IDs within `skills/jira-read/reference.md` (prefix-only swap to a neutral prefix, numbers preserved).

## Capabilities

### New Capabilities

- `jira-read`: attachment-download contract — download to disk, never into Agent context; report format per reference §7; generic placeholders only.

### Modified Capabilities

- (none — no existing `openspec/specs/jira-read/` entry)

## Impact

- Skills: `skills/jira-read/SKILL.md`, `skills/jira-read/reference.md`, `skills/jira-read/scripts/download_jira_attachments.sh`
- Docs: `docs/generated/skills-index.md` (description unchanged → no content change expected; regenerated to confirm)
- No runtime app code; no BREAKING change to existing read-from-cache / API-fetch behavior
- Out of scope: repo-wide internal-identifier debt (internal hostname / product name / project code) in other skills (`jira-fix-workflow`, `opsx-jira-fix-workflow`, `merge-discipline` evals) and `docs/merge-coverage-gate-bypass-incident.md` — tracked as a separate cleanup
