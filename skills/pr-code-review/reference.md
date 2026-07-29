# PR Code Review — Reference

## Comment format (issues remain)

```markdown
### Code review

**Strengths:** <one short line or "none noted">

## Standards
1. <brief> (Critical|Important|Minor; confidence N) — <guidance cite or smell name>
https://github.com/<owner>/<repo>/blob/<full-sha>/<path>#L<start>-L<end>

## Spec
1. <brief> (Critical|Important|Minor; confidence N) — <plan/spec quote>
https://github.com/<owner>/<repo>/blob/<full-sha>/<path>#L<start>-L<end>
```

If Spec was skipped: `## Spec` → `Skipped — no spec available`.

## Comment format (pass)

```markdown
### Code review

No blocking issues (confidence ≥80 Critical/Important) on Standards or Spec.
Checked project guidance and plan/spec sources where available.
```

## Permalink rules

- Full git SHA only (never abbreviated; never shell-expand inside the comment).
- Repo must match the PR.
- Fragment `#Lstart-Lend` with ≥1 line context before and after.

## Smell baseline (Standards; judgement calls)

Use only when repo docs are silent. **Repo docs override.** Never treat baseline-alone as a hard violation. Skip anything tooling already enforces.

| Smell | Hint |
|-------|------|
| Mysterious Name | Name does not reveal role → rename or rethink design |
| Duplicated Code | Same shape in multiple hunks → extract |
| Feature Envy | Method uses another's data more than its own → move |
| Data Clumps | Same fields travel together → bundle type |
| Primitive Obsession | Primitive stands for a domain concept → small type |
| Repeated Switches | Same type cascade recurs → polymorphism or shared map |
| Shotgun Surgery | One change scatters across many files → gather |
| Divergent Change | One module edited for unrelated reasons → split |
| Speculative Generality | Abstraction for unneeded future → delete until real need |
| Message Chains | Long `a.b().c()` → hide behind one method |
| Middle Man | Mostly delegates → remove and call target |
| Refused Bequest | Ignores most inheritance → prefer composition |

Source: Fowler, *Refactoring* ch.3 (via mattpocock dual-axis review practice).

## Post-feedback reception (optional)

Not part of merge Part R. When implementing review feedback:

1. Read fully → restate → verify in this codebase → evaluate → respond or push back → implement one item at a time.
2. Do not performatively agree ("You're absolutely right!") before verification.
3. Clarify unclear items before coding any of the batch.

## Origins

- Claude Code plugin `code-review` (eligibility, multi-agent perspectives, ≥80 filter, permalinks) — Boris Cherny / Anthropic.
- mattpocock `code-review` skill (Standards∥Spec, fixed-point, smell baseline).
- Superpowers `requesting-code-review` / `receiving-code-review` (plan alignment, severity, strengths-first, reception rigor).
