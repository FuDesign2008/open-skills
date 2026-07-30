## Context

Callees list PDCA host names as reverse "Integrated by" inventories. AGENTS already says callees need not reverse-declare. Solution 3: authoring contract + repo-wide scrub to role phrases.

## Goals / Non-Goals

**Goals:**
- Codify host→callee SoT; no authoritative reverse name lists on callees.
- Scrub existing enumerations in bodies and routing descriptions.
- Replace `learn-and-improve` OpenSpec requirement that mandated listing integrators.

**Non-Goals:**
- Changing host `dependencies` edges.
- Rewriting methodology bodies.
- Removing forward delegation notes (e.g. hybrid → browser-debug-toolkit).

## Decisions

1. **Role phrase template**: `Referenced by PDCA hosts via frontmatter dependencies` (or equivalent); no host id inventory.
2. **Why-history**: Allowed to mention hosts as motivation ("across workflows…") without an Integrated-by contract list.
3. **AGENTS**: Extend the existing dependencies bullet — reverse name lists are not contract; role phrase OK; SoT = host frontmatter + AGENTS table.
4. **Description**: Strip host name lists used only as reverse-dep docs; keep triggers / what / when / Do NOT use.

## Risks / Trade-offs

- [Weaker in-skill navigation] → Mitigation: AGENTS dependency table + host frontmatter remain.
- [Missed files in scrub] → Mitigation: ripgrep for four-host patterns before verify.

## Open Questions

- None.
