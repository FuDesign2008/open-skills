## 1. Navigation block

- [x] 1.1 Add `renderNav` and inject the block into `renderFile` via `nav`/`navManifest`, `navRoot`, and `unavailableLabel`; expose the CLI flags.

## 2. Contract and tests

- [x] 2.1 Add a renderer test for relative links and unavailable markers; run `node --test skills/goal-driven-queue/scripts/render-html.test.mjs`.
- [x] 2.2 Add the navigation sentences to `SKILL.md` and `reference.md`, and the contract assertions; run `node --test scripts/human-facing-html-contract.test.mjs`.

## 3. Verification

- [x] 3.1 Run `npm test` under Node 22 and `openspec validate goal-queue --strict`.
