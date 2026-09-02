## 1. Version SoT and CI

- [x] 1.1 Add `"version": "2.18.0"` to root `package.json`
- [x] 1.2 Rewrite `.github/workflows/release.yml` to read/bump `package.json` and trigger on `skills/**` only

## 2. Remove user-facing full-capability trees

- [x] 2.1 `git rm` `.claude-plugin/`, `.cursor-plugin/`, `commands/`, tracked `.opencode/` files

## 3. Docs and contributor knowledge base

- [x] 3.1 README.md / README.zh-CN.md: single generic install; drop Commands badge and full-capability pointer
- [x] 3.2 Rewrite `docs/INSTALL.md` as npx-only; update FAQ paths
- [x] 3.3 Update `docs/README.md`; delete `docs/CURSOR_MARKETPLACE_PUBLISH.md` and OpenCode-only install/impl docs that only served the dropped track
- [x] 3.4 Rewrite `AGENTS.md` structure, install, version, verify sections (keep `.claude/` OpenSpec)

## 4. Specs and skill notices

- [x] 4.1 Apply live spec deltas: `write-workflow`, `brainstorm-workflow`, `goal-run`, `skill-naming`, `merge-discipline`
- [x] 4.2 Update `skills/merge-discipline/reference.md` Part R tables; bump skill version
- [x] 4.3 Drop full-capability install lines from `skills/solve-workflow/reference.md`; bump patch version

## 5. Verify

- [x] 5.1 Grep live trees for 全能力 / plugin-install / `.opencode/INSTALL` (exclude archive and fix-log)
- [x] 5.2 `node --test scripts/*.test.mjs`; JSON parse `package.json`; `openspec validate` if available
