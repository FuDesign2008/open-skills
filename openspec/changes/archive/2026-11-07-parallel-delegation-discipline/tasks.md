## 1. Create the shared discipline

- [x] 1.1 Create `skills/parallel-delegation-discipline/SKILL.md` with frontmatter: `name: parallel-delegation-discipline`, `version: "1.0.0"`, `user-invocable: false`, a single-line double-quoted `description` under 1024 characters carrying the four routing elements and Chinese triggers (「并行执行」「并行委派」「子代理并行」「多代理并行」) plus English equivalents, and `dependencies: []`.
- [x] 1.2 Write the Iron Law: only independent units with disjoint write sets may run in parallel, and parallelism changes no stage order, gate, write ownership, or evidence responsibility.
- [x] 1.3 Write the admission test as five checkable conditions, each naming the artifact, command, or path set that resolves it; state that a failed condition means serial execution plus a stated reason.
- [x] 1.4 Write the four composition modes with the split basis each requires, and the collection implication of each.
- [x] 1.5 Write the bounded return contract: self-contained instruction, summary fields (conclusion, evidence, artifact path, unresolved item), and a thin reference to `context-budget-discipline` for the size bound instead of a number.
- [x] 1.6 Write the collection duty: cross-unit write-conflict check plus fresh-evidence acceptance per `completion-evidence-discipline`, and the rule that a unit's self-report cannot satisfy a stage gate.
- [x] 1.7 Write the serial reservation list and the write-isolation rule (disjointness plus one isolated workspace per writing unit created through `git-worktree-discipline`).
- [x] 1.8 Write the disclosure rule (plan announced in the host's existing stage-confirmation output, no new pause) and the serial override (user request wins, reason recorded).
- [x] 1.9 Write the cost posture (parallelism is not cheaper; default 3–5; above 5 needs a stated reason) and the boundary section naming the four adjacent skills by responsibility without restating their rules.
- [x] 1.10 Decide whether `reference.md` is needed from the final `SKILL.md` length; if created, move only the delegation-prompt and summary templates there and reference it from `SKILL.md`.
- [x] 1.11 Compose with `agent-role-separation`: state that a project-provided role contract's task card, result card, fail-closed acceptance, and write boundaries are authoritative when present; keep a generic summary fallback for projects without one; do not restate `Verdict`/`Confidence`/`Model tier`.
- [x] 1.12 Keep the body declarative: no slots, watchdogs, schedulers, queue processes, or background-process mechanics; name `goal-driven-queue` as the owner of slot dispatch.

## 2. Wire the four hosts

- [x] 2.1 `skills/solve-workflow/SKILL.md`: add `parallel-delegation-discipline` to frontmatter `dependencies`; add one pointer line each at stage 2 (analyze), stage 4 (review), and stage 7 (verify). Keep stages 1–5 write-free.
- [x] 2.2 `skills/opsx-solve-workflow/SKILL.md`: same dependency line; pointers at stage 2, stage 4, and stage 7. Keep OpenSpec artifact writes single-owner.
- [x] 2.3 `skills/jira-fix-workflow/SKILL.md`: same dependency line; pointers at stage 3, stage 5, and stage 8. State that Jira status transitions and comments stay serial, and that stage 8's 8a → 8b dependency edge stays serial while only independent units of 8a and 8c may join a parallel set.
- [x] 2.4 `skills/opsx-jira-fix-workflow/SKILL.md`: same dependency line; pointers at stage 2, stage 4, and stage 7. State that OpenSpec artifacts and Jira transitions stay serial.
- [x] 2.5 In each host, phrase the pointer as load-and-apply, with the plan announcement placed in the stage output the host already produces; do not restate admission conditions, modes, or the return contract.

## 3. Adjust the shared review skill

- [x] 3.1 `skills/staged-review-flow/SKILL.md`: change the single dual-axis sentence so that, when the axes run as delegated units, the method comes from `parallel-delegation-discipline`, and the final cross-axis verdict stays serial. Keep the requirement permissive ("may").

## 4. Update the registry

- [x] 4.1 `AGENTS.md`: add `parallel-delegation-discipline` to the dependency column of the four host rows and add a row for the new skill in the discipline section.
- [x] 4.2 Regenerate `docs/generated/skills-index.md` with `node scripts/gen-skill-docs.mjs`.

## 5. Verify

- [x] 5.1 Run `npm run lint:skill-description` and confirm the new description passes.
- [x] 5.2 Run `npm run lint:deid -- --staged` after staging, and confirm no internal identifier is introduced.
- [x] 5.3 Run `node --check scripts/gen-skill-docs.mjs`, then regenerate and confirm `git diff --exit-code docs/generated/skills-index.md` is clean after the regeneration commit.
- [x] 5.4 Run `openspec validate --strict --all` and confirm both the change and the main specs pass.
- [x] 5.5 Grep the repository for restated methodology in host bodies: confirm the admission conditions, the four mode names, the summary field list, and the reservation list appear only in `parallel-delegation-discipline`; confirm the discipline does not restate `agent-role-separation`'s `Verdict`/`Confidence`/`Model tier` fields.
- [x] 5.8 Re-read `openspec/specs/agent-role-separation/spec.md` and the four hosts' current state after any rebase; confirm no requirement or Stage-8 split conflicts with this change.
- [x] 5.6 Grep the four hosts for `sub-?agent|parallel` and confirm each hit is a pointer sentence, not a method paragraph.
- [x] 5.7 Confirm the serial-path invariant by reading each host's diff: a run selecting no parallelism produces the same stage order, exits, and artifacts as before.
