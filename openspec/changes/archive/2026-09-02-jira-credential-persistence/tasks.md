## 1. jira-read credential contract

- [x] 1.1 Rewrite `skills/jira-read/SKILL.md` Authentication: three-level chain (`JIRA_PERSONAL_TOKEN` → alias `JIRA_PAT` → `~/.config/jira-certs/jira-pat.txt` / Windows `%USERPROFILE%\.config\jira-certs\jira-pat.txt`), Credentials field (path, single-line format, rotation), mcp-atlassian optional for env injection only
- [x] 1.2 Remove the “build an equivalent curl from the Authentication table” fallback; examples MUST NOT interpolate the PAT into argv; tell the agent not to paste the PAT into chat once env or file exists, and not to echo it in replies or logs
- [x] 1.3 Split Error Handling: empty chain → ask-and-persist; 401/403 → rotate token and update the file; TLS/cert → mTLS pair + do not use Schannel curl for PEM
- [x] 1.4 Update `skills/jira-read/reference.md` so download/auth examples follow the chain and Credentials field (no PAT in sample commands)

## 2. Download scripts

- [x] 2.1 Change `skills/jira-read/scripts/download_jira_attachments.sh` to resolve token (canonical env → alias → file) instead of fail-fast on env only; do not print the token; keep PEM `--cert/--key` for non-Schannel curl
- [x] 2.2 Add a node sidecar under `skills/jira-read/scripts/` that reads the same chain, uses `key`/`cert` PEM files, TLS 1.3, writes the attachment to disk, and never logs the PAT
- [x] 2.3 In SKILL.md, probe `curl -V` for Schannel (or missing PEM `--cert` support) and select node vs bash; document that Windows Schannel MUST use node

## 3. Host thin pointers

- [x] 3.1 `skills/jira-fix-workflow/SKILL.md`: Prerequisites and Stage 0 — run `jira-read` chain first; do not abort solely because mcp-atlassian is missing; MCP `jira_get_issue` optional; degrade to `jira-read` cache when MCP is absent
- [x] 3.2 `skills/jira-fix-workflow/reference.md` Stage 0 template: replace hard `mcp-atlassian: ✅ Connected` with credential-chain / MCP-optional wording
- [x] 3.3 `skills/jira-status-writeback/SKILL.md`: one line that this skill does not resolve PAT files; session/MCP auth follows `jira-read`
- [x] 3.4 Confirm `jira-fix-batch` has no copied auth table (enqueue shell only)

## 4. Unarchived overlap

- [x] 4.1 Note in this change’s design (already) and in `jira-read` SKILL.md that “equivalent curl” is forbidden, superseding `openspec/changes/2026-08-06-jira-read-attachment-download` if that delta is still open

## 5. Verify

- [x] 5.1 `node scripts/gen-skill-docs.mjs` if descriptions changed; `npm run lint:skill-description`
- [x] 5.2 `node scripts/lint-skill-deidentification.mjs --staged` (or scoped scan of touched skill files) — no internal hostnames or real PAT
- [x] 5.3 `bash -n` on the bash download script; `node --check` on the node sidecar
- [x] 5.4 `openspec validate jira-credential-persistence`
- [x] 5.5 Grep `skills/jira-read` and `skills/jira-fix-workflow` for `PAT='`, manual-curl fallback, and “mcp-atlassian is configured with a valid PAT” as the sole prerequisite — zero hits except historical/archive notes
