## 1. Attachment Download content

- [x] 1.1 Add "Attachment Download" section to `skills/jira-read/SKILL.md` (auth / URL / script / flow), English body
- [x] 1.2 Add §7 Attachment Download Report to `skills/jira-read/reference.md`
- [x] 1.3 Add `skills/jira-read/scripts/download_jira_attachments.sh` (Bearer + Basic fallback; `JIRA_URL` / `JIRA_PERSONAL_TOKEN` required)

## 2. Compliance (de-identify + English)

- [x] 2.1 Replace internal hostname / product name / Jira ID with generic placeholders in new content
- [x] 2.2 Translate new Chinese sections to English (keep `description` trigger「下载附件」)
- [x] 2.3 Prefix-swap the pre-existing internal project-code prefix → `PROJ-` within `skills/jira-read/reference.md`

## 3. Index & verify

- [x] 3.1 Regenerate `docs/generated/skills-index.md`; confirm no diff (description unchanged)
- [x] 3.2 `npm run lint:skill-description` (0 errors)
- [x] 3.3 `bash -n` on the download script
- [x] 3.4 Scan `skills/jira-read/` for internal identifiers (hostname / product / project-code) → zero hits

## 4. OpenSpec

- [ ] 4.1 `openspec validate` — CLI not installed in this env; change structure hand-verified against the archived house format
