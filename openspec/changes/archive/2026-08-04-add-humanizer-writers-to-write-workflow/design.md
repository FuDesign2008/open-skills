## Context

User confirmed: vendoring both EN and ZH humanizer skills into open-skills, and making both **strong dependencies** of `write-workflow` (option B + wiring 2). Upstream MIT projects.

## Goals / Non-Goals

**Goals:** ship `humanizer` + `humanizer-zh`; wire write-workflow routes + prerequisite check; preserve attribution; adapt frontmatter to repo conventions.

**Non-Goals:** merging the two into one skill; optional-only deps; auto pipeline after every tech-review; modifying solve-workflow.

## Decisions

1. **Two skills** — `humanizer` (EN body) and `humanizer-zh` (ZH body exception).
2. **Strong deps on write-workflow** — intentional; install surface larger.
3. **Language routing** — zh → humanizer-zh, en → humanizer; ask once if unclear.
4. **Gate difference** — humanizer confirms input text/path; no tech-review §1.
5. **Portable package** — SKILL.md + LICENSE (+ short ATTRIBUTION); omit upstream `agents/` / `scripts/` unless needed for core behavior (core is prompt-only).
6. **Frontmatter** — single-line `description`; drop `|` blocks and `allowed-tools` AskUserQuestion lists.
7. **Opsx** — this change archives into main specs.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Write blocked without humanizers | Document in description/Do NOT / install hint; user-confirmed |
| Dual skill drift | ATTRIBUTION points to upstream; keep names aligned |
| Description >1024 | Trim triggers; lint |
| Iron law 6 tool hardcode | Strip AskUserQuestion from zh |

## Migration Plan

Additive. Rollback = revert PR.

## Open Questions

None blocking.
