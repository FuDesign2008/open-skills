# Tasks

## 1. Failing contract tests

- [x] 1.1 Add `scripts/explain-clearly-contract.test.mjs` and extend the delete-section assertion in `scripts/session-cleanup-contract.test.mjs`. Verify both fail before the skill files change: `node --test scripts/explain-clearly-contract.test.mjs scripts/session-cleanup-contract.test.mjs`.

## 2. explain-clearly

- [x] 2.1 Move `skills/explain-simply/` to `skills/explain-clearly/`, rewrite `SKILL.md` and `reference.md`, and add `assets/explanation-shell.html`. Verify `node --test scripts/explain-clearly-contract.test.mjs` passes.

## 3. session-cleanup delete confirmation

- [x] 3.1 Update the Delete section of `skills/session-cleanup/SKILL.md` so proposed file deletes wait for confirmation, and set the skill version to 1.1.0. Verify `node --test scripts/session-cleanup-contract.test.mjs` passes.

## 4. Active references and index

- [x] 4.1 Point `AGENTS.md`, `docs/README.md`, and `docs/concept-explanation-dual-track.md` at `explain-clearly`, then regenerate `docs/generated/skills-index.md`. Verify a search of `skills/`, `AGENTS.md`, and `openspec/specs/` no longer finds `explain-simply` after archive, and `npm run lint:skill-description` passes.

## Workflow follow-up

- Archive `rename-explain-simply-to-explain-clearly` after validation so the main specs match the skills.
- Run `npm test` and `openspec validate rename-explain-simply-to-explain-clearly --strict` before archive.
