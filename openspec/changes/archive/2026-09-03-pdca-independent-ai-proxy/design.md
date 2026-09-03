## Context

Queue-child PDCA hosts already occupy stage exits when `Stage-exit policy: ai-proxy`. Independent invocation cannot: mode detection is manual/auto only, and `ai-proxy-discipline` plus the `ai-proxy` spec require a queue-child conjunction. This change implements proposal solution 1 (overlay + conversation-local this-run contract) under frozen intake 3+5.

Stakeholders: authors of the four PDCA hosts, `write-workflow` (must remain two-state), queue orchestrator (already three-valued policy; no semantic change required).

Constraints: do not delete `ai-proxy-discipline`; do not move the charter into `workflow-mode-lifecycle`; do not edit `goal-driven-workflow` or `write-workflow` bodies; Jira PR-open / archive+PR-open terminals stay `queue-child`-only; description ≤1024 characters.

## Goals / Non-Goals

**Goals:**

- Independent PDCA invocation with listed triggers enters thin freeze, then occupancy.
- Mid-run 「切换 ai-proxy」 on those hosts requests overlay the same way.
- Lifecycle recognizes overlay (auto carrier + policy); discipline owns freeze, occupancy, charter.
- Hosts stay thin pointers. `write-workflow` ignores overlay.

**Non-Goals:**

- Deleting `ai-proxy-discipline` or treating ai-proxy as a third control-flow enum.
- File-backed run contracts.
- Changing `goal-driven-workflow` standalone Armed/Launch behavior.
- Changing queue Mode propagation semantics.

## Decisions

1. **Activation key is `Stage-exit policy: ai-proxy` only**  
   Queue child is one *source* of that field, not a required conjunct. Alternative (keep conjunction + add a parallel Independent section) rejected: two pointers drift.

2. **Thin freeze is conversation-local**  
   Template in `ai-proxy-discipline/reference.md`. Occupancy starts only after destination + constraints + policy are written and confirmed. Alternative (`.goal-driven/run-contracts/`) rejected: second card format.

3. **Lifecycle overlay ≠ third mode enum**  
   Recognition/switch/revert/batch-pass live here; charter does not. Mapping: overlay → auto carrier + policy ai-proxy. Revert-to-manual also clears overlay. Hosts whose `description` omits ai-proxy triggers MUST ignore overlay (`write-workflow` covered without editing it). Alternative (user-facing three-mode enum) rejected: dual vocabulary with `Stage-exit policy`.

4. **Trigger list (PDCA `description` only)**  
   「ai-proxy 模式」「AI 代理模式」「切换 ai-proxy」 / "ai-proxy mode" / "switch to ai-proxy". Must not rely on the substring 「自动」. Discipline `description` stays charter-focused (already long); freeze steps stay in body/reference.

5. **Presence tier 1 carve-out**  
   Explicit opt-in + completed freeze ⇒ proxy MAY occupy later checkpoints. Freeze Q&A stays with the present human. Do NOT line on discipline `description` is updated so it does not veto that grant.

6. **Jira split**  
   Shared Unattended pointer = policy occupancy (same as solve). Queue-child block = issue supply + PR-open / archive+PR-open terminals only.

7. **Batch SKILL**  
   Touch only if lifecycle’s batch sentence would contradict current three-value propagation; then one-line alignment, no semantic change.

## Risks / Trade-offs

- [Conversation contract lost on new session] → Accept for standalone PDCA; queue cards remain the durable form.  
- [Discipline description length] → Do not add freeze checklist to frontmatter.  
- [「自动」 vs overlay mis-parse] → Overlay triggers must not be the auto-mode table; if both appear, overlay+freeze wins over naked auto.  
- [write-workflow loads lifecycle] → Inert rule is in lifecycle spec/skill, not in write-workflow body.  
- [Same-context fake proxy] → Occupancy still requires fresh-context counterpart per existing protocol; this design does not relax that.

## Migration Plan

- Additive skill/spec text; no data migration.  
- Rollback: revert the feature branch.  
- After archive, main specs `ai-proxy` and `workflow-mode-lifecycle` pick up the deltas.

## Open Questions

None blocking. Deferred items from intake are closed by decisions 2, 4, and 6.
