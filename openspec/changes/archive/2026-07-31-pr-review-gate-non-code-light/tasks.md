## 1. pr-code-review depth

- [x] 1.1 Document `depth=full|light` in `skills/pr-code-review/SKILL.md` (default full; light = dual-axis without mandatory parallel multi-perspective)
- [x] 1.2 Bump `pr-code-review` patch version; ensure Part R host contract mentions depth
- [x] 1.3 Update `openspec/specs/pr-code-review/spec.md` from delta (or sync at archive)

## 2. merge-discipline Part R

- [x] 2.1 Add `pr-review-gate` preference resolution (scan order + unset≡always) to Part R
- [x] 2.2 Add surface classifier; put authoritative allow/deny table in `reference.md`; SKILL.md summarizes + points
- [x] 2.3 Wire depth selection: always→full; never→skip+留痕; ask→user; non-code-light→light|full by surface
- [x] 2.4 Update Part R checklist in `reference.md`; bump `merge-discipline` version
- [x] 2.5 Update `openspec/specs/merge-discipline/spec.md` from delta (or sync at archive)

## 3. Repo preference + verification

- [x] 3.1 Add `pr-review-gate: non-code-light` next to coverage-gate in `AGENTS.md` with a one-line comment
- [x] 3.2 Add or adjust merge-discipline eval for skills-only / mixed surface if evals exist
- [x] 3.3 Run `npm run lint:skill-description`; regenerate skills-index if descriptions change
