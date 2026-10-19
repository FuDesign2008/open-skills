## 1. Failing contract check

- [x] 1.1 Add `scripts/competitive-research-contract.test.mjs` asserting the hard-cut id, behavior-before-mechanism text, `analysis-core` lean load, host dependencies, and `known-issue-research` boundary. Run it and record the failure before editing those skills.

## 2. competitive-research skill

- [x] 2.1 Move `skills/tech-research-workflow/` to `skills/competitive-research/` and set frontmatter `name`, version `2.0.0`, and a single-line description with Chinese triggers 「技术调研」「竞品调研」「产品调研」「全面调研」 plus the Do-NOT-use boundary. Keep `dependencies: [effective-web-research]`.
- [x] 2.2 Rewrite the body for layer selection (behavior, then boundaries when adopting, then mechanism; risk surfaces on demand), evidence source grades, and the lean path hosts call. Keep audit, mechanism forensics, design mapping, reflux, and the report family.
- [x] 2.3 Point `reference.md` at the new id and add the layer and evidence-source shapes there.

## 3. Thin integration

- [x] 3.1 In `analysis-core`, load `competitive-research` on the lean path when the expected outcome is user-visible, including boundary operations when that behavior will be adopted. Do not add it to `analysis-core` frontmatter `dependencies`.
- [x] 3.2 Add the boundary sentence to `known-issue-research` description.
- [x] 3.3 Add `competitive-research` to the frontmatter `dependencies` and one analysis-stage delegation line in `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, and `opsx-jira-fix-workflow`.

## 4. Verification

- [x] 4.1 Re-run the contract test and expect pass.
- [x] 4.2 Run description lint and de-identification lint on the skill diff. Search `skills/` and `AGENTS.md` for `tech-research-workflow` and require zero hits. The active spec folder moves at archive, not in this task.
- [x] 4.3 Regenerate `docs/generated/skills-index.md` and run `openspec validate upgrade-competitive-research --type change --strict`.
- [x] 4.4 Run `npm test`.
