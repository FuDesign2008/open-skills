## Context

`jira-read` documents PAT as env `JIRA_PERSONAL_TOKEN` injected by mcp-atlassian. The attachment script fail-fasts on that env and calls curl with PEM `--cert/--key`. On Windows, `curl.exe` is Schannel and cannot present that PEM pair. Machines without mcp-atlassian have no agreed file for the PAT, so the next chat session loses the token or greps it from transcripts.

Incident: `docs/jira-credential-storage-missing-incident.md`. Frozen skills: `jira-read` (SoT), `jira-fix-workflow`, `jira-fix-batch`, `jira-status-writeback`.

## Goals / Non-Goals

**Goals:**

- Three-level PAT resolution owned by `jira-read`, used before live MCP/HTTP fetch and before download scripts.
- Canonical env `JIRA_PERSONAL_TOKEN`, alias `JIRA_PAT`, file `~/.config/jira-certs/jira-pat.txt`.
- No PAT on argv; scripts/node read env or file; no manual “equivalent curl” that interpolates the token.
- After a store exists, do not echo the PAT in chat or ask the user to paste it again.
- Node sidecar when curl is Schannel / cannot use PEM file pairs.
- Error split: empty chain vs 401/403 vs TLS/cert.
- Credentials field in the access recipe.
- `jira-fix-workflow` Stage 0 / Prerequisites stop treating mcp-atlassian as the only injector; `reference.md` status line is not “mcp-atlassian Connected” as a hard fact.

**Non-Goals:**

- `opsx-jira-fix-workflow` (related host, not in frozen four).
- New `jira-auth-discipline` skill.
- OS credential manager / Keychain.
- A new full Jira REST issue-fetch client inside `jira-fix-workflow`. MCP-less live issue JSON stays `jira-read` cache degrade (and existing MCP when present).
- Committing PAT values; installing mcp-atlassian for the user.

## Decisions

1. **SoT is `jira-read`, hosts thin-point.** Copying the chain into every Jira skill would drift. `jira-fix-batch` stays enqueue-only. `jira-status-writeback` one line: it does not resolve PAT files.

2. **Canonical env `JIRA_PERSONAL_TOKEN`, alias `JIRA_PAT`.** Matches current skill/script and incident rec 1. Session scripts that used `JIRA_PAT` keep working. Examples in SKILL.md use only the canonical name.

3. **File next to mTLS certs.** Same directory the skill already uses for `client.crt` / `client.key`. Plaintext, same threat model as the key file. Not in any git repo.

4. **Scripts read the file themselves.** Do not rely on the agent `export`/`cat` into the conversation. Resolve order in script/node: env canonical → env alias → file.

5. **Download: probe then bash or node.** `curl -V` contains `Schannel` → node sidecar (`https.request` with `key`/`cert`, TLS 1.3). Otherwise keep `download_jira_attachments.sh`. Shared pieces (URL, ids) stay small; duplication is Prudent-Deliberate for two TLS stacks.

6. **`jira-fix-workflow` Stage 0.** Run the `jira-read` chain first. MCP `jira_get_issue` is optional transport. Missing MCP + missing cache + no other `jira-read` live path → abort. Missing MCP + cache present → continue. Do not abort only because mcp-atlassian is unconfigured. Update `reference.md` Stage 0 template (`mcp-atlassian: ✅ Connected`) to credential-chain / MCP-optional wording.

7. **Supersede unarchived `2026-08-06-jira-read-attachment-download`.** That delta still allows “equivalent curl”. This change forbids it. Archive that change first if possible; if both remain, this spec wins on anti-inline. Do not reintroduce SKILL.md “build curl from the Authentication table”.

8. **Anti-transcript.** First paste only when the chain is empty (ask-and-persist). After persist, never print the PAT. Skill text says not to paste into chat on later turns.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Plaintext PAT on disk | Same dir as `client.key`; never commit; chmod/ACL is user-local; later OS manager is out of scope |
| Token still in process env | Better than argv/`ps`; scripts must not log it |
| Two download implementations | Probe once; keep both small; no third helper skill |
| Stage 0 vs MCP-less live fetch | Explicit non-goal: no new issue REST client; cache degrade |
| Archive merge revives equivalent curl | Decision 7; call out in tasks |
| User pastes PAT anyway | Skill cannot prevent paste; persist immediately and stop echoing |

## Migration Plan

- No runtime deploy. Ship skill + scripts; users who already export `JIRA_PERSONAL_TOKEN` need no change.
- Users with only `JIRA_PAT` or only `jira-pat.txt` start working without mcp-atlassian.
- Rollback: revert the skill/script commit.

## Open Questions

- None blocking. `opsx-jira-fix-workflow` pointer is deferred (human scope ticket if desired later).
- TLS 1.3-only gateway vs node was not live-probed this run; node sidecar still matches the incident’s working recipe.

## Review record (Stage 4)

- **Standards:** Type 2 door. Dual download is Prudent-Deliberate. Layer A quick path (same skill directory, no cross-process import). Layer C: do not log secrets.
- **Spec:** Chain, alias, anti-inline, anti-transcript, node fallback, error split, Credentials field, Stage 0 MCP-optional.
- **Verdict after spec patch:** Pass both axes (proxy had rejected the first review for Stage 0 / RC3 / archive; those are now in specs + this design).
