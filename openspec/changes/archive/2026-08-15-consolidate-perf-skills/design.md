# Design — consolidate-perf-skills

## Context

Prior changes landed a two-skill architecture (host + evidence-discipline gate) and then deleted the loop protocol skill in favor of an environment gate. This change finishes the consolidation the user directed: one perf skill, integrated into generic hosts via thin routing references.

## Goals / Non-Goals

- Goals: single `perf-optimize-workflow` carrying paradigm + in-file evidence gate + knowledge layer + case archive; routing edges in three generic hosts; zero content loss.
- Non-Goals: knowledge refresh; touching already-correct references (known-issue-research §2.1, write-workflow boundary).

## Decisions

1. **Single in-file disciplines section + per-stage number pointers** (vs distributing discipline prose into each stage body): disciplines cross-reference each other (1↔6 rAF spans, 8 rides on 4's throttle matrix) and read as a unit; stage bodies stay lean with gate lines like today. Cost: none — this is how the mount table already reads, minus the cross-file hop.
2. **Routing edges are informational lines, not dependencies**: non-perf runs through solve/jira-fix/opsx-solve must not abort for a perf skill they never use — the analysis-core contrast (embedded methodology vs routed domain host) is why the shapes differ deliberately.
3. **Trigger inheritance for the discipline phrases** (「伪影排查」「口径校准」「设备画像」): preserves the routing surface the discipline's description carried; cheap in the description budget (~660/1024).
4. **Manual archive for the capability deletion**: openspec CLI 1.3.1 rejects archiving a change that empties a capability spec (validated in the prior change) — same manual-move procedure, recorded here.
5. **RELEASE-NOTES 2.0.0 edited in place**: the entry is unreleased (open PR), so accuracy for the eventual merge beats append-only history here.

## Risks / Trade-offs

- Content-move loss → mitigated: keyword mapping grep (nine discipline keywords + case-archive markers) and deletion-side diff review in tasks.
- Discipline independent mountability lost → accepted by user ruling (single consumer; if a second host appears later, the in-file section is the extraction seam — same seam logic as the knowledge chapters).
- Description drift → lint gate in tasks.

## Open Questions

None blocking.
