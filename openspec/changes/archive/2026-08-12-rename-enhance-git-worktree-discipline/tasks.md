## 1. Skill package

- [x] 1.1 Create `skills/git-worktree-discipline/SKILL.md` (English body, Chinese triggers, preference loop, thin host integration)
- [x] 1.2 Create `skills/git-worktree-discipline/reference.md` (gate parse, suitability signals, multi-repo/pack checklist, create/remove command notes)
- [x] 1.3 Delete `skills/workspace-isolation-discipline/`

## 2. Hosts and closeout

- [x] 2.1 Update `solve-workflow` dependencies + prose + reference
- [x] 2.2 Update `opsx-solve-workflow` dependencies + prose
- [x] 2.3 Update `jira-fix-workflow` dependencies + prose
- [x] 2.4 Update `opsx-jira-fix-workflow` dependencies + prose
- [x] 2.5 Update `feature-branch-closeout` cleanup composition text

## 3. Docs and index

- [x] 3.1 Update `AGENTS.md` skill table + merge-preference note for `worktree-gate` if appropriate
- [x] 3.2 Deidentify + retarget `docs/git-worktree-multi-repo-local-verify-case.md`; update `docs/README.md` row
- [x] 3.3 Regenerate `docs/generated/skills-index.md`

## 4. OpenSpec main sync (on archive)

- [x] 4.1 Add `openspec/specs/git-worktree-discipline/spec.md`
- [x] 4.2 Remove `openspec/specs/workspace-isolation-discipline/`
- [x] 4.3 Update `openspec/specs/feature-branch-closeout/spec.md` composition requirement

## 5. Verification

- [x] 5.1 `npm run lint:skill-description` (or project equivalent) for new skill
- [x] 5.2 `node scripts/lint-skill-deidentification.mjs --staged` clean for staged skill/docs
- [x] 5.3 Grep: zero non-archive hits for `workspace-isolation-discipline` as live skill id
- [x] 5.4 `openspec validate rename-enhance-git-worktree-discipline --strict` (or project validate command)
