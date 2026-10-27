## 1. File links

- [x] 1.1 Add `renderCodeSpan` and the `fileLink` resolver with `--file-root`; leave non-file spans plain.

## 2. Contract and tests

- [x] 2.1 Add a renderer test for an existing path and a command; run `node --test skills/goal-driven-queue/scripts/render-html.test.mjs`.
- [x] 2.2 Add the file-link sentences to `SKILL.md` and `reference.md`, and the contract assertions; run `node --test scripts/human-facing-html-contract.test.mjs`.

## 3. Verification

- [x] 3.1 Run `npm test` under Node 22 and `openspec validate goal-queue --strict`.
