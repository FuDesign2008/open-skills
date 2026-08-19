# Tasks — add-project-skill-seeding

## 1. Workflow contract

- [x] SKILL.md: description mentions seeding/evolution; layered-architecture table rebuilt (paradigm / project skills / corpus); Scope lists the two project skills as deliverables
- [x] Stage 2: "Project attribution skill (code-insight)" subsection — probe / seed / run-and-note-gaps lifecycle
- [x] Stage 5: "Project optimization skill (code-optimizer)" subsection — same lifecycle
- [x] Iteration loop: "Skill evolution" subsection — fold validated lessons at stop conditions and ~5-round checkpoints
- [x] reference.md: reading guide reframed (corpus = seed + fallback; Part 3 = seed slots; Part 4 stays)

## 2. Verification

- [x] `npm run lint:skill-description` (0 errors)
- [x] `node scripts/gen-skill-docs.mjs` + index consistency (`git diff --exit-code`)
- [x] `node scripts/lint-skill-deidentification.mjs --staged`
- [x] Contract grep: code-insight / code-optimizer present at Stage 2 / Stage 5 / loop sections; no platform-path enumeration in the seeding text (intent-level only)
- [x] `openspec validate add-project-skill-seeding`
- [x] Line-count check (SKILL.md < 500)

## 3. Closeout

- [x] Archive the change; update main spec `perf-optimize-workflow/spec.md` (ADDED + MODIFIED)
- [x] Commit on `feat/perf-paradigm-skills`; push (PR #277 updates)
