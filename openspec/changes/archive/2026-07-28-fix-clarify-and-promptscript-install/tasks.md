## 1. Clarifying discipline

- [x] 1.1 Update `skills/clarifying-question-discipline/SKILL.md`: remove any「一问一答」risk; add clarify-first section; bump patch version
- [x] 1.2 Grep workflows for「一问一答」and fix stray phrases; keep「一次一问、多轮问清」pointers; optionally add short「问清优先」hint in the one-line pointer

## 2. Install helper

- [x] 2.1 Add `scripts/install-skills.mjs` (default source `FuDesign2008/open-skills`, `--skill '*'` / args, agents `claude-code cursor opencode` or `OPEN_SKILLS_AGENTS`, denylist `promptscript`/`eve`, fail if log matches PromptScript ✗)
- [x] 2.2 Update `AGENTS.md` merge/release install recipe to the helper; remove「已知无害」misdiagnosis; note upstream issue
- [x] 2.3 Update `docs/INSTALL.md` (and README install snippet if it duplicates the bad recipe) to recommend the helper for non-interactive global full install

## 3. Verify

- [x] 3.1 `openspec validate fix-clarify-and-promptscript-install`
- [x] 3.2 Dry-run helper against local or remote with one skill; assert zero PromptScript ✗ in output
- [x] 3.3 `node --check scripts/install-skills.mjs`; `node scripts/gen-skill-docs.mjs` if skill frontmatter changed
