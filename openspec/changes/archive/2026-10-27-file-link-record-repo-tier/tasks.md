## 1. Tier and tests

- [x] 1.1 Add a failing test: a record in a repository resolves a repo-relative path while `--file-root` points at a different tree.
- [x] 1.2 Add the record's repository root as a resolution tier after the workspace root.
- [x] 1.3 Update `SKILL.md`, `reference.md`, and the contract assertion with the new tier list.

## 2. Verification

- [x] 2.1 Run `npm test` under Node 22, `openspec validate` for this change, and regenerate the acceptance views.
