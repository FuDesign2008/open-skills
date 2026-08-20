# OPSX Solve Workflow — Output Format Reference

Output templates for each stage of the `opsx-solve-workflow` skill, for the AI to follow when formatting output.

Stage-2 analysis methodology lives in `analysis-core` (not repeated here).

---

## Stage 1 Clarify the Problem

```text
【Problem restatement】...
(describe only the user's intent and symptoms — no root-cause judgment or fix suggestion; technical conclusions belong to stage 2)
【Key elements】Goal: ... / Constraints: ... / Background: ... / Expected outcome: ...
【OpenSpec change】Suggested change name: ...
【Confirmation needed】Proceed with this change?
```

---

## Stage 2 Analyze the Problem

Analysis methodology and output format live in `analysis-core` (§§1-3 + §5). The stage output MUST close with the **analysis gate output block** (SoT: `analysis-core` §5 — red loop / debug entry / scenario supplements / temporary changes; missing block blocks Stage 3). Do not restate the block's fields here.

---

## Stage 7 Check & Verify

```text
【Verification results】
- OpenSpec validation: executed (openspec validate <name>, output: ...) / failed (reason: ...)
- Engineering verification: executed (command: ..., result: ...) / pending (manual action needed: ...)
- Behavior cross-check: executed (per-item comparison: ...) / pending (manual verification items: ...)
- Comparison against tasks.md: ...
- Side-effect check (functional: new issues introduced in other modules; non-functional: unexpected impact on performance/security/maintainability): ...
- Ready to archive: yes / no
```

---

## Stage 8 Review & Archive

```text
【Retrospective】
- Completed change: ...
- Specs updated: ...
- Archive location: ...
- Reusable lessons: ...
- Not worth solidifying: ... (one-off lessons, unverified judgments, etc. — never write these into long-term rules)
- Recommended carrier: AGENTS.md / CLAUDE.md / .cursor/rules/ / project-local skill / summary doc / not solidifying now, reason: ...
- Needs user confirmation to write: yes / no; if yes, wait for an explicit user request before writing
- Next steps: ...
- [Mode status] Auto mode completed this round and has reverted to manual. To continue auto mode next round, explicitly say "opsx 自动解决 xxx".
```

---

## Pre-merge checklist

See the strong dependency `merge-discipline`'s [reference.md](../merge-discipline/reference.md)「合并前检查清单」(single source, Parts A-D — do not copy its body into this file).
