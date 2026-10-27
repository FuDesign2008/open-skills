## 1. Skill rule

- [x] 1.1 Add the language rule to `skills/goal-driven-queue/SKILL.md` and `reference.md`; verify the sentences.

## 2. Contract lock

- [x] 2.1 Add contract assertions for the rule and run `node --test scripts/human-facing-html-contract.test.mjs`.

## 3. Localized renderer

- [x] 3.1 Add entry-page label and footer text options to `skills/goal-driven-queue/scripts/render-html.mjs`; verify with a Chinese fixture.

## 4. Verification

- [x] 4.1 Run `npm test` under Node 22 and `openspec validate goal-queue --strict`.
