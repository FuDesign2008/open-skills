## 1. Move skill directories and frontmatter

- [x] 1.1 `git mv skills/goal-driven-batch skills/goal-driven-queue`; set `name: goal-driven-queue`; retitle; bump version; keep old id in description triggers
- [x] 1.2 `git mv skills/jira-fix-batch skills/jira-fix-queue`; same for `name`, title, version, triggers
- [x] 1.3 `git mv skills/opsx-jira-fix-batch skills/opsx-jira-fix-queue`; keep `opsx-` prefix; same metadata updates

## 2. Live references (exclude archive)

- [x] 2.1 Replace ids in remaining `skills/` (hosts, lifecycle, evals, `_eval-en-batch1-tools`) longest-first
- [x] 2.2 Replace ids in `AGENTS.md`
- [x] 2.3 Replace ids in live `openspec/specs/goal-queue/spec.md` and `openspec/specs/skill-authoring-language/spec.md` (including Purpose line that names the orchestrator)
- [x] 2.4 Replace ids in `docs/` content (except this change will regenerate `docs/generated/skills-index.md`)

## 3. Index and validate

- [x] 3.1 `node scripts/gen-skill-docs.mjs`
- [x] 3.2 `rg` old ids in `skills/`, `AGENTS.md`, `openspec/specs/`, `docs/` excluding `openspec/changes/archive/` — zero hits
- [x] 3.3 `openspec validate --change rename-batch-skills-to-queue`

## 4. Archive and PR

- [x] 4.1 Archive the change via `openspec-archive-change`
- [ ] 4.2 Commit on `feat/rename-batch-skills-to-queue` (do not add `.goal-driven/` or unrelated untracked docs)
- [ ] 4.3 Open PR; do not merge
