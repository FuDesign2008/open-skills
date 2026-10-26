## 1. URL links

- [x] 1.1 Add `renderPlainUrl` and wire it into `renderInline`; keep code spans and Markdown links unchanged.

## 2. Contract and tests

- [x] 2.1 Add a renderer test for a plain URL and a URL inside code; run `node --test skills/goal-driven-queue/scripts/render-html.test.mjs`.
- [x] 2.2 Add the URL-link sentences to `SKILL.md` and `reference.md`, and the contract assertions; run `node --test scripts/human-facing-html-contract.test.mjs`.

## 3. Verification

- [x] 3.1 Run `npm test` under Node 22 and `openspec validate goal-queue --strict`.
