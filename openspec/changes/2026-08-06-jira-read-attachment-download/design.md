## Context

`jira-read` reads Jira issue data from local cache or the mcp-atlassian API. Attachments (logs, screenshots) were only surfaced as "visit Jira". This change adds script-based download-to-disk so attachment content never enters the Agent context. The original PR draft violated 铁律 2 (data de-identification: internal hostname / product name / Jira IDs) and 铁律 3 (English body); this change implements the fix within the `jira-read` directory and formalizes the behavior contract here.

User-confirmed scope: `jira-read` directory only + this OpenSpec change. Repo-wide internal-identifier cleanup is a separate issue.

## Goals / Non-Goals

**Goals:**

- Attachment content never enters Agent context; download to disk + targeted extraction.
- All new `jira-read` content uses generic placeholders and English body.
- Behavior contract captured in OpenSpec; de-identification rule codified to prevent regression.

**Non-Goals:**

- Repo-wide de-identification of internal identifiers in other skills/docs (separate issue).
- Changing existing read-from-cache / API-fetch behavior.
- Translating pre-existing English content (already English).

## Decisions

1. **Script auth — Bearer then Basic fallback** — Jira PATs work as both Bearer and Basic (`PAT:x-oauth-basic`); keep the fallback for environments where Bearer is rejected. Preserved from the original draft, not newly invented.
2. **`JIRA_URL` required (no baked-in default)** — a public skill must not ship a real internal hostname as a default. Fail fast with a hint (`jira.example.com`) instead. The script is new/unreleased, so zero migration cost.
3. **Example ID prefix swap → `PROJ-`** — replace the internal project-code prefix only, numbers preserved (numbers are not org-identifying; only the project prefix is). Applied only within `jira-read`.
4. **English body, Chinese triggers** — per 铁律 3; `description` keeps「下载附件」.

## Risks / Trade-offs

- [Removing the `JIRA_URL` default may surprise testers] → Mitigation: fail-fast message states the env var name and an example; auth table in SKILL.md documents it.
- [Basic-auth fallback sends the PAT as username] → Mitigation: standard Jira PAT-as-Basic pattern; only attempted after Bearer fails.

## Migration Plan

1. Edit `SKILL.md`, `reference.md`, the download script.
2. Scaffold this OpenSpec change.
3. Regenerate skills-index; confirm no diff (description unchanged).
4. Archive after verify.

## Open Questions

- None.
