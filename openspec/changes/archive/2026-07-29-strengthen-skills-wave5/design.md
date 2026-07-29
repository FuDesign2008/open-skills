## Context

R1 lean host reference.md after waves 1–4. P0 only.

## Goals / Non-Goals

**Goals:** jira Stage3 + industry pointer lean; solve Missing Notice sync.

**Non-Goals:** P1 writeback/closeout template extraction; deleting exit scripts / state.json / mode tables.

## Decisions

1. Keep jira gate divergence text for industry 🚫 (stop + Jira comment).
2. Missing Notice: expand full dependency list to match frontmatter (explicit list, not "see frontmatter only" — clearer for agents).
3. No version bump required on SKILL.md if only reference changes — bump jira-fix / solve patch for traceability anyway (solve 1.20.0→1.20.1, jira 3.23.0→3.23.1).

### Stage 4 review — Pass (auto; solution 1)

## Risks / Trade-offs

- [Over-delete Stage 3] → Keep difficulty + artifact path
- [Lose gate] → Keep stop + Jira comment sentence

## Migration Plan

Edit references → validate → verify → archive/PR.

## Open Questions

None.
